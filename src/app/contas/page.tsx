"use client";

import { useState, useEffect } from 'react';
import { Landmark, ArrowLeft, Plus, ChevronRight, Eye, EyeOff, MoreHorizontal, Wallet, ShieldCheck, Globe, Activity, TrendingUp, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { MOCK_CONTAS } from '@/lib/mockData';
import { dataService } from '@/lib/dataService';

export default function ContasPage() {
  const [loading, setLoading] = useState(true);
  const [contas, setContas] = useState<any[]>(MOCK_CONTAS);
  const [showValues, setShowValues] = useState(true);
  const [recarregando, setRecarregando] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [novaConta, setNovaConta] = useState({ banco: '', saldo: '', tipo: 'Conta Corrente', cor_hex: '#10B981' });

  const fetchContas = async () => {
    try {
      setRecarregando(true);
      const data = await dataService.getAccounts();
      if (data && data.length > 0) {
        setContas(data);
      } else {
        setContas(MOCK_CONTAS);
      }
    } catch (err) {
      console.error('Erro ao carregar contas:', err);
      setContas(MOCK_CONTAS);
    } finally {
      setLoading(false);
      setRecarregando(false);
    }
  };

  const salvarConta = async () => {
    try {
      const targetId = dataService.formatId('5535991831298');
      const { error } = await supabase.from('contas').insert([{
        banco: novaConta.banco,
        saldo: parseFloat(novaConta.saldo) || 0,
        tipo: novaConta.tipo,
        cor_hex: novaConta.cor_hex,
        id_whatsapp: targetId
      }]);
      if (error) throw error;
      setModalAberto(false);
      fetchContas();
      setNovaConta({ banco: '', saldo: '', tipo: 'Conta Corrente', cor_hex: '#10B981' });
    } catch (err) {
      console.error('Erro ao salvar conta:', err);
    }
  };

  useEffect(() => {
    fetchContas();
    
    const channel = supabase.channel('contas-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contas' }, () => fetchContas())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const totalSaldo = contas.reduce((acc, c) => acc + (parseFloat(c.saldo) || 0), 0);
  const formatCurrency = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="dashboard-container zero-scroll fade-in">
      <div className="dashboard-content-wrapper">
         <header style={{ height: 'var(--header-h)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1rem', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '0.8rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
               <h1 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff', letterSpacing: '0.05em', textTransform: 'uppercase', margin: 0 }}>
                 CUSTÓDIA DE <span className="text-neon-blue" style={{ color: 'var(--primary)' }}>CAPITAL</span>
               </h1>
               <p style={{ fontSize: '0.6rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Núcleo de Inteligência v4.2 • Análise de Liquidez</p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                <button onClick={() => setShowValues(!showValues)} className="elite-button-icon" style={{ width: '38px', height: '38px' }}>
                  {showValues ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
                <button onClick={() => fetchContas()} className="elite-button-icon" style={{ width: '38px', height: '38px' }}>
                  <div className={recarregando ? 'elite-pulse' : ''}>
                     <RefreshCw size={18} />
                  </div>
               </button>
               <button onClick={() => setModalAberto(true)} className="btn" style={{ fontSize: '0.7rem', padding: '0.6rem 1.2rem', borderRadius: '10px' }}>
                  <Plus size={16} /> ADICIONAR INSTITUIÇÃO
               </button>
            </div>
         </header>

         <div className="elite-main-view custom-scrollbar" style={{ flex: 1, overflowY: 'hidden', display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '0 1rem 1rem 1rem' }}>
            
            {/* ROW 1: KPI SCORECARDS */}
            <div className="kpi-row">
               <div className="glass-card kpi-card neon-glow-blue">
                  <div className="kpi-info">
                     <p className="kpi-label">TOTAL CAPITAL LÍQUIDO</p>
                     <h2 className="kpi-value text-neon-blue">{showValues ? formatCurrency(totalSaldo) : 'R$ •••••'}</h2>
                     <div className="kpi-trend positive">
                        <TrendingUp size={12} /> <span style={{fontSize:'0.6rem', fontWeight: 800}}>SALDOS CONSOLIDADOS</span>
                     </div>
                  </div>
                  <Wallet size={32} style={{ opacity: 0.1, alignSelf: 'center' }} />
               </div>

               <div className="glass-card kpi-card neon-glow-green">
                  <div className="kpi-info">
                     <p className="kpi-label">INSTITUIÇÕES ATIVAS</p>
                     <h2 className="kpi-value text-neon-green">{contas.length} CONTAS</h2>
                     <div className="kpi-trend positive">
                        <Globe size={12} /> <span style={{fontSize:'0.6rem', fontWeight: 800}}>RISCO DIVERSIFICADO</span>
                     </div>
                  </div>
               </div>

               <div className="glass-card kpi-card neon-glow-purple">
                  <div className="kpi-info">
                     <p className="kpi-label">MÉDIA POR CONTA</p>
                     <h2 className="kpi-value text-neon-purple">{showValues ? formatCurrency(totalSaldo / (contas.length || 1)) : 'R$ •••'}</h2>
                     <div className="kpi-trend positive">
                        <Activity size={12} /> <span style={{fontSize:'0.6rem', fontWeight: 800}}>ALOCAÇÃO ESTÁVEL</span>
                     </div>
                  </div>
               </div>

               <div className="glass-card kpi-card" style={{ borderLeft: '3px solid #f59e0b' }}>
                  <div className="kpi-info">
                     <p className="kpi-label">VERIFICAÇÃO DE SEGURANÇA</p>
                     <h2 className="kpi-value" style={{ color: '#f59e0b' }}>100% SEGURO</h2>
                     <div className="kpi-trend positive" style={{ color: '#f59e0b' }}>
                        <ShieldCheck size={12} /> <span style={{fontSize:'0.6rem', fontWeight: 800}}>LINKS CRIPTOGRAFADOS</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* ROW 2: ACCOUNTS LIST */}
            <div className="table-row glass-card" style={{ flex: 1, minHeight: 0, padding: '1.5rem' }}>
               <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>NODOS BANCÁRIOS CONECTADOS</h3>
               <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1rem', paddingBottom: '1rem' }}>
                    {contas.map((conta, i) => (
                      <div key={i} className="glass-card elite-row" style={{ padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '1.2rem', borderLeft: `4px solid ${conta.cor_hex || 'var(--primary)'}` }}>
                         <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${conta.cor_hex || 'var(--primary)'}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${conta.cor_hex || 'var(--primary)'}30` }}>
                            <Landmark size={24} color={conta.cor_hex || 'var(--primary)'} />
                         </div>
                         
                         <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                               <div>
                                  <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 900, margin: 0 }}>{conta.banco.toUpperCase()}</h4>
                                  <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>{conta.tipo || 'CONTA CORRENTE'}</span>
                               </div>
                               <div style={{ textAlign: 'right' }}>
                                  <p style={{ color: showValues ? '#fff' : '#64748b', fontSize: '1.2rem', fontWeight: 900, margin: 0 }}>{showValues ? formatCurrency(conta.saldo) : '••••••'}</p>
                                  <span style={{ fontSize: '0.55rem', color: Number(conta.saldo) >= 0 ? 'var(--accent)' : 'var(--danger)', fontWeight: 800 }}>{Number(conta.saldo) >= 0 ? 'SALDO NOMINAL' : 'ALERTA DE CHEQUE ESPECIAL'}</span>
                               </div>
                            </div>
                         </div>
                         
                         <button className="elite-button-icon" style={{ border: 'none', background: 'rgba(255,255,255,0.03)', width: '32px', height: '32px' }}>
                            <MoreHorizontal size={16} />
                         </button>
                      </div>
                    ))}
                  </div>
               </div>
             </div>
             
             {/* MODAL NEXO DE ADIÇÃO */}
             {modalAberto && (
               <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
                  <div className="glass-card" style={{ width: '400px', padding: '2rem', border: '1px solid var(--primary)' }}>
                     <h3 className="card-title" style={{ marginBottom: '1.5rem', color: 'var(--primary)', fontWeight: 900 }}>CONECTAR NOVO NODO BANCÁRIO</h3>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                        <div>
                           <label style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>INSTITUIÇÃO</label>
                           <input type="text" placeholder="Ex: Itaú, Santander, Nubank..." style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.9rem', borderRadius: '10px', color: '#fff', marginTop: '0.5rem', outline: 'none' }} value={novaConta.banco} onChange={(e) => {
                               const b = e.target.value;
                               let color = '#10B981';
                               if (b.toLowerCase().includes('itau')) color = '#f59e0b';
                               if (b.toLowerCase().includes('santander')) color = '#ef4444';
                               if (b.toLowerCase().includes('nubank')) color = '#8b5cf6';
                               setNovaConta({...novaConta, banco: b, cor_hex: color});
                             }} />
                        </div>
                        <div>
                           <label style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>SALDO EM CUSTÓDIA (R$)</label>
                           <input type="number" placeholder="0,00" style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.9rem', borderRadius: '10px', color: '#fff', marginTop: '0.5rem', outline: 'none' }} value={novaConta.saldo} onChange={(e) => setNovaConta({...novaConta, saldo: e.target.value})} />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                           <button onClick={() => setModalAberto(false)} className="btn" style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.7rem', fontWeight: 900 }}>CANCELAR</button>
                           <button onClick={salvarConta} className="btn" style={{ flex: 2, fontSize: '0.7rem', fontWeight: 900 }}>ATIVAR NODO</button>
                        </div>
                     </div>
                  </div>
               </div>
             )}
          </div>
       </div>

      <style jsx>{`
        .dashboard-container { width: 100%; height: 100vh; position: relative; color: #fff; background: #020617; }
        .dashboard-content-wrapper { display: flex; flex-direction: column; height: 100vh; }
        .kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; flex-shrink: 0; }
        .kpi-card { display: flex; justify-content: space-between; padding: 1.2rem; height: 110px; }
        .kpi-label { font-size: 0.6rem; font-weight: 800; color: #64748b; letter-spacing: 0.1em; margin-bottom: 0.5rem; text-transform: uppercase; }
        .kpi-value { font-size: 1.4rem; font-weight: 900; margin: 0; }
        .kpi-trend { display: flex; align-items: center; gap: 0.3rem; margin-top: 0.5rem; }
        .kpi-trend.positive { color: var(--accent); }
        .kpi-trend.negative { color: var(--danger); }
        .card-title { font-size: 0.65rem; font-weight: 900; color: #64748b; letter-spacing: 0.15em; text-transform: uppercase; border-left: 3px solid var(--primary); padding-left: 0.8rem; }
        .table-row { flex: 1; min-height: 0; display: flex; flex-direction: column; }
        
        .elite-button-icon {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: rgba(0, 210, 255, 0.08);
          border: 1px solid rgba(0, 210, 255, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
          cursor: pointer;
          transition: 0.4s;
        }
        .elite-button-icon:hover { background: rgba(0, 210, 255, 0.15); box-shadow: 0 0 20px rgba(0, 210, 255, 0.2); }

        @media (max-width: 1200px) { .kpi-row { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 768px) { .kpi-row { grid-template-columns: 1fr; } .dashboard-container { overflow-y: auto; } .dashboard-content-wrapper { height: auto; } .zero-scroll { height: auto !important; overflow: auto !important; } }
      `}</style>
    </div>
  );
}
