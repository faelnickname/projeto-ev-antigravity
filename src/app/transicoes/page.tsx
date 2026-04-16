"use client";

import { PieChart as PieIcon, Plus, Download, Search, X, Image as ImageIcon, CheckCircle2, AlertCircle, TrendingUp, TrendingDown, ArrowLeft, RefreshCw, ChevronRight, Filter } from 'lucide-react';
import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { MOCK_TRANSACTIONS, MOCK_CHART_DATA } from '@/lib/mockData';

import { dataService } from '@/lib/dataService';

function TransicoesContent() {
  const searchParams = useSearchParams();
  const tipoParam = searchParams.get('tipo');

  const [transacoes, setTransacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [recarregando, setRecarregando] = useState(false);
  
  const [filtroTab, setFiltroTab] = useState('all');
  const [filtroBusca, setFiltroBusca] = useState('');

  async function fetchDados() {
    try {
      setRecarregando(true);
      const data = await dataService.getTransactions();
      setTransacoes(data || []);
    } catch (err) {
      console.error('Erro ao carregar transacoes:', err);
      setTransacoes(MOCK_TRANSACTIONS);
    } finally {
      setLoading(false);
      setRecarregando(false);
    }
  }

  useEffect(() => {
    fetchDados();

    const channel = supabase.channel('transacoes-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transacoes' }, () => fetchDados())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const transacoesFiltradas = transacoes.filter(t => {
    const matchesBusca = (t.description || '').toLowerCase().includes(filtroBusca.toLowerCase()) || 
                         (t.category || '').toLowerCase().includes(filtroBusca.toLowerCase());
    const matchesTab = filtroTab === 'all' || 
                       (filtroTab === 'incomes' && (t.tipo === 'inc' || t.tipo === 'receita')) ||
                       (filtroTab === 'expenses' && (t.tipo === 'exp' || t.tipo === 'despesa'));
    return matchesBusca && matchesTab;
  });

  const totalInc = transacoes.filter(t => t.tipo === 'inc' || t.tipo === 'receita').reduce((acc, t) => acc + Math.abs(t.valor), 0);
  const totalExp = transacoes.filter(t => t.tipo === 'exp' || t.tipo === 'despesa').reduce((acc, t) => acc + Math.abs(t.valor), 0);

  const formatCurrency = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="dashboard-container zero-scroll fade-in">
      <div className="dashboard-content-wrapper">
         <header style={{ height: 'var(--header-h)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1rem', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '0.8rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
               <h1 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff', letterSpacing: '0.05em', textTransform: 'uppercase', margin: 0 }}>
                 LIVRO <span className="text-neon-blue" style={{ color: 'var(--primary)' }}>DE REGISTROS</span>
               </h1>
               <p style={{ fontSize: '0.6rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Núcleo de Inteligência v4.2 • Trilhas de Auditoria</p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
               <div className="search-box">
                  <Search size={14} color="#64748b" />
                  <input 
                    type="text" 
                    placeholder="Buscar registros..." 
                    value={filtroBusca}
                    onChange={(e) => setFiltroBusca(e.target.value)}
                    style={{ background: 'none', border: 'none', color: '#fff', fontSize: '0.75rem', outline: 'none', width: '180px' }}
                  />
               </div>
               <button onClick={() => fetchDados()} className="elite-button-icon" style={{ width: '38px', height: '38px' }}>
                  <div className={recarregando ? 'elite-pulse' : ''}>
                     <RefreshCw size={18} />
                  </div>
               </button>
               <button className="btn" style={{ fontSize: '0.7rem', padding: '0.6rem 1.2rem', borderRadius: '10px' }}>
                  <Plus size={16} /> REGISTRO MANUAL
               </button>
            </div>
         </header>

         <div className="elite-main-view custom-scrollbar" style={{ flex: 1, overflowY: 'hidden', display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0 1rem 1rem 1rem' }}>
            
            {/* ROW 1: KPI SCORECARDS */}
            <div className="kpi-row">
               <div className="glass-card kpi-card neon-glow-green">
                  <div className="kpi-info">
                     <p className="kpi-label">ENTRADAS</p>
                     <h2 className="kpi-value text-neon-green">{formatCurrency(totalInc)}</h2>
                     <div className="kpi-trend positive">
                        <TrendingUp size={12} /> <span style={{fontSize:'0.6rem', fontWeight: 800}}>RECEITA NO MÊS</span>
                     </div>
                  </div>
               </div>

               <div className="glass-card kpi-card neon-glow-red">
                  <div className="kpi-info">
                     <p className="kpi-label">DESPESAS</p>
                     <h2 className="kpi-value text-neon-red">{formatCurrency(totalExp)}</h2>
                     <div className="kpi-trend negative">
                        <TrendingDown size={12} /> <span style={{fontSize:'0.6rem', fontWeight: 800}}>PASSIVOS NO MÊS</span>
                     </div>
                  </div>
               </div>

               <div className="glass-card kpi-card neon-glow-blue" style={{ borderLeft: '3px solid var(--primary)' }}>
                  <div className="kpi-info">
                     <p className="kpi-label">TOTAL DE ENTRADAS</p>
                     <h2 className="kpi-value text-neon-blue">{transacoes.length} LOGS</h2>
                     <div className="kpi-trend positive">
                        <CheckCircle2 size={12} /> <span style={{fontSize:'0.6rem', fontWeight: 800}}>INTEGRIDADE VERIFICADA</span>
                     </div>
                  </div>
               </div>

               <div className="glass-card kpi-card" style={{ borderLeft: '3px solid #8b5cf6' }}>
                  <div className="kpi-info">
                     <p className="kpi-label">TOTAL DE SAÍDAS</p>
                     <h2 className="kpi-value" style={{ color: '#8b5cf6' }}>{formatCurrency(totalInc - totalExp)}</h2>
                     <div className="kpi-trend positive">
                        <TrendingUp size={12} /> <span style={{fontSize:'0.6rem', fontWeight: 800}}>SUPERÁVIT ALTO</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* ROW 2: LEDGER TABLE */}
            <div className="table-row glass-card" style={{ flex: 1, minHeight: 0, padding: '1.2rem' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {[
                      { id: 'all', label: 'Todos' },
                      { id: 'incomes', label: 'Entradas' },
                      { id: 'expenses', label: 'Saídas' }
                    ].map(tab => (
                      <button 
                        key={tab.id} 
                        onClick={() => setFiltroTab(tab.id)}
                        style={{ 
                          background: filtroTab === tab.id ? 'var(--primary)' : 'rgba(255,255,255,0.03)', 
                          color: filtroTab === tab.id ? '#000' : '#64748b',
                          border: 'none', padding: '0.4rem 1rem', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', transition: '0.3s'
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                  <button className="elite-link"><Download size={14} /> EXPORTAR DADOS</button>
               </div>

               <div className="elite-table-container custom-scrollbar" style={{ flex: 1, overflowY: 'auto' }}>
                  <table className="elite-table">
                    <thead>
                      <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.05)' }}>
                        <th style={{ padding: '1rem', textAlign: 'left', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 800 }}>DATA/HORA</th>
                        <th style={{ padding: '1rem', textAlign: 'left', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 800 }}>DESCRIÇÃO</th>
                        <th style={{ padding: '1rem', textAlign: 'left', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 800 }}>CATEGORIA</th>
                        <th style={{ padding: '1rem', textAlign: 'left', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 800 }}>STATUS</th>
                        <th style={{ padding: '1rem', textAlign: 'right', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 800 }}>VALOR DO ATIVO</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transacoesFiltradas.map((t, i) => {
                        const isEntrada = t.tipo === 'inc' || t.tipo === 'receita';
                        const isPendente = t.status === 'a pagar' || t.status === 'a receber';
                        const dotColor = isEntrada 
                          ? (isPendente ? '#eab308' : '#10b981') 
                          : (isPendente ? '#eab308' : '#ef4444');

                        return (
                          <tr key={t.id || i} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.02)'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                            <td style={{ padding: '1.2rem 1rem', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>{new Date(t.created_at).toLocaleDateString('pt-BR')} {new Date(t.created_at).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}</td>
                            <td style={{ padding: '1.2rem 1rem', fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>{(t.description || t.descricao || '').toUpperCase()}</td>
                            <td style={{ padding: '1.2rem 1rem' }}><span className="elite-badge" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>{(t.category || t.categoria || 'OUTROS').toUpperCase()}</span></td>
                            <td style={{ padding: '1.2rem 1rem' }}>
                               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                 <div style={{ width: 8, height: 8, borderRadius: '50%', background: dotColor, boxShadow: `0 0 10px ${dotColor}` }}></div>
                                 <select 
                                   value={t.status || (isEntrada ? 'recebido' : 'pago')}
                                   onChange={async (e) => {
                                      const newVal = e.target.value;
                                      
                                      // Default optimistic upgrade
                                      setTransacoes(prev => prev.map(tr => tr.id === t.id ? { ...tr, status: newVal } : tr));
                                      
                                      if (t.id) {
                                        const { error } = await supabase.from('transacoes').update({ status: newVal }).eq('id', t.id);
                                        if (error) {
                                          console.error("Failed to update status", error);
                                          // Revert on failure
                                          setTransacoes(prev => prev.map(tr => tr.id === t.id ? { ...tr, status: t.status } : tr));
                                        }
                                      }
                                   }}
                                   style={{ 
                                     background: 'rgba(255,255,255,0.03)', 
                                     border: '1px solid rgba(255,255,255,0.1)', 
                                     color: isPendente ? '#eab308' : 'rgba(255,255,255,0.8)', 
                                     fontSize: '0.7rem', 
                                     fontWeight: 800, 
                                     textTransform: 'uppercase', 
                                     cursor: 'pointer', 
                                     outline: 'none', 
                                     borderRadius: '4px',
                                     padding: '0.2rem 0.4rem'
                                   }}
                                 >
                                   {isEntrada ? (
                                     <>
                                       <option value="recebido" style={{ color: 'black' }}>RECEBIDO</option>
                                       <option value="a receber" style={{ color: 'black' }}>A RECEBER</option>
                                     </>
                                   ) : (
                                     <>
                                       <option value="pago" style={{ color: 'black' }}>PAGO</option>
                                       <option value="a pagar" style={{ color: 'black' }}>A PAGAR</option>
                                     </>
                                   )}
                                 </select>
                               </div>
                            </td>
                            <td style={{ padding: '1.2rem 1rem', textAlign:'right', fontWeight: 900, fontSize: '1.05rem', color: isEntrada ? 'var(--accent)' : '#fff'}}>
                              {isEntrada ? '+' : '-'} {formatCurrency(Math.abs(t.valor))}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
               </div>
            </div>

         </div>
      </div>

      <style jsx>{`
        .dashboard-container { width: 100%; height: 100vh; position: relative; color: #fff; background: #020617; }
        .dashboard-content-wrapper { display: flex; flex-direction: column; height: 100vh; }
        .kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; flex-shrink: 0; }
        .kpi-card { display: flex; justify-content: space-between; padding: 1.2rem; height: 110px; }
        .kpi-label { font-size: 0.6rem; font-weight: 800; color: #64748b; letter-spacing: 0.1em; margin-bottom: 0.5rem; text-transform: uppercase; }
        .kpi-value { font-size: 1.4rem; font-weight: 900; margin: 0; }
        .table-row { flex: 1; min-height: 0; display: flex; flex-direction: column; }
        .search-box { display: flex; alignItems: center; gap: 0.8rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); padding: 0.6rem 1rem; borderRadius: '12px'; }
        .elite-badge { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 0.2rem 0.8rem; border-radius: 6px; font-size: 0.6rem; font-weight: 800; color: rgba(255,255,255,0.6); }
        .elite-link { font-size: 0.6rem; font-weight: 900; color: var(--primary); text-decoration: none; letter-spacing: 0.1em; display: flex; align-items: center; gap: 0.3rem; transition: 0.3s; border: none; background: none; cursor: pointer; }
        .elite-button-icon { width: 42px; height: 42px; border-radius: 12px; background: rgba(0, 210, 255, 0.08); border: 1px solid rgba(0, 210, 255, 0.15); display: flex; align-items: center; justify-content: center; color: var(--primary); cursor: pointer; transition: 0.4s; }
        @media (max-width: 1200px) { .kpi-row { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 768px) { .kpi-row { grid-template-columns: 1fr; } .dashboard-container { overflow-y: auto; } .dashboard-content-wrapper { height: auto; } .zero-scroll { height: auto !important; overflow: auto !important; } }
      `}</style>
    </div>
  );
}

export default function TransicoesPage() {
  return (
    <Suspense fallback={<div className="dashboard-container"><div className="elite-pulse">INITIALIZING LEDGER...</div></div>}>
      <TransicoesContent />
    </Suspense>
  );
}
