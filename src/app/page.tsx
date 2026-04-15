"use client";

import { 
  Home, Coffee, CreditCard, 
  Truck, Wallet, TrendingUp
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, 
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

export default function DashboardCompact() {
  return (
    <div className="zero-scroll" style={{ 
      height: '100vh', 
      width: '100vw',
      overflow: 'hidden', 
      background: '#0b0e1a', 
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      padding: '0.8rem'
    }}>
      {/* HEADER INTEGRADO */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '0.8rem',
        padding: '0 0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Wallet size={18} color="var(--primary)" />
            <span style={{ fontSize: '0.9rem', fontWeight: '900', letterSpacing: '0.1em' }}>NEXO</span>
          </div>
          <div style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', fontSize: '0.65rem', color: '#64748b' }}>
            RAFA (ADMIN)
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>Dashboard Financeiro</h1>
          <div style={{ fontSize: '0.6rem', color: '#10B981', fontWeight: 700, border: '1px solid rgba(16, 185, 129, 0.2)', padding: '2px 6px', borderRadius: '4px' }}>
            ● LIVE
          </div>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL - FLEX GROW PARA OCUPAR ESPAÇO SEM ROLAR */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '0.6rem',
        minHeight: 0 // Importante para flex containers não estourarem
      }}>
        
        {/* ROW 1: KPIs (MAIS FINOS) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
          <div className="glass-card kpi-card-saldo" style={{ padding: '0.6rem' }}>
            <span style={{ fontSize: '0.6rem', opacity: 0.8, fontWeight: 600 }}>SALDO ATUAL</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>R$ 4.216</div>
          </div>
          <div className="glass-card" style={{ padding: '0.6rem', borderLeft: '3px solid #0ea5e9' }}>
            <span style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 600 }}>ENTRADAS</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0ea5e9' }}>R$ 20.300</div>
          </div>
          <div className="glass-card" style={{ padding: '0.6rem', borderLeft: '3px solid #f43f5e' }}>
            <span style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 600 }}>DESPESAS</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f43f5e' }}>R$ 16.084</div>
          </div>
        </div>

        {/* ROW 2: GRÁFICOS (FLEX: 1 PARA OCUPAR O RESTO) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', flex: 1, minHeight: 0 }}>
          <div className="glass-card" style={{ padding: '0.8rem', display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, marginBottom: '0.4rem' }}>DISTRIBUIÇÃO DE DESPESAS</span>
            <div style={{ flex: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={topDespesas} innerRadius="60%" outerRadius="90%" paddingAngle={5} dataKey="value">
                    {topDespesas.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: '10px', background: '#0b0e1a', border: 'none' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '0.8rem', display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, marginBottom: '0.4rem' }}>TOP ENTRADAS</span>
            <div style={{ flex: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topEntradas}>
                  <XAxis dataKey="name" hide />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                    {topEntradas.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Bar>
                  <Tooltip contentStyle={{ fontSize: '10px', background: '#0b0e1a', border: 'none' }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ROW 3: CATEGORIAS (MAIORES E MAIS INTEGRADAS) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem' }}>
          {[
            { l: 'Moradia', v: '2.9k', i: Home },
            { l: 'Cartão', v: '1.8k', i: CreditCard },
            { l: 'Transporte', v: '1.5k', i: Truck },
            { l: 'Lazer', v: '900', i: Coffee },
          ].map((c, i) => (
            <div key={i} className="glass-card" style={{ padding: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '6px', borderRadius: '6px' }}>
                <c.i size={14} color="var(--primary)" />
              </div>
              <div>
                <div style={{ fontSize: '0.5rem', color: '#64748b', fontWeight: 700 }}>{c.l.toUpperCase()}</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>R$ {c.v}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ROW 4: TENDÊNCIA (INTEGRADA NO RODAPÉ) */}
        <div className="glass-card" style={{ padding: '0.4rem 0.6rem', height: '55px', flexShrink: 0, marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
            <span style={{ fontSize: '0.55rem', color: '#64748b', fontWeight: 700 }}>TENDÊNCIA SEMANAL</span>
            <div style={{ fontSize: '0.5rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 700 }}>
              <TrendingUp size={8} /> +12% VS SEMANA ANTERIOR
            </div>
          </div>
          <div style={{ height: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={evolucaoMensal}>
                <Bar dataKey="e" fill="rgba(14, 165, 233, 0.2)" barSize={60} />
                <Bar dataKey="d" fill="rgba(244, 63, 94, 0.4)" barSize={60} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
