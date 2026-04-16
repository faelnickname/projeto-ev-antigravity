import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Este endpoint será chamado por um cron job externo (Vercel Cron ou upstash.com)
// Configurar em vercel.json:
// {
//   "crons": [{
//     "path": "/api/cron/alertas",
//     "schedule": "0 20 * * *"  // 20:00 todos os dias
//   }]
// }

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔔 Iniciando verificação de alertas...');

    // Buscar dados financeiros com tentativa de coletar o dia_vencimento (PGRST fallback)
    let transacoes: any[] = [];
    const { data: transData, error: transError } = await supabase
      .from('transacoes')
      .select('valor, tipo, categoria, descricao, created_at, dia_vencimento, status');
      
    if (transError && transError.code === '42703') {
       console.warn('⚠️ Coluna dia_vencimento não existe. Usando fallback e extração pela descrição.');
       const { data: fallbackData } = await supabase.from('transacoes').select('valor, tipo, categoria, status, descricao, created_at');
       transacoes = fallbackData || [];
    } else {
       transacoes = transData || [];
    }

    const { data: orcamentos } = await supabase
      .from('orcamentos')
      .select('*');

    const { data: usuarios } = await supabase
      .from('usuarios')
      .select('*')
      .eq('notificacoes_ativas', true);

    if (!usuarios || usuarios.length === 0) {
      console.log('ℹ️ Nenhum usuário com notificações ativas');
      return NextResponse.json({ enviados: 0 });
    }

    const mesAtual = new Date().getMonth();
    const gastosPorCategoria: Record<string, number> = {};
    let totalGastos = 0;

    transacoes?.forEach(t => {
      const val = Math.abs(Number(t.valor) || 0);
      if (t.tipo === 'exp' || t.tipo === 'despesa') {
        const dataT = new Date(t.created_at || new Date());
        if (dataT.getMonth() === mesAtual) {
          const cat = t.categoria || 'Outros';
          gastosPorCategoria[cat] = (gastosPorCategoria[cat] || 0) + val;
          totalGastos += val;
        }
      }
    });

    let alertasEnviados = 0;

    // ======================================
    // 1. CHECAR LEMBRETES DE DESPESA FIXA
    // ======================================
    const hoje = new Date();
    // Ajuste de TZ (Hora de Brasília se roda no Vercel UTC-3)
    hoje.setHours(hoje.getHours() - 3);
    const diaHoje = hoje.getDate();
    
    const amanhaData = new Date(hoje);
    amanhaData.setDate(hoje.getDate() + 1);
    const diaAmanha = amanhaData.getDate();

    let alertasLembrete: string[] = [];
    const transacoesUnicas = new Map();
    
    for (const t of transacoes) {
      if (t.status === 'pago' || t.status === 'liquidado' || t.status === 'recebido') continue;

      let dia = t.dia_vencimento;
      if (!dia && t.descricao) {
         const match = t.descricao.match(/Vence Dia (\d+)/i);
         if (match) dia = parseInt(match[1]);
      }

      if (dia) {
         t.dia_vencimento = dia; // Normalize it inside mapping
         transacoesUnicas.set(t.descricao, t);
      }
    }

    for (const [descricao, t] of Array.from(transacoesUnicas.entries())) {
       if (t.dia_vencimento === diaHoje) {
          alertasLembrete.push(`🔴 *VENCE HOJE:* ${descricao} (R$ ${Math.abs(t.valor).toFixed(2)})`);
       } else if (t.dia_vencimento === diaAmanha) {
          alertasLembrete.push(`🟡 *VENCE AMANHÃ:* ${descricao} (R$ ${Math.abs(t.valor).toFixed(2)})`);
       }
    }

    if (alertasLembrete.length > 0) {
       for (const usuario of usuarios) {
         const msgLembrete = `🔔 *LEMBRETE DE PAGAMENTOS*\n\n` + alertasLembrete.join('\n') + `\n\n💡 Não esqueça de pagar e registrar!`;
         await enviarAlerataWhatsApp(usuario.numero_whatsapp, msgLembrete);
         alertasEnviados++;
       }
    }

    // ======================================
    // 2. VERIFICAR ALERTA DE ORÇAMENTOS
    // ======================================
    // Verificar cada orçamento
    for (const orcamento of orcamentos || []) {
      const gasto = gastosPorCategoria[orcamento.categoria] || 0;
      const percentual = (gasto / orcamento.valor_limite) * 100;

      if (percentual >= 80) {
        // Enviar alerta para todos os usuários
        for (const usuario of usuarios) {
          const mensagem = `⚠️ **ALERTA DE ORÇAMENTO**\n\n${orcamento.categoria.toUpperCase()}\nGasto: R$ ${gasto.toFixed(2)}\nLimite: R$ ${orcamento.valor_limite.toFixed(2)}\nPercentual: ${percentual.toFixed(0)}%\n\n💡 Reduza gastos para não ultrapassar o limite!`;

          await enviarAlerataWhatsApp(usuario.numero_whatsapp, mensagem);
          alertasEnviados++;
          console.log(`✅ Alerta enviado para ${usuario.numero_whatsapp}`);
        }
      }
    }

    // Resumo geral
    const resumoMês = `📊 **RESUMO DO MÊS ATÉ AGORA**\n\nTotal Gasto: R$ ${totalGastos.toFixed(2)}\nPercentual do Orçamento: ${((totalGastos / (orcamentos?.reduce((sum, o) => sum + o.valor_limite, 0) || 1)) * 100).toFixed(0)}%`;

    if (alertasEnviados === 0) {
      // Se não houve alertas críticos, enviar resumo positivo
      for (const usuario of usuarios) {
        await enviarAlerataWhatsApp(usuario.numero_whatsapp, resumoMês + '\n\n✅ Você está no controle! Continue assim!');
      }
      alertasEnviados = usuarios.length;
    }

    console.log(`✅ Alertas diários completados - ${alertasEnviados} notificações`);

    return NextResponse.json({ 
      success: true, 
      alertasEnviados,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro no cron de alertas:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

async function enviarAlerataWhatsApp(numero: string, mensagem: string) {
  const url = process.env.EVOLUTION_API_URL;
  const key = process.env.EVOLUTION_API_KEY;
  const instance = 'agentev';

  try {
    await fetch(`${url}/message/sendText/${instance}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'apikey': key || '' 
      },
      body: JSON.stringify({ 
        number: numero.replace(/\D/g, ''),
        text: mensagem 
      })
    });
  } catch (err) {
    console.error(`Erro ao enviar alerta para ${numero}:`, err);
  }
}
