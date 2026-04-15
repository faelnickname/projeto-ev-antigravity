const url = "https://evolution-api-production-13d0.up.railway.app/webhook/set/nexofinanceiro_bot";
const apiKey = "39a1b497bd9c57647bc56517d87595017192006d10d68ebf4e22c02016b75f4c";

async function setWebhook() {
    const body = {
        enabled: true,
        url: "https://projeto-ev-antigravity.vercel.app/api/webhook/evolution",
        events: ["MESSAGES_UPSERT"]
    };

    console.log("Tentando Formato Direto con Events...");
    let response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': apiKey
        },
        body: JSON.stringify(body)
    });
    console.log("Status:", response.status);
    console.log("Response:", await response.text());
}

setWebhook();
