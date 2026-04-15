const { createClient } = require('@supabase/supabase-js');

// Configurações
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xricehgkolfaqjlbxmg.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyaWNlaGdraWxmYXFnamxieG1nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwMzg5NjEyOCwiZXhwIjoyMDE5MTcyMTI4fQ.5B9sxjVlkj0O8wZ0lj_xmKqM0lj0O8wZ0lj_xmKqM0lj0O8wZ0lj_xmKqM0lj';

const sql = `
ALTER TABLE transacoes ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'confirmado';
CREATE INDEX IF NOT EXISTS idx_transacoes_status ON transacoes(status);
`;

async function run() {
  console.log('🚀 Iniciando migração final...');
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  const commands = sql.split(';').map(c => c.trim()).filter(c => c);

  for (const cmd of commands) {
    console.log(`📡 Executando: ${cmd.substring(0, 50)}...`);
    const { error } = await supabase.rpc('exec_sql', { sql: cmd });
    if (error) {
      console.log(`❌ Erro: ${error.message}`);
      // Se o RPC não existir, avisar o usuário
      if (error.message.includes('function "exec_sql" does not exist')) {
        console.log('\n⚠️  FUNÇÃO RPC "exec_sql" NÃO ENCONTRADA.');
        console.log('Por favor, execute o SQL manualmente no dashboard do Supabase.');
        return;
      }
    } else {
      console.log('✅ Sucesso!');
    }
  }
}

run();
