"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Treemap, Legend, LabelList } from 'recharts';
import { CreditCard, TrendingUp, TrendingDown, Calendar as CalendarIcon, Wallet, Zap, Activity, Clock, ArrowUpRight, ArrowDownLeft, Terminal, ShieldAlert, Sparkles, Cpu, Radio, ChevronRight, MessageSquare, User, PieChart as PieIcon, BarChart3, Hexagon, LayoutGrid, RefreshCw, Target, Landmark, Utensils, Car, Briefcase } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { MOCK_STATS, MOCK_CHART_DATA, MOCK_CATEGORY_DATA, MOCK_TRANSACTIONS, MOCK_CONTAS, ELITE_COLORS } from '@/lib/mockData';
import { dataService } from '@/lib/dataService';

const formatCurrency = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function Home() {
  const [estatisticas, setEstatisticas] = useState({ saldo: 0, receitas: 0, despesas: 0 });
  const [chartData, setChartData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [transacoesRecentes, setTransacoesRecentes] = useState<any[]>([]);
  const [contas, setContas] = useState<any[]>([]);
  const [totalSaldoGeral, setTotalSaldoGeral] = useState(0);
  const [showSaldo, setShowSaldo] = useState(true);
  const [loading, setLoading] = useState(true);
  const [recarregando, setRecarregando] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [totalCartoes, setTotalCartoes] = useState(0);

  async function fetchDashboard() {
    try {
      setRecarregando(true);
      const transacoes = await dataService.getTransactions();
      const dbStats = await dataService.getStats();
      const accounts = await dataService.getAccounts();
      const activityLogs = await dataService.getLogs();
      const cards = await dataService.getCards();
      
      setIsDemoMode(false);
      setEstatisticas(dbStats);
      setTransacoesRecentes(transacoes.slice(0, 10));
      setContas(accounts);
      setLogs(activityLogs);
      
      const totalContas = accounts.reduce((acc, c) => acc + (parseFloat(c.saldo) || 0), 0);
      const totalDividaCartoes = (cards || []).reduce((acc: number, c: any) => acc + (Number(c.fatura_atual) || 0), 0);
      setTotalCartoes(totalDividaCartoes);
      setTotalSaldoGeral(totalContas - totalDividaCartoes);

      const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const mesesData: Record<string, any> = {};
      const catMap: Record<string, number> = {};

      transacoes.forEach(t => {
        const dataCriacao = new Date(t.created_at || new Date());
        const mes = mesesNomes[dataCriacao.getMonth()];
        const val = Math.abs(Number(t.valor) || 0);
        if (!mesesData[mes]) mesesData[mes] = { name: mes, receitas: 0, despesas: 0 };
        if (t.tipo === 'inc' || t.tipo === 'receita') mesesData[mes].receitas += val;
        else {
          mesesData[mes].despesas += val;
          const cat = t.categoria || t.category || 'Outros';
          catMap[cat] = (catMap[cat] || 0) + val;
        }
      });

      const monthsArray = mesesNomes.filter(m => mesesData[m]).map(m => mesesData[m]);
      setChartData(monthsArray.length > 0 ? monthsArray : MOCK_CHART_DATA);

      const formattedCats = Object.keys(catMap).map((name, i) => ({
         name,
         value: catMap[name],
         color: ELITE_COLORS[i % ELITE_COLORS.length]
      }));
      setCategoryData(formattedCats.length > 0 ? formattedCats : MOCK_CATEGORY_DATA);
    } catch (err) {
      console.error('❌ Erro no sincronismo:', err);
      setIsDemoMode(true);
    } finally {
      setRecarregando(false);
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboard();
    const channel = supabase.channel('realtime-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transacoes' }, () => fetchDashboard())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contas' }, () => fetchDashboard())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'logs' }, () => fetchDashboard())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="dashboard-container zero-scroll fade-in">
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: `linear-gradient(rgba(0, 210, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 210, 255, 0.02) 1px, transparent 1px)`, backgroundSize: '40px 40px', pointerEvents: 'none', zIndex: -1 }}></div>
      <div className="dashboard-content-wrapper">
         <header style={{ height: 'var(--header-h)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1rem', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '0.8rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h1 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff', letterSpacing: '0.05em', textTransform: 'uppercase', margin: 0 }}>
                  NEXO <span className="text-neon-blue" style={{ color: 'var(--primary)' }}>FINANCEIRO</span>
                </h1>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <p style={{ fontSize: '0.6rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Núcleo de Inteligência v4.2 • Monitoramento em Tempo Real</p>
                 {isDemoMode && <span style={{ padding: '2px 6px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', fontSize: '0.5rem', borderRadius: '4px', fontWeight: 900, border: '1px solid rgba(245, 158, 11, 0.2)' }}>MODO DEMO</span>}
               </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
               <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                  <p style={{ fontSize: '0.55rem', fontWeight: 800, color: '#64748b', margin: 0 }}>MOTOR ATIVO</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'flex-end' }}>
                     <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' }}></div>
                     <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#fff' }}>Rafa S.</span>
                  </div>
               </div>
               <button onClick={() => fetchDashboard()} className="elite-button-icon">
                  <div className={recarregando ? 'elite-pulse' : ''}>
                     <RefreshCw size={18} />
                  </div>
               </button>
            </div>
         </header>

         <div className="elite-main-view custom-scrollbar" style={{ flex: 1, overflowY: 'hidden', display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0 1rem 1rem 1rem' }}>
            <div className="kpi-row">
               <Link href="/transicoes?tipo=incomes" className="glass-card kpi-card neon-glow-blue" style={{ textDecoration: 'none' }}>
                  <div className="kpi-info">
                     <p className="kpi-label">ENTRADAS</p>
                     <h2 className="kpi-value text-neon-blue">{showSaldo ? formatCurrency(estatisticas.receitas) : 'R$ •••••'}</h2>
                     <div className="kpi-trend positive">
                        <TrendingUp size={12} /> <span style={{fontSize:'0.6rem', fontWeight: 800}}>+12% TENDÊNCIA</span>
                     </div>
                  </div>
                  <div className="kpi-sparkline">
                     <ResponsiveContainer width="100%" height={40}>
                        <AreaChart data={chartData.slice(-6)}>
                           <Area type="monotone" dataKey="receitas" stroke="var(--primary)" fill="rgba(0, 210, 255, 0.1)" strokeWidth={2} />
                        </AreaChart>
                     </ResponsiveContainer>
                  </div>
               </Link>

               <Link href="/transicoes?tipo=incomes" className="glass-card kpi-card neon-glow-green" style={{ textDecoration: 'none' }}>
                  <div className="kpi-info">
                     <p className="kpi-label">TOTAL RECEBIDO</p>
                     <h2 className="kpi-value text-neon-green">{showSaldo ? formatCurrency(estatisticas.receitas) : 'R$ •••'}</h2>
                     <div className="kpi-trend positive">
                        <ArrowUpRight size={12} /> <span style={{fontSize:'0.6rem', fontWeight: 800}}>ENTRADAS BRUTAS</span>
                     </div>
                  </div>
                  <div className="kpi-sparkline">
                     <ResponsiveContainer width="100%" height={40}>
                        <AreaChart data={chartData.slice(-6)}>
                           <Area type="monotone" dataKey="receitas" stroke="var(--accent)" fill="rgba(16, 185, 129, 0.1)" strokeWidth={2} />
                        </AreaChart>
                     </ResponsiveContainer>
                  </div>
               </Link>

               <Link href="/transicoes?tipo=expenses" className="glass-card kpi-card neon-glow-red" style={{ textDecoration: 'none' }}>
                  <div className="kpi-info">
                     <p className="kpi-label">SAÍDAS</p>
                     <h2 className="kpi-value text-neon-red">{showSaldo ? formatCurrency(estatisticas.despesas) : 'R$ •••'}</h2>
                     <div className="kpi-trend negative">
                        <ArrowDownLeft size={12} /> <span style={{fontSize:'0.6rem', fontWeight: 800}}>FLUXO DE CAIXA</span>
                     </div>
                  </div>
                  <div className="kpi-sparkline">
                     <ResponsiveContainer width="100%" height={40}>
                        <AreaChart data={chartData.slice(-6)}>
                           <Area type="monotone" dataKey="despesas" stroke="var(--danger)" fill="rgba(225, 29, 72, 0.1)" strokeWidth={2} />
                        </AreaChart>
                     </ResponsiveContainer>
                  </div>
               </Link>

               <div className="glass-card kpi-card neon-glow-purple">
                  <div className="kpi-info">
                     <p className="kpi-label">PATRIMÔNIO LÍQUIDO</p>
                     <h2 className="kpi-value text-neon-purple">{showSaldo ? formatCurrency(totalSaldoGeral) : 'R$ •••'}</h2>
                     <div className="kpi-trend positive">
                        <Hexagon size={12} className="text-neon-purple" /> <span style={{fontSize:'0.6rem', fontWeight: 800}}>POSIÇÃO REAL</span>
                     </div>
                  </div>
                  <div className="kpi-sparkline">
                     <ResponsiveContainer width="100%" height={40}>
                        <AreaChart data={chartData.slice(-6)}>
                           <Area type="monotone" dataKey="receitas" stroke="#8b5cf6" fill="rgba(139, 92, 246, 0.1)" strokeWidth={2} />
                        </AreaChart>
                     </ResponsiveContainer>
                  </div>
               </div>
            </div>

            <div className="charts-row">
               <div className="glass-card chart-block">
                  <h3 className="card-title">DISTRIBUIÇÃO DE FLUXO</h3>
                  <div className="chart-wrapper">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                           <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 700}} dy={10} />
                           <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                           <Tooltip contentStyle={{ background: '#020617', border: '1px solid var(--card-border)', borderRadius: '12px', fontSize: '0.7rem' }} />
                           <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '0.6rem', textTransform: 'uppercase', fontWeight: 800, paddingBottom: '10px' }} />
                           <Bar dataKey="receitas" name="Receitas" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={25} />
                           <Bar dataKey="despesas" name="Despesas" fill="var(--danger)" radius={[4, 4, 0, 0]} barSize={25} />
                        </BarChart>
                     </ResponsiveContainer>
                  </div>
               </div>

               <div className="glass-card chart-block">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 className="card-title" style={{margin:0}}>ANÁLISE SETORIZADA</h3>
                    <PieIcon size={16} color="var(--primary)" />
                  </div>
                  <div className="chart-wrapper">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                           <Pie data={categoryData} cx="50%" cy="50%" innerRadius="70%" outerRadius="95%" paddingAngle={5} dataKey="value" stroke="none">
                              {categoryData.map((entry, i) => (
                                <Cell key={i} fill={ELITE_COLORS[i % ELITE_COLORS.length]} />
                              ))}
                           </Pie>
                           <Tooltip contentStyle={{ background: '#020617', border: '1px solid var(--card-border)', borderRadius: '12px', fontSize: '0.7rem' }} />
                           <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" wrapperStyle={{ fontSize: '0.55rem', textTransform: 'uppercase', fontWeight: 700, paddingLeft: '10px' }} />
                        </PieChart>
                     </ResponsiveContainer>
                  </div>
               </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem', flex: 1, minHeight: 0 }}>
               <div className="glass-card table-row" style={{ minHeight: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                     <h3 className="card-title" style={{margin:0}}>REGISTRO EM TEMPO REAL</h3>
                     <Link href="/transicoes" className="elite-link">VER HISTÓRICO <ChevronRight size={14} /></Link>
                  </div>
                  <div className="elite-table-container custom-scrollbar" style={{ flex: 1, overflowY: 'auto' }}>
                     <table className="elite-table">
                        <thead>
                        <tr>
                           <th>DATA</th>
                           <th>DESCRIÇÃO</th>
                           <th>CAT.</th>
                           <th style={{textAlign:'right'}}>VALOR</th>
                        </tr>
                        </thead>
                        <tbody>
                        {transacoesRecentes.map((t, i) => {
                           const cat = (t.category || t.categoria || 'OUTROS').toUpperCase();
                           return (
                             <tr key={i} className="elite-row">
                               <td style={{color: '#64748b', fontSize: '0.65rem', fontWeight: 800}}>{new Date(t.created_at).toLocaleDateString('pt-BR')}</td>
                               <td style={{fontWeight: 800, fontSize: '0.7rem', color: '#fff'}}>{(t.description || t.descricao || '').toUpperCase()}</td>
                               <td><span className="elite-badge">{cat}</span></td>
                               <td style={{textAlign:'right', fontWeight: 900, fontSize: '0.8rem', color: t.tipo === 'inc' ? 'var(--accent)' : '#fff'}}>
                                  {t.tipo === 'inc' ? '+' : '-'} {formatCurrency(Math.abs(t.valor))}
                               </td>
                             </tr>
                           );
                        })}
                        </tbody>
                     </table>
                  </div>
               </div>

               <div className="glass-card table-row" style={{ minHeight: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                     <h3 className="card-title" style={{margin:0}}>INTELIGÊNCIA WHATSAPP</h3>
                     <Radio size={14} className="elite-pulse" color="var(--primary)" />
                  </div>
                  <div className="activity-logs custom-scrollbar" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                     {logs.map((log, i) => (
                        <div key={i} className="log-entry" style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', borderLeft: `3px solid ${log.tipo_acao === 'transacao' ? 'var(--accent)' : 'var(--primary)'}` }}>
                           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                              <span style={{ fontSize: '0.55rem', fontWeight: 900, color: '#64748b' }}>{new Date(log.created_at).toLocaleTimeString('pt-BR')}</span>
                              <span style={{ fontSize: '0.55rem', fontWeight: 900, color: log.tipo_acao === 'transacao' ? 'var(--accent)' : 'var(--primary)' }}>{log.tipo_acao?.toUpperCase()}</span>
                           </div>
                           <p style={{ fontSize: '0.7rem', margin: '0.2rem 0', color: '#fff', fontWeight: 500 }}>
                              <span style={{ color: '#64748b', marginRight: '4px' }}>Rafa:</span> {log.mensagem_entrada}
                           </p>
                           <p style={{ fontSize: '0.7rem', margin: 0, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', lineBreak: 'anywhere' }}>
                              <span style={{ color: 'var(--primary)', marginRight: '4px' }}>NEXO:</span> {log.resposta_enviada?.slice(0, 80)}...
                           </p>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      </div>
      <style jsx>{`
        .dashboard-container { width: 100%; height: 100%; position: relative; color: #fff; background: #020617; }
        .dashboard-content-wrapper { display: flex; flex-direction: column; height: 100vh; }
        .kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; flex-shrink: 0; }
        .kpi-card { display: flex; justify-content: space-between; padding: 1rem; height: 100px; }
        .kpi-info { display: flex; flex-direction: column; gap: 0.1rem; }
        .kpi-label { font-size: 0.6rem; font-weight: 800; color: #64748b; letter-spacing: 0.08em; margin-bottom: 0.4rem; }
        .kpi-value { font-size: 1.4rem; font-weight: 900; margin: 0; letter-spacing: -0.01em; }
        .kpi-trend { display: flex; align-items: center; gap: 0.3rem; margin-top: 0.4rem; }
        .kpi-trend.positive { color: var(--accent); }
        .kpi-trend.negative { color: var(--danger); }
        .kpi-sparkline { width: 70px; display: flex; align-items: flex-end; }
        .charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; height: 240px; flex-shrink: 0; }
        .card-title { font-size: 0.65rem; font-weight: 900; color: #64748b; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 1.2rem; border-left: 3px solid var(--primary); padding-left: 0.8rem; }
        .chart-wrapper { flex: 1; min-height: 0; height: 180px; }
        .table-row { flex: 1; min-height: 0; display: flex; flex-direction: column; padding: 1.2rem; }
        .elite-link { font-size: 0.6rem; font-weight: 900; color: var(--primary); text-decoration: none; letter-spacing: 0.1em; display: flex; align-items: center; gap: 0.3rem; transition: 0.3s; }
        .elite-link:hover { filter: brightness(1.2); transform: translateX(3px); }
        .elite-badge { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 0.2rem 0.8rem; border-radius: 6px; font-size: 0.6rem; font-weight: 800; color: rgba(255,255,255,0.6); }
        .elite-button-icon { width: 42px; height: 42px; border-radius: 12px; background: rgba(0, 210, 255, 0.08); border: 1px solid rgba(0, 210, 255, 0.15); display: flex; align-items: center; justify-content: center; color: var(--primary); cursor: pointer; transition: 0.4s cubic-bezier(0.23, 1, 0.32, 1); }
        .elite-button-icon:hover { background: rgba(0, 210, 255, 0.15); box-shadow: 0 0 20px rgba(0, 210, 255, 0.2); transform: translateY(-2px); }
        @media (max-width: 1400px) { .kpi-value { font-size: 1.2rem; } }
        @media (max-width: 1200px) { .kpi-row { grid-template-columns: 1fr 1fr; } .charts-row { grid-template-columns: 1fr; height: auto; } .chart-wrapper { height: 220px; } }
        @media (max-width: 768px) { .kpi-row { grid-template-columns: 1fr; } .dashboard-container { overflow-y: auto; } .dashboard-content-wrapper { height: auto; } .zero-scroll { height: auto !important; overflow: auto !important; } }
      `}</style>
    </div>
  );
}
