"use client";

import { 
  Home, Coffee, CreditCard, Truck, 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, 
  Cell, PieChart, Pie, LineChart, Line
} from 'recharts';

const topDespesas = [
  { name: 'Supermercado', value: 36.30, color: '#f43f5e' },
  { name: 'Cartão de crédito', value: 18.16, color: '#fb7185' },
  { name: 'Plano de saúde', value: 12.12, color: '#fda4af' },
  { name: 'Prestação da casa', value: 15.18, color: '#0ea5e9' },
  { name: 'Presentes', value: 35.18, color: '#38bdf8' },
];

const sparklineData = Array.from({ length: 20 }, (_, i) => ({ value: 30 + Math.random() * 40 + (i > 10 ? Math.sin(i) * 10 : 0) }));

export default function DashboardNexusFinal() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', height: '100%' }}>
      {/* TOP KPI ROW */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: '1.2fr 1fr 1fr', gap: '1rem', marginBottom: 0 }}>
        {/* SALDO */}
        <div className="glass-card kpi-card-saldo" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 600, opacity: 0.9 }}>Saldo</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>R$ 4.216</div>
            <div style={{ height: '40px', width: '120px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparklineData}><Line type="monotone" dataKey="value" stroke="white" strokeWidth={2} dot={false} /></LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ENTRADAS */}
        <div className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>Entradas</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flex: 1 }}>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>R$ 20.300</div>
            <div style={{ height: '30px', width: '80px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparklineData}><Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2} dot={false} /></LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* DESPESAS */}
        <div className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>Despesas</span>
            <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800 }}>79,23%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flex: 1 }}>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>R$ 16.084</div>
            <div style={{ height: '30px', width: '80px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparklineData}><Line type="monotone" dataKey="value" stroke="#f43f5e" strokeWidth={2} dot={false} /></LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN ANALYSIS ROW */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: 'minmax(280px, 320px) 1fr', gap: '1rem', flex: 1, marginBottom: 0, minHeight: 0 }}>
        {/* LEFT COLUMN: FILTERS & ACCOUNTS */}
        <div className="glass-card" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '1.2rem', overflowY: 'auto' }}>
          <div className="elite-filter-group">
            <label className="elite-filter-label" style={{ fontSize: '0.65rem' }}>CONTA</label>
            <select className="elite-select" style={{ fontSize: '0.75rem', padding: '0.5rem' }}><option>Todos</option></select>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#64748b', fontWeight: 700, marginBottom: '0.5rem' }}>
              <span>CONTAS</span>
              <span>SALDO</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[
                { n: 'CAIXXXA', v: 'R$ 6.616', s: '#10B981' },
                { n: 'BUBANK', v: '-R$ 9.900', s: '#f43f5e' },
                { n: 'VISA', v: '-R$ 1.500', s: '#f43f5e' }
              ].map((acc, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', fontWeight: 600 }}>
                  <span>{acc.n}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span>{acc.v}</span>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: acc.s }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div className="elite-filter-group">
              <label className="elite-filter-label" style={{ fontSize: '0.65rem' }}>PERÍODO</label>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <input type="text" className="elite-select" defaultValue="01/07/2023" style={{ textAlign: 'center', fontSize: '0.7rem', padding: '0.4rem' }} />
                <input type="text" className="elite-select" defaultValue="30/12/2024" style={{ textAlign: 'center', fontSize: '0.7rem', padding: '0.4rem' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <div className="elite-filter-group">
                <label className="elite-filter-label" style={{ fontSize: '0.65rem' }}>ANO</label>
                <select className="elite-select" style={{ fontSize: '0.75rem', padding: '0.4rem' }}><option>2023</option></select>
              </div>
              <div className="elite-filter-group">
                <label className="elite-filter-label" style={{ fontSize: '0.65rem' }}>MÊS</label>
                <select className="elite-select" style={{ fontSize: '0.75rem', padding: '0.4rem' }}><option>Todos</option></select>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer', justifyContent: 'center' }}>
              <div style={{ width: '12px', height: '12px', border: '1px solid #64748b', borderRadius: '3px' }}></div>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b' }}>Limpar filtros</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CHARTS & CARDS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: 0 }}>
          {/* CHART CARD */}
          <div className="glass-card" style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'white', marginBottom: '1rem' }}>Top 5 Despesas por categoria</h3>
            <div style={{ display: 'flex', alignItems: 'center', flex: 1, minHeight: 0 }}>
              <div style={{ width: '45%', height: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={topDespesas} innerRadius="65%" outerRadius="90%" paddingAngle={4} dataKey="value">
                      {topDespesas.map((e, index) => <Cell key={index} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem', paddingLeft: '1.5rem' }}>
                <span className="elite-filter-label" style={{ fontSize: '0.55rem' }}>CATEGORIA</span>
                {topDespesas.sort((a,b) => b.value - a.value).map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', fontWeight: 600 }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: item.color }}></div>
                    <span style={{ color: '#94a3b8', flex: 1 }}>{item.name}</span>
                    <span>{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CATEGORY CARDS GRID */}
          <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.8rem', marginBottom: 0 }}>
            {[
              { l: 'Moradia', v: '2.929', i: Home },
              { l: 'Lazer', v: '900', i: Coffee },
              { l: 'Cartão', v: '1.800', i: CreditCard },
              { l: 'Transporte', v: '1.500', i: Truck },
            ].map((cat, i) => (
              <div key={i} className="glass-card" style={{ padding: '0.8rem', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '3px solid #f97316' }}>
                <div style={{ width: '36px', height: '36px', background: 'rgba(249, 115, 22, 0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <cat.i size={18} color="#f97316" />
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>{cat.l}</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>R$ {cat.v}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
