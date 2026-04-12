import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { processarMensagemAssistente, gerarAudioDoTexto } from '@/lib/ai';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Evento de nova mensagem na Evolution API
    if (body.event === 'messages.upsert') {
      const messageData = body.data?.message;
      const key = body.data?.key;
      const instanceName = body.instance; // Evolution API manda a instância no body
      
      const remoteJid = key?.remoteJid;
      const isFromMe = key?.fromMe;

      // Pegar texto da mensagem
      const text = messageData?.conversation || messageData?.extendedTextMessage?.text;

      if (!isFromMe && text && remoteJid) {
        console.log(`Mensagem recebida do WhatsApp via Evolution: ${text}`);

        // Integração com a IA da OpenAI
        const respostaIA = await processarMensagemAssistente(text);

        if (respostaIA) {
          if (respostaIA.intencao === 'transacao') {
            const dados = respostaIA.dados;
            await supabase.from('transacoes').insert({
              descricao: dados.descricao,
              categoria: dados.categoria,
              valor: dados.tipo === 'exp' ? -Math.abs(dados.valor) : Math.abs(dados.valor),
              tipo: dados.tipo,
              id_whatsapp: remoteJid
            });
            console.log(`Sucesso: Transação '${dados.descricao}' registrada!`);
          } 
          else if (respostaIA.intencao === 'agenda') {
            const dados = respostaIA.dados;
            await supabase.from('compromissos').insert({
              titulo: dados.descricao,
              data_hora: dados.data_hora || new Date().toISOString(),
              detalhes: 'Agendado via IA WhatsApp'
            });
            console.log(`Sucesso: Compromisso '${dados.descricao}' adicionado!`);
          }

          // Resposta por voz (Text-to-Speech)
          if (respostaIA.resposta && process.env.EVOLUTION_API_URL && process.env.EVOLUTION_API_KEY) {
            const base64Audio = await gerarAudioDoTexto(respostaIA.resposta);
            
            if (base64Audio) {
              const url = `${process.env.EVOLUTION_API_URL}/message/sendWhatsAppAudio/${instanceName}`;
              
              // Disparar áudio como mensagem de voz ptt (para o WhatsApp parecer que foi gravado)
              await fetch(url, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'apikey': process.env.EVOLUTION_API_KEY
                },
                body: JSON.stringify({
                  number: remoteJid.replace('@s.whatsapp.net', ''), // Número sem o sufixo
                  audio: `data:audio/mp3;base64,${base64Audio}`,
                  delay: 1500, // Dá a impressão de que está gravando
                  mimetype: "audio/mp4",
                  ptt: true // (Push to Talk - Voice Note)
                })
              });
              console.log("Áudio de resposta enviado via Evolution!");
            }
          }
        }
      }
    }

    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error) {
    console.error('Erro na Evolution API Webhook:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
