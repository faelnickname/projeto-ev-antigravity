const url = "https://evolution-api-production-13d0.up.railway.app/webhook/set/nexofinanceiro";
const apiKey = "39a1b497bd9c57647bc56517d87595017192006d10d68ebf4e22c02016b75f4c";

async function setWebhook() {
    // Tentativa 1: Formato padrão
    const body1 = {
        enabled: true,
        webhook: {
            enabled: true,
            url: "https://projeto-ev-antigravity.vercel.app/api/webhook/evolution"
        }
    };

    console.log("Tentando Formato 1...");
    let response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': apiKey
        },
        body: JSON.stringify(body1)
    });
    console.log("Status:", response.status);
    console.log("Response:", await response.text());
}

setWebhook();
