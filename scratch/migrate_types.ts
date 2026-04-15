import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function migrate() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  
  console.log('🔄 Iniciando migração de tipos...');

  const { data: incs } = await supabase.from('transacoes').update({ tipo: 'entrada' }).eq('tipo', 'inc');
  console.log('✅ inc -> entrada concluído');

  const { data: exps } = await supabase.from('transacoes').update({ tipo: 'saida' }).eq('tipo', 'exp');
  console.log('✅ exp -> saida concluído');

  const { data: counts } = await supabase.from('transacoes').select('tipo', { count: 'exact' });
  console.log('📊 Estado atual:', counts);
}

migrate();
