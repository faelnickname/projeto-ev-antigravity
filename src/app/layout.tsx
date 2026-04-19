"use client";

import './globals.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PieChart, Calendar, Settings, MessageSquare, Target, CreditCard, Landmark, Briefcase, ShieldCheck, History, Activity } from 'lucide-react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/eve', label: 'Cockpit EVE', icon: ShieldCheck },
    { href: '/saude', label: 'NutriMind', icon: Activity },
    { href: '/transicoes', label: 'Transações', icon: PieChart },
    { href: '/fixas', label: 'Despesas Fixas', icon: Target },
    { href: '/contas', label: 'Contas', icon: Landmark },
    { href: '/agenda', label: 'Agenda', icon: Calendar },
    { href: '/settings', label: 'Configurações', icon: Settings },
  ];

  const isStandalonePage = pathname?.startsWith('/saude') || pathname?.startsWith('/eve');

  return (
    <html lang="pt-BR">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Nexus" />
        <meta name="theme-color" content="#0b0e1a" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body>
        <div className="app-container zero-scroll">
          {/* HIDE NEXUS SIDEBAR ON SAUDE OR EVE ROUTES */}
          {!isStandalonePage && (
            <aside className="sidebar desktop-only" style={{ background: '#0f172a' }}>
              <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                
                {/* Premium Nexus Inline SVG Logo */}
                <div style={{ marginBottom: '0.8rem' }}>
                  <svg width="170" height="45" viewBox="0 0 170 45" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="nexusGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                      <filter id="neonGlowLogo" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    
                    {/* Glowing N Symbol */}
                    <g filter="url(#neonGlowLogo)">
                      <path d="M 8 34 L 8 10 L 26 34 L 26 10" stroke="url(#nexusGrad)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="26" cy="10" r="3.5" fill="#10b981" />
                      <circle cx="8" cy="34" r="3.5" fill="#38bdf8" />
                    </g>
                    
                    {/* Nexus Text */}
                    <text x="42" y="31" fill="#ffffff" fontFamily="system-ui, -apple-system, sans-serif" fontSize="24" fontWeight="900" letterSpacing="0.1em">NEXUS</text>
                  </svg>
                </div>

                <div className="sidebar-subtitle" style={{ fontSize: '0.65rem', letterSpacing: '2px', textAlign: 'center', color: '#64748b', fontWeight: 800 }}>
                  GESTÃO DE PERFORMANCE
                </div>
              </div>

              <div className="status-box">
                <span className="status-label">STATUS DO SISTEMA</span>
                <div className="status-value" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  SINCRONIZADO E ATIVO
                </div>
              </div>

              <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link 
                      key={item.href} 
                      href={item.href} 
                      className={`nav-link ${pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href)) ? 'active' : ''}`}
                    >
                      <Icon size={18} /> {item.label}
                    </Link>
                  );
                })}
              </nav>

              <Link href="/eve" className="glass-card" style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', marginTop: '1rem', cursor: 'pointer', display: 'block', textDecoration: 'none', color: 'inherit' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.8rem', fontWeight: 700 }}>
                  <div style={{ width: '24px', height: '24px', background: 'rgba(56, 189, 248, 0.2)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldCheck size={14} color="#38BDF8" />
                  </div>
                  Cockpit Estratégico EVE
                </div>
              </Link>
            </aside>
          )}

          <main className={isStandalonePage ? "main-content-full" : "main-content"}>
            <div className="page-wrapper fade-in">
              {children}
            </div>
          </main>

          {/* HIDE NEXUS BOTTOM NAV ON SAUDE OR EVE ROUTES */}
          {!isStandalonePage && (
            <nav className="mobile-only bottom-nav">
              <Link href="/" className={`mobile-nav-item ${pathname === '/' ? 'active' : ''}`}>
                <LayoutDashboard size={22} />
              </Link>
              <Link href="/eve" className={`mobile-nav-item ${pathname?.startsWith('/eve') ? 'active' : ''}`}>
                <ShieldCheck size={22} color="#38BDF8" />
              </Link>
              <Link href="/saude" className={`mobile-nav-item ${pathname?.startsWith('/saude') ? 'active' : ''}`}>
                <Activity size={22} />
              </Link>
              <Link href="/cartoes" className={`mobile-nav-item ${pathname === '/cartoes' ? 'active' : ''}`}>
                <CreditCard size={22} />
              </Link>
              <Link href="/settings" className={`nav-item ${pathname === '/settings' ? 'active' : ''}`}>
                <Settings size={22} />
              </Link>
            </nav>
          )}
        </div>
      </body>
    </html>
  );
}
