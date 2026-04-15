# 🚀 GUIA DE ATIVAÇÃO FINAL - EV Agente Financeiro IA

## **3 PASSOS PARA ATIVAR A MÁGICA**

---

## **PASSO 1️⃣: Preparar o Banco de Dados (Supabase)**

### Instruções:

1. **Acesse o Supabase**
   - Vá em: https://supabase.com
   - Clique no seu projeto "Projeto EV"

2. **Abra o SQL Editor**
   - Menu lateral esquerdo → "SQL Editor"
   - Clique em "New Query"

3. **Cole o Script**
   - Abra o arquivo `setup-final.sql` (na raiz do projeto)
   - Copie TODO o conteúdo
   - Cole no SQL Editor do Supabase

4. **Execute**
   - Clique no botão **"Run"** (play verde)
   - Aguarde a mensagem: "✅ Success"

**Resultado Esperado:**
```
✅ Tables created: orcamentos, usuarios, logs
✅ Columns added: anexo_url, id_whatsapp
✅ Indexes created for performance
✅ Default budgets inserted
```

---

## **PASSO 2️⃣: Criar o Cofre de Fotos (Storage)**

### Instruções:

1. **Vá ao Storage do Supabase**
   - Menu lateral → "Storage"

2. **Criar novo Bucket**
   - Clique em "New Bucket"
   - Nome: `comprovantes` (exatamente assim, minúsculas)
   - ✅ Marque: "Public bucket"
   - Clique em "Save"

3. **Pronto!**
   - Seu bucket está criado

**Resultado Esperado:**
```
📦 Bucket criado: comprovantes
🌐 Público: Sim
🔗 URL base: https://seu-project.supabase.co/storage/v1/object/public/comprovantes/
```

---

## **PASSO 3️⃣: Configurar as Variáveis (Vercel)**

### Instruções:

1. **Acesse Vercel**
   - https://vercel.com
   - Clique no projeto "projeto-ev-antigravity"

2. **Vá em Settings**
   - Menu superior → "Settings"
   - Sidebar esquerdo → "Environment Variables"

3. **Verifique se Existem TODAS as 6 Variáveis:**

| Variável | Onde Pegar | Status |
|----------|-----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon public | ✅ |
| `OPENAI_API_KEY` | platform.openai.com → API keys | ✅ |
| `EVOLUTION_API_URL` | https://evolution.projetoev.com.br | ✅ |
| `EVOLUTION_API_KEY` | Evolution Manager → instância → copiar chave | ✅ |
| `AUTHORIZED_PHONE` | Seu número WhatsApp (ex: 5535991831298) | ✅ |

4. **Se Faltarem Variáveis**
   - Clique em "Add New"
   - Preencha Name e Value
   - Clique em "Save"

5. **Fazer Novo Deploy**
   - Vá em "Deployments"
   - Clique na ação (3 pontinhos) do deployment mais recente
   - Selecione "Redeploy"

**Resultado Esperado:**
```
✅ Todas as 6 variáveis presentes
✅ Deploy "Ready" em ~2 minutos
🌐 Site funcionando em: https://projeto-ev-antigravity.vercel.app
```

---

## **🎉 ATIVAÇÃO COMPLETA - TESTE AGORA!**

### Teste 1: Enviar Mensagem WhatsApp

1. Abra WhatsApp no celular
2. Vá no chat "Você" (Bloco de Notas)
3. Envie a mensagem:
   ```
   EV, teste. Gastei 50 reais em comida!
   ```
4. **Aguarde 5 segundos**
5. **Você deve receber uma resposta de áudio humanizada!**

**Resposta Esperada:**
```
✅ "Registrei uma despesa de 50 reais em Alimentação"
📊 (com áudio humano)
```

### Teste 2: Consultar Saldo

1. Envie:
   ```
   EV, qual meu saldo?
   ```
2. **Resposta esperada:**
   ```
   💰 Seu saldo: R$ 1.250,00
   📈 Receitas: R$ 4.500,00
   📉 Despesas: R$ 3.250,00
   ```

### Teste 3: Acessar Dashboard

1. Acesse: https://projeto-ev-antigravity.vercel.app
2. Veja seus dados carregados
3. Gráficos atualizados
4. Interface moderna ✨

---

## **📱 INSTALAR COMO APP (PWA)**

### iPhone (Safari):

1. Abra: https://projeto-ev-antigravity.vercel.app
2. Clique no ícone **"Compartilhar"** (setinha)
3. Selecione **"Adicionar à Tela de Início"**
4. Nomeie: "EV Financeiro"
5. Clique em **"Adicionar"**

✅ Pronto! Agora funciona como app nativo!

### Android (Chrome):

1. Abra: https://projeto-ev-antigravidade.vercel.app
2. Clique nos **"Três Pontinhos"** (menu)
3. Selecione **"Instalar app"** ou **"Instalar aplicativo"**
4. Confirme

✅ App instalado na sua tela inicial!

---

## **🔧 TROUBLESHOOTING**

### ❌ "Mensagem não chega no WhatsApp"

**Verifique:**
- [ ] `AUTHORIZED_PHONE` está correto? (Seu número com DDI)
- [ ] Evolution API webhook está ativo?
- [ ] Event `MESSAGES_UPSERT` está marcado?
- [ ] Vercel deploy está em status "Ready"?

**Solução:**
1. Vá em Vercel → Logs → Live
2. Envie mensagem do WhatsApp
3. Verifique se aparece POST `/api/webhook/whatsapp`
4. Se não aparecer, o webhook não está sendo acionado

### ❌ "Erro no Supabase"

**Verifique:**
- [ ] Tabelas foram criadas? (SQL Editor → Tables)
- [ ] Bucket "comprovantes" existe? (Storage)

**Solução:**
1. Execute o script `setup-final.sql` novamente
2. Verifique mensagem de erro exata
3. Se persistir, abra um ticket no Supabase

### ❌ "Dashboard não carrega dados"

**Verifique:**
- [ ] Variáveis de ambiente estão todas presentes?
- [ ] Supabase está respondendo?
- [ ] Transações existem no banco?

**Solução:**
1. Abra console do navegador (F12)
2. Veja se há erros de rede
3. Vá em Supabase → SQL Editor → `SELECT * FROM transacoes;`
4. Confirme se há dados

---

## **✅ CHECKLIST FINAL**

Antes de dar por completo, confirme:

- [ ] **Supabase SQL executado com sucesso**
- [ ] **Bucket "comprovantes" criado**
- [ ] **Todas as 6 variáveis na Vercel**
- [ ] **Vercel em status "Ready"**
- [ ] **Mensagem WhatsApp recebeu resposta**
- [ ] **Dashboard carregou com dados**
- [ ] **App instalado no celular (opcional)**

---

## **🎯 RESUMO DO SISTEMA**

```
WhatsApp (Entrada)
    ↓
Evolution API (Webhook)
    ↓
Vercel (/api/webhook/whatsapp)
    ↓
OpenAI (Analisa texto)
    ↓
Supabase (Salva dados)
    ↓
Resposta em Áudio Humano
    ↓
WhatsApp (Saída)
    ↓
Dashboard Web (Visualiza)
```

---

## **🚀 PARABÉNS!**

Você agora tem um **Agente Financeiro IA Profissional** rodando 24/7!

### O que a EV faz:
✅ Recebe suas transações por WhatsApp  
✅ Analisa com IA (OpenAI)  
✅ Salva no banco de dados (Supabase)  
✅ Responde em áudio humanizado  
✅ Mostra tudo no dashboard web  
✅ Envia alertas automáticos  
✅ Funciona como PWA (app)  

**Bem-vindo ao futuro da gestão financeira! 🎉**

---

*Dúvidas? Verifique os logs em Vercel ou abra um issue no GitHub.*
