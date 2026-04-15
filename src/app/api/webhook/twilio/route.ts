import { NextRequest } from 'next/server';
import { processarMensagemAssistente, analisarImagem, transcreverAudio } from '@/lib/ai';
import { supabase } from '@/lib/supabase';
import { verificarDuplicata, verificarRateLimit } from '@/lib/rateLimit';
import { whatsappService } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
// Aumenta o timeout máximo da função para 30s (padrão Next.js)
export const maxDuration = 30;

function log(nivel: string, mensagem: string) {
  console.log(`[${new Date().toISOString()}] TWILIO_${nivel}: ${mensagem}`);
}

async function downloadMedia(url: string) {
  const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
  const response = await fetch(url, { headers: { 'Authorization': `Basic ${auth}` } });
  if (!response.ok) throw new Error('Falha ao baixar mídia');
  return Buffer.from(await response.arrayBuffer());
}

// Resposta imediata de 200 OK ao Twilio (TwiML vazio)
function respostaOkImediata() {
  return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
    status: 200,
    headers: { 'Content-Type': 'text/xml' }
  });
}

export async function GET() {
  return new Response('Webhook Twilio ONLINE 🤖💎', { status: 200 });
}

export async function POST(request: NextRequest) {
  const rawText = await request.text();
  const allData = Object.fromEntries(new URLSearchParams(rawText).entries());

  const fromRaw = String(allData.From || '');
  const bodyText = String(allData.Body || '').trim();
  const bodyTextLower = bodyText.toLowerCase();
  const mediaUrl = allData.MediaUrl0;
  const contentType = allData.MediaContentType0;

  // Extrai o número limpo (apenas dígitos, sem whatsapp: prefix)
  const phoneNumber = fromRaw.replace('whatsapp:', '').trim();
  const phoneDigitsOnly = phoneNumber.replace(/\D/g, '');

  log('INFO', `Mensagem recebida de: ${fromRaw} | Corpo: "${bodyText}"`);

  // PING imediato sem IA
  if (bodyTextLower === 'ping' || bodyTextLower === 'teste') {
    await whatsappService.sendMessage(phoneNumber, 'PONG! 🏓 Servidor ativo!');
    return respostaOkImediata();
  }

  // Autorização
  const authorizedPhone = (process.env.AUTHORIZED_PHONE || '').replace(/\D/g, '');
  if (authorizedPhone && !phoneDigitsOnly.endsWith(authorizedPhone.slice(-8))) {
    log('WARN', `Acesso não autorizado: ${phoneNumber}`);
    return respostaOkImediata();
  }

  const finalId = phoneDigitsOnly.slice(-8);

  // Rate limit e duplicatas
  if (!verificarRateLimit(phoneDigitsOnly).permitido) {
    await whatsappService.sendMessage(phoneNumber, '⚠️ Muitas mensagens. Aguarde um momento.');
    return respostaOkImediata();
  }
  if (verificarDuplicata(phoneDigitsOnly, bodyText || mediaUrl)) {
    return respostaOkImediata();
  }

  // ====================================================
  // PROCESSAMENTO ASSÍNCRONO: Responde Twilio IMEDIATAMENTE
  // e envia a resposta da IA depois via REST API
  // ====================================================
  processarEResponder(phoneNumber, finalId, bodyText, mediaUrl, contentType).catch(err => {
    log('ERROR', `Falha no processamento assíncrono: ${err.message}`);
  });

  // Resposta imediata ao Twilio (< 100ms) — EVITA TIMEOUT
  return respostaOkImediata();
}

async function processarEResponder(
  phoneNumber: string,
  finalId: string,
  bodyText: string,
  mediaUrl?: string,
  contentType?: string
) {
  try {
    let textoFinal = bodyText;
    let infoExtraida = '';

    // Processamento de mídia (imagem/áudio)
    if (mediaUrl) {
      log('INFO', `Processando mídia: ${contentType}`);
      const buf = await downloadMedia(mediaUrl);
      if (contentType?.startsWith('image/')) {
        const v = await analisarImagem(buf.toString('base64'));
        if (v) {
          infoExtraida = `[IMAGEM] ${v.descricao} - R$ ${v.valor}`;
          textoFinal = `Registre: ${v.descricao}, valor ${v.valor}, categoria ${v.categoria}`;
        }
      } else if (contentType?.startsWith('audio/') || contentType?.includes('ogg')) {
        const audio = await transcreverAudio(buf);
        if (audio) { infoExtraida = `[ÁUDIO] ${audio}`; textoFinal = audio; }
      }
    }

    if (!textoFinal) return;

    // Busca dados em paralelo (UMA query unificada)
    const [{ data: transRaw }, { data: contas }, { data: historicoLogs }] = await Promise.all([
      supabase.from('transacoes').select('valor,tipo,categoria,subcategoria,descricao').eq('id_whatsapp', finalId).order('created_at', { ascending: false }).limit(40),
      supabase.from('contas').select('nome,saldo').eq('id_whatsapp', finalId),
      supabase.from('logs').select('mensagem_entrada,resposta_enviada').eq('numero_whatsapp', finalId).order('created_at', { ascending: false }).limit(3)
    ]);

    // Filtragem em memória
    const gerais = transRaw?.filter(t => t.categoria !== 'Despesa Coral' && t.categoria !== 'Despesa Fixa').slice(0, 10) || [];
    const coral = transRaw?.filter(t => t.categoria === 'Despesa Coral').slice(0, 15) || [];
    const fixas = transRaw?.filter(t => t.categoria === 'Despesa Fixa').slice(0, 15) || [];

    let receitas = 0, despesas = 0;
    transRaw?.forEach(t => {
      const v = Math.abs(Number(t.valor) || 0);
      if (t.tipo === 'inc' || t.tipo === 'receita') receitas += v;
      else despesas += v;
    });

    const contexto = `
SALDO: R$ ${(receitas - despesas).toFixed(2)} | Receitas: R$ ${receitas.toFixed(2)} | Despesas: R$ ${despesas.toFixed(2)}
CONTAS: ${contas?.map(c => `${c.nome}: R$ ${c.saldo}`).join(', ') || 'Nenhuma'}
ÚLTIMAS TRANSAÇÕES: ${gerais.map(t => `${t.descricao}: R$ ${t.valor} [${t.categoria}]`).join(' | ') || 'Nenhuma'}
CORAL: ${coral.map(t => `${t.descricao}: R$ ${t.valor}`).join(' | ') || 'Nenhuma'}
FIXAS: ${fixas.map(t => `${t.descricao}: R$ ${t.valor}`).join(' | ') || 'Nenhuma'}
`.trim();

    const historico = historicoLogs?.reverse().flatMap(l => ([
      { role: 'user' as const, content: l.mensagem_entrada },
      { role: 'assistant' as const, content: l.resposta_enviada }
    ])) || [];

    // Chama IA
    const ia = await processarMensagemAssistente(textoFinal, contexto, historico);
    if (!ia?.resposta) throw new Error('IA não retornou resposta');

    log('INFO', `IA respondeu: "${ia.resposta.substring(0, 60)}..."`);

    // Salva transação se for o caso
    if (ia.intencao === 'transacao' && ia.dados) {
      const d = ia.dados;
      const { error } = await supabase.from('transacoes').insert({
        descricao: d.descricao,
        categoria: d.categoria || 'Outros',
        subcategoria: d.subcategoria,
        valor: d.tipo === 'inc' ? Math.abs(d.valor) : -Math.abs(d.valor),
        tipo: d.tipo === 'inc' ? 'inc' : 'exp',
        id_whatsapp: finalId,
        status: 'confirmado',
        anexo_url: mediaUrl
      });
      if (error) log('ERROR', `Erro ao salvar transação: ${error.message}`);
    }

    // Log da conversa
    await supabase.from('logs').insert({
      numero_whatsapp: finalId,
      mensagem_entrada: infoExtraida || textoFinal,
      resposta_enviada: ia.resposta,
      tipo_acao: ia.intencao
    });

    // ENVIA RESPOSTA VIA TWILIO REST API
    const enviado = await whatsappService.sendMessage(phoneNumber, ia.resposta);
    if (enviado) {
      log('INFO', `Resposta enviada! SID: ${enviado.sid}`);
    } else {
      log('ERROR', 'whatsappService.sendMessage retornou null');
    }

  } catch (err: any) {
    log('ERROR', `processarEResponder: ${err.message}`);
    await whatsappService.sendMessage(phoneNumber, '⚠️ Erro ao processar. Tente novamente.');
  }
}
