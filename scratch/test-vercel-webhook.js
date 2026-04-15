async function testWebhook() {
    const url = "https://projeto-ev-antigravity.vercel.app/api/webhook/evolution"
    const payload = {
        event: "MESSAGES_UPSERT",
        instance: "nexofinanceiro_bot",
        data: {
             key: {
                 remoteJid: "5535991831298@s.whatsapp.net",
                 fromMe: false,
                 id: "TEST_" + Date.now()
             },
             message: {
                 conversation: "Teste de conexão manual - Responda se estiver ouvindo!"
             },
             pushName: "Rafa Teste"
        }
    };

    console.log("Enviando payload de teste para Vercel...");
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        console.log("Status:", response.status);
        const text = await response.text();
        console.log("Resposta:", text);
    } catch (e) {
        console.error("Erro:", e);
    }
}

testWebhook();
