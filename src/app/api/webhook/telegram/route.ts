import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { processarMensagemAssistente, gerarAudioDoTexto, transcreverAudio } from '@/lib/ai';

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

export async function POST(request: Request) {
  try {
    const update = await request.json();
    console.log('📬 Webhook Telegram recebido:', JSON.stringify(update, null, 2));

    const message = update.message;
    if (!message) return NextResponse.json({ ok: true });

    const chatId = message.chat.id;
    let text = message.text;
    let voice = message.voice;

    // Se for áudio, processar
    if (voice) {
      text = await processarAudioTelegram(voice.file_id);
      console.log('🎙️ Áudio Telegram transcrito:', text);
    }

    if (!text) return NextResponse.json({ ok: true });

    // Buscar contexto financeiro
    const { data: transacoes } = await supabase.from('transacoes').select('valor, tipo, categoria, created_at');
    let totalReceitas = 0;
    let totalDespesas = 0;
    transacoes?.forEach(t => {
      const val = Math.abs(Number(t.valor));
      if (t.tipo === 'inc') totalReceitas += val;
      else totalDespesas += val;
    });
    const resumo = `Total de Receitas: R$ ${totalReceitas.toFixed(2)}, Total de Despesas: R$ ${totalDespesas.toFixed(2)}, Saldo: R$ ${(totalReceitas - totalDespesas).toFixed(2)}.`;

    // Processar com a IA
    const respostaIA = await processarMensagemAssistente(text, resumo, []);

    if (respostaIA) {
      if (respostaIA.intencao === 'transacao') {
        const dados = respostaIA.dados;
        await supabase.from('transacoes').insert({
          descricao: dados.descricao,
          categoria: dados.categoria,
          valor: dados.tipo === 'exp' ? -Math.abs(dados.valor) : Math.abs(dados.valor),
          tipo: dados.tipo === 'inc' ? 'inc' : 'exp',
          id_whatsapp: `Telegram_${chatId}`,
          status: 'confirmado'
        });
      }

      await enviarMensagemTelegram(chatId, respostaIA.resposta);

      if (voice || respostaIA.requer_audio) {
        const audioBuffer = await gerarAudioDoTexto(respostaIA.resposta);
        if (audioBuffer) {
          await enviarAudioTelegram(chatId, audioBuffer);
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('❌ Erro no Webhook Telegram:', error);
    return NextResponse.json({ ok: true });
  }
}

async function processarAudioTelegram(fileId: string) {
  try {
    const resFile = await fetch(`${TELEGRAM_API}/getFile?file_id=${fileId}`);
    const { result } = await resFile.json();
    const filePath = result.file_path;
    const downloadRes = await fetch(`https://api.telegram.org/file/bot${TELEGRAM_TOKEN}/${filePath}`);
    const arrayBuffer = await downloadRes.arrayBuffer();
    return await transcreverAudio(Buffer.from(arrayBuffer));
  } catch (err) {
    return null;
  }
}

async function enviarMensagemTelegram(chatId: number, text: string) {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: text, parse_mode: 'Markdown' })
  });
}

async function enviarAudioTelegram(chat_id: number, audioBuffer: Buffer) {
  try {
    const formData = new FormData();
    const blob = new Blob([new Uint8Array(audioBuffer)], { type: 'audio/mp3' });
    formData.append('chat_id', chat_id.toString());
    formData.append('voice', blob, 'resposta.mp3');

    await fetch(`${TELEGRAM_API}/sendVoice`, {
      method: 'POST',
      body: formData
    });
  } catch (err) {
    console.error('Erro ao enviar áudio:', err);
  }
}
