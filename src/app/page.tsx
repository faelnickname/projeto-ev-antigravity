"use client";

import { useState } from 'react';
import { 
  Home, Coffee, CreditCard, 
  Truck
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, 
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie, 
  LineChart, Line, ComposedChart
} from 'recharts';

// Data Mock matching the screenshot style
const topEntradas = [
  { name: 'Salário', value: 15000, color: '#0ea5e9' },
  { name: 'Outras Receitas', value: 3000, color: '#ffffff' },
  { name: '13º salário', value: 3000, color: '#ffffff' },
];

const topDespesas = [
  { name: 'Supermercado', value: 36.36, color: '#f43f5e' },
  { name: 'Cartão de crédito', value: 18.18, color: '#fb7185' },
  { name: 'Plano de saúde', value: 18.18, color: '#fda4af' },
  { name: 'Prestação da casa', value: 15.15, color: '#0ea5e9' },
  { name: 'Presentes', value: 12.12, color: '#38bdf8' },
];

const evolucaoMensal = [
  { month: 'jul', despesas: 1500, entradas: 2500, saldo: 1000 },
  { month: 'ago', despesas: 2200, entradas: 3200, saldo: 2000 },
  { month: 'set', despesas: 1800, entradas: 2800, saldo: 3000 },
  { month: 'out', despesas: 2000, entradas: 2600, saldo: 3600 },
  { month: 'nov', despesas: 2800, entradas: 3500, saldo: 4300 },
  { month: 'dez', despesas: 4200, entradas: 8000, saldo: 8100 },
];

const sparklineData = Array.from({ length: 15 }, (_, i) => ({ value: Math.random() * 100 }));

export default function DashboardElite() {
  const [activeAccount, setActiveAccount] = useState('Todos');

  return (
    <div className="app-container zero-scroll">
      {/* SIDEBAR ELITE (FABRIDATA STYLE) */}
      <aside className="sidebar desktop-only" style={{ background: '#0f172a' }}>
        <div style={{ marginBottom: '2rem', padding: '0.5rem' }}>
          {/* Logo FABRIDATA */}
          <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            <img 
              src="/fabridata-logo.png" 
              alt="FABRIDATA LOGO" 
              style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }}
            />
          </div>

          <div className="elite-filter-group">
            <label className="elite-filter-label">Conta</label>
            <select className="elite-select" value={activeAccount} onChange={(e) => setActiveAccount(e.target.value)}>
              <option>Todos</option>
              <option>Itaú Personnalité</option>
              <option>Santander Select</option>
            </select>
          </div>

          <table className="account-table">
            <thead>
              <tr>
                <th>Contas</th>
                <th>Saldo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>CAIXXXA</td>
                <td>R$ 6.616 <span className="status-dot" style={{ background: '#10B981' }}></span></td>
              </tr>
              <tr>
                <td>BUBANK</td>
                <td>-R$ 900 <span className="status-dot" style={{ background: '#f43f5e' }}></span></td>
              </tr>
              <tr>
                <td>WISA</td>
                <td>-R$ 1.500 <span className="status-dot" style={{ background: '#f43f5e' }}></span></td>
              </tr>
            </tbody>
          </table>

          <div className="elite-filter-group">
            <label className="elite-filter-label">Período</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input type="date" className="elite-select" defaultValue="2023-07-01" />
              <input type="date" className="elite-select" defaultValue="2024-12-30" />
            </div>
          </div>

          <div className="elite-filter-group">
            <label className="elite-filter-label">Ano</label>
            <select className="elite-select"><option>2023</option><option>2024</option></select>
          </div>

          <div className="elite-filter-group">
            <label className="elite-filter-label">Mês</label>
            <select className="elite-select"><option>Todos</option></select>
          </div>

          <button className="btn" style={{ width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#64748b', justifyContent: 'center' }}>
            Limpar Filtros
          </button>
        </div>
      </aside>

      <main className="main-content" style={{ padding: '2rem' }}>
        <h1 className="page-title" style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>Dashboard Finanças Pessoais</h1>

        <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr 1.2fr' }}>
          {/* KPI 1: SALDO */}
          <div className="glass-card kpi-card-saldo">
            <div className="kpi-card-inner">
              <span className="kpi-label-elite">Saldo</span>
              <div className="stat-value">R$ 4.216</div>
              <div className="kpi-sparkline">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sparklineData}>
                    <Line type="monotone" dataKey="value" stroke="white" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* KPI 2: ENTRADAS */}
          <div className="glass-card">
            <div className="kpi-card-inner">
              <span className="kpi-label-elite" style={{ color: '#64748b' }}>Entradas</span>
              <div className="stat-value">R$ 20.300</div>
              <div className="kpi-sparkline">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sparklineData}>
                    <Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* KPI 3: DESPESAS */}
          <div className="glass-card">
            <div className="kpi-card-inner">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="kpi-label-elite" style={{ color: '#64748b' }}>Despesas</span>
                <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800 }}>79,23%</span>
              </div>
              <div className="stat-value">R$ 16.084</div>
              <div className="kpi-sparkline">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sparklineData}>
                    <Line type="monotone" dataKey="value" stroke="#f43f5e" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-grid" style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.2fr)', gap: '1.5rem' }}>
          {/* CHART: TOP 5 ENTRADAS */}
          <div className="glass-card">
            <h3 className="elite-filter-label" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>Top 5 Entradas por categoria</h3>
            <div style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topEntradas} layout="horizontal">
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} dy={10} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                    {topEntradas.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* CHART: TOP 5 DESPESAS */}
          <div className="glass-card">
            <h3 className="elite-filter-label" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>Top 5 Despesas por categoria</h3>
            <div style={{ display: 'flex', alignItems: 'center', height: '200px' }}>
              <div style={{ flex: 1.2, height: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={topDespesas}
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {topDespesas.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <span className="elite-filter-label" style={{ fontSize: '0.6rem' }}>CATEGORIA</span>
                {topDespesas.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', fontWeight: 600 }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }}></div>
                    <span style={{ color: '#94a3b8', flex: 1 }}>{item.name}</span>
                    <span>{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-grid" style={{ gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
          {/* CHART: EVOLUÇÃO MENSAL */}
          <div className="glass-card">
            <h3 className="elite-filter-label" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>Evolução mensal despesas vs entradas</h3>
            <div style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={evolucaoMensal}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Bar dataKey="despesas" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={15} />
                  <Bar dataKey="entradas" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={15} />
                  <Line type="monotone" dataKey="saldo" stroke="white" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                  <Tooltip />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* BOTTOM CATEGORY GRID */}
          <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: 0 }}>
            {[
              { label: 'Moradia', value: '2.929', color: '#f97316', icon: Home },
              { label: 'Lazer', value: '900', color: '#f97316', icon: Coffee },
              { label: 'Cartão', value: '1.800', color: '#f97316', icon: CreditCard },
              { label: 'Transporte', value: '1.500', color: '#f97316', icon: Truck },
            ].map((cat, i) => (
              <div key={i} className="category-mini-card" style={{ borderLeftColor: cat.color }}>
                <div className="category-icon-wrapper">
                  <cat.icon size={18} color={cat.color} />
                </div>
                <div>
                  <div className="elite-filter-label" style={{ marginBottom: 0, fontSize: '0.65rem' }}>{cat.label}</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800 }}>R$ {cat.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
