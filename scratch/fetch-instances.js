const url = "https://evolution-api-production-13d0.up.railway.app/instance/fetchInstances";
const apiKey = "39a1b497bd9c57647bc56517d87595017192006d10d68ebf4e22c02016b75f4c";

async function fetchInstances() {
    console.log("Buscando instâncias...");
    let response = await fetch(url, {
        method: 'GET',
        headers: {
            'apikey': apiKey
        }
    });
    console.log("Status:", response.status);
    const data = await response.json();
    console.log("Instâncias:", JSON.stringify(data, null, 2));
}

fetchInstances();
