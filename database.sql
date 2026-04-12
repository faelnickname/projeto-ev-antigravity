-- Executar isso no SQL Editor do seu Supabase

CREATE TABLE transacoes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  descricao TEXT NOT NULL,
  categoria TEXT,
  valor DECIMAL(10,2) NOT NULL,
  tipo TEXT CHECK (tipo IN ('receita', 'despesa', 'inc', 'exp')),
  data_referencia DATE DEFAULT CURRENT_DATE,
  id_whatsapp TEXT -- opcional, para rastrear quem mandou
);

CREATE TABLE compromissos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  titulo TEXT NOT NULL,
  data_hora TIMESTAMP WITH TIME ZONE,
  local TEXT,
  detalhes TEXT
);

-- Políticas RLS (Se necessário depois, por agora manteremos público para desenvolvimento).
ALTER TABLE transacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE compromissos ENABLE ROW LEVEL SECURITY;

-- Temporário: Permitir qualquer insert enquanto você testa a API (Remover em prod)
CREATE POLICY "Public Access" ON transacoes FOR ALL USING (true);
CREATE POLICY "Public Access" ON compromissos FOR ALL USING (true);
