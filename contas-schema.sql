-- TABELA DE CONTAS E CONEXÕES BANCÁRIAS
CREATE TABLE IF NOT EXISTS contas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  id_whatsapp TEXT NOT NULL,
  banco TEXT NOT NULL,
  tipo TEXT NOT NULL, -- 'Conta Corrente', 'Cartão', 'Investimentos', 'Poupança'
  saldo NUMERIC DEFAULT 0,
  cor_hex TEXT DEFAULT '#10b981',
  instituicao_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE MAX_VAL ENABLE ROW LEVEL SECURITY; -- Fix if table name is different
ALTER TABLE contas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access Contas" ON contas FOR ALL USING (true);

-- Dados iniciais de exemplo (Tenant Global para demo)
INSERT INTO contas (id_whatsapp, banco, tipo, saldo, cor_hex, instituicao_id) VALUES
  ('default', 'Nuconta', 'Conta Corrente', 60500.56, '#8b5cf6', 'nubank'),
  ('default', 'Itaú', 'Conta Corrente', -126.48, '#f59e0b', 'itau'),
  ('default', 'Caixa', 'Poupança', 1250.00, '#00d2ff', 'caixa'),
  ('default', 'Santander', 'Conta Corrente', 0, '#ef4444', 'santander')
ON CONFLICT DO NOTHING;
