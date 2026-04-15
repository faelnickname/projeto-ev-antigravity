import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  try {
    console.log('⚛️ Protocolo Nuclear Ativado pelo Rafa...');
    
    // Lista de tabelas para limpeza total
    const tables = [
      'transacoes', 
      'logs', 
      'orcamentos', 
      'compromissos', 
      'contas', 
      'cartoes'
    ];

    const results = [];
    
    for (const table of tables) {
      console.log(`🧹 Limpando tabela: ${table}...`);
      
      // Tentativa de delete total usando filtro universal
      const { error } = await supabase
        .from(table)
        .delete()
        .not('id', 'is', null);

      if (error) {
        // Se a tabela não existe (42P01), ignoramos silenciosamente para o usuário
        if (error.code === '42P01') {
          console.warn(`⚠️ Tabela "${table}" não encontrada no banco. Pulando...`);
          results.push({ table, status: 'skipped (not found)' });
        } else {
          console.error(`❌ Erro ao limpar "${table}":`, error);
          results.push({ table, status: 'error', message: error.message });
        }
      } else {
        results.push({ table, status: 'success' });
      }
    }

    // Verifica se houve erros críticos (que não sejam tabela inexistente)
    const criticalErrors = results.filter(r => r.status === 'error');
    
    return NextResponse.json({ 
      success: criticalErrors.length === 0, 
      message: "Protocolo Nuclear concluído.",
      details: results,
      error: criticalErrors.length > 0 ? criticalErrors[0].message : null
    });

  } catch (error: any) {
    console.error('Erro crítico no Protocolo Nuclear:', error);
    return NextResponse.json({ success: false, error: 'Erro de ignição: ' + error.message }, { status: 500 });
  }
}
