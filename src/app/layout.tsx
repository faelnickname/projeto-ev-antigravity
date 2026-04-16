"use client";

import './globals.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PieChart, Calendar, Settings, MessageSquare, Target, CreditCard, Landmark, Briefcase, ShieldCheck, History } from 'lucide-react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/transicoes', label: 'Transações', icon: PieChart },
    { href: '/fixas', label: 'Despesas Fixas', icon: Target },
    { href: '/coral', label: 'Despesas Coral', icon: Briefcase },
    { href: '/contas', label: 'Contas', icon: Landmark },
    { href: '/cartoes', label: 'Cartões', icon: CreditCard },
    { href: '/historico', label: 'Histórico', icon: History },
    { href: '/agenda', label: 'Agenda', icon: Calendar },
    { href: '/settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <html lang="pt-BR">
      <body>
        <div className="app-container zero-scroll">
          {/* SIDEBAR NEXUS STYLE */}
          <aside className="sidebar desktop-only" style={{ background: '#0f172a' }}>
            <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
              <img 
                src="/logo.png" 
                alt="Nexus Financeiro Logo" 
                style={{ width: '100px', height: 'auto', marginBottom: '0.5rem' }} 
              />
              <div className="sidebar-subtitle" style={{ fontSize: '0.6rem', letterSpacing: '2px', textAlign: 'center' }}>
                GESTÃO DE PERFORMANCE OPERACIONAL
              </div>
            </div>

            <div className="status-box">
              <span className="status-label">STATUS DO SISTEMA</span>
              <div className="status-value" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                SINCRONIZADO E ATIVO
              </div>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
              <Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}><LayoutDashboard size={18} /> Dashboard</Link>
              <Link href="/transicoes" className={`nav-link ${pathname === '/transicoes' ? 'active' : ''}`}><PieChart size={18} /> Transações</Link>
              <Link href="/fixas" className={`nav-link ${pathname === '/fixas' ? 'active' : ''}`}><Target size={18} /> Despesas Fixas</Link>
              <Link href="/coral" className={`nav-link ${pathname === '/coral' ? 'active' : ''}`}><Briefcase size={18} /> Despesas Coral</Link>
              <Link href="/contas" className={`nav-link ${pathname === '/contas' ? 'active' : ''}`}><Landmark size={18} /> Contas</Link>
              <Link href="/cartoes" className={`nav-link ${pathname === '/cartoes' ? 'active' : ''}`}><CreditCard size={18} /> Cartões</Link>
              <Link href="/historico" className={`nav-link ${pathname === '/historico' ? 'active' : ''}`}><History size={18} /> Histórico</Link>
              <Link href="/agenda" className={`nav-link ${pathname === '/agenda' ? 'active' : ''}`}><Calendar size={18} /> Agenda</Link>
              <Link href="/settings" className={`nav-link ${pathname === '/settings' ? 'active' : ''}`}><Settings size={18} /> Configurações</Link>
            </nav>

            <Link href="/chat" className="glass-card" style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', marginTop: '1rem', cursor: 'pointer', display: 'block', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.8rem', fontWeight: 700 }}>
                <div style={{ width: '24px', height: '24px', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageSquare size={14} color="#10B981" />
                </div>
                Perguntar ao Nexo
              </div>
            </Link>
          </aside>
          
          <main className="main-content">
            <div className="page-wrapper fade-in">
              {children}
            </div>
          </main>

          {/* MOBILE BOTTOM NAV */}
          <nav className="mobile-only bottom-nav">
            <Link href="/" className={`mobile-nav-item ${pathname === '/' ? 'active' : ''}`}>
              <LayoutDashboard size={22} />
            </Link>
            <Link href="/cartoes" className={`mobile-nav-item ${pathname === '/cartoes' ? 'active' : ''}`}>
              <CreditCard size={22} />
            </Link>
            <Link href="/chat" className="mobile-nav-item elite-chat-btn">
              <MessageSquare size={24} color="white" />
            </Link>
            <Link href="/contas" className={`mobile-nav-item ${pathname === '/contas' ? 'active' : ''}`}>
              <Landmark size={22} />
            </Link>
            <Link href="/settings" className={`mobile-nav-item ${pathname === '/settings' ? 'active' : ''}`}>
              <Settings size={22} />
            </Link>
          </nav>
        </div>
      </body>
    </html>
  );
}
