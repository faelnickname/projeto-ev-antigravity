"use client";

import { Calendar, Search } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { dataService } from '@/lib/dataService';

export default function HistoricoPage() {
  const [transacoes, setTransacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth());
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear());

  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  async function fetchDados() {
    try {
      setLoading(true);
      const data = await dataService.getTransactions();
      setTransacoes(data || []);
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDados();
  }, []);

  const transacoesFiltradas = useMemo(() => {
    return transacoes.filter((t: any) => {
      const d = new Date(t.created_at);
      return d.getMonth() === mesSelecionado && d.getFullYear() === anoSelecionado;
    });
  }, [transacoes, mesSelecionado, anoSelecionado]);

  const totalInc = transacoesFiltradas.filter((t: any) => t.tipo === 'inc' || t.tipo === 'receita' || t.tipo === 'entrada').reduce((acc, t) => acc + Math.abs(Number(t.valor)), 0);
  const totalExp = transacoesFiltradas.filter((t: any) => t.tipo === 'exp' || t.tipo === 'despesa' || t.tipo === 'saida').reduce((acc, t) => acc + Math.abs(Number(t.valor)), 0);

  const formatCurrency = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="dashboard-container zero-scroll fade-in">
      <div className="dashboard-content-wrapper">
         <header style={{ height: 'var(--header-h)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1.5rem', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
               <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff', letterSpacing: '0.05em', textTransform: 'uppercase', margin: 0 }}>
                 HISTÓRICO <span className="text-neon-blue" style={{ color: 'var(--primary)' }}>MENSAL</span>
               </h1>
               <p style={{ fontSize: '0.65rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Memória Consolidada de Registros • Auditoria</p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '12px' }}>
                 <Calendar size={16} color="var(--primary)" />
                 <select 
                   value={mesSelecionado}
                   onChange={e => setMesSelecionado(Number(e.target.value))}
                   style={{ background: 'transparent', color: 'white', border: 'none', outline: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700 }}
                 >
                   {meses.map((m, i) => <option key={i} value={i} style={{ color: 'black' }}>{m}</option>)}
                 </select>
               </div>
            </div>
         </header>

         <div className="elite-main-view custom-scrollbar" style={{ flex: 1, overflowY: 'hidden', display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0 1.5rem 1.5rem 1.5rem' }}>
            
            <div className="kpi-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
               <div className="glass-card kpi-card neon-glow-green" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: '3px solid #10b981' }}>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 800, letterSpacing: '0.1em' }}>ENTRADAS NO MÊS</p>
                  <h2 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#10b981', margin: '0.5rem 0' }}>{formatCurrency(totalInc)}</h2>
               </div>
               <div className="glass-card kpi-card neon-glow-red" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: '3px solid #ef4444' }}>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 800, letterSpacing: '0.1em' }}>SAÍDAS NO MÊS</p>
                  <h2 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#ef4444', margin: '0.5rem 0' }}>{formatCurrency(totalExp)}</h2>
               </div>
               <div className="glass-card kpi-card neon-glow-blue" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: '3px solid var(--primary)' }}>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 800, letterSpacing: '0.1em' }}>RESULTADO LÍQUIDO</p>
                  <h2 style={{ fontSize: '2.4rem', fontWeight: 900, color: totalInc - totalExp >= 0 ? '#10b981' : '#ef4444', margin: '0.5rem 0' }}>{formatCurrency(totalInc - totalExp)}</h2>
               </div>
            </div>

            <div className="table-row glass-card" style={{ flex: 1, minHeight: 0, padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
               <h3 style={{ fontSize: '0.9rem', color: 'white', marginBottom: '1.5rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                 Registros Processados <span style={{ color: 'var(--primary)' }}>• {meses[mesSelecionado]}</span>
               </h3>
               
               <div className="elite-table-container custom-scrollbar" style={{ flex: 1, overflowY: 'auto' }}>
                  <table className="elite-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ position: 'sticky', top: 0, background: 'rgba(2, 6, 23, 0.95)', backdropFilter: 'blur(5px)', zIndex: 10 }}>
                      <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.05)' }}>
                        <th style={{ padding: '1rem', textAlign: 'left', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 800 }}>DATA/HORA</th>
                        <th style={{ padding: '1rem', textAlign: 'left', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 800 }}>DESCRIÇÃO</th>
                        <th style={{ padding: '1rem', textAlign: 'left', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 800 }}>CATEGORIA</th>
                        <th style={{ padding: '1rem', textAlign: 'right', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 800 }}>VALOR LÍQUIDO</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transacoesFiltradas.length > 0 ? transacoesFiltradas.map((t: any, i: number) => (
                        <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', transition: 'background 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.02)'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                          <td style={{ padding: '1.2rem 1rem', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>
                            {new Date(t.created_at).toLocaleDateString('pt-BR')} {new Date(t.created_at).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}
                          </td>
                          <td style={{ padding: '1.2rem 1rem', color: '#fff', fontSize: '0.9rem', fontWeight: 700 }}>{(t.descricao || t.description || '').toUpperCase()}</td>
                          <td style={{ padding: '1.2rem 1rem' }}>
                            <span style={{ padding: '0.4rem 0.8rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 800 }}>
                              {(t.categoria || t.category || 'OUTROS').toUpperCase()}
                            </span>
                          </td>
                          <td style={{ padding: '1.2rem 1rem', textAlign: 'right', color: (t.tipo === 'inc' || t.tipo === 'receita' || t.tipo === 'entrada') ? '#10b981' : '#fff', fontWeight: 800, fontSize: '1.05rem' }}>
                            {(t.tipo === 'inc' || t.tipo === 'receita' || t.tipo === 'entrada') ? '+' : '-'} {formatCurrency(Math.abs(t.valor))}
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem', fontWeight: 700 }}>NENHUM REGISTRO LOCALIZADO PARA A COMPETÊNCIA SELECIONADA.</td></tr>
                      )}
                    </tbody>
                  </table>
               </div>
            </div>
         </div>
      </div>
      <style jsx>{`
        .dashboard-container { width: 100%; height: 100vh; position: relative; color: #fff; background: #020617; }
        .dashboard-content-wrapper { display: flex; flex-direction: column; height: 100vh; }
      `}</style>
    </div>
  );
}
