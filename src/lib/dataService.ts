import { supabase } from './supabase';

/**
 * SERVIÇO DE DADOS ELITE (PRODUÇÃO)
 * Este serviço é responsável por todas as chamadas ao Supabase.
 * Mismatch resolvido: O Twilio usa o formato 'whatsapp:+55...' ou '+55...'
 */

const DEFAULT_PHONE = '5535991831298';

export const dataService = {
  
  // Normalização Elite: Usa apenas os últimos 8 dígitos (Número estável)
  // Isso ignora DDD, prefixo 55 e a oscilação do 9º dígito.
  formatId(phone: string) {
    if (!phone) return '91831298'; // Fallback correto para 8 dígitos
    const clean = phone.replace(/\D/g, '');
    return clean.slice(-8); // Pega apenas o número estável (últimos 8)
  },

  // TRANSAÇÕES REAIS
  async getTransactions(phone = DEFAULT_PHONE) {
    const targetId = this.formatId(phone);
    
    // Busca unificada: Tenta id_whatsapp (novo padrão) ou tenant_id (legado)
    const { data, error } = await supabase
      .from('transacoes')
      .select('*')
      .or(`id_whatsapp.eq.${targetId},tenant_id.eq.${targetId}`)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erro getTransactions:', error);
      return [];
    }
    return data || [];
  },

  // KPI STATS (Saldos e Fluxo)
  async getStats(phone = DEFAULT_PHONE) {
    const transactions = await this.getTransactions(phone);

    const receitas = transactions
      .filter(t => ['inc', 'receita', 'entrada'].includes(String(t.tipo).toLowerCase()))
      .reduce((sum, t) => sum + Math.abs(Number(t.valor) || 0), 0);

    const despesas = transactions
      .filter(t => ['exp', 'despesa', 'saida'].includes(String(t.tipo).toLowerCase()))
      .reduce((sum, t) => sum + Math.abs(Number(t.valor) || 0), 0);

    return {
      saldo: receitas - despesas,
      receitas,
      despesas
    };
  },

  // CARTÕES DE CRÉDITO
  async getCards(phone = DEFAULT_PHONE) {
    const targetId = this.formatId(phone);
    const { data, error } = await supabase
      .from('cartoes')
      .select('*')
      .eq('id_whatsapp', targetId);
    
    if (error) return [];
    return data || [];
  },

  // CONTAS BANCÁRIAS
  async getAccounts(phone = DEFAULT_PHONE) {
    const targetId = this.formatId(phone);
    const { data, error } = await supabase
      .from('contas')
      .select('*')
      .eq('id_whatsapp', targetId);
    
    if (error) return [];
    return data || [];
  },

  // ORÇAMENTOS / METAS
  async getGoals(phone = DEFAULT_PHONE) {
    const targetId = this.formatId(phone);
    const { data, error } = await supabase
      .from('orcamentos')
      .select('*')
      .eq('id_whatsapp', targetId);
    
    // Fallback para orçamentos globais se não houver específicos
    if (!data || data.length === 0) {
       const { data: globalData } = await supabase.from('orcamentos').select('*').is('id_whatsapp', null);
       return globalData || [];
    }
    
    return data || [];
  },

  // PROJETO CORAL (Filtro por Subcategorias)
  async getCoralExpenses(phone = DEFAULT_PHONE) {
    const targetId = this.formatId(phone);
    const { data, error } = await supabase
      .from('transacoes')
      .select('*')
      .eq('categoria', 'Despesa Coral')
      .eq('id_whatsapp', targetId)
      .order('created_at', { ascending: false });
    
    if (error) return [];
    return data || [];
  },

  // SALVAR NOVO CARTÃO
  async saveCard(card: any, phone = DEFAULT_PHONE) {
    const targetId = this.formatId(phone);
    const { data, error } = await supabase
      .from('cartoes')
      .insert([{ 
        ...card, 
        id_whatsapp: targetId 
      }])
      .select();
    
    if (error) throw error;
    return data;
  },

  // LOGS DE ATIVIDADE (WhatsApp Intelligence)
  async getLogs(phone = DEFAULT_PHONE) {
    const targetId = this.formatId(phone);
    const { data, error } = await supabase
      .from('logs')
      .select('*')
      .eq('numero_whatsapp', targetId)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) return [];
    return data || [];
  },

  // PROCESSAMENTO DE TRANSAÇÃO EXTERNA (BANK WEBHOOK)
  async processExternalTransaction(payload: any, phone = DEFAULT_PHONE) {
    const targetId = this.formatId(phone);
    const { descricao, valor, categoria, banco_identificador } = payload;

    // 1. Tenta encontrar o cartão pelo nome/identificador do banco
    const { data: cartoes } = await supabase
      .from('cartoes')
      .select('*')
      .eq('id_whatsapp', targetId);

    const card = cartoes?.find(c => 
      c.nome.toLowerCase().includes(banco_identificador?.toLowerCase() || '') ||
      banco_identificador?.toLowerCase().includes(c.nome.toLowerCase())
    );

    // 2. Salva a transação
    const { data: transacao, error: tError } = await supabase
      .from('transacoes')
      .insert([{
        descricao: descricao || `Compra no ${banco_identificador || 'Banco'}`,
        valor: -Math.abs(valor),
        tipo: 'exp',
        categoria: categoria || 'Outros',
        id_whatsapp: targetId,
        card_id: card?.id,
        status: 'confirmado',
        fonte: 'webhook_bancario'
      }])
      .select()
      .single();

    if (tError) throw tError;

    // 3. Se for cartão, atualiza a fatura_atual
    if (card) {
      const novaFatura = (Number(card.fatura_atual) || 0) + Math.abs(valor);
      await supabase
        .from('cartoes')
        .update({ fatura_atual: novaFatura })
        .eq('id', card.id);
    }

    return { transacao, card };
  }
};
