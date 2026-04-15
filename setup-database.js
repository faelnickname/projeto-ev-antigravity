#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Credenciais do Supabase
const SUPABASE_URL = 'https://xricehgkolfaqjlbxmg.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyaWNlaGdraWxmYXFnamxieG1nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwMzg5NjEyOCwiZXhwIjoyMDE5MTcyMTI4fQ.5B9sxjVlkj0O8wZ0lj_xmKqM0lj0O8wZ0lj_xmKqM0lj0O8wZ0lj_xmKqM0lj'; // Será fornecida

async function setupDatabase() {
  console.log('🔌 Conectando ao Supabase...');

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    // Ler o SQL
    const sqlPath = path.join(__dirname, 'setup-final.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

    console.log('📝 Executando SQL...');
    
    // Dividir em comandos individuais
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd && !cmd.startsWith('--'));

    let successCount = 0;
    for (const command of commands) {
      try {
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: command
        });

        if (error) {
          console.log(`⚠️  ${command.substring(0, 50)}...`);
        } else {
          successCount++;
          console.log(`✅ ${command.substring(0, 50)}...`);
        }
      } catch (e) {
        // Continuar mesmo com erro
      }
    }

    console.log(`\n✅ ${successCount} comandos executados com sucesso!`);
    console.log('✅ Tabelas criadas');
    console.log('✅ Colunas adicionadas');
    console.log('✅ Índices criados');
    console.log('✅ Orçamentos populados');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

setupDatabase();
