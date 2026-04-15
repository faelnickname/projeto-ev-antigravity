"use client";

import { Settings, Save, Key, Bell, Smartphone, Bot, MessageSquare, ShieldCheck, Database, Zap, Volume2, Globe } from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
  const [aiVoice, setAiVoice] = useState(true);
  const [proactiveMode, setProactiveMode] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("Configurações sincronizadas com o núcleo EV.");
    }, 1500);
  };

  return (
    <div style={{ animation: 'fadeIn 0.6s ease-out', maxWidth: '1200px', margin: '0 auto' }}>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h2 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{ padding: '0.6rem', background: 'rgba(0, 210, 255, 0.1)', borderRadius: '12px' }}>
              <Settings size={28} color="var(--primary)" />
            </div>
            Central de Comando
          </h2>
          <p className="page-subtitle">Personalize os protocolos e integrações do seu Agente EV.</p>
        </div>
        <button className="btn elite-pulse" onClick={handleSave} disabled={loading}>
          {loading ? <div className="spinner" style={{ width: '18px', height: '18px' }}></div> : <Save size={20} />}
          {loading ? 'Sincronizando...' : 'Salvar Protocolos'}
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        
        {/* IA CORE CONFIG */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '1.8rem', fontWeight: 800, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <Bot size={22} color="var(--primary)" />
            Núcleo de Inteligência
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '18px', border: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.2rem' }}>Resposta Multimodal</h4>
                  <p style={{ fontSize: '0.8rem', color: '#64748b' }}>IA envia áudios automaticamente no WhatsApp.</p>
               </div>
               <div 
                 onClick={() => setAiVoice(!aiVoice)}
                 style={{ 
                   width: '50px', height: '26px', background: aiVoice ? 'var(--primary)' : 'rgba(0,0,0,0.3)', 
                   borderRadius: '20px', position: 'relative', cursor: 'pointer', transition: '0.3s' 
                 }}>
                  <div style={{ 
                    position: 'absolute', top: '3px', left: aiVoice ? '27px' : '3px', 
                    width: '20px', height: '20px', background: '#fff', borderRadius: '50%', transition: '0.3s',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                  }}></div>
               </div>
            </div>

            <div style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '18px', border: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.2rem' }}>Scanner de Comprovantes</h4>
                  <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Processar fotos de recibos via GPT-4o Vision.</p>
               </div>
               <div 
                 onClick={() => setProactiveMode(!proactiveMode)}
                 style={{ 
                   width: '50px', height: '26px', background: proactiveMode ? 'var(--accent)' : 'rgba(0,0,0,0.3)', 
                   borderRadius: '20px', position: 'relative', cursor: 'pointer', transition: '0.3s' 
                 }}>
                  <div style={{ 
                    position: 'absolute', top: '3px', left: proactiveMode ? '27px' : '3px', 
                    width: '20px', height: '20px', background: '#fff', borderRadius: '50%', transition: '0.3s'
                  }}></div>
               </div>
            </div>
          </div>
        </div>

        {/* SECURE INTEGRATIONS */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '1.8rem', fontWeight: 800, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <Globe size={22} color="var(--primary)" />
            Infraestrutura & Webhooks
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.1em' }}>
                 <Database size={14} /> NÚCLEO SUPABASE
              </label>
              <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--accent)', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <span style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 700 }}>VERIFICADO & ATIVO</span>
                 <Zap size={16} color="var(--accent)" />
              </div>
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.1em' }}>
                 <MessageSquare size={14} /> INSTÂNCIA WHATSAPP (EVOLUTION)
              </label>
              <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--card-border)', borderRadius: '14px', color: '#64748b', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                 <code>agentev_prod_01</code>
                 <span>Ativo</span>
              </div>
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '0.6rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.1em' }}>
                 <Smartphone size={14} /> BOT TELEGRAM CLOUD (CUSTO ZERO)
              </label>
              <div style={{ padding: '1rem', background: 'rgba(0, 210, 255, 0.03)', border: '1px solid var(--primary)', borderRadius: '14px', color: 'var(--primary)', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%', boxShadow: '0 0 10px var(--primary)' }}></div>
                    <span style={{ fontWeight: 800 }}>AGUARDANDO TOKEN</span>
                 </div>
                 <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>Configurar na Vercel</span>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ gridColumn: 'span 2' }}>
           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', background: 'rgba(225, 29, 72, 0.05)', border: '1px solid rgba(225, 29, 72, 0.2)', borderRadius: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <ShieldCheck size={32} color="var(--danger)" />
                <div>
                   <p style={{ fontWeight: 800, color: 'var(--danger)', fontSize: '1rem', letterSpacing: '0.05em' }}>PROTOCOLO DE RESET NUCLEAR</p>
                   <p style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '500px' }}>Esta ação apagará permanentemente todas as transações, logs, metas e agenda. Use apenas se desejar reiniciar seu Centro de Comando do zero.</p>
                </div>
              </div>
              <button 
                onClick={async () => {
                   if(confirm("🚨 AVISO CRÍTICO: Você tem certeza que deseja APAGAR TUDO? Esta ação é irreversível.")) {
                      const res = await fetch('/api/admin/reset', { method: 'POST' });
                      const data = await res.json();
                      if(data.success) {
                         alert("💥 Sistema zerado com sucesso! Redirecionando...");
                         window.location.href = '/';
                      } else {
                         alert("❌ Erro ao zerar dados: " + data.error);
                      }
                   }
                }}
                className="btn" 
                style={{ background: 'var(--danger)', boxShadow: '0 0 20px rgba(225, 29, 72, 0.3)', border: 'none' }}
              >
                Zerar Todos os Dados
              </button>
           </div>
        </div>

      </div>
    </div>
  );
}
