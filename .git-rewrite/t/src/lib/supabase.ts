import { createClient } from '@supabase/supabase-js';

// Usar Variáveis de ambiente no deployment real.
// Para rodar localmente sem falhar durante a importação, usamos fallbacks vazios
// O usuário vai definir NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY na Vercel
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sua-url-aqui.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sua-chave-anon-aqui';

export const supabase = createClient(supabaseUrl, supabaseKey);
