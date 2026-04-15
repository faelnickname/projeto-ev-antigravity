import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('=== DIAGNÓSTICO DO SISTEMA ===');

    // 1. Verificar conexão Supabase
    console.log('1. Testando conexão Supabase...');
    const { data: testData, error: testError } = await supabase
      .from('transacoes')
      .select('id')
      .limit(1);

    if (testError) {
      console.error('❌ Erro ao conectar Supabase:', testError);
      return NextResponse.json({
        status: 'error',
        message: 'Falha na conexão Supabase',
        details: testError.message
      }, { status: 500 });
    }

    console.log('✅ Supabase conectado');

    // 2. Verificar tabelas
    console.log('2. Verificando tabelas...');
    const { data: transacoes, error: errTrans } = await supabase
      .from('transacoes')
      .select('count', { count: 'exact' });

    const { data: orcamentos, error: errOrc } = await supabase
      .from('orcamentos')
      .select('count', { count: 'exact' });

    const { data: logs, error: errLogs } = await supabase
      .from('logs')
      .select('count', { count: 'exact' });

    console.log(`✅ Tabelas encontradas`);
    console.log(`   - transacoes: ${transacoes ? 'OK' : errTrans?.message}`);
    console.log(`   - orcamentos: ${orcamentos ? 'OK' : errOrc?.message}`);
    console.log(`   - logs: ${logs ? 'OK' : errLogs?.message}`);

    // 3. Verificar variáveis de ambiente
    console.log('3. Verificando variáveis de ambiente...');
    const envVars = {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      openaiKey: !!process.env.OPENAI_API_KEY,
      evolutionUrl: !!process.env.EVOLUTION_API_URL,
      evolutionKey: !!process.env.EVOLUTION_API_KEY,
      authorizedPhone: !!process.env.AUTHORIZED_PHONE,
      cronSecret: !!process.env.CRON_SECRET
    };

    console.log('✅ Variáveis:', envVars);

    // 4. Teste de insert
    console.log('4. Testando insert de transação...');
    const { data: insertTest, error: errInsert } = await supabase
      .from('transacoes')
      .insert({
        descricao: 'TEST - Pode deletar',
        categoria: 'Testes',
        valor: -99.99,
        tipo: 'exp',
        fonte: 'diagnostico',
        status: 'confirmado'
      })
      .select();

    if (errInsert) {
      console.error('❌ Erro ao inserir:', errInsert);
      return NextResponse.json({
        status: 'error',
        message: 'Falha ao inserir transação',
        details: errInsert.message,
        envVars
      }, { status: 500 });
    }

    console.log('✅ Insert funcionando - ID:', insertTest?.[0]?.id);

    // Limpar teste
    if (insertTest?.[0]?.id) {
      await supabase.from('transacoes').delete().eq('id', insertTest[0].id);
    }

    return NextResponse.json({
      status: 'ok',
      message: 'Sistema funcionando normalmente',
      checks: {
        supabase: true,
        tables: {
          transacoes: !errTrans,
          orcamentos: !errOrc,
          logs: !errLogs
        },
        envVars,
        insert: true
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('❌ Erro no diagnóstico:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Erro interno no diagnóstico',
      details: error.message
    }, { status: 500 });
  }
}
