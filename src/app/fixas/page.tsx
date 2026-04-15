"use client";

import { PieChart as PieIcon, TrendingUp, TrendingDown, Calendar as CalendarIcon, RefreshCw, ChevronRight, LayoutGrid, Target, Home, Smartphone, Globe, ShieldCheck, Activity, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { dataService } from '@/lib/dataService';
import { ELITE_COLORS } from '@/lib/mockData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, LabelList } from 'recharts';

export default function DespesasFixasPage() {
  const [transacoes, setTransacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [recarregando, setRecarregando] = useState(false);
  
  async function fetchDados() {
    try {
      setRecarregando(true);
      // Aqui usamos um filtro específico para "Despesa Fixa"
      const all = await dataService.getTransactions();
      const fixas = all.filter(t => t.categoria === 'Despesa Fixa' || t.category === 'Despesa Fixa');
      setTransacoes(fixas);
    } catch (err) {
      console.error('Erro ao carregar despesas fixas:', err);
    } finally {
      setLoading(false);
      setRecarregando(false);
    }
  }

  useEffect(() => {
    fetchDados();
    const channel = supabase.channel('fixas-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transacoes' }, () => fetchDados())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const totalGasto = transacoes.reduce((acc, t) => acc + Math.abs(t.valor), 0);
  const formatCurrency = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Agrupar por subcategoria para o gráfico
  const catMap: Record<string, number> = {};
  transacoes.forEach(t => {
    const sub = t.subcategoria || 'Outros';
    catMap[sub] = (catMap[sub] || 0) + Math.abs(t.valor);
  });

  const chartData = Object.keys(catMap).map(name => ({
    name,
    valor: catMap[name]
  }));

  return (
    <div className="dashboard-container zero-scroll fade-in">
      <div className="dashboard-content-wrapper">
         <header style={{ height: 'var(--header-h)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1rem', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '0.8rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
               <h1 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff', letterSpacing: '0.05em', textTransform: 'uppercase', margin: 0 }}>
                 DESPESAS <span className="text-neon-green" style={{ color: 'var(--primary)' }}>FIXAS</span>
               </h1>
               <p style={{ fontSize: '0.6rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Monitoramento de Obrigações Recorrentes</p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
               <button onClick={() => fetchDados()} className="elite-button-icon" style={{ width: '38px', height: '38px' }}>
                  <div className={recarregando ? 'elite-pulse' : ''}>
                     <RefreshCw size={18} />
                  </div>
               </button>
            </div>
         </header>

         <div className="elite-main-view custom-scrollbar" style={{ flex: 1, overflowY: 'hidden', display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0 1rem 1rem 1rem' }}>
            
            {/* ROW 1: KPI SCORECARDS */}
            <div className="kpi-row">
               <div className="glass-card kpi-card neon-glow-green">
                  <div className="kpi-info">
                     <p className="kpi-label">TOTAL MENSAL FIXO</p>
                     <h2 className="kpi-value text-neon-green">{formatCurrency(totalGasto)}</h2>
                     <div className="kpi-trend positive">
                        <CalendarIcon size={12} /> <span style={{fontSize:'0.6rem', fontWeight: 800}}>COMPROMETIMENTO MENSAL</span>
                     </div>
                  </div>
               </div>

               <div className="glass-card kpi-card neon-glow-blue" style={{ borderLeft: '3px solid var(--primary)' }}>
                  <div className="kpi-info">
                     <p className="kpi-label">ITENS RECORRENTES</p>
                     <h2 className="kpi-value text-neon-blue">{transacoes.length} CONTRATOS</h2>
                     <div className="kpi-trend positive">
                        <ShieldCheck size={12} /> <span style={{fontSize:'0.6rem', fontWeight: 800}}>SISTEMA AUDITADO</span>
                     </div>
                  </div>
               </div>

               <div className="glass-card kpi-card" style={{ borderLeft: '3px solid var(--danger)' }}>
                  <div className="kpi-info">
                     <p className="kpi-label">MAIOR COMPROMISSO</p>
                     <h2 className="kpi-value text-neon-red">{formatCurrency(Math.max(...transacoes.map(t => Math.abs(t.valor)), 0))}</h2>
                     <div className="kpi-trend negative">
                        <ArrowDownLeft size={12} /> <span style={{fontSize:'0.6rem', fontWeight: 800}}>PONTO DE ATENÇÃO</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* ROW 2: CHART + LOGS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 400px', gap: '1.2rem', flex: 1, minHeight: 0 }}>
               
               {/* CHART PANEL */}
               <div className="glass-card chart-block" style={{ display: 'flex', flexDirection: 'column' }}>
                  <h3 className="card-title">DISTRIBUIÇÃO POR SERVIÇO</h3>
                  <div style={{ flex: 1, marginTop: '1rem' }}>
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} layout="vertical" margin={{ left: 30, right: 30 }}>
                           <XAxis type="number" hide />
                           <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 700}} width={100} />
                           <Tooltip contentStyle={{ background: '#020617', border: '1px solid var(--card-border)', borderRadius: '12px', fontSize: '0.7rem' }} />
                           <Bar dataKey="valor" fill="var(--primary)" radius={[0, 4, 4, 0]} barSize={20}>
                              <LabelList dataKey="valor" position="right" formatter={(v: any) => `R$${v}`} style={{ fill: '#fff', fontSize: '0.6rem', fontWeight: 800 }} />
                           </Bar>
                        </BarChart>
                     </ResponsiveContainer>
                  </div>
               </div>

               {/* RECENT LOGS */}
               <div className="glass-card table-row" style={{ minHeight: 0 }}>
                  <h3 className="card-title">ÚLTIMOS LANÇAMENTOS FIXOS</h3>
                  <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto' }}>
                     <table className="elite-table">
                        <thead>
                           <tr>
                              <th>DATA</th>
                              <th>DESCRIÇÃO</th>
                              <th style={{textAlign:'right'}}>VALOR</th>
                           </tr>
                        </thead>
                        <tbody>
                           {transacoes.slice(0, 10).map((t, i) => (
                              <tr key={i} className="elite-row">
                                 <td style={{fontSize: '0.65rem', color: '#64748b'}}>{new Date(t.created_at).toLocaleDateString()}</td>
                                 <td style={{fontWeight: 800, fontSize: '0.75rem'}}>{(t.description || t.descricao || '').toUpperCase()}</td>
                                 <td style={{textAlign:'right', fontWeight: 900, color: 'var(--primary)'}}>{formatCurrency(Math.abs(t.valor))}</td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>

         </div>
      </div>
      
      <style jsx>{`
        .dashboard-container { width: 100%; height: 100vh; background: #020617; color: #fff; }
        .dashboard-content-wrapper { display: flex; flex-direction: column; height: 100vh; }
        .kpi-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; flex-shrink: 0; }
        .kpi-card { display: flex; justify-content: space-between; padding: 1.2rem; height: 100px; }
        .kpi-label { font-size: 0.6rem; font-weight: 800; color: #64748b; margin-bottom: 0.5rem; text-transform: uppercase; }
        .kpi-value { font-size: 1.4rem; font-weight: 900; margin: 0; }
        .card-title { font-size: 0.65rem; font-weight: 900; color: #64748b; text-transform: uppercase; border-left: 3px solid var(--primary); padding-left: 0.8rem; margin-bottom: 1rem; }
        .table-row { display: flex; flex-direction: column; }
        .elite-button-icon { border-radius: 12px; background: rgba(0, 210, 255, 0.08); border: 1px solid rgba(0, 210, 255, 0.15); display: flex; align-items: center; justify-content: center; color: var(--primary); cursor: pointer; transition: 0.4s; }
        .elite-table { width: 100%; border-collapse: collapse; }
        .elite-table th { text-align: left; padding: 0.8rem; font-size: 0.6rem; color: #64748b; text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .elite-table td { padding: 0.8rem; border-bottom: 1px solid rgba(255,255,255,0.02); }
        @media (max-width: 768px) { .kpi-row { grid-template-columns: 1fr; } .kpi-card { height: 80px; } }
      `}</style>
    </div>
  );
}
