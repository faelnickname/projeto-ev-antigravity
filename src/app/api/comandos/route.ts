import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { comando, numero_whatsapp } = await request.json();

    if (!comando) {
      return NextResponse.json({ error: 'Comando ausente' }, { status: 400 });
    }

    const cmd = comando.toLowerCase().trim();

    // ===== /SALDO =====
    if (cmd === '/saldo' || cmd === 'saldo' || cmd === 'qual meu saldo') {
      const { data: transacoes } = await supabase
        .from('transacoes')
        .select('valor, tipo');

      let totalReceitas = 0;
      let totalDespesas = 0;
      let countReceitas = 0;
      let countDespesas = 0;

      transacoes?.forEach(t => {
        const val = Math.abs(Number(t.valor) || 0);
        if (t.tipo === 'inc' || t.tipo === 'receita') {
          totalReceitas += val;
          countReceitas++;
        } else if (t.tipo === 'exp' || t.tipo === 'despesa') {
          totalDespesas += val;
          countDespesas++;
        }
      });

      const saldo = totalReceitas - totalDespesas;

      return NextResponse.json({
        resposta: `💰 **SEU SALDO ATUAL**

💵 Saldo: R$ ${saldo.toFixed(2)}

📈 Receitas: R$ ${totalReceitas.toFixed(2)} (${countReceitas} transações)
📉 Despesas: R$ ${totalDespesas.toFixed(2)} (${countDespesas} transações)

${saldo > 0 ? '✅ Você está no positivo!' : '⚠️ Você está no negativo!'}`,
        intencao: 'saldo'
      });
    }

    // ===== /META =====
    if (cmd === '/meta' || cmd === 'meta' || cmd === 'qual minha meta') {
      const { data: orcamentos } = await supabase.from('orcamentos').select('*');
      const { data: transacoes } = await supabase.from('transacoes').select('valor, tipo, categoria, created_at');

      const mesAtual = new Date().getMonth();
      const gastosPorCategoria: Record<string, number> = {};
      let totalGastoMes = 0;
      let totalLimite = 0;

      transacoes?.forEach(t => {
        const val = Math.abs(Number(t.valor) || 0);
        if (t.tipo === 'exp' || t.tipo === 'despesa') {
          const dataT = new Date(t.created_at || new Date());
          if (dataT.getMonth() === mesAtual) {
            const cat = t.categoria || 'Outros';
            gastosPorCategoria[cat] = (gastosPorCategoria[cat] || 0) + val;
            totalGastoMes += val;
          }
        }
      });

      let metasTexto = '';
      const categoriasCriticas: Array<{ categoria: string; percentual: number }> = [];

      orcamentos?.forEach(o => {
        const gasto = gastosPorCategoria[o.categoria] || 0;
        const percentual = (gasto / o.valor_limite) * 100;
        totalLimite += o.valor_limite;

        const emoji = percentual >= 90 ? '🔴' : percentual >= 80 ? '🟠' : '🟢';
        metasTexto += `\n${emoji} ${o.categoria.toUpperCase()}: R$ ${gasto.toFixed(2)} / R$ ${o.valor_limite.toFixed(2)} (${percentual.toFixed(0)}%)`;

        if (percentual >= 80) {
          categoriasCriticas.push({ categoria: o.categoria, percentual });
        }
      });

      const percentualTotal = (totalGastoMes / totalLimite) * 100;

      let alertaTexto = '';
      if (categoriasCriticas.length > 0) {
        alertaTexto = `\n\n🚨 **ALERTAS CRÍTICOS:**`;
        categoriasCriticas.forEach(cat => {
          alertaTexto += `\n⚠️ ${cat.categoria}: ${cat.percentual.toFixed(0)}% do limite!`;
        });
      }

      return NextResponse.json({
        resposta: `🎯 **SUAS METAS MENSAIS**

Gasto Total: R$ ${totalGastoMes.toFixed(2)} / R$ ${totalLimite.toFixed(2)}
Percentual: ${percentualTotal.toFixed(0)}% utilizado

Categorias:${metasTexto}

${totalLimite - totalGastoMes > 0 ? `💡 Você pode gastar ainda: R$ ${(totalLimite - totalGastoMes).toFixed(2)}` : `❌ Você ultrapassou o limite em R$ ${Math.abs(totalLimite - totalGastoMes).toFixed(2)}`}${alertaTexto}`,
        intencao: 'meta'
      });
    }

    // ===== /ANÁLISE =====
    if (cmd === '/analise' || cmd === '/análise' || cmd === 'analise' || cmd === 'análise') {
      const { data: transacoes } = await supabase
        .from('transacoes')
        .select('valor, tipo, categoria, created_at')
        .order('created_at', { ascending: false });

      const mesAtual = new Date().getMonth();
      const mesPrior = mesAtual === 0 ? 11 : mesAtual - 1;
      
      const categoriasMes: Record<string, number> = {};
      const categoriasPrior: Record<string, number> = {};
      let totalMes = 0;
      let totalPrior = 0;

      transacoes?.forEach(t => {
        const val = Math.abs(Number(t.valor) || 0);
        const dataT = new Date(t.created_at || new Date());
        
        if (t.tipo === 'exp' || t.tipo === 'despesa') {
          const cat = t.categoria || 'Outros';
          
          if (dataT.getMonth() === mesAtual) {
            categoriasMes[cat] = (categoriasMes[cat] || 0) + val;
            totalMes += val;
          } else if (dataT.getMonth() === mesPrior) {
            categoriasPrior[cat] = (categoriasPrior[cat] || 0) + val;
            totalPrior += val;
          }
        }
      });

      const topCategoria = Object.entries(categoriasMes)
        .sort((a, b) => b[1] - a[1])[0];

      const variacao = totalPrior > 0 ? ((totalMes - totalPrior) / totalPrior * 100) : 0;

      let analiseTexto = `📊 **ANÁLISE DO MÊS**

Total de Despesas: R$ ${totalMes.toFixed(2)}
Maior Categoria: ${topCategoria ? `${topCategoria[0]} (R$ ${topCategoria[1].toFixed(2)})` : 'N/A'}

Variação vs Mês Anterior: ${variacao > 0 ? '📈' : '📉'} ${Math.abs(variacao).toFixed(1)}%`;

      if (variacao > 20) {
        analiseTexto += `\n\n⚠️ Você gastou ${variacao.toFixed(0)}% a mais que mês passado!`;
      } else if (variacao < -20) {
        analiseTexto += `\n\n✅ Você economizou ${Math.abs(variacao).toFixed(0)}% em relação ao mês passado!`;
      }

      // Dicas
      if (topCategoria && categoriasMes[topCategoria[0]] > 2000) {
        analiseTexto += `\n💡 Dica: Reduza ${topCategoria[0]} em 10-15% para economizar`;
      }

      return NextResponse.json({
        resposta: analiseTexto,
        intencao: 'analise'
      });
    }

    return NextResponse.json({ 
      error: 'Comando não reconhecido. Use: /saldo, /meta ou /análise' 
    }, { status: 400 });

  } catch (error) {
    console.error('Erro na API de comandos:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
