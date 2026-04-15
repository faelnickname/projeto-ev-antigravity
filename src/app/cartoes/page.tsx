"use client";

import { useState, useEffect } from 'react';
import { CreditCard, Plus, ArrowLeft, Trash2, Landmark, Zap, TrendingUp, ChevronRight, Activity, ShieldCheck, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { dataService } from '@/lib/dataService';
import { supabase } from '@/lib/supabase';

export default function CartoesPage() {
  const [cartoes, setCartoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoLimite, setNovoLimite] = useState('');
  const [bandeira, setBandeira] = useState('Visa');
  const [cor, setCor] = useState('#38bdf8');
  const [salvando, setSalvando] = useState(false);

  async function fetchCartoes() {
    try {
      setLoading(true);
      const data = await dataService.getCards();
      setCartoes(data || []);
    } catch (err) {
      console.error('Erro ao carregar cartões:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddCartao() {
    if (!novoNome || !novoLimite) return;
    try {
      setSalvando(true);
      await dataService.saveCard({
        nome: novoNome,
        limite: parseFloat(novoLimite),
        fatura_atual: 0,
        bandeira: bandeira,
        cor_hex: cor
      });
      setShowAddModal(false);
      setNovoNome('');
      setNovoLimite('');
      fetchCartoes();
    } catch (err) {
      console.error('Erro ao salvar cartão:', err);
    } finally {
      setSalvando(false);
    }
  }

  useEffect(() => {
    fetchCartoes();
    
    const channel = supabase.channel('cartoes-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cartoes' }, () => fetchCartoes())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const totalFaturas = cartoes.reduce((acc, c) => acc + (Number(c.fatura_atual) || 0), 0);
  const totalLimites = cartoes.reduce((acc, c) => acc + (Number(c.limite) || 0), 0);
  const limiteDisponivel = totalLimites - totalFaturas;

  const formatCurrency = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="dashboard-container zero-scroll fade-in">
      <div className="dashboard-content-wrapper">
         <header style={{ height: 'var(--header-h)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1rem', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '0.8rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
               <h1 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff', letterSpacing: '0.05em', textTransform: 'uppercase', margin: 0 }}>
                 GESTÃO DE <span className="text-neon-blue" style={{ color: 'var(--primary)' }}>CARTÕES</span>
               </h1>
               <p style={{ fontSize: '0.6rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Núcleo de Inteligência v4.2 • Monitoramento de Passivos</p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
               <button onClick={() => setShowAddModal(true)} className="btn" style={{ fontSize: '0.7rem', padding: '0.6rem 1.2rem', borderRadius: '10px' }}>
                  <Plus size={16} /> NOVO ATIVO
               </button>
            </div>
         </header>

         <div className="elite-main-view custom-scrollbar" style={{ flex: 1, overflowY: 'hidden', display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '0 1rem 1rem 1rem' }}>
            
            {/* ROW 1: KPI SCORECARDS */}
            <div className="kpi-row">
               <div className="glass-card kpi-card neon-glow-red">
                  <div className="kpi-info">
                     <p className="kpi-label">TOTAL FATURAS ABERTAS</p>
                     <h2 className="kpi-value text-neon-red">{formatCurrency(totalFaturas)}</h2>
                     <div className="kpi-trend negative">
                        <Activity size={12} /> <span style={{fontSize:'0.6rem', fontWeight: 800}}>DÉBITO ATIVO</span>
                     </div>
                  </div>
                  <ShieldCheck size={32} style={{ opacity: 0.1, alignSelf: 'center' }} />
               </div>

               <div className="glass-card kpi-card neon-glow-green">
                  <div className="kpi-info">
                     <p className="kpi-label">LIMITE DISPONÍVEL GLOBAL</p>
                     <h2 className="kpi-value text-neon-green">{formatCurrency(limiteDisponivel)}</h2>
                     <div className="kpi-trend positive">
                        <TrendingUp size={12} /> <span style={{fontSize:'0.6rem', fontWeight: 800}}>LIQUIDEZ DISPONÍVEL</span>
                     </div>
                  </div>
                  <Zap size={32} style={{ opacity: 0.1, alignSelf: 'center' }} />
               </div>

               <div className="glass-card kpi-card neon-glow-blue">
                  <div className="kpi-info">
                     <p className="kpi-label">EXPOSIÇÃO TOTAL DE CRÉDITO</p>
                     <h2 className="kpi-value text-neon-blue">{formatCurrency(totalLimites)}</h2>
                     <div className="kpi-trend positive" style={{ color: 'var(--primary)' }}>
                        <ShieldCheck size={12} /> <span style={{fontSize:'0.6rem', fontWeight: 800}}>SCORE: ALTO</span>
                     </div>
                  </div>
               </div>

               <div className="glass-card kpi-card" style={{ borderLeft: '3px solid #8b5cf6', background: 'rgba(139, 92, 246, 0.05)' }}>
                  <div className="kpi-info" style={{ width: '100%' }}>
                     <p className="kpi-label">TOKEN DE INTEGRAÇÃO</p>
                     <code style={{ fontSize: '0.65rem', background: 'rgba(0,0,0,0.3)', padding: '0.4rem', borderRadius: '4px', display: 'block', marginBottom: '0.4rem', color: '#fff', border: '1px solid rgba(139, 92, 246, 0.3)' }}>nexo-elite-2024</code>
                     <p style={{ fontSize: '0.55rem', color: '#64748b', fontWeight: 700, margin: 0 }}>USE ESTE TOKEN NO SEU N8N / TASKER</p>
                  </div>
               </div>
            </div>

            {/* ROW 2: VISUAL CARDS GRID */}
            <div className="table-row glass-card" style={{ flex: 1, minHeight: 0, padding: '1.5rem' }}>
               <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>CARTÕES DIGITAIS ATIVOS</h3>
               <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem', paddingBottom: '1rem' }}>
                    {cartoes.map(cartao => {
                       const progresso = (cartao.fatura_atual / cartao.limite) * 100;
                       const cardColor = cartao.cor_hex || '#38bdf8';

                       return (
                         <div key={cartao.id} className="glass-card elite-row" style={{ padding: '1.8rem', position: 'relative', overflow: 'hidden', borderLeft: `4px solid ${cardColor}`, background: 'rgba(255,255,255,0.02)' }}>
                           <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: cardColor, filter: 'blur(60px)', opacity: 0.2 }}></div>
                           
                           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ background: `${cardColor}15`, padding: '0.8rem', borderRadius: '12px', border: `1px solid ${cardColor}30` }}>
                                   <CreditCard size={24} color={cardColor} />
                                </div>
                                <div>
                                  <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 900, margin: 0, textTransform: 'uppercase' }}>{cartao.nome}</h4>
                                  <span style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>REDE: {cartao.bandeira || 'Visa'}</span>
                                </div>
                             </div>
                           </div>

                           <div style={{ marginBottom: '1.2rem', position: 'relative', zIndex: 1 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                                 <span style={{ color: '#64748b', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase' }}>FATURA ATUAL</span>
                                 <span style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 900 }}>{formatCurrency(cartao.fatura_atual || 0)}</span>
                              </div>
                              
                              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden', marginBottom: '0.6rem' }}>
                                 <div style={{ height: '100%', width: `${Math.min(progresso || 0, 100)}%`, background: progresso > 80 ? 'var(--danger)' : cardColor, borderRadius: '10px', boxShadow: `0 0 10px ${cardColor}50`, transition: 'width 1s cubic-bezier(0.23, 1, 0.32, 1)' }}></div>
                              </div>
                              
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                 <span style={{ color: '#475569', fontSize: '0.6rem', fontWeight: 800 }}>LIMITE {formatCurrency(cartao.limite)}</span>
                                 <span style={{ color: progresso > 85 ? 'var(--danger)' : 'var(--accent)', fontSize: '0.65rem', fontWeight: 900 }}>
                                    {formatCurrency(cartao.limite - (cartao.fatura_atual || 0))} DISPONÍVEL
                                 </span>
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

      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(15px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="glass-card" style={{ width: '95%', maxWidth: '480px', padding: '2.5rem', animation: 'fadeIn 0.4s cubic-bezier(0.23, 1, 0.32, 1)', border: '1px solid var(--primary-glow)' }}>
             <h2 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 900, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CONECTAR NOVO ATIVO</h2>
             <p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, marginBottom: '2rem', textTransform: 'uppercase' }}>Integração de Sincronismo via API Core</p>
             
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '2.5rem' }}>
                <div>
                   <label style={{ display: 'block', color: '#64748b', fontSize: '0.6rem', fontWeight: 900, marginBottom: '0.5rem', textTransform: 'uppercase' }}>NOME DO ATIVO</label>
                   <input 
                     type="text" 
                     placeholder="Ex: C6 Black Carbon" 
                     value={novoNome}
                     onChange={(e) => setNovoNome(e.target.value)}
                     style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.9rem', borderRadius: '12px', color: '#fff', outline: 'none', fontWeight: 700 }} 
                   />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                   <div>
                      <label style={{ display: 'block', color: '#64748b', fontSize: '0.6rem', fontWeight: 900, marginBottom: '0.5rem', textTransform: 'uppercase' }}>LIMITE (R$)</label>
                      <input 
                        type="number" 
                        placeholder="Ex: 25000" 
                        value={novoLimite}
                        onChange={(e) => setNovoLimite(e.target.value)}
                        style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.9rem', borderRadius: '12px', color: '#fff', outline: 'none', fontWeight: 700 }} 
                      />
                   </div>
                   <div>
                      <label style={{ display: 'block', color: '#64748b', fontSize: '0.6rem', fontWeight: 900, marginBottom: '0.5rem', textTransform: 'uppercase' }}>BANDEIRA</label>
                      <select 
                        value={bandeira}
                        onChange={(e) => setBandeira(e.target.value)}
                        style={{ width: '100%', background: 'rgba(2, 6, 23, 1)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.9rem', borderRadius: '12px', color: '#fff', outline: 'none', fontWeight: 700 }}
                      >
                         <option value="Visa">Visa</option>
                         <option value="Mastercard">Mastercard</option>
                         <option value="Amex">Amex</option>
                         <option value="Elo">Elo</option>
                      </select>
                   </div>
                </div>
                <div>
                   <label style={{ display: 'block', color: '#64748b', fontSize: '0.6rem', fontWeight: 900, marginBottom: '0.5rem', textTransform: 'uppercase' }}>COR DE IDENTIFICAÇÃO</label>
                   <input 
                     type="color" 
                     value={cor}
                     onChange={(e) => setCor(e.target.value)}
                     style={{ width: '100%', height: '40px', background: 'none', border: 'none', cursor: 'pointer' }} 
                   />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                 <button onClick={() => setShowAddModal(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '1rem', borderRadius: '14px', fontWeight: 800, cursor: 'pointer' }}>
                    ABORTAR
                 </button>
                 <button onClick={handleAddCartao} disabled={salvando} className="btn" style={{ flex: 1, padding: '1rem', borderRadius: '14px', justifyContent: 'center' }}>
                    {salvando ? 'CONECTANDO...' : 'ESTABELECER LINK'}
                 </button>
              </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .dashboard-container { width: 100%; height: 100vh; position: relative; color: #fff; background: #020617; }
        .dashboard-content-wrapper { display: flex; flex-direction: column; height: 100vh; }
        .kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; flex-shrink: 0; }
        .kpi-card { display: flex; justify-content: space-between; padding: 1.2rem; height: 110px; }
        .kpi-info { display: flex; flex-direction: column; gap: 0.1rem; }
        .kpi-label { font-size: 0.6rem; font-weight: 800; color: #64748b; letter-spacing: 0.1em; margin-bottom: 0.5rem; text-transform: uppercase; }
        .kpi-value { font-size: 1.4rem; font-weight: 900; margin: 0; }
        .kpi-trend { display: flex; align-items: center; gap: 0.3rem; margin-top: 0.5rem; }
        .kpi-trend.positive { color: var(--accent); }
        .kpi-trend.negative { color: var(--danger); }
        .card-title { font-size: 0.65rem; font-weight: 900; color: #64748b; letter-spacing: 0.15em; text-transform: uppercase; border-left: 3px solid var(--primary); padding-left: 0.8rem; }
        .table-row { flex: 1; min-height: 0; display: flex; flex-direction: column; }
        @media (max-width: 1200px) { .kpi-row { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 768px) { .kpi-row { grid-template-columns: 1fr; } .dashboard-container { overflow-y: auto; } .dashboard-content-wrapper { height: auto; } .zero-scroll { height: auto !important; overflow: auto !important; } }
      `}</style>
    </div>
  );
}
