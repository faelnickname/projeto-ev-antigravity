import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import { Home, PieChart, Calendar, Settings, Bot } from 'lucide-react';

export const metadata: Metadata = {
  title: 'EV Antigravity | Assistente Pessoal',
  description: 'Gestão Financeira e Agenda com Inteligência Artificial',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="app-container">
          <aside className="sidebar">
            <h1>
              <Bot size={28} />
              Antigravity
            </h1>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link href="/" className="nav-link">
                <Home size={20} />
                Dashboard
              </Link>
              <Link href="/transicoes" className="nav-link">
                <PieChart size={20} />
                Transações
              </Link>
              <Link href="/agenda" className="nav-link">
                <Calendar size={20} />
                Agenda
              </Link>
              <Link href="/settings" className="nav-link">
                <Settings size={20} />
                Configurações
              </Link>
            </nav>
            <div style={{ marginTop: 'auto', fontSize: '0.8rem', color: '#64748b' }}>
              <p>Bot Integrado:</p>
              <p style={{ color: '#10B981', fontWeight: 600 }}>WhatsApp Webhook Ativo</p>
            </div>
          </aside>
          
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
