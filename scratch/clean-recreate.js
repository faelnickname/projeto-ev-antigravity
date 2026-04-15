const apiKey = "39a1b497bd9c57647bc56517d87595017192006d10d68ebf4e22c02016b75f4c";
const baseUrl = "https://evolution-api-production-13d0.up.railway.app";

async function run() {
    console.log("Iniciando Limpeza Total...");
    
    // Deletar instâncias antigas
    await fetch(`${baseUrl}/instance/delete/nexofinanceiro_bot`, { method: 'DELETE', headers: { apikey: apiKey } });
    await fetch(`${baseUrl}/instance/delete/nexofinanceiro`, { method: 'DELETE', headers: { apikey: apiKey } });
    
    console.log("Criando Instância nexofinanceiro...");
    const create = await fetch(`${baseUrl}/instance/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: apiKey },
        body: JSON.stringify({ instanceName: "nexofinanceiro", qrcode: true, integration: "WHATSAPP-BAILEYS" })
    });
    console.log("Create:", create.status);

    console.log("Configurando Webhook...");
    const webhook = await fetch(`${baseUrl}/webhook/set/nexofinanceiro`, {
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
    console.log("Webhook:", webhook.status);

    console.log("Buscando QR...");
    const connect = await fetch(`${baseUrl}/instance/connect/nexofinanceiro`, {
        method: 'GET',
        headers: { apikey: apiKey }
    });
    const res = await connect.json();
    console.log("QR Ready!");
}

run();
