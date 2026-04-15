# 🚀 GUIA DE INSTALAÇÃO - EVOLUTION GO + EV AGENTE FINANCEIRO

## ⚡ OPÇÃO 1: Instalação Automática (Recomendado)

### Passo 1: Clonar repositório do projeto EV
```bash
git clone https://github.com/faelnickname/projeto-ev-antigravity.git
cd projeto-ev-antigravity
```

### Passo 2: Executar script de instalação
```bash
# Download do script
curl -O https://raw.githubusercontent.com/faelnickname/projeto-ev-antigravity/main/scripts/install-evolution.sh

# Dar permissão de execução
chmod +x install-evolution.sh

# Executar
./install-evolution.sh
```

O script vai:
- ✅ Verificar Docker e Docker Compose
- ✅ Criar diretório de trabalho
- ✅ Puxar imagens Docker
- ✅ Iniciar PostgreSQL
- ✅ Iniciar Evolution Go
- ✅ Testar conexões
- ✅ Exibir credenciais

---

## 📋 OPÇÃO 2: Instalação Manual

### Passo 1: Criar arquivo docker-compose.yml
```bash
mkdir -p ~/evolution-setup
cd ~/evolution-setup

# Criar arquivo docker-compose.yml com o conteúdo abaixo
```

### Passo 2: Docker Compose
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    container_name: evolution_postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: evolution_secure_pass_2024
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - evolution_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  evolution-go:
    image: evoapicloud/evolution-go:latest
    container_name: evolution_go
    ports:
      - "8080:8080"
    environment:
      SERVER_PORT: 8080
      CLIENT_NAME: evolution
      GLOBAL_API_KEY: B5D22993E361-4914-A8E6-07AB63A3F0A1
      POSTGRES_AUTH_DB: postgresql://postgres:evolution_secure_pass_2024@postgres:5432/evogo_auth?sslmode=disable
      POSTGRES_USERS_DB: postgresql://postgres:evolution_secure_pass_2024@postgres:5432/evogo_users?sslmode=disable
      DATABASE_SAVE_MESSAGES: false
      WADEBUG: INFO
      LOGTYPE: console
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - evolution_network

volumes:
  postgres_data:

networks:
  evolution_network:
```

### Passo 3: Iniciar serviços
```bash
# Puxar imagens
docker-compose pull

# Iniciar em background
docker-compose up -d

# Verificar status
docker-compose ps
```

### Passo 4: Verificar se está funcionando
```bash
# Acessar Evolution Go
curl http://localhost:8080

# Ver logs
docker-compose logs -f evolution-go
```

---

## 🔧 CONFIGURAÇÃO PÓS-INSTALAÇÃO

### 1. Acessar Evolution Go
```
http://localhost:8080
```

### 2. Criar Instância WhatsApp
- Clique em "Create Instance"
- Digite um nome (ex: "ev-main")
- Clique em "Create"

### 3. Configurar Webhook
- Na instância, vá para "Settings"
- Webhook URL: `https://projeto-ev-antigravity.vercel.app/api/webhook/whatsapp`
- Ativar: "Webhook by Events"
- Salvar

### 4. Conectar WhatsApp
- Escaneie o QR Code com seu telefone
- Confirme no WhatsApp
- Aguarde conectar (pode levar 30s)

### 5. Testar Integração
Envie uma mensagem no WhatsApp:
```
EV, /saldo
```

Você deve receber a resposta automática!

---

## 📊 COMANDOS ÚTEIS

### Ver Logs
```bash
docker-compose logs -f evolution-go
docker-compose logs -f postgres
```

### Parar Serviços
```bash
docker-compose down
```

### Reiniciar
```bash
docker-compose restart
```

### Resetar Banco (⚠️ CUIDADO)
```bash
docker-compose down -v  # Remove volumes
docker-compose up -d    # Inicia do zero
```

### Conectar ao Banco Diretamente
```bash
docker exec -it evolution_postgres psql -U postgres -d evogo_users
```

---

## 🔐 SEGURANÇA

### ⚠️ ALTERE A CHAVE DE API EM PRODUÇÃO!

**Gerar nova chave segura:**
```bash
openssl rand -base64 32
```

**Atualizar no docker-compose.yml:**
```yaml
GLOBAL_API_KEY: sua-nova-chave-secura-aqui
```

**Alterar Senha PostgreSQL:**
```yaml
POSTGRES_PASSWORD: sua-nova-senha-secura
```

---

## 🚨 TROUBLESHOOTING

### Porta 8080 já está em uso
```bash
# Encontrar processo usando a porta
lsof -i :8080

# Matar processo (substitua PID)
kill -9 <PID>

# Ou mudar porta no docker-compose.yml
ports:
  - "8888:8080"  # Novo: 8888
```

### PostgreSQL não conecta
```bash
# Verificar se está rodando
docker ps | grep postgres

# Reiniciar
docker-compose restart postgres

# Ver logs
docker-compose logs postgres
```

### Evolution Go não responde
```bash
# Reiniciar
docker-compose restart evolution-go

# Aguardar ~30s
sleep 30

# Testar
curl http://localhost:8080
```

### Webhook não está recebendo mensagens
1. Verificar se webhook URL está correto:
   ```
   https://projeto-ev-antigravity.vercel.app/api/webhook/whatsapp
   ```
2. Confirmar que "Webhook by Events" está ativado
3. Ver logs do Evolution:
   ```bash
   docker-compose logs -f evolution-go | grep webhook
   ```
4. Testar em produção:
   ```bash
   curl https://projeto-ev-antigravity.vercel.app/api/webhook/whatsapp
   ```

---

## 📱 TESTANDO A INTEGRAÇÃO

### Teste 1: Enviar mensagem simples
```
Eviou: EV, oi
Esperado: Resposta da IA
```

### Teste 2: Registrar transação
```
Você: EV, gastei 50 em comida
Esperado: Confirmação de registro
```

### Teste 3: Comando /saldo
```
Você: EV, /saldo
Esperado: Saldo atual + Receitas + Despesas
```

### Teste 4: Ver metas
```
Você: EV, /meta
Esperado: Orçamentos e alertas
```

---

## 📊 ARQUITETURA

```
┌─────────────────────────────────────┐
│     SEU CELULAR (WhatsApp)          │
└────────────────┬────────────────────┘
                 │
     ┌───────────┴────────────┐
     │                        │
     ▼                        ▼
┌─────────────────┐  ┌──────────────────────────┐
│  Evolution Go   │  │ Projeto EV (Vercel)      │
│  (localhost:    │  │ (projeto-ev-              │
│   8080)         │  │  antigravity.vercel.app) │
└────────┬────────┘  └──────────┬───────────────┘
         │                      │
         │  Webhook             │ Processa com IA
         │  messages            │ (OpenAI GPT-4)
         │                      │
         │                      ▼
         │          ┌───────────────────┐
         │          │ Supabase (Cloud)  │
         │          │ - transacoes      │
         │          │ - logs            │
         │          │ - orcamentos      │
         │          │ - usuarios        │
         │          └───────────────────┘
         │                      │
         └──────────┬───────────┘
                    │
                    ▼
         ┌────────────────────┐
         │ Dashboard Web      │
         │ (vercel.app)       │
         │ - Gráficos         │
         │ - Saldo            │
         │ - Histórico        │
         └────────────────────┘
```

---

## ✅ CHECKLIST FINAL

- [ ] Docker e Docker Compose instalados
- [ ] docker-compose.yml criado
- [ ] `docker-compose up -d` executado
- [ ] PostgreSQL está healthy
- [ ] Evolution Go respondendo em http://localhost:8080
- [ ] Instância WhatsApp criada
- [ ] QR Code escaneado e conectado
- [ ] Webhook configurado
- [ ] Teste `/saldo` enviado
- [ ] Resposta recebida

---

## 🎉 PRONTO!

Seu sistema Evolution Go + EV Agente Financeiro está completo e funcionando!

**Próximos passos:**
1. Comece a usar via WhatsApp
2. Acompanhe o dashboard em tempo real
3. Configure suas metas e orçamentos
4. Deixe a IA gerenciar suas finanças! 💰

---

## 📞 SUPORTE

- **Documentação EV:** https://github.com/faelnickname/projeto-ev-antigravity
- **Evolution Docs:** https://docs.evolution.app
- **Docker Docs:** https://docs.docker.com

---

**Versão:** 1.0  
**Última Atualização:** 12/04/2024  
**Status:** ✅ Pronto para Produção
