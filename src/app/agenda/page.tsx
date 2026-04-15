"use client";

import { Calendar as CalendarIcon, Clock, MapPin, Plus, X, Zap, ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AgendaPage() {
  const [compromissos, setCompromissos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  
  // Form state
  const [titulo, setTitulo] = useState('');
  const [dataHora, setDataHora] = useState('');
  const [detalhes, setDetalhes] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function fetchCompromissos() {
    setLoading(true);
    const { data, error } = await supabase
      .from('compromissos')
      .select('*')
      .order('data_hora', { ascending: true });

    if (!error && data) {
      setCompromissos(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchCompromissos();

    // REALTIME: Atualiza a agenda instantaneamente ao marcar compromissos via WhatsApp
    const canal = supabase
      .channel('agenda-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'compromissos' }, () => {
        fetchCompromissos();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, []);

  async function salvarCompromisso(e: any) {
    e.preventDefault();
    setEnviando(true);
    
    await supabase.from('compromissos').insert({
      titulo,
      data_hora: new Date(dataHora).toISOString(),
      detalhes: detalhes || 'Agendado manualmente via Web'
    });

    setModalAberto(false);
    setTitulo(''); setDataHora(''); setDetalhes('');
    setEnviando(false);
    fetchCompromissos();
  }

  // Helper de data
  const formatData = (isoString: string) => {
    if (!isoString) return { day: '-', date: '-', time: '-' };
    const d = new Date(isoString);
    const dayName = d.toLocaleDateString('pt-BR', { weekday: 'short' });
    const fullDate = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return { day: dayName, date: fullDate, time };
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h2 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.6rem', background: 'rgba(0, 210, 255, 0.1)', borderRadius: '12px', color: 'var(--primary)' }}>
              <CalendarIcon size={28} />
            </div>
            Minha Agenda
          </h2>
          <p className="page-subtitle">Sincronize sua rotina com a Inteligência da EV.</p>
        </div>
        <button className="btn" onClick={() => setModalAberto(true)} style={{ boxShadow: '0 10px 20px var(--primary-glow)' }}>
          <Plus size={20} />
          Novo Evento
        </button>
      </header>

      {/* MODAL REDESIGNED */}
      {modalAberto && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
          <div className="glass-card" style={{ width: '420px', position: 'relative' }}>
            <button onClick={() => setModalAberto(false)} style={{ position: 'absolute', right: 20, top: 20, background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}>
               <X size={24} />
            </button>
            <h3 style={{ marginBottom: '2rem', fontWeight: 800, fontSize: '1.4rem' }}>Agendar Compromisso</h3>
            
            <form onSubmit={salvarCompromisso} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>TÍTULO DO EVENTO</label>
                <input required value={titulo} onChange={e => setTitulo(e.target.value)} type="text" placeholder="Ex: Reunião de Planejamento" style={{ width: '100%', padding: '1rem', borderRadius: '14px', border: '1px solid var(--card-border)', background: 'rgba(0,0,0,0.1)', color: 'var(--text-color)', outline: 'none' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>DATA E HORÁRIO</label>
                <input required value={dataHora} onChange={e => setDataHora(e.target.value)} type="datetime-local" style={{ width: '100%', padding: '1rem', borderRadius: '14px', border: '1px solid var(--card-border)', background: 'rgba(0,0,0,0.1)', color: 'var(--text-color)', outline: 'none' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>DETALHES OU LOCAL</label>
                <input value={detalhes} onChange={e => setDetalhes(e.target.value)} type="text" placeholder="Ex: Google Meet ou Escritório Central" style={{ width: '100%', padding: '1rem', borderRadius: '14px', border: '1px solid var(--card-border)', background: 'rgba(0,0,0,0.1)', color: 'var(--text-color)', outline: 'none' }} />
              </div>

              <button disabled={enviando} className="btn" type="submit" style={{ width: '100%', height: '54px', justifyContent: 'center' }}>
                {enviando ? 'Sincronizando...' : 'Confirmar Agendamento'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="dashboard-grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <div className="glass-card">
          <h3 style={{ marginBottom: '2rem', fontWeight: 700, fontSize: '1.3rem' }}>Linha do Tempo</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {loading && <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Buscando sua agenda...</div>}
            {!loading && compromissos.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                <CalendarIcon size={40} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                <p>Nenhum compromisso para os próximos dias.</p>
              </div>
            )}

            {!loading && compromissos.map((ev, idx) => {
              const { day, date, time } = formatData(ev.data_hora);
              return (
                <div key={ev.id || idx} style={{ 
                  display: 'flex', 
                  background: 'rgba(255,255,255,0.02)', 
                  border: '1px solid var(--card-border)', 
                  borderRadius: '20px',
                  padding: '1.5rem',
                  gap: '2.5rem',
                  alignItems: 'center',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }} className="agenda-card-premium">
                  
                  <div style={{ textAlign: 'center', minWidth: '90px', borderRight: '1px solid var(--card-border)', paddingRight: '2rem' }}>
                    <p style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{day}</p>
                    <p style={{ color: 'var(--text-color)', fontWeight: 700, fontSize: '1.1rem', marginTop: '0.2rem' }}>{date}</p>
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.6rem', letterSpacing: '-0.01em' }}>{ev.titulo}</h4>
                    <div style={{ display: 'flex', gap: '2rem', color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={16} className="text-primary" />
                        {time}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MapPin size={16} />
                        {ev.detalhes}
                      </span>
                    </div>
                  </div>

                  <div className="status-dot"></div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card">
            <h3 style={{ marginBottom: '1.5rem', fontWeight: 700, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
              <Zap size={20} color="var(--primary)" />
              Sincronização IA
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              A EV processa suas mensagens e atualiza esta agenda automaticamente. Você também pode criar eventos via voz no WhatsApp.
            </p>
            
            <div style={{ padding: '1.5rem', background: 'rgba(0, 210, 255, 0.05)', borderRadius: '18px', border: '1px solid rgba(0, 210, 255, 0.1)', textAlign: 'center' }}>
              <ShieldCheck size={32} color="var(--primary)" style={{ margin: '0 auto 1.2rem auto' }} />
              <h4 style={{ fontWeight: 700, marginBottom: '0.4rem', fontSize: '1rem' }}>Integração Segura</h4>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Dados criptografados de ponta a ponta.</p>
            </div>
          </div>
          
          <div className="glass-card" style={{ background: 'linear-gradient(135deg, var(--primary), #0078ff)', color: '#fff', border: 'none' }}>
             <h4 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.8rem' }}>Dica da EV</h4>
             <p style={{ fontSize: '0.9rem', opacity: 0.9, lineHeight: 1.5 }}>
               "Você tem 3 compromissos esta semana. Lembre-se de reservar tempo para rever suas metas financeiras no domingo!"
             </p>
          </div>
        </div>
      </div>
      <style>{`
        .agenda-card-premium:hover {
          transform: scale(1.02) translateX(8px);
          background: rgba(0, 210, 255, 0.05) !important;
          border-color: rgba(0, 210, 255, 0.2) !important;
        }
        .status-dot {
          width: 8px;
          height: 8px;
          background: var(--accent);
          border-radius: 50%;
          box-shadow: 0 0 10px var(--accent);
          opacity: 0.6;
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
