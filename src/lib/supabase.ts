import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sua-url-aqui.supabase.co';

// Decisão Inteligente de Chave:
// No Servidor (Webhook/API), preferimos a SERVICE_ROLE_KEY para ignorar RLS e garantir persistência.
// No Cliente, usamos a ANON_KEY.
const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sua-chave-aqui');

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false, // Evita problemas em ambientes serverless
    autoRefreshToken: false,
  }
});
