"use client";

import { Calendar as CalendarIcon, Clock, MapPin, Plus } from 'lucide-react';

export default function AgendaPage() {
  return (
    <div>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <CalendarIcon size={28} color="var(--primary)" />
            Agenda Pessoal
          </h2>
          <p className="page-subtitle">Seus compromissos integrados com seu assistente.</p>
        </div>
        <button className="btn">
          <Plus size={20} />
          Novo Compromisso
        </button>
      </header>

      <div className="dashboard-grid">
        {/* Próximos compromissos */}
        <div className="glass-card" style={{ gridColumn: 'span 2' }}>
          <h3 style={{ marginBottom: '1.5rem', fontWeight: 600, fontSize: '1.2rem' }}>Próximos Dias</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { day: 'Hoje', date: 'Qui, 12 Abr', title: 'Dentista Dr. Marcos', time: '14:30 - 15:30', loc: 'Centro Médico Sul' },
              { day: 'Amanhã', date: 'Sex, 13 Abr', title: 'Reunião com Equipe Ev.', time: '09:00 - 10:00', loc: 'Google Meet' },
              { day: 'Sábado', date: 'Sáb, 14 Abr', title: 'Almoço em Família', time: '13:00', loc: 'Restaurante Central' }
            ].map((ev, idx) => (
              <div key={idx} style={{ 
                display: 'flex', 
                background: 'rgba(0,0,0,0.02)', 
                border: '1px solid var(--card-border)', 
                borderRadius: '16px',
                padding: '1.5rem',
                gap: '2rem',
                alignItems: 'center',
                transition: 'transform 0.2s'
              }} className="agenda-card">
                
                <div style={{ textAlign: 'center', minWidth: '80px', borderRight: '1px solid var(--card-border)', paddingRight: '2rem' }}>
                  <p style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase' }}>{ev.day}</p>
                  <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.3rem' }}>{ev.date}</p>
                </div>
                
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{ev.title}</h4>
                  <div style={{ display: 'flex', gap: '1.5rem', color: '#64748b', fontSize: '0.9rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Clock size={16} />
                      {ev.time}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <MapPin size={16} />
                      {ev.loc}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid var(--card-border)', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, color: 'var(--text-color)' }}>
                    Editar
                  </button>
                  <button style={{ padding: '0.5rem 1rem', background: 'rgba(239, 68, 68, 0.1)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, color: 'var(--danger)' }}>
                    Cancelar
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* Integrações / Status */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '1.5rem', fontWeight: 600, fontSize: '1.2rem' }}>Sincronização</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            Sua agenda pode ser sincronizada com o Google Calendar. Agende via WhatsApp enviando: "Marcar reunião amanhã às 14h".
          </p>
          
          <div style={{ background: 'rgba(30, 41, 59, 0.05)', border: '1px dashed var(--card-border)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
            <CalendarIcon size={32} color="#64748b" style={{ margin: '0 auto 1rem auto' }} />
            <h4 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Google Calendar</h4>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>Não conectado</p>
            <button className="btn" style={{ background: '#fff', color: '#000', width: '100%', justifyContent: 'center', border: '1px solid #ddd' }}>
               <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="G" style={{ width: 16 }} />
               Conectar Conta
            </button>
          </div>
        </div>
      </div>
      <style>{`
        .agenda-card:hover {
          transform: translateX(4px);
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        }
      `}</style>
    </div>
  );
}
