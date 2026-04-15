import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { processarMensagemAssistente, gerarAudioDoTexto, transcreverAudio } from '@/lib/ai';
const FINAL_DB_ID = '91831298';

export async function POST(request: Request) {
  try {
    const { mensagem: textoEntrada, audio: audioBase64 } = await request.json();
    let mensagem = textoEntrada;

    // Se houver áudio, transcrever primeiro
    if (audioBase64) {
      const audioBuffer = Buffer.from(audioBase64, 'base64');
      const transcricao = await transcreverAudio(audioBuffer);
      if (transcricao) {
        mensagem = transcricao;
        console.log(`🎙️ Áudio transcrito via Web Chat: "${mensagem}"`);
      }
    }
    
    if (!mensagem) {
      return NextResponse.json({ error: 'Mensagem ou áudio vazio' }, { status: 400 });
    }

    console.log(`💬 Web Chat - Mensagem recebida: "${mensagem}"`);

    // Buscar contexto financeiro para dar "memória" a IA
    const { data: transacoes } = await supabase.from('transacoes').select('valor, tipo, categoria, descricao, created_at').order('created_at', { ascending: false }).limit(50);
    const { data: orcamentos } = await supabase.from('orcamentos').select('*');
    
    let totalReceitas = 0;
    let totalDespesas = 0;
    const gastosPorCategoria: Record<string, number> = {};
    const mesAtual = new Date().getMonth();
    let transacoesRecentes = "\\nTRANSAÇÕES RECENTES:";

    transacoes?.forEach(t => {
      const val = Number(t.valor) || 0;
      const absVal = Math.abs(val);
      const desc = t.descricao || 'Desconhecido';
      const dataFormatada = new Date(t.created_at).toLocaleDateString('pt-BR');
      
      if (t.tipo === 'inc' || t.tipo === 'receita') {
        totalReceitas += absVal;
        transacoesRecentes += `\\n[+] ${dataFormatada} - R$ ${absVal.toFixed(2)} - ${desc} (${t.categoria})`;
      } else if (t.tipo === 'exp' || t.tipo === 'despesa') {
        totalDespesas += absVal;
        transacoesRecentes += `\\n[-] ${dataFormatada} - R$ ${absVal.toFixed(2)} - ${desc} (${t.categoria})`;
        
        // Calcular gasto do mês atual para orçamentos
        const dataT = new Date(t.created_at || new Date());
        if (dataT.getMonth() === mesAtual) {
          const cat = t.categoria || 'Outros';
          gastosPorCategoria[cat] = (gastosPorCategoria[cat] || 0) + absVal;
        }
      }
    });

    const resumo = `Total de Receitas: R$ ${totalReceitas.toFixed(2)}, Total de Despesas: R$ ${totalDespesas.toFixed(2)}, Saldo Atual: R$ ${(totalReceitas - totalDespesas).toFixed(2)}\\n${transacoesRecentes}`;

    console.log(`📊 Contexto financeiro carregado`);

    // 1. Verificar se há confirmação pendente (S/N)
    let pendente = null;
    try {
      const { data } = await supabase
        .from('transacoes')
        .select('*')
        .eq('fonte', 'web-chat')
        .eq('status', 'pendente')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      pendente = data;
    } catch (err) {
      // Sem transação pendente, continuar
    }

    if (pendente && (mensagem.toLowerCase() === 's' || mensagem.toLowerCase() === 'sim' || mensagem.toLowerCase() === 'n' || mensagem.toLowerCase() === 'não' || mensagem.toLowerCase() === 'nao')) {
      const confirmado = mensagem.toLowerCase() === 's' || mensagem.toLowerCase() === 'sim';
      if (confirmado) {
        await supabase.from('transacoes').update({ status: 'confirmado' }).eq('id', pendente.id);
        console.log(`✅ Transação confirmada: ${pendente.id}`);
        return NextResponse.json({ resposta: "✅ Registrado com sucesso! Essa transação já entrou no seu histórico." });
      } else {
        await supabase.from('transacoes').update({ status: 'cancelado' }).eq('id', pendente.id);
        console.log(`❌ Transação cancelada: ${pendente.id}`);
        return NextResponse.json({ resposta: "Entendido, cancelei esse registro. Se precisar anotar novamente, é só chamar!" });
      }
    }

    // Buscar histórico recente
    let historico: any[] = [];
    try {
      const { data: logs } = await supabase
        .from('logs')
        .select('mensagem_entrada, resposta_enviada')
        .order('created_at', { ascending: false })
        .limit(5);

      historico = logs?.reverse().map(l => ([
        { role: "user" as const, content: l.mensagem_entrada }, 
        { role: "assistant" as const, content: l.resposta_enviada }
      ])).flat() || [];
    } catch (err) {
      console.log('Histórico não carregado');
    }

    // Processar com IA
    const respostaIA = await processarMensagemAssistente(mensagem, resumo, historico);

    if (respostaIA) {
      console.log(`✅ IA processou - Intenção: ${respostaIA.intencao}`);

      // TRANSAÇÃO
      if (respostaIA.intencao === 'transacao' && respostaIA.dados) {
        const dados = respostaIA.dados;
        const confianca = respostaIA.confianca_ia || 0.9;
        const statusFinal = confianca < 0.8 ? 'pendente' : 'confirmado';
        const valorFinal = dados.tipo === 'exp' ? -Math.abs(dados.valor) : Math.abs(dados.valor);

        // Inserção com esquema atualizado
        const { error: insertError } = await supabase.from('transacoes').insert({
          descricao: dados.descricao,
          categoria: dados.categoria || 'Outros',
          valor: valorFinal,
          tipo: dados.tipo === 'inc' ? 'inc' : 'exp',
          status: statusFinal,
          id_whatsapp: FINAL_DB_ID
        });

        if (insertError) {
          console.error(`❌ Erro real ao salvar transação via Chat: ${insertError.message}`);
          return NextResponse.json({ resposta: "Desculpe, tive um erro persistente ao salvar. Verifique se o banco de dados está online." }, { status: 500 });
        }

        console.log(`💾 Transação salva (Modo: ${insertError ? 'Legado' : 'Elite'}): ${dados.descricao}`);

        if (confianca < 0.8) {
          return NextResponse.json({ 
            resposta: `⚠️ Só para confirmar... você quer registrar isso como **${dados.tipo === 'inc' ? 'Ganho' : 'Gasto'}** de **R$ ${Number(dados.valor).toFixed(2)}** em **${dados.categoria}**? (Responda S ou N)`,
            intencao: 'confirmacao_pendente'
          });
        }
      } 
      // AGENDA
      else if (respostaIA.intencao === 'agenda' && respostaIA.dados) {
        const dados = respostaIA.dados;
        const { error: errInsert } = await supabase.from('compromissos').insert({
          titulo: dados.descricao,
          data_hora: dados.data_hora || new Date().toISOString(),
          detalhes: 'Agendado via Web Chat'
        });
        if (errInsert) console.error('Erro compromisso:', errInsert);
      }
      // META
      else if (respostaIA.intencao === 'configurar_meta' && respostaIA.dados) {
        const dados = respostaIA.dados;
        await supabase.from('orcamentos').upsert({
          categoria: dados.categoria,
          valor_limite: dados.valor
        }, { onConflict: 'categoria' });
      }

      // Salvar Log
      try {
        await supabase.from('logs').insert({
          numero_whatsapp: 'web-chat',
          mensagem_entrada: mensagem,
          resposta_enviada: respostaIA.resposta,
          tipo_acao: respostaIA.intencao
        });
      } catch (err) {
        console.log('Log não salvo');
      }

      // Gerar áudio
      let audioB64 = null;
      if (respostaIA.requer_audio) {
        try {
          audioB64 = await gerarAudioDoTexto(respostaIA.resposta);
        } catch (err) {
          console.log('Áudio não gerado');
        }
      }

      console.log(`📤 Resposta enviada`);
      return NextResponse.json({ 
        resposta: respostaIA.resposta, 
        intencao: respostaIA.intencao,
        audio: audioB64
      }, { status: 200 });

    } else {
      console.error(`❌ IA retornou null`);
      return NextResponse.json({ resposta: "Desculpe, tive uma falha rápida. Pode repetir?" }, { status: 200 });
    }
  } catch (error) {
    console.error('❌ Erro no Web Chat API:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
