const url = "https://evolution-api-production-13d0.up.railway.app/webhook/set/nexofinanceiro_bot";
const apiKey = "39a1b497bd9c57647bc56517d87595017192006d10d68ebf4e22c02016b75f4c";

async function setWebhook() {
    const body = {
        enabled: true,
        url: "https://projeto-ev-antigravity.vercel.app/api/webhook/evolution",
        webhookByEvents: false,
        events: [
            "MESSAGES_UPSERT"
        ]
    };

    console.log("Configurando Webhook...");
    let response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': apiKey
        },
        body: JSON.stringify(body)
    });
    
    const result = await response.json();
    console.log("Status:", response.status);
    console.log("Response:", JSON.stringify(result, null, 2));

    // Se falhar, tenta o formato alternativo
    if (response.status === 400) {
        console.log("Tentando formato alternativo...");
        const altBody = {
            webhook: {
                enabled: true,
                url: "https://projeto-ev-antigravity.vercel.app/api/webhook/evolution",
                byEvents: false,
                events: ["MESSAGES_UPSERT"]
            }
        };
        let responseAlt = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': apiKey
            },
            body: JSON.stringify(altBody)
        });
        console.log("Status Alt:", responseAlt.status);
        console.log("Response Alt:", await responseAlt.text());
    }
}

setWebhook();
