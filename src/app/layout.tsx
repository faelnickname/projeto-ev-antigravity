"use client";

import type { Metadata, Viewport } from 'next';
import './globals.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PieChart, Calendar, Settings, Bot, MessageSquare, Target, Zap, CreditCard, Landmark, ChevronRight, Briefcase } from 'lucide-react';

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
    { href: '/agenda', label: 'Agenda', icon: Calendar },
    { href: '/settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <html lang="pt-BR">
      <head>
        <title>Nexo Financeiro | Gestão de Elite</title>
        <meta name="description" content="Centro de Comando Financeiro com IA" />
      </head>
      <body>
        <div className="app-container zero-scroll">
          {/* SIDEBAR ELITE */}
          <aside className="sidebar desktop-only">
            <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{ width: '40px', height: '40px', background: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px var(--primary-glow)' }}>
                <Zap size={24} fill="white" stroke="white" />
              </div>
              <div>
                <h1 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'white', margin: 0, letterSpacing: '-0.02em' }}>
                  NEXO <span style={{ color: 'var(--primary)' }}>FINANCEIRO</span>
                </h1>
                <p style={{ fontSize: '0.55rem', fontWeight: 800, color: '#64748b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Gestão de Performance Operacional</p>
              </div>
            </div>

            <div className="elite-pulse" style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '2rem' }}>
              <div style={{ fontSize: '0.55rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.5rem' }}>STATUS DO SISTEMA</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%', boxShadow: '0 0 10px var(--primary)' }}></div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'white' }}>SINCRONIZADO E ATIVO</span>
              </div>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href} className={`nav-link ${isActive ? 'active' : ''}`}>
                    <Icon size={20} />
                    <span>{item.label}</span>
                    {isActive && <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
                  </Link>
                );
              })}
              
              <Link href="/chat" className={`nav-link ${pathname === '/chat' ? 'active' : ''}`} style={{ marginTop: 'auto', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                <MessageSquare size={20} className="text-neon-green" />
                <span className="text-neon-green" style={{ fontWeight: 800 }}>Perguntar ao Nexo</span>
              </Link>
            </nav>
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
