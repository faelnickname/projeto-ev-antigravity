"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { LogIn, ShieldCheck, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Credenciais inválidas. Verifique seus dados.");
      setLoading(false);
    } else {
      router.push('/');
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'radial-gradient(circle at center, #0f172a 0%, #020617 100%)'
    }}>
      <div className="glass-card" style={{ width: '400px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            background: 'var(--primary)', 
            borderRadius: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 0 30px rgba(99, 102, 241, 0.4)'
          }}>
            <ShieldCheck size={32} color="white" />
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem' }}>EV Elite Auth</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Acesso restrito ao seu centro financeiro.</p>
        </div>

        {error && (
          <div style={{ 
            padding: '0.8rem', 
            background: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid rgba(239, 68, 68, 0.2)', 
            borderRadius: '10px', 
            color: '#f87171', 
            fontSize: '0.85rem',
            textAlign: 'center',
            marginBottom: '1.5rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>E-MAIL</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input 
                required
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com" 
                style={{ 
                  width: '100%', 
                  padding: '1rem 1rem 1rem 3rem', 
                  borderRadius: '12px', 
                  background: 'rgba(0,0,0,0.2)', 
                  border: '1px solid var(--card-border)',
                  color: 'white',
                  outline: 'none'
                }} 
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>SENHA</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input 
                required
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" 
                style={{ 
                  width: '100%', 
                  padding: '1rem 1rem 1rem 3rem', 
                  borderRadius: '12px', 
                  background: 'rgba(0,0,0,0.2)', 
                  border: '1px solid var(--card-border)',
                  color: 'white',
                  outline: 'none'
                }} 
              />
            </div>
          </div>

          <button 
            disabled={loading}
            type="submit" 
            className="btn" 
            style={{ 
              width: '100%', 
              height: '52px', 
              justifyContent: 'center', 
              fontSize: '1rem',
              marginTop: '1rem'
            }}
          >
            {loading ? 'Validando...' : (
              <>
                Entrar no Sistema
                <LogIn size={20} />
              </>
            )}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.75rem', color: '#475569' }}>
          Esqueceu a senha? Entre em contato com o suporte EV.
        </p>
      </div>
    </div>
  );
}
