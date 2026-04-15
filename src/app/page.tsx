"use client";

import { useState } from 'react';
import { 
  Home, Coffee, CreditCard, 
  Truck, Wallet, TrendingUp, TrendingDown
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, 
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie, 
  ComposedChart
} from 'recharts';

// Data Mock
const topEntradas = [
  { name: 'Salário', value: 15000, color: '#0ea5e9' },
  { name: 'Receitas', value: 3000, color: '#ffffff' },
  { name: 'Bônus', value: 2000, color: '#ffffff' },
];

const topDespesas = [
  { name: 'Mercado', value: 36, color: '#f43f5e' },
  { name: 'Cartão', value: 25, color: '#fb7185' },
  { name: 'Saúde', value: 15, color: '#fda4af' },
  { name: 'Lazer', value: 12, color: '#0ea5e9' },
  { name: 'Diversos', value: 12, color: '#38bdf8' },
];

const evolucaoMensal = [
  { month: 'S1', d: 1500, e: 2500 },
  { month: 'S2', d: 2200, e: 3200 },
  { month: 'S3', d: 1800, e: 2800 },
  { month: 'S4', d: 2000, e: 2600 },
];

export default function DashboardUltra() {
  return (
    <div className="app-container zero-scroll" style={{ height: '100vh', overflow: 'hidden' }}>
      {/* SIDEBAR COMPACTA */}
      <aside className="sidebar" style={{ width: '240px', padding: '1rem', background: '#0b0e1a' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Wallet size={20} color="var(--primary)" />
          <span style={{ fontSize: '1rem', fontWeight: '900', color: 'white' }}>NEXO</span>
        </div>

        <div className="elite-filter-group" style={{ marginBottom: '1rem' }}>
          <label className="elite-filter-label" style={{ fontSize: '0.6rem' }}>CONTA ATIVA</label>
          <select className="elite-select" style={{ fontSize: '0.7rem' }}>
            <option>Todas as Contas</option>
          </select>
        </div>

        <table className="account-table" style={{ marginTop: 0 }}>
          <thead>
            <tr><th style={{ fontSize: '0.55rem' }}>INSTITUIÇÃO</th><th style={{ fontSize: '0.55rem' }}>SALDO</th></tr>
          </thead>
          <tbody style={{ fontSize: '0.7rem' }}>
            <tr><td>CAIXA</td><td>R$ 6k <span className="status-dot" style={{ background: '#10B981' }}></span></td></tr>
            <tr><td>NUBANK</td><td>-R$ 900 <span className="status-dot" style={{ background: '#f43f5e' }}></span></td></tr>
            <tr><td>WISA</td><td>-R$ 1.5k <span className="status-dot" style={{ background: '#f43f5e' }}></span></td></tr>
          </tbody>
        </table>

        <div style={{ marginTop: 'auto', padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <span className="elite-filter-label" style={{ fontSize: '0.6rem' }}>SESSÃO ATIVA</span>
          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Rafa (Admin)</div>
        </div>
      </aside>

      <main className="main-content" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', height: '100vh' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Dashboard Financeiro</h1>
          <div style={{ fontSize: '0.7rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', padding: '4px 8px', borderRadius: '4px', fontWeight: 700 }}>
            ● LIVE SYNC
          </div>
        </header>

        {/* ROW 1: KPIs */}
        <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.8rem', marginBottom: 0 }}>
          <div className="glass-card kpi-card-saldo" style={{ padding: '0.8rem' }}>
            <span style={{ fontSize: '0.7rem', opacity: 0.8, fontWeight: 600 }}>SALDO ATUAL</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>R$ 4.216</div>
          </div>
          <div className="glass-card" style={{ padding: '0.8rem', borderLeft: '4px solid #0ea5e9' }}>
            <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>ENTRADAS</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0ea5e9' }}>R$ 20.300</div>
          </div>
          <div className="glass-card" style={{ padding: '0.8rem', borderLeft: '4px solid #f43f5e' }}>
            <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>DESPESAS</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f43f5e' }}>R$ 16.084</div>
          </div>
        </div>

        {/* ROW 2: PRINCIPAL CHARTS */}
        <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.8rem', flex: 1, maxHeight: '250px' }}>
          <div className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column' }}>
            <h3 className="elite-filter-label" style={{ fontSize: '0.7rem', marginBottom: '0.5rem' }}>DISTRIBUIÇÃO DE DESPESAS</h3>
            <div style={{ flex: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={topDespesas} innerRadius={35} outerRadius={55} paddingAngle={5} dataKey="value">
                    {topDespesas.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column' }}>
            <h3 className="elite-filter-label" style={{ fontSize: '0.7rem', marginBottom: '0.5rem' }}>TOP ENTRADAS</h3>
            <div style={{ flex: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topEntradas}>
                  <XAxis dataKey="name" hide />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={30}>
                    {topEntradas.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Bar>
                  <Tooltip />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ROW 3: CATEGORIES & QUICK VIEW */}
        <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.8rem', marginBottom: 0 }}>
          {[
            { l: 'Moradia', v: '2.9k', i: Home },
            { l: 'Cartão', v: '1.8k', i: CreditCard },
            { l: 'Transporte', v: '1.5k', i: Truck },
            { l: 'Lazer', v: '900', i: Coffee },
          ].map((c, i) => (
            <div key={i} className="glass-card" style={{ padding: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px' }}>
                <c.i size={16} color="var(--primary)" />
              </div>
              <div>
                <div style={{ fontSize: '0.55rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>{c.l}</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>R$ {c.v}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ROW 4: TREND (ULTRA-COMPACT) */}
        <div className="glass-card" style={{ padding: '0.8rem', height: '80px', flex: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span className="elite-filter-label" style={{ fontSize: '0.6rem' }}>TENDÊNCIA SEMANAL</span>
            <div style={{ fontSize: '0.6rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <TrendingUp size={10} /> +12% vs semana passada
            </div>
          </div>
          <div style={{ height: '40px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={evolucaoMensal}>
                <Bar dataKey="e" fill="rgba(14, 165, 233, 0.2)" barSize={40} />
                <Bar dataKey="d" fill="rgba(244, 63, 94, 0.4)" barSize={40} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
}
