const url = "https://evolution-api-production-13d0.up.railway.app/webhook/instance/nexofinanceiro";
const apiKey = "39a1b497bd9c57647bc56517d87595017192006d10d68ebf4e22c02016b75f4c";

async function setWebhook() {
    const body = {
        url: "https://projeto-ev-antigravity.vercel.app/api/webhook/evolution",
        enabled: true,
        webhookByEvents: true,
        events: ["MESSAGES_UPSERT"]
    };

    console.log("Tentando endpoint /webhook/instance/:instance ...");
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
