'use client';

import { useState } from 'react';

export default function SetupWizard() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleExecuteSQL = async () => {
    setLoading(true);
    setMessage('⏳ Executando SQL no Supabase...');

    try {
      const response = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'execute_sql'
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessage('✅ SQL executado com sucesso!');
        setStep(2);
      } else {
        setMessage('❌ ' + data.error);
      }
    } catch (error: any) {
      setMessage('❌ Erro: ' + (error?.message || String(error)));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBucket = async () => {
    setLoading(true);
    setMessage('⏳ Criando bucket...');

    try {
      const response = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_bucket'
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessage('✅ Bucket criado com sucesso!');
        setStep(3);
      } else {
        setMessage('❌ ' + data.error);
      }
    } catch (error: any) {
      setMessage('❌ Erro: ' + (error?.message || String(error)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '600px',
      margin: '2rem auto',
      padding: '2rem',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      borderRadius: '16px',
      color: '#fff',
      fontFamily: 'Inter, sans-serif'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>🚀 Setup EV</h1>
      <p style={{ color: '#cbd5e1', marginBottom: '2rem' }}>Ative seu agente financeiro em 3 cliques</p>

      {step >= 1 && (
          <div style={{
            padding: '1.5rem',
            background: 'rgba(0, 210, 255, 0.1)',
            border: '1px solid rgba(0, 210, 255, 0.3)',
            borderRadius: '20px',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
              {step === 1 ? '1️⃣ Preparar Banco de Dados' : '✅ Banco de Dados'}
            </h2>
            {step === 1 && (
              <>
                <p style={{ marginBottom: '1rem', color: '#cbd5e1' }}>
                  Vou criar as tabelas, colunas e índices automaticamente.
                </p>
                <button
                  onClick={handleExecuteSQL}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: loading ? '#666' : 'var(--primary)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '1rem',
                    fontWeight: '700',
                    boxShadow: '0 8px 16px var(--primary-glow)',
                    transition: 'all 0.3s'
                  }}
                >
                  {loading ? '⏳ Aguarde...' : '🔨 Executar SQL'}
                </button>
              </>
            )}
            {step > 1 && <p style={{ color: '#10b981' }}>✅ Completo!</p>}
          </div>
      )}

      {step >= 2 && (
          <div style={{
            padding: '1.5rem',
            background: 'rgba(0, 210, 255, 0.05)',
            border: '1px solid rgba(0, 210, 255, 0.2)',
            borderRadius: '20px',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
              {step === 2 ? '2️⃣ Criar Storage' : '✅ Storage'}
            </h2>
            {step === 2 && (
              <>
                <p style={{ marginBottom: '1rem', color: '#cbd5e1' }}>
                  Vou criar o bucket 'comprovantes' para guardar fotos de recibos.
                </p>
                <button
                  onClick={handleCreateBucket}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: loading ? '#666' : 'var(--accent)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '1rem',
                    fontWeight: '700',
                    boxShadow: '0 8px 16px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  {loading ? '⏳ Aguarde...' : '📦 Criar Bucket'}
                </button>
              </>
            )}
            {step > 2 && <p style={{ color: '#10b981' }}>✅ Completo!</p>}
          </div>
      )}

      {step >= 3 && (
          <div style={{
            padding: '1.5rem',
            background: 'rgba(0, 210, 255, 0.1)',
            border: '1px solid rgba(0, 210, 255, 0.3)',
            borderRadius: '20px'
          }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>✅ Pronto!</h2>
            <p style={{ marginBottom: '1rem', color: '#cbd5e1' }}>
              Seu sistema EV está 100% ativo e pronto para usar.
            </p>
            <div style={{
              background: 'rgba(0, 0, 0, 0.2)',
              padding: '1rem',
              borderRadius: '12px',
              marginBottom: '1rem'
            }}>
              <p style={{ margin: 0, marginBottom: '0.5rem' }}>📱 Teste agora no WhatsApp:</p>
              <code style={{ 
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '0.5rem',
                borderRadius: '8px',
                display: 'block',
                color: 'var(--primary)'
              }}>
                "EV, gastei 50 reais em comida!"
              </code>
            </div>
            <p style={{ color: 'var(--accent)', margin: 0, fontWeight: 700 }}>
              Você receberá uma resposta em áudio em 5 segundos! 🎉
            </p>
          </div>
      )}

      {message && (
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: message.includes('❌') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
          border: message.includes('❌') ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '8px',
          color: message.includes('❌') ? '#fca5a5' : '#6ee7b7'
        }}>
          {message}
        </div>
      )}
    </div>
  );
}
