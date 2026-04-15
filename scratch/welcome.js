const url = "https://evolution-api-production-13d0.up.railway.app/message/sendText/nexofinanceiro_bot";
const apiKey = "39a1b497bd9c57647bc56517d87595017192006d10d68ebf4e22c02016b75f4c";

async function sendMessage() {
    const body = {
        number: "5535991831298",
        text: "✅ SISTEMA RESTAURADO! Seu Agente Nexo Financeiro 4.2 está online e ouvindo. Como posso te ajudar com suas finanças hoje?"
    };

    console.log("Enviando mensagem de boas-vindas...");
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

sendMessage();
