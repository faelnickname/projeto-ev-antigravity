import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE || 'nexofinanceiro_bot';
const WEBHOOK_URL = 'https://projetoev.com.br/api/webhook/evolution';

async function setupWebhook() {
  console.log(`[EVO_SETUP] Configurando Webhook para instância: ${EVOLUTION_INSTANCE}`);
  
  try {
    const res = await fetch(`${EVOLUTION_API_URL}/webhook/set/${EVOLUTION_INSTANCE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': EVOLUTION_API_KEY!
      },
      body: JSON.stringify({
        url: WEBHOOK_URL,
        enabled: true,
        events: ['MESSAGES_UPSERT']
      })
    });

    const data = await res.json();
    console.log('[EVO_SETUP] Resposta:', JSON.stringify(data, null, 2));
    
    if (res.ok) {
        console.log('✅ WEBHOOK CONFIGURADO COM SUCESSO!');
    } else {
        console.error('❌ FALHA NA CONFIGURAÇÃO DO WEBHOOK.');
    }

  } catch (err) {
    console.error('[EVO_SETUP] Erro fatal:', err);
  }
}

setupWebhook();
