"use client";

import { Briefcase, CreditCard, Hotel, Utensils, Construction, Car, TrendingDown, ArrowLeft, RefreshCw, ChevronRight, Activity, Map, Coffee } from 'lucide-react';
import { useState, useEffect } from 'react';
import { dataService } from '@/lib/dataService';
import { supabase } from '@/lib/supabase';

const SUB_ICONS: Record<string, any> = {
  'hotel': Hotel,
  'alimentação': Utensils,
  'almoço': Utensils,
  'café': Coffee,
  'jantar': Utensils,
  'pedágio': Map,
  'lavagem': Car,
  'lavagem de automóvel': Car,
};

export default function CoralPage() {
  const [transacoes, setTransacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [recarregando, setRecarregando] = useState(false);

  const fetchDados = async () => {
    try {
      setRecarregando(true);
      const data = await dataService.getCoralExpenses();
      setTransacoes(data || []);
    } catch (err) {
      console.error('Erro ao carregar despesas coral:', err);
    } finally {
      setLoading(false);
      setRecarregando(false);
    }
  };

  useEffect(() => {
    fetchDados();
    const channel = supabase.channel('coral-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transacoes', filter: "categoria=eq.Despesa Coral" }, () => fetchDados())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const totalGasto = transacoes.reduce((acc, t) => acc + Math.abs(Number(t.valor) || 0), 0);
  
  // Agrupar por subcategoria
  const porSubcategoria = transacoes.reduce((acc: any, t) => {
    const sub = (t.subcategoria || 'outros').toLowerCase();
    acc[sub] = (acc[sub] || 0) + Math.abs(Number(t.valor) || 0);
    return acc;
  }, {});

  const formatCurrency = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  if (loading && transacoes.length === 0) {
    return (
      <div className="dashboard-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="elite-pulse" style={{ color: 'var(--primary)', fontWeight: 900 }}>INICIANDO MÓDULO CORAL...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container zero-scroll fade-in">
      <div className="dashboard-content-wrapper">
         <header style={{ height: 'var(--header-h)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1rem', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
               <div style={{ width: '40px', height: '40px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                  <Briefcase size={22} />
               </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                   <h1 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff', letterSpacing: '0.05em', textTransform: 'uppercase', margin: 0 }}>
                     DESPESAS <span className="text-neon-green" style={{ color: 'var(--primary)' }}>CORAL</span>
                   </h1>
                   <p style={{ fontSize: '0.6rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Centro de Custos Estratégicos • Operação Ativa</p>
                </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
               <button onClick={() => fetchDados()} className="elite-button-icon" style={{ width: '38px', height: '38px' }}>
                  <div className={recarregando ? 'elite-pulse' : ''}>
                     <RefreshCw size={18} />
                  </div>
               </button>
            </div>
         </header>

         <div className="elite-main-view custom-scrollbar" style={{ flex: 1, overflowY: 'hidden', display: 'flex', flexDirection: 'column', gap: '1.2rem', padding: '0 1rem 1rem 1rem' }}>
            
            {/* ROW 1: KPI SCORECARDS */}
            <div className="kpi-row">
               <div className="glass-card kpi-card neon-glow-blue" style={{ borderLeft: '3px solid #38bdf8' }}>
                   <div className="kpi-info">
                      <p className="kpi-label">TOTAL DESPESAS CORAL</p>
                      <h2 className="kpi-value text-neon-green" style={{ color: 'var(--primary)' }}>{formatCurrency(totalGasto)}</h2>
                      <div className="kpi-trend positive" style={{ color: 'var(--primary)' }}>
                         <TrendingDown size={12} /> <span style={{fontSize:'0.6rem', fontWeight: 800}}>FLUXO DE CAIXA OPERACIONAL</span>
                      </div>
                   </div>
               </div>

               <div className="glass-card kpi-card" style={{ borderLeft: '3px solid var(--accent)' }}>
                  <div className="kpi-info">
                     <p className="kpi-label">NOTAS REGISTRADAS</p>
                     <h2 className="kpi-value text-neon-green">{transacoes.length} ITEMS</h2>
                     <div className="kpi-trend positive">
                        <Activity size={12} /> <span style={{fontSize:'0.6rem', fontWeight: 800}}>SISTEMA AUDITADO</span>
                     </div>
                  </div>
               </div>

               <div className="glass-card kpi-card" style={{ borderLeft: '3px solid var(--danger)' }}>
                  <div className="kpi-info">
                     <p className="kpi-label">MAIOR DESPESA ÚNICA</p>
                     <h2 className="kpi-value text-neon-red">{formatCurrency(Math.max(...transacoes.map(t => Math.abs(t.valor)), 0))}</h2>
                     <div className="kpi-trend negative">
                        <ArrowLeft size={12} /> <span style={{fontSize:'0.6rem', fontWeight: 800}}>PONTO DE CONTROLE</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* ROW 2: SUB-CATEGORIES + LOGS */}
            <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '1.2rem', flex: 1, minHeight: 0 }}>
               
               {/* SUB-CATEGORIES PANEL */}
               <div className="glass-card custom-scrollbar" style={{ padding: '1.5rem', overflowY: 'auto' }}>
                  <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>DISTRIBUIÇÃO POR SETOR</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                     {Object.entries(porSubcategoria).map(([sub, valor]: [string, any]) => {
                        const Icon = SUB_ICONS[sub] || Briefcase;
                        const percent = (valor / totalGasto) * 100;
                        return (
                           <div key={sub} className="elite-row" style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                    <Icon size={18} color="var(--primary)" />
                                    <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#fff', textTransform: 'uppercase' }}>{sub}</span>
                                 </div>
                                 <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--primary)' }}>{formatCurrency(valor)}</span>
                              </div>
                              <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                                 <div style={{ width: `${percent}%`, height: '100%', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary-glow)' }}></div>
                              </div>
                           </div>
                        );
                     })}
                     {transacoes.length === 0 && (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.7rem' }}>
                           NENHUM REGISTRO CORAL LOCALIZADO.
                        </div>
                     )}
                  </div>
               </div>

               {/* RECENT LOGS */}
               <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                  <h3 className="card-title" style={{ marginBottom: '1.2rem' }}>ÚLTIMOS REGISTROS "CORAL"</h3>
                  <div className="elite-table-container custom-scrollbar" style={{ flex: 1, overflowY: 'auto' }}>
                     <table className="elite-table">
                        <thead>
                           <tr>
                              <th>DATA/HORA</th>
                              <th>SUB-SETOR</th>
                              <th>DESCRIÇÃO/NOTAS</th>
                              <th style={{ textAlign: 'right' }}>VALOR</th>
                           </tr>
                        </thead>
                        <tbody>
                           {transacoes.map((t, i) => (
                              <tr key={i} className="elite-row">
                                 <td style={{ color: '#64748b', fontSize: '0.65rem', fontWeight: 800 }}>{new Date(t.created_at).toLocaleDateString('pt-BR')} {new Date(t.created_at).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}</td>
                                 <td><span className="elite-badge" style={{ color: 'var(--primary)', borderColor: 'rgba(0, 210, 255, 0.2)' }}>{(t.subcategoria || 'Geral').toUpperCase()}</span></td>
                                 <td style={{ color: '#fff', fontSize: '0.7rem', fontWeight: 800 }}>{(t.descricao || '').toUpperCase()}</td>
                                 <td style={{ textAlign: 'right', fontWeight: 900, color: '#fff' }}>{formatCurrency(Math.abs(t.valor))}</td>
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
        .dashboard-container { width: 100%; height: 100vh; position: relative; color: #fff; background: #020617; }
        .dashboard-content-wrapper { display: flex; flex-direction: column; height: 100vh; }
        .kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; flex-shrink: 0; }
        .kpi-card { display: flex; justify-content: space-between; padding: 1.2rem; height: 110px; }
        .kpi-label { font-size: 0.6rem; font-weight: 800; color: #64748b; letter-spacing: 0.1em; margin-bottom: 0.5rem; text-transform: uppercase; }
        .kpi-value { font-size: 1.4rem; font-weight: 900; margin: 0; }
        .card-title { font-size: 0.65rem; font-weight: 900; color: #64748b; letter-spacing: 0.15em; text-transform: uppercase; border-left: 3px solid var(--primary); padding-left: 0.8rem; }
        .elite-badge { background: rgba(0, 210, 255, 0.03); border: 1px solid rgba(255,255,255,0.08); padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.55rem; font-weight: 800; }
        @media (max-width: 1200px) { .kpi-row { grid-template-columns: 1fr 1fr; } }
      `}</style>
    </div>
  );
}
