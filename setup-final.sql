-- ========================================
-- SETUP FINAL - EV AGENTE FINANCEIRO IA
-- ========================================

-- 1. CRIAR TABELA: Orçamentos/Metas
CREATE TABLE IF NOT EXISTS orcamentos (
  id BIGSERIAL PRIMARY KEY,
  categoria TEXT NOT NULL UNIQUE,
  valor_limite NUMERIC NOT NULL,
  periodo TEXT DEFAULT 'mensal',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ADICIONAR COLUNA: Anexo (Foto de Comprovante)
ALTER TABLE transacoes ADD COLUMN IF NOT EXISTS anexo_url TEXT;

-- 3. ADICIONAR COLUNA: ID do WhatsApp
ALTER TABLE transacoes ADD COLUMN IF NOT EXISTS id_whatsapp TEXT;

-- 4. CRIAR TABELA: Usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  numero_whatsapp TEXT UNIQUE NOT NULL,
  nome TEXT,
  moeda_padrao TEXT DEFAULT 'BRL',
  tema TEXT DEFAULT 'dark',
  notificacoes_ativas BOOLEAN DEFAULT true,
  objetivo_financeiro TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CRIAR TABELA: Logs (Auditoria)
CREATE TABLE IF NOT EXISTS logs (
  id BIGSERIAL PRIMARY KEY,
  numero_whatsapp TEXT,
  mensagem_entrada TEXT,
  resposta_enviada TEXT,
  tipo_acao TEXT,
  confianca_ia NUMERIC(3,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. HABILITAR RLS
ALTER TABLE orcamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- 7. CRIAR POLÍTICAS RLS (Permissão pública para desenvolvimento)
CREATE POLICY "Public Access Orcamentos" ON orcamentos FOR ALL USING (true);
CREATE POLICY "Public Access Usuarios" ON usuarios FOR ALL USING (true);
CREATE POLICY "Public Access Logs" ON logs FOR ALL USING (true);

-- 8. CRIAR ÍNDICES (Performance)
CREATE INDEX IF NOT EXISTS idx_transacoes_whatsapp ON transacoes(id_whatsapp);
CREATE INDEX IF NOT EXISTS idx_transacoes_data ON transacoes(created_at);
CREATE INDEX IF NOT EXISTS idx_transacoes_categoria ON transacoes(categoria);
CREATE INDEX IF NOT EXISTS idx_usuarios_whatsapp ON usuarios(numero_whatsapp);
CREATE INDEX IF NOT EXISTS idx_logs_whatsapp ON logs(numero_whatsapp);

-- 9. POPULAR ORÇAMENTOS COM CATEGORIAS PADRÃO
INSERT INTO orcamentos (categoria, valor_limite, periodo) VALUES
  ('alimentação', 1000, 'mensal'),
  ('transporte', 500, 'mensal'),
  ('saúde', 800, 'mensal'),
  ('lazer', 500, 'mensal'),
  ('assinaturas', 300, 'mensal'),
  ('educação', 1000, 'mensal'),
  ('roupas', 600, 'mensal'),
  ('outros', 1300, 'mensal')
ON CONFLICT (categoria) DO NOTHING;

-- ✅ FIM DO SETUP
-- Execute este script no SQL Editor do Supabase
-- Depois crie o Bucket 'comprovantes' manualmente no Storage
