
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTransactions() {
  console.log('--- Ultimas 5 Transações ---');
  const { data, error } = await supabase
    .from('transacoes')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Erro:', error);
    return;
  }

  console.table(data.map(t => ({
    id: t.id,
    desc: t.descricao,
    valor: t.valor,
    id_whatsapp: t.id_whatsapp,
    tenant_id: t.tenant_id,
    created_at: t.created_at
  })));
}

checkTransactions();
