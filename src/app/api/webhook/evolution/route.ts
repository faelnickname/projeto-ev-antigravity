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

    // Rate limit
    if (!verificarRateLimit(FINAL_DB_ID).permitido) {
      await evolutionService.sendMessage(remoteJid, '⚠️ Muitas mensagens. Aguarde um momento.');
      return new Response('ok', { status: 200 });
    }

    // Busca dados financeiros em paralelo - Otimizado para não truncar categorias
    const [
      { data: transGerais }, 
      { data: transCoral }, 
      { data: transFixas }, 
      { data: contas }, 
      { data: historicoLogs }
    ] = await Promise.all([
      supabase.from('transacoes').select('valor,tipo,categoria,descricao').eq('id_whatsapp', FINAL_DB_ID).not('categoria', 'in', '("Despesa Coral","Despesa Fixa")').order('created_at', { ascending: false }).limit(20),
      supabase.from('transacoes').select('valor,tipo,categoria,descricao').eq('id_whatsapp', FINAL_DB_ID).eq('categoria', 'Despesa Coral').order('created_at', { ascending: false }).limit(20),
      supabase.from('transacoes').select('valor,tipo,categoria,descricao').eq('id_whatsapp', FINAL_DB_ID).eq('categoria', 'Despesa Fixa').order('created_at', { ascending: false }).limit(30),
      supabase.from('contas').select('nome,saldo').eq('id_whatsapp', FINAL_DB_ID),
      supabase.from('logs').select('mensagem_entrada,resposta_enviada').eq('numero_whatsapp', FINAL_DB_ID).order('created_at', { ascending: false }).limit(5)
    ]);

    const receitas = transGerais?.filter(t => t.tipo === 'entrada').reduce((acc, t) => acc + Math.abs(Number(t.valor)), 0) || 0;
    const despesas = transGerais?.filter(t => t.tipo === 'saida').reduce((acc, t) => acc + Math.abs(Number(t.valor)), 0) || 0;

    const contexto = `
SALDO ATUAL: R$ ${(receitas - despesas).toFixed(2)}
ÚLTIMAS GERAIS: ${transGerais?.map(t => `${t.descricao}: R$ ${t.valor}`).join(' | ') || 'Nenhuma'}
DESPESAS CORAL (Últimas 20): ${transCoral?.map(t => `${t.descricao}: R$ ${t.valor}`).join(' | ') || 'Nenhuma'}
DESPESAS FIXAS (Últimas 30): ${transFixas?.map(t => `${t.descricao}: R$ ${t.valor}`).join(' | ') || 'Nenhuma'}
CONTAS: ${contas?.map(c => `${c.nome}: R$ ${c.saldo}`).join(', ') || 'Nenhuma'}
`.trim();

    const historico = (historicoLogs || [])
      .reverse()
      .filter(l => !/mint|ynab|pocketguard|spendee|nubank|guiabolso|sheets|excel|planilha/i.test(l.resposta_enviada || ''))
      .flatMap(l => ([
        { role: 'user' as const, content: l.mensagem_entrada },
        { role: 'assistant' as const, content: l.resposta_enviada }
      ]));

    const ia = await processarMensagemAssistente(bodyText, contexto, historico);
    if (!ia?.resposta) throw new Error('IA sem resposta');

    log('INFO', `IA: "${ia.resposta.substring(0, 80)}..."`);

    // Salva transação se a IA detectou uma transação
    if (ia.intencao === 'transacao' && ia.dados) {
      const transacoesLista = Array.isArray(ia.dados) ? ia.dados : [ia.dados];
      
      for (const d of transacoesLista) {
        try {
          const isPending = d.dia_vencimento || d.descricao?.match(/vence/i) ? true : false;
          const baseDesc = d.descricao || 'Despesa/Receita';
          const finalDescricao = d.dia_vencimento && !baseDesc.match(/Vence/i) ? `${baseDesc} (Vence Dia ${d.dia_vencimento})` : baseDesc;

          const { error: insertError } = await supabase.from('transacoes').insert({
            descricao: finalDescricao,
            categoria: d.categoria || 'Outros',
            subcategoria: d.subcategoria,
            valor: d.tipo === 'inc' ? Math.abs(Number(d.valor)) : -Math.abs(Number(d.valor)),
            tipo: d.tipo === 'inc' ? 'inc' : 'exp',
            id_whatsapp: FINAL_DB_ID,
            status: isPending ? 'a pagar' : 'confirmado'
          });
          
          if (insertError) {
            log('ERROR', `Falha ao inserir no banco: ${insertError.message}`);
            // Tenta logar a falha em uma entrada de log para depuração
            await supabase.from('logs').insert({
              numero_whatsapp: 'SYSTEM_ERROR',
              mensagem_entrada: bodyText,
              resposta_enviada: `ERRO BD: ${insertError.message}`,
              tipo_acao: 'database_error'
            });
          } else {
            log('INFO', `Transação registrada: ${d.descricao} R$ ${d.valor}`);
          }
        } catch (dbErr: any) {
          log('ERROR', `Exceção ao inserir transação: ${dbErr.message}`);
        }
      }
    } else if (ia.intencao === 'alterar_transacao' && ia.dados_alteracao) {
      log('INFO', 'Alterando transação existente...');
      try {
        const { busca_descricao, novo_dia_vencimento, novo_status } = ia.dados_alteracao;
        // Buscar transação parecida
        const { data: achados } = await supabase
          .from('transacoes')
          .select('*')
          .eq('id_whatsapp', FINAL_DB_ID)
          .ilike('descricao', `%${busca_descricao}%`)
          .order('created_at', { ascending: false })
          .limit(1);

        if (achados && achados.length > 0) {
           const alvo = achados[0];
           const updates: any = {};
           
           if (novo_status) {
              updates.status = novo_status;
           }
           
           if (novo_dia_vencimento) {
              const baseDesc = alvo.descricao.replace(/\(Vence Dia \d+\)/i, '').trim();
              updates.descricao = `${baseDesc} (Vence Dia ${novo_dia_vencimento})`;
           }
           
           await supabase.from('transacoes').update(updates).eq('id', alvo.id);
           log('INFO', `Transação ${alvo.id} atualizada com sucesso`);
        } else {
           log('WARNING', `Transação não encontrada para: ${busca_descricao}`);
        }
      } catch (err) {
         log('ERROR', 'Erro ao alterar transação');
      }
    }

    // Salva log da conversa
    await supabase.from('logs').insert({
      numero_whatsapp: FINAL_DB_ID,
      mensagem_entrada: bodyText,
      resposta_enviada: ia.resposta,
      tipo_acao: ia.intencao
    });

    // Limpeza de segurança (Anti-Hallucinação)
    let respostaFinal = ia.resposta;
    
    // Se a IA alucinar dizendo que não tem link ou sugerindo outros, nós limpamos
    const frasesProibidas = [
      /infelizmente.*link/gi,
      /não tenho.*link/gi,
      /não possuo.*link/gi,
      /recomendo.*planilha/gi,
      /use.*guiabolso/gi,
      /use.*sheets/gi,
      /planilha no google/gi
    ];

    frasesProibidas.forEach(regex => {
      if (regex.test(respostaFinal)) {
        respostaFinal = respostaFinal.replace(regex, "Você pode acessar tudo aqui pela nossa plataforma oficial.");
      }
    });

    const querAcesso = /plataforma/i.test(bodyText);

    if (querAcesso) {
      if (!respostaFinal.includes('https://projetoev.com.br')) {
        respostaFinal += `\n\n🔗 *Acesso à Plataforma:* https://projetoev.com.br`;
      }
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
