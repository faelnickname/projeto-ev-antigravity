"use client";

import { Target, Plus, X, AlertTriangle, CheckCircle2, TrendingUp, Zap, Activity, ShieldCheck, RefreshCw, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { MOCK_METAS } from '@/lib/mockData';

import { dataService } from '@/lib/dataService';

export default function MetasPage() {
  const [metas, setMetas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [recarregando, setRecarregando] = useState(false);
  
  // Form state
  const [categoria, setCategoria] = useState('');
  const [limite, setLimite] = useState('');

  const fetchDados = async () => {
    try {
      setRecarregando(true);
      const metasData = await dataService.getGoals();
      const transacoes = await dataService.getTransactions();
      
      if (!metasData || metasData.length === 0) {
        setMetas([]);
        return;
      }

      // Calcular gasto por categoria baseado nas transacoes
      const calculoMetas = metasData.map(m => {
        const gasto = transacoes
          .filter(t => (t.category || t.categoria) === m.categoria && t.tipo === 'exp')
          .reduce((sum, t) => sum + Math.abs(Number(t.valor) || 0), 0);
        
        return {
          ...m,
          gasto,
          percent: m.valor_limite > 0 ? (gasto / m.valor_limite) * 100 : 0
        };
      });

      setMetas(calculoMetas);
    } catch (err) {
      console.error('Erro ao carregar metas:', err);
      setMetas([]);
    } finally {
      setLoading(false);
      setRecarregando(false);
    }
  };

  useEffect(() => {
    fetchDados();
    
    const channel = supabase.channel('metas-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orcamentos' }, () => fetchDados())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transacoes' }, () => fetchDados())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const totalLimite = metas.reduce((acc, m) => acc + (Number(m.valor_limite) || 0), 0);
  const totalGasto = metas.reduce((acc, m) => acc + (Number(m.gasto) || 0), 0);
  const eficienciaGlobal = totalLimite > 0 ? (1 - (totalGasto / totalLimite)) * 100 : 100;

  const formatCurrency = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="dashboard-container zero-scroll fade-in">
      <div className="dashboard-content-wrapper">
         <header style={{ height: 'var(--header-h)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1rem', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '0.8rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
               <h1 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff', letterSpacing: '0.05em', textTransform: 'uppercase', margin: 0 }}>
                 OBJETIVOS DE <span className="text-neon-blue" style={{ color: 'var(--primary)' }}>PERFORMANCE</span>
               </h1>
               <p style={{ fontSize: '0.6rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Núcleo de Inteligência v4.2 • Monitoramento de Eficiência</p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
               <button onClick={() => fetchDados()} className="elite-button-icon" style={{ width: '38px', height: '38px' }}>
                  <div className={recarregando ? 'elite-pulse' : ''}>
                     <RefreshCw size={18} />
                  </div>
               </button>
               <button onClick={() => setModalAberto(true)} className="btn" style={{ fontSize: '0.7rem', padding: '0.6rem 1.2rem', borderRadius: '10px' }}>
                  <Plus size={16} /> DEFINIR META
               </button>
            </div>
         </header>

         <div className="elite-main-view custom-scrollbar" style={{ flex: 1, overflowY: 'hidden', display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '0 1rem 1rem 1rem' }}>
            
            {/* ROW 1: KPI SCORECARDS */}
            <div className="kpi-row">
               <div className="glass-card kpi-card neon-glow-blue">
                  <div className="kpi-info">
                     <p className="kpi-label">LIMITE TOTAL ESTIMADO</p>
                     <h2 className="kpi-value text-neon-blue">{formatCurrency(totalLimite)}</h2>
                     <div className="kpi-trend positive">
                        <TrendingUp size={12} /> <span style={{fontSize:'0.6rem', fontWeight: 800}}>CAPITAL ALOCADO</span>
                     </div>
                  </div>
                  <Target size={32} style={{ opacity: 0.1, alignSelf: 'center' }} />
               </div>

               <div className="glass-card kpi-card neon-glow-green">
                  <div className="kpi-info">
                     <p className="kpi-label">RATING DE EFICIÊNCIA</p>
                     <h2 className="kpi-value text-neon-green">{eficienciaGlobal.toFixed(1)}% ÓTIMO</h2>
                     <div className="kpi-trend positive">
                        <ShieldCheck size={12} /> <span style={{fontSize:'0.6rem', fontWeight: 800}}>MARGEM SEGURA</span>
                     </div>
                  </div>
               </div>

               <div className="glass-card kpi-card neon-glow-red">
                  <div className="kpi-info">
                     <p className="kpi-label">CONSUMO DE RECURSOS</p>
                     <h2 className="kpi-value text-neon-red">{formatCurrency(totalGasto)}</h2>
                     <div className="kpi-trend negative">
                        <Activity size={12} /> <span style={{fontSize:'0.6rem', fontWeight: 800}}>TAXA DE GASTO ATUAL</span>
                     </div>
                  </div>
               </div>

               <div className="glass-card kpi-card" style={{ borderLeft: '3px solid #f59e0b' }}>
                  <div className="kpi-info">
                     <p className="kpi-label">OBJETIVOS ATIVOS</p>
                     <h2 className="kpi-value" style={{ color: '#f59e0b' }}>{metas.length} VETORES</h2>
                     <div className="kpi-trend positive" style={{ color: '#f59e0b' }}>
                        <Zap size={12} /> <span style={{fontSize:'0.6rem', fontWeight: 800}}>OTIMIZAÇÃO ATIVA</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* ROW 2: PROGRESS CARDS GRID */}
            <div className="table-row glass-card" style={{ flex: 1, minHeight: 0, padding: '1.5rem' }}>
               <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>MONITORAMENTO DE PROGRESSO POR SETOR</h3>
               <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '1.2rem', paddingBottom: '1rem' }}>
                    {metas.map((meta, i) => {
                       const color = meta.percent > 90 ? 'var(--danger)' : meta.percent > 70 ? '#f59e0b' : 'var(--accent)';
                       const glow = meta.percent > 90 ? 'neon-glow-red' : meta.percent > 70 ? '' : 'neon-glow-green';

                       return (
                         <div key={i} className={`glass-card elite-row ${glow}`} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                               <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                  <div style={{ padding: '0.6rem', borderRadius: '10px', background: 'rgba(255,255,255,0.05)' }}>
                                     <Target size={20} color={color} />
                                  </div>
                                  <div>
                                     <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 900, margin: 0, textTransform: 'uppercase' }}>{meta.categoria}</h4>
                                     <span style={{ fontSize: '0.55rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Setor Estratégico</span>
                                  </div>
                               </div>
                               <div style={{ textAlign: 'right' }}>
                                  <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff' }}>{meta.percent.toFixed(1)}%</span>
                               </div>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                               <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.04)', borderRadius: '20px', overflow: 'hidden' }}>
                                  <div style={{ height: '100%', width: `${Math.min(meta.percent, 100)}%`, background: color, borderRadius: '20px', boxShadow: `0 0 15px ${color}`, transition: 'width 1.2s cubic-bezier(0.23, 1, 0.32, 1)' }}></div>
                               </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                <div>
                                   <p style={{ fontSize: '0.55rem', color: '#64748b', fontWeight: 800, margin: 0 }}>ALOCADO</p>
                                   <p style={{ fontSize: '0.9rem', fontWeight: 900, color: '#fff', margin: 0 }}>{formatCurrency(meta.gasto)}</p>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                   {meta.percent > 100 ? <AlertTriangle size={16} color="var(--danger)" /> : <CheckCircle2 size={16} color="var(--accent)" />}
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                   <p style={{ fontSize: '0.55rem', color: '#64748b', fontWeight: 800, margin: 0 }}>TETO ESTABELECIDO</p>
                                   <p style={{ fontSize: '0.9rem', fontWeight: 900, color: color, margin: 0 }}>{formatCurrency(meta.valor_limite)}</p>
                                </div>
                            </div>
                         </div>
                       );
                    })}
                  </div>
               </div>
            </div>

         </div>
      </div>

      {modalAberto && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(15px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="glass-card" style={{ width: '95%', maxWidth: '450px', padding: '2.5rem', border: '1px solid var(--primary-glow)' }}>
             <h2 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 900, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CALIBRAÇÃO DE VETOR</h2>
             <p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, marginBottom: '2rem' }}>Defina limites de gastos para gestão via IA.</p>
             
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '2.5rem' }}>
                <input type="text" placeholder="NOME DA CATEGORIA" style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.9rem', borderRadius: '12px', color: '#fff', outline: 'none', fontWeight: 700 }} />
                <input type="number" placeholder="VALOR LIMITE (R$)" style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.9rem', borderRadius: '12px', color: '#fff', outline: 'none', fontWeight: 700 }} />
             </div>

             <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => setModalAberto(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: 'none', color: '#fff', padding: '1rem', borderRadius: '14px', fontWeight: 800, cursor: 'pointer' }}>CANCELAR</button>
                <button onClick={() => setModalAberto(false)} className="btn" style={{ flex: 1, padding: '1rem', borderRadius: '14px', justifyContent: 'center' }}>SALVAR VETOR</button>
             </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .dashboard-container { width: 100%; height: 100vh; position: relative; color: #fff; background: #020617; }
        .dashboard-content-wrapper { display: flex; flex-direction: column; height: 100vh; }
        .kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; flex-shrink: 0; }
        .kpi-card { display: flex; justify-content: space-between; padding: 1.2rem; height: 110px; }
        .kpi-label { font-size: 0.6rem; font-weight: 800; color: #64748b; letter-spacing: 0.1em; margin-bottom: 0.5rem; text-transform: uppercase; }
        .kpi-value { font-size: 1.4rem; font-weight: 900; margin: 0; }
        .card-title { font-size: 0.65rem; font-weight: 900; color: #64748b; letter-spacing: 0.15em; text-transform: uppercase; border-left: 3px solid var(--primary); padding-left: 0.8rem; }
        .table-row { flex: 1; min-height: 0; display: flex; flex-direction: column; }
        .elite-button-icon { width: 42px; height: 42px; border-radius: 12px; background: rgba(0, 210, 255, 0.08); border: 1px solid rgba(0, 210, 255, 0.15); display: flex; align-items: center; justify-content: center; color: var(--primary); cursor: pointer; transition: 0.4s; }
        @media (max-width: 1200px) { .kpi-row { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 768px) { .kpi-row { grid-template-columns: 1fr; } .dashboard-container { overflow-y: auto; } .dashboard-content-wrapper { height: auto; } .zero-scroll { height: auto !important; overflow: auto !important; } }
      `}</style>
    </div>
  );
}
