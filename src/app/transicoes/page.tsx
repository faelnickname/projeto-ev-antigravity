"use client";

import { PieChart as PieIcon, Plus, Download, Search } from 'lucide-react';

export default function TransicoesPage() {
  return (
    <div>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <PieIcon size={28} color="var(--primary)" />
            Transações
          </h2>
          <p className="page-subtitle">Gerencie suas receitas e despesas ou envie comprovantes.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn" style={{ background: 'var(--card-bg)', color: 'var(--text-color)', border: '1px solid var(--card-border)' }}>
            <Download size={20} />
            Exportar
          </button>
          <button className="btn">
            <Plus size={20} />
            Nova Transação
          </button>
        </div>
      </header>

      <div className="glass-card" style={{ padding: '0' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--card-border)', display: 'flex', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-color)', padding: '0.6rem 1rem', borderRadius: '12px', flex: 1, border: '1px solid var(--card-border)' }}>
            <Search size={20} color="#64748b" style={{ marginRight: '0.8rem' }} />
            <input 
              type="text" 
              placeholder="Buscar transações por nome ou categoria..." 
              style={{ border: 'none', background: 'transparent', outline: 'none', color: 'var(--text-color)', width: '100%', fontSize: '0.95rem' }}
            />
          </div>
          <select style={{ background: 'var(--bg-color)', color: 'var(--text-color)', border: '1px solid var(--card-border)', padding: '0.6rem 1.5rem', borderRadius: '12px', outline: 'none' }}>
            <option>Todos os tipos</option>
            <option>Somente Receitas</option>
            <option>Somente Despesas</option>
          </select>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.02)', color: '#64748b', fontSize: '0.9rem' }}>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>Data</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>Descrição</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>Categoria</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>Valor</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>Comprovante</th>
              </tr>
            </thead>
            <tbody>
              {[
                { date: '12/Abr', desc: 'Mercado Mensal', cat: 'Alimentação', val: '- R$ 850,00', type: 'exp' },
                { date: '10/Abr', desc: 'Salário', cat: 'Receita', val: '+ R$ 5.400,00', type: 'inc' },
                { date: '08/Abr', desc: 'Netflix', cat: 'Lazer', val: '- R$ 55,90', type: 'exp' },
                { date: '04/Abr', desc: 'Combustível', cat: 'Transporte', val: '- R$ 200,00', type: 'exp' },
              ].map((t, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--card-border)', transition: 'background 0.2s', cursor: 'pointer' }} className="hover-row">
                  <td style={{ padding: '1.2rem 1.5rem', color: '#64748b' }}>{t.date}</td>
                  <td style={{ padding: '1.2rem 1.5rem', fontWeight: 500 }}>{t.desc}</td>
                  <td style={{ padding: '1.2rem 1.5rem' }}>
                    <span style={{ padding: '0.3rem 0.8rem', background: 'rgba(0,0,0,0.05)', borderRadius: '20px', fontSize: '0.8rem' }}>
                      {t.cat}
                    </span>
                  </td>
                  <td style={{ padding: '1.2rem 1.5rem', fontWeight: 600, color: t.type === 'inc' ? 'var(--accent)' : 'var(--danger)' }}>
                    {t.val}
                  </td>
                  <td style={{ padding: '1.2rem 1.5rem' }}>
                    {t.type === 'exp' ? (
                      <span style={{ color: 'var(--primary)', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}>Ver Anexo</span>
                    ) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <style>{`
        .hover-row:hover {
          background: rgba(79, 70, 229, 0.03);
        }
      `}</style>
    </div>
  );
}
