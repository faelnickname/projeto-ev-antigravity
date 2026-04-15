# 🧪 PLANO DE TESTES - EV AGENTE FINANCEIRO IA

## ⚠️ PRÉ-REQUISITOS
- ✅ Vercel deploy finalizado (~5 minutos após push)
- ✅ Variável `CRON_SECRET` adicionada na Vercel
- ✅ WhatsApp conectado com Evolution API
- ✅ Banco de dados Supabase operacional

---

## TESTE 1: RATE LIMITING (50 msg/hora)

**Objetivo:** Verificar se sistema bloqueia após 50 mensagens

**Como fazer:**
1. Envie 50 mensagens rápidas no WhatsApp
   - Use: `EV, teste 1` x 50
2. Na 51ª mensagem, você deve receber:
   ```
   ⚠️ Você atingiu o limite de 50 mensagens por hora. Tente novamente em alguns minutos.
   ```

**Resultado esperado:** ✅ Aviso de rate limit recebido

---

## TESTE 2: DETECÇÃO DE DUPLICATAS

**Objetivo:** Verificar se mensagens duplicadas em < 5s são ignoradas

**Como fazer:**
1. Copie uma mensagem
2. Cole e envie 2x rapidamente (em menos de 5 segundos)
3. Observe se apenas 1 resposta é enviada

**Resultado esperado:** ✅ Apenas 1 resposta (a segunda msg é ignorada)

---

## TESTE 3: COMANDO /SALDO

**Objetivo:** Verificar extração de saldo, receitas e despesas

**Como fazer:**
1. Envie no WhatsApp: `EV, /saldo`
2. Aguarde resposta da IA

**Resultado esperado:** ✅ Resposta como:
```
💰 SEU SALDO ATUAL

💵 Saldo: R$ 1.250,00

📈 Receitas: R$ 4.500,00 (10 transações)
📉 Despesas: R$ 3.250,00 (8 transações)

✅ Você está no positivo!
```

---

## TESTE 4: COMANDO /META

**Objetivo:** Verificar exibição de metas e alertas de limite

**Como fazer:**
1. Envie: `EV, /meta`
2. Aguarde resposta

**Resultado esperado:** ✅ Resposta como:
```
🎯 SUAS METAS MENSAIS

Gasto Total: R$ 2.500,00 / R$ 5.000,00
Percentual: 50% utilizado

Categorias:
🟢 Alimentação: R$ 500,00 / R$ 1.000,00 (50%)
🟠 Lazer: R$ 450,00 / R$ 500,00 (90%)

💡 Você pode gastar ainda: R$ 2.500,00

🚨 ALERTAS CRÍTICOS:
⚠️ Lazer: 90% do limite!
```

---

## TESTE 5: COMANDO /ANÁLISE

**Objetivo:** Verificar análise comparativa com mês anterior

**Como fazer:**
1. Envie: `EV, /análise`
2. Aguarde resposta

**Resultado esperado:** ✅ Resposta como:
```
📊 ANÁLISE DO MÊS

Total de Despesas: R$ 2.500,00
Maior Categoria: Alimentação (R$ 500,00)

Variação vs Mês Anterior: 📉 -15%

✅ Você economizou 15% em relação ao mês passado!

💡 Dica: Reduza Alimentação em 10-15% para economizar
```

---

## TESTE 6: ADICIONAR TRANSAÇÃO VIA IA

**Objetivo:** Verificar se sistema registra nova transação

**Como fazer:**
1. Envie: `EV, gastei 50 reais em comida`
2. IA vai responder confirmando
3. Verifique no Supabase se transação foi salva

**Resultado esperado:** ✅ Resposta confirmando e transação aparecendo em:
- Supabase → tabela `transacoes`
- Dashboard → seção "Fluxo Recente"
- Comando `/saldo` (valor atualizado)

---

## TESTE 7: SINCRONIZAÇÃO APP/DASHBOARD

**Objetivo:** Verificar se dados aparecem no dashboard em tempo real

**Como fazer:**
1. Registre uma transação no WhatsApp
   - `EV, recebi 200 de freelance`
2. Abra o dashboard em outra aba
3. Aguarde até 10 segundos
4. Verifique se a transação aparece

**Resultado esperado:** ✅ Transação aparece no dashboard em até 10 segundos

---

## TESTE 8: ALERTAS PROATIVOS (Cron 20:00)

**Objetivo:** Verificar se cron job envia alertas diariamente

**Como fazer:**
1. Aguarde até as 20:00 UTC
   - Ou simule localmente fazendo requisição GET para `/api/cron/alertas`
2. Verifique se recebeu mensagem de alerta ou resumo

**Resultado esperado:** ✅ Mensagem recebida no WhatsApp às 20:00:
```
⚠️ ALERTA DE ORÇAMENTO

LAZER
Gasto: R$ 450,00
Limite: R$ 500,00
Percentual: 90%

💡 Reduza gastos para não ultrapassar o limite!
```

Ou se tudo OK:
```
📊 RESUMO DO MÊS ATÉ AGORA

Total Gasto: R$ 2.500,00
Percentual do Orçamento: 50%

✅ Você está no controle! Continue assim!
```

---

## 📋 CHECKLIST FINAL

- [ ] Teste 1: Rate limiting bloqueou 51ª mensagem
- [ ] Teste 2: Duplicata ignorada em < 5s
- [ ] Teste 3: /saldo retornou dados corretos
- [ ] Teste 4: /meta mostrou metas e alertas
- [ ] Teste 5: /análise comparou meses
- [ ] Teste 6: Transação foi salva no banco
- [ ] Teste 7: Dashboard sincronizou em < 10s
- [ ] Teste 8: Cron alertou corretamente

---

## 🐛 SE ALGO NÃO FUNCIONAR

### Problema: Webhook não responde
**Solução:**
1. Verifique logs na Vercel → Functions
2. Confirme variáveis de ambiente estão corretas
3. Teste acesso a `https://seu-site.vercel.app/api/webhook/whatsapp`
   - Deve retornar: `{"status":"webhook ativo"}`

### Problema: Comando /saldo retorna erro
**Solução:**
1. Verifique conexão Supabase
2. Confirme tabela `transacoes` existe
3. Veja logs do console (F12 → Network)

### Problema: Dashboard não atualiza
**Solução:**
1. Clique em botão de refresh manual
2. Abra DevTools (F12) e limpe cache
3. Verifique se transação foi realmente salva no Supabase

### Problema: Cron não executa
**Solução:**
1. Confirme `CRON_SECRET` está configurado
2. Teste manualmente: `curl -H "Authorization: Bearer $CRON_SECRET" https://seu-site.vercel.app/api/cron/alertas`
3. Verifique logs em Vercel → Crons

---

## 📞 INFORMAÇÕES IMPORTANTES

**Números úteis:**
- Rate limit: 50 mensagens por hora por usuário
- Threshold duplicata: 5 segundos
- Refresh dashboard: 10 segundos
- Threshold alerta: 80% do orçamento
- Cron execution: 20:00 UTC (diariamente)

**URLs importantes:**
- Dashboard: `https://projeto-ev-antigravity.vercel.app`
- Webhook status: `https://projeto-ev-antigravity.vercel.app/api/webhook/whatsapp`
- Supabase: `https://supabase.com` (projeto: xricehgkolfaqjlbxmg)

---

## ✅ TESTES COMPLETADOS?

Quando todos os 8 testes passarem com sucesso, marque como pronto para:
- ✅ Produção
- ✅ Compartilhar com usuários
- ✅ Monitorar em tempo real
