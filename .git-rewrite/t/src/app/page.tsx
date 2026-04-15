"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { CreditCard, TrendingUp, TrendingDown, Calendar as CalendarIcon } from 'lucide-react';

// Dados Mokados para prévia do Dashboard antes de integrar DB
const data = [
  { name: 'Jan', receitas: 4000, despesas: 2400 },
  { name: 'Fev', receitas: 3000, despesas: 1398 },
  { name: 'Mar', receitas: 2000, despesas: 9800 },
  { name: 'Abr', receitas: 2780, despesas: 3908 },
  { name: 'Mai', receitas: 1890, despesas: 4800 },
  { name: 'Jun', receitas: 2390, despesas: 3800 },
  { name: 'Jul', receitas: 3490, despesas: 4300 },
];

export default function Home() {
  return (
    <div>
      <header className="page-header">
        <h2 className="page-title">Bem Vindo ao Antigravity 👋</h2>
        <p className="page-subtitle">Seu assistente financeiro e pessoal inteligente.</p>
      </header>

      <div className="dashboard-grid">
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(79, 70, 229, 0.1)', borderRadius: '12px', color: 'var(--primary)' }}>
              <CreditCard size={24} />
            </div>
            <div>
              <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>Saldo Atual</p>
              <p className="stat-value">R$ 1.250,00</p>
            </div>
          </div>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: 'var(--accent)' }}>
              <TrendingUp size={24} />
            </div>
            <div>
              <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>Receitas (Mês)</p>
              <p className="stat-value stat-income">+ R$ 4.500,00</p>
            </div>
          </div>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', color: 'var(--danger)' }}>
              <TrendingDown size={24} />
            </div>
            <div>
              <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>Despesas (Mês)</p>
              <p className="stat-value stat-expense">- R$ 3.250,00</p>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: 'minmax(400px, 2fr) minmax(300px, 1fr)' }}>
        <div className="glass-card">
          <h3 style={{ marginBottom: '1rem', fontWeight: 600 }}>Fluxo de Caixa</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--card-border)" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ backgroundColor: 'var(--card-bg)', backdropFilter: 'blur(10px)', border: '1px solid var(--card-border)', borderRadius: '8px' }} 
                />
                <Bar dataKey="receitas" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="despesas" fill="var(--danger)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card">
          <h3 style={{ marginBottom: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CalendarIcon size={20} color="var(--primary)" />
            Próximos Compromissos
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[1, 2, 3].map((_, i) => (
              <div key={i} style={{ padding: '1rem', background: 'rgba(0,0,0,0.02)', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
                <p style={{ fontWeight: 600, marginBottom: '0.2rem' }}>Reunião de Projetos</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b' }}>
                  <span>Amanhã, 14:00</span>
                  <span>Google Meet</span>
                </div>
              </div>
            ))}
            <button className="btn" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
              Ver Agenda Completa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
