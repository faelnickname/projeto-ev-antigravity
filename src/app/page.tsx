"use client";

import { useEffect, useState } from 'react';
import { 
  Home, Coffee, CreditCard, Truck, 
  ArrowUpCircle, ArrowDownCircle, Landmark, 
  CheckSquare
} from 'lucide-react';
import { 
  Tooltip, ResponsiveContainer, 
  Cell, PieChart, Pie, LineChart, Line
} from 'recharts';
import { supabase } from '@/lib/supabase';

// Mock Sparkline Data (will use real trend in next iteration)
const sparklineData = Array.from({ length: 20 }, (_, i) => ({ value: 30 + Math.random() * 40 }));

export default function DashboardNexusFinal() {
  const [data, setData] = useState<{
    saldo: number;
    entradas: number;
    saidas: number;
    topDespesas: any[];
    recentTransactions: any[];
    period: { start: string, end: string };
  }>({
    saldo: 0,
    entradas: 0,
    saidas: 0,
    topDespesas: [],
    recentTransactions: [],
    period: { start: '01/01/2024', end: '31/12/2024' }
  });
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [filter, setFilter] = useState('Selecionar Despesa');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data: trans } = await supabase
        .from('transacoes')
        .select('tipo, valor, categoria, descricao, created_at')
        .order('created_at', { ascending: false });

      if (trans) setAllTransactions(trans);
      setLoading(false);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (allTransactions.length === 0) return;

    const entradas = allTransactions.filter(t => t.tipo === 'entrada').reduce((acc, t) => acc + (Number(t.valor) || 0), 0);
    const saidas = allTransactions.filter(t => t.tipo === 'saida').reduce((acc, t) => acc + (Math.abs(Number(t.valor)) || 0), 0);
    const saldo = entradas - saidas;

    const despesasMap: Record<string, number> = {};
    allTransactions.filter(t => t.tipo === 'saida').forEach(t => {
      const val = Math.abs(Number(t.valor)) || 0;
      despesasMap[t.categoria || 'Outros'] = (despesasMap[t.categoria || 'Outros'] || 0) + val;
    });

    const topDespesas = Object.entries(despesasMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a,b) => b.value - a.value)
      .slice(0, 5);
    
    const totalSaidas = saidas || 1;
    const topDespesasPerc = topDespesas.map((d, i) => ({
      ...d,
      percent: ((d.value / totalSaidas) * 100).toFixed(1),
      color: ['#f43f5e', '#fb7185', '#fda4af', '#0ea5e9', '#38bdf8'][i % 5]
    }));

    // Dynamic Period Logic
    const filtered = filter === 'Selecionar Despesa' 
      ? allTransactions 
      : allTransactions.filter(t => t.categoria?.toLowerCase().includes(filter.toLowerCase()));

    let start = '01/01/2024';
    let end = '31/12/2024';
    
    if (filtered.length > 0) {
      const dates = filtered.map(t => new Date(t.created_at).getTime()).sort((a,b) => a - b);
      const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
      start = new Date(dates[0]).toLocaleString('pt-BR', options);
      end = new Date(dates[dates.length - 1]).toLocaleString('pt-BR', options);
    }

    setData({
      saldo,
      entradas,
      saidas,
      topDespesas: topDespesasPerc as any,
      recentTransactions: filtered.slice(0, 4),
      period: { start, end }
    });
  }, [allTransactions, filter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', height: '100%' }}>
      {/* TOP KPI ROW */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: '1.2fr 1fr 1fr', gap: '1rem', marginBottom: 0 }}>
        {/* SALDO */}
        <div className="glass-card kpi-card-saldo" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 600, opacity: 0.9 }}>Saldo Total</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>R$ {data.saldo.toLocaleString('pt-BR')}</div>
            <div style={{ height: '40px', width: '120px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparklineData}><Line type="monotone" dataKey="value" stroke="white" strokeWidth={2} dot={false} /></LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ENTRADAS */}
        <div className="glass-card" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>Entradas</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flex: 1 }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0ea5e9' }}>R$ {data.entradas.toLocaleString('pt-BR')}</div>
            <div style={{ height: '30px', width: '80px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparklineData}><Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2} dot={false} /></LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* SAÍDAS */}
        <div className="glass-card" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>Saídas</span>
            <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800 }}>
              {data.entradas > 0 ? ((data.saidas / data.entradas) * 100).toFixed(1) : '0'}%
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flex: 1 }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f43f5e' }}>R$ {data.saidas.toLocaleString('pt-BR')}</div>
            <div style={{ height: '30px', width: '80px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparklineData}><Line type="monotone" dataKey="value" stroke="#f43f5e" strokeWidth={2} dot={false} /></LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN ANALYSIS ROW */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: 'minmax(280px, 320px) 1fr', gap: '1rem', flex: 1, marginBottom: 0, minHeight: 0 }}>
        {/* LEFT COLUMN: FILTERS & ACCOUNTS */}
        <div className="glass-card" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '1.2rem', overflowY: 'auto' }}>
          <div className="elite-filter-group">
            <label className="elite-filter-label" style={{ fontSize: '0.65rem' }}>Tipo de Despesa</label>
            <select 
              className="elite-select" 
              style={{ fontSize: '0.75rem', padding: '0.5rem' }}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="Selecionar Despesa">Selecionar Despesa</option>
              <option value="Coral">Despesa Coral</option>
              <option value="Fixa">Despesa Fixa</option>
              <option value="Cartão">Cartão</option>
            </select>
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div className="elite-filter-group">
              <label className="elite-filter-label" style={{ fontSize: '0.65rem' }}>PERÍODO</label>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <input type="text" className="elite-select" value={data.period.start} readOnly style={{ textAlign: 'center', fontSize: '0.7rem', padding: '0.4rem' }} />
                <input type="text" className="elite-select" value={data.period.end} readOnly style={{ textAlign: 'center', fontSize: '0.7rem', padding: '0.4rem' }} />
              </div>
            </div>

            <div 
              style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer', justifyContent: 'center' }}
              onClick={() => setFilter('Selecionar Despesa')}
            >
              <CheckSquare size={14} color="#64748b" />
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b' }}>Limpar filtros</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CHARTS & RECENT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: 0 }}>
          {/* CHART CARD */}
          <div className="glass-card" style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'white', marginBottom: '1rem' }}>Top 5 Despesas por categoria</h3>
            <div style={{ display: 'flex', alignItems: 'center', flex: 1, minHeight: 0 }}>
              <div style={{ width: '45%', height: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.topDespesas} innerRadius="65%" outerRadius="90%" paddingAngle={4} dataKey="value">
                      {data.topDespesas.map((e: any, index) => <Cell key={index} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem', paddingLeft: '1.5rem' }}>
                <span className="elite-filter-label" style={{ fontSize: '0.55rem' }}>CATEGORIA</span>
                {data.topDespesas.map((item: any, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', fontWeight: 600 }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: item.color }}></div>
                    <span style={{ color: '#94a3b8', flex: 1 }}>{item.name}</span>
                    <span>{item.percent}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ÚLTIMOS REGISTROS (GRID) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'white' }}>Últimos Registros</h3>
            <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.8rem', marginBottom: 0 }}>
              {data.recentTransactions.map((t: any, i) => (
                <div key={i} className="glass-card" style={{ padding: '0.8rem', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: `3px solid ${t.tipo === 'entrada' ? '#0ea5e9' : '#f43f5e'}` }}>
                  <div style={{ width: '36px', height: '36px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {t.tipo === 'entrada' ? <ArrowUpCircle size={18} color="#0ea5e9" /> : <ArrowDownCircle size={18} color="#f43f5e" />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>{t.categoria || 'Geral'}</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>{t.descricao}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: t.tipo === 'entrada' ? '#0ea5e9' : '#f43f5e' }}>
                      {t.tipo === 'entrada' ? '+' : '-'} R$ {Number(t.valor).toLocaleString('pt-BR')}
                    </div>
                    <div style={{ fontSize: '0.55rem', color: '#64748b' }}>
                      {new Date(t.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
