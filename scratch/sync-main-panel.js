
const API_URL = 'https://evolution-api-production-13d0.up.railway.app';
const API_KEY = '39a1b497bd9c57647bc56517d87595017192006d10d68ebf4e22c02016b75f4c';
const INSTANCE = 'nexofinanceiro_bot';
const NEW_WEBHOOK_URL = 'https://projetoev.com.br/api/webhook/evolution';

async function syncWithMainPanel() {
    console.log(`📡 Sincronizando com o Centro de Comando Principal: ${NEW_WEBHOOK_URL}...`);
    
    const payload = {
        webhook: {
            enabled: true,
            url: NEW_WEBHOOK_URL,
            byEvents: false,
            events: [
                "MESSAGES_UPSERT"
            ]
        }
    };

    try {
        const response = await fetch(`${API_URL}/webhook/set/${INSTANCE}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': API_KEY
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log('✅ Resposta da Evolution API:', JSON.stringify(data, null, 2));

        if (response.ok) {
            console.log('\n✨ INTEGRAÇÃO DE ELITE CONCLUÍDA! ✨');
            console.log(`O bot agora está mapeado para o domínio oficial: projetoev.com.br`);
        } else {
            console.error('❌ Falha na integração. Verifique os enums e a estrutura.');
        }

    } catch (error) {
        console.error('❌ Erro crítico:', error);
    }
}

syncWithMainPanel();
