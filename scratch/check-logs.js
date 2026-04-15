const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually read .env.local because we don't have dotenv
const envPath = path.join(process.cwd(), '.env.local');
const envFile = fs.readFileSync(envPath, 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
        env[parts[0].trim()] = parts.slice(1).join('=').trim();
    }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase URL or Key missing in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLogs() {
    console.log("Fetching last 10 logs from:", supabaseUrl);
    const { data, error } = await supabase
        .from('logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error("Error fetching logs:", error);
    } else {
        console.log("Found", data.length, "logs:");
        data.forEach(log => {
            console.log(`[${log.created_at}] ${log.numero_whatsapp}: ${log.mensagem_entrada.substring(0, 50)}...`);
            console.log(` -> Resposta: ${log.resposta_enviada.substring(0, 50)}...`);
            console.log('---');
        });
    }
}

checkLogs();
