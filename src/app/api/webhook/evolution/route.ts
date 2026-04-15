import { NextRequest } from 'next/server';
import { processarMensagemAssistente, transcreverAudio, analisarImagem } from '@/lib/ai';
import { supabase } from '@/lib/supabase';
import { verificarDuplicata, verificarRateLimit } from '@/lib/rateLimit';
import { evolutionService } from '@/lib/evolution';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

function log(nivel: string, msg: string) {
  console.log(`[${new Date().toISOString()}] EVO_${nivel}: ${msg}`);
}

// Número autorizado — apenas ele pode interagir com o bot
const AUTHORIZED_PHONE = (process.env.AUTHORIZED_PHONE || '35991831298').replace(/\D/g, '');

// ID fixo no Supabase (sufixo do número autorizado, para não quebrar dados existentes)
const FINAL_DB_ID = '91831298';

export async function GET() {
  return new Response('🚀 NEXO FINANCEIRO 4.2 - OFICIAL (Build: RELEASE-4.2-FINAL-V1)', { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log de depuração total (pode ser removido depois)
    await supabase.from('logs').insert({
      numero_whatsapp: 'DEBUG_WEBHOOK',
      mensagem_entrada: `Payload: ${JSON.stringify(body).slice(0, 1000)}`,
      resposta_enviada: 'Log de entrada recebido',
      tipo_acao: 'debug'
    });

    // Só processa eventos de mensagem nova
    const event = (body.event || '').toLowerCase().replace('_', '.');
    if (event !== 'messages.upsert') {
      return new Response('ok', { status: 200 });
    }

    const raw = body.data;
    const message = Array.isArray(raw) ? raw[0] : raw;
    if (!message) return new Response('ok', { status: 200 });

    // Ignora mensagens enviadas pelo próprio bot
    if (message?.key?.fromMe === true) {
      return new Response('ok', { status: 200 });
    }

    const remoteJid: string = message?.key?.remoteJid || '';

    // Só aceita mensagens diretas (DM), não grupos
    if (!remoteJid.endsWith('@s.whatsapp.net')) {
      return new Response('ok', { status: 200 });
    }

    // Extrai o número do remetente
    const senderNumber = remoteJid.replace('@s.whatsapp.net', '').replace(/\D/g, '');

    // Verifica se o remetente é o número autorizado
    const senderSuffix = senderNumber.slice(-8);
    const authorizedSuffix = AUTHORIZED_PHONE.slice(-8);

    if (senderSuffix !== authorizedSuffix) {
      log('BLOCKED', `Número não autorizado: ${senderNumber} (Esperado final: ${authorizedSuffix})`);
      // Log no Supabase para depuração remota
      await supabase.from('logs').insert({
        numero_whatsapp: 'SYSTEM_DEBUG',
        mensagem_entrada: `BLOQUEADO: ${senderNumber}`,
        resposta_enviada: `O sistema esperava o sufixo ${authorizedSuffix} mas recebeu ${senderSuffix}`,
        tipo_acao: 'debug'
      });
      return new Response('ok', { status: 200 });
    }

    let bodyText: string = (
      message?.message?.conversation ||
      message?.message?.extendedTextMessage?.text ||
      ''
    ).trim();

    // SUPORTE PARA ÁUDIO
    if (!bodyText && message?.message?.audioMessage) {
      log('INFO', 'Detectado ÁUDIO. Transcrevendo...');
      try {
        const res = await fetch(`${process.env.EVOLUTION_API_URL}/chat/getBase64FromMediaMessage/${body.instance}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'apikey': process.env.EVOLUTION_API_KEY || '' },
          body: JSON.stringify({ message: message })
        });
        const mediaData = await res.json();
        if (mediaData.base64) {
          const buffer = Buffer.from(mediaData.base64, 'base64');
          const transcription = await transcreverAudio(buffer);
          if (transcription) {
            bodyText = transcription;
            log('INFO', `Transcrição: "${bodyText}"`);
          }
        }
      } catch (err) {
        log('ERROR', 'Erro ao transcrever áudio');
      }
    }

    // SUPORTE PARA IMAGEM (VISION)
    if (!bodyText && message?.message?.imageMessage) {
      log('INFO', 'Detectada IMAGEM. Analisando...');
      try {
        const res = await fetch(`${process.env.EVOLUTION_API_URL}/chat/getBase64FromMediaMessage/${body.instance}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'apikey': process.env.EVOLUTION_API_KEY || '' },
          body: JSON.stringify({ message: message })
        });
        const mediaData = await res.json();
        if (mediaData.base64) {
          const visionData = await analisarImagem(mediaData.base64);
          if (visionData && visionData.valor) {
            bodyText = `Registre pelo comprovante: ${visionData.descricao || 'Compra'} valor R$ ${visionData.valor} categoria ${visionData.categoria || 'Outros'}`;
            log('INFO', `Visão: "${bodyText}"`);
          }
        }
      } catch (err) {
        log('ERROR', 'Erro ao analisar imagem');
      }
    }

    log('INFO', `DM de: ${senderNumber} | Msg: "${bodyText}"`);

    if (!bodyText) return new Response('ok', { status: 200 });

    // Rate limit e duplicatas
    if (!verificarRateLimit(FINAL_DB_ID).permitido) {
      await evolutionService.sendMessage(remoteJid, '⚠️ Muitas mensagens. Aguarde um momento.');
      return new Response('ok', { status: 200 });
    }
    if (verificarDuplicata(FINAL_DB_ID, bodyText)) {
      return new Response('ok', { status: 200 });
    }

    // Busca dados financeiros em paralelo
    const [{ data: transRaw }, { data: contas }, { data: historicoLogs }] = await Promise.all([
      supabase.from('transacoes').select('valor,tipo,categoria,subcategoria,descricao').eq('id_whatsapp', FINAL_DB_ID).order('created_at', { ascending: false }).limit(40),
      supabase.from('contas').select('nome,saldo').eq('id_whatsapp', FINAL_DB_ID),
      supabase.from('logs').select('mensagem_entrada,resposta_enviada').eq('numero_whatsapp', FINAL_DB_ID).order('created_at', { ascending: false }).limit(3)
    ]);

    const gerais = transRaw?.filter(t => t.categoria !== 'Despesa Coral' && t.categoria !== 'Despesa Fixa').slice(0, 10) || [];
    const coral  = transRaw?.filter(t => t.categoria === 'Despesa Coral').slice(0, 15) || [];
    const fixas  = transRaw?.filter(t => t.categoria === 'Despesa Fixa').slice(0, 15) || [];

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

    const ia = await processarMensagemAssistente(bodyText, contexto, historico);
    if (!ia?.resposta) throw new Error('IA sem resposta');

    log('INFO', `IA: "${ia.resposta.substring(0, 80)}..."`);

    // Salva transação se a IA detectou uma transação
    if (ia.intencao === 'transacao' && ia.dados) {
      const d = ia.dados;
      await supabase.from('transacoes').insert({
        descricao: d.descricao,
        categoria: d.categoria || 'Outros',
        subcategoria: d.subcategoria,
        valor: d.tipo === 'inc' ? Math.abs(d.valor) : -Math.abs(d.valor),
        tipo: d.tipo === 'inc' ? 'entrada' : 'saida',
        id_whatsapp: FINAL_DB_ID,
        status: 'confirmado'
      });
      log('INFO', `Transação registrada: ${d.descricao} R$ ${d.valor}`);
    }

    // Salva log da conversa
    await supabase.from('logs').insert({
      numero_whatsapp: FINAL_DB_ID,
      mensagem_entrada: bodyText,
      resposta_enviada: ia.resposta,
      tipo_acao: ia.intencao
    });

    // Verifica se deve adicionar o link da plataforma
    let respostaFinal = ia.resposta;
    const querAcesso = /painel|plataforma|acender|link|ver os dados|site|dashboard/i.test(bodyText);
    const isAnalise = ia.intencao === 'pergunta' || ia.intencao === 'consulta';

    if (querAcesso || isAnalise) {
      respostaFinal += `\n\n🔗 *Acesso à Plataforma:* https://projetoev.com.br`;
    }

    // Responde diretamente na DM do usuário
    await evolutionService.sendMessage(remoteJid, respostaFinal);
    log('INFO', '✅ Resposta enviada com sucesso!');

    return new Response('ok', { status: 200 });

  } catch (err: any) {
    log('ERROR', err.message);
    return new Response('ok', { status: 200 });
  }
}
