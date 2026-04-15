const apiKey = "39a1b497bd9c57647bc56517d87595017192006d10d68ebf4e22c02016b75f4c";
const baseUrl = "https://evolution-api-production-13d0.up.railway.app";
const instanceName = "nexofinanceiro_bot";

async function setup() {
    // 1. Delete old (just in case)
    try {
        await fetch(`${baseUrl}/instance/delete/nexofinanceiro`, { method: 'DELETE', headers: { apikey: apiKey } });
    } catch (e) {}
    try {
        await fetch(`${baseUrl}/instance/delete/${instanceName}`, { method: 'DELETE', headers: { apikey: apiKey } });
    } catch (e) {}

    // 2. Create New
    console.log("Criando instância...");
    const createRes = await fetch(`${baseUrl}/instance/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: apiKey },
        body: JSON.stringify({
            instanceName: instanceName,
            qrcode: true,
            integration: "WHATSAPP-BAILEYS"
        })
    });
    console.log("Create Status:", createRes.status);

    // 3. Set Webhook
    console.log("Configurando Webhook...");
    const webhookRes = await fetch(`${baseUrl}/webhook/set/${instanceName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: apiKey },
        body: JSON.stringify({
            enabled: true,
            url: "https://projeto-ev-antigravity.vercel.app/api/webhook/evolution",
            webhookByEvents: false,
            events: ["MESSAGES_UPSERT"]
        })
    });
    console.log("Webhook Status:", webhookRes.status);

    // 4. Get QR
    console.log("Gerando QR Code...");
    const connectRes = await fetch(`${baseUrl}/instance/connect/${instanceName}`, {
        method: 'GET',
        headers: { apikey: apiKey }
    });
    const connectData = await connectRes.json();
    console.log("QR JSON:", JSON.stringify(connectData));
}

setup();
