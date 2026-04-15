const apiKey = "39a1b497bd9c57647bc56517d87595017192006d10d68ebf4e22c02016b75f4c";
const baseUrl = "https://evolution-api-production-13d0.up.railway.app";
const instanceName = "nexofinanceiro";

async function setup() {
    // 1. Delete all possible conflicts
    console.log("Limpando instâncias...");
    await fetch(`${baseUrl}/instance/delete/nexofinanceiro_bot`, { method: 'DELETE', headers: { apikey: apiKey } }).catch(() => {});
    await fetch(`${baseUrl}/instance/delete/nexofinanceiro`, { method: 'DELETE', headers: { apikey: apiKey } }).catch(() => {});

    // 2. Create Official
    console.log(`Criando instância oficial: ${instanceName}...`);
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
    console.log("Configurando Webhook oficial...");
    const webhookRes = await fetch(`${baseUrl}/webhook/set/${instanceName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: apiKey },
        body: JSON.stringify({
            webhook: {
                enabled: true,
                url: "https://projeto-ev-antigravity.vercel.app/api/webhook/evolution",
                events: ["MESSAGES_UPSERT"]
            }
        })
    });
    console.log("Webhook Status:", webhookRes.status);

    // 4. Get QR
    console.log("Pronto para o QR final...");
}

setup();
