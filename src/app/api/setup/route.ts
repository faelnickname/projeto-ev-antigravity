import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Variáveis Supabase não configuradas no ambiente');
  }

  return createClient(supabaseUrl, supabaseKey);
}

export async function POST(request: Request) {
  try {
    const { action } = await request.json();

    if (action === 'execute_sql') {
      return await executeSql();
    } else if (action === 'create_bucket') {
      return await createBucket();
    }

    return Response.json({ success: false, error: 'Ação inválida' });
  } catch (error: any) {
    return Response.json({ success: false, error: error.message });
  }
}

async function executeSql() {
  try {
    const supabase = getSupabase();
    
    // Ler arquivo SQL
    const sqlPath = join(process.cwd(), 'setup-final.sql');
    const sqlContent = readFileSync(sqlPath, 'utf-8');

    // Dividir em comandos
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd && !cmd.startsWith('--'));

    let executed = 0;

    // Executar cada comando via RPC (exec_sql deve estar definido no Supabase)
    for (const command of commands) {
      try {
        const { error } = await supabase.rpc('exec_sql', {
          sql: command
        }) as any;

        if (!error) executed++;
      } catch (err) {
        // Continuar mesmo com erro, pois alguns comandos podem falhar se já existirem
      }
    }

    return Response.json({
      success: true,
      message: `${executed}/${commands.length} comandos executados`,
      executed
    });
  } catch (error: any) {
    return Response.json({
      success: false,
      error: error.message
    });
  }
}

async function createBucket() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Variáveis Supabase não configuradas');
    }

    // Criar bucket via API REST
    const response = await fetch(
      `${supabaseUrl}/storage/v1/bucket`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({
          name: 'comprovantes',
          public: true
        })
      }
    );

    const data = await response.json();

    if (response.ok || data.error?.includes('already exists')) {
      return Response.json({
        success: true,
        message: 'Bucket criado ou já existe'
      });
    }

    return Response.json({
      success: false,
      error: data.message || 'Erro ao criar bucket'
    });
  } catch (error: any) {
    return Response.json({
      success: false,
      error: error.message
    });
  }
}
