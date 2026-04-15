"use client";

// Realistic Mock Data for EV Financeira "Elite Demo Mode"
export const MOCK_STATS = {
  saldo: 61624.08,
  receitas: 12450.00,
  despesas: 8320.45
};

export const MOCK_CHART_DATA = [
  { name: 'Jan', receitas: 10500, despesas: 8200 },
  { name: 'Fev', receitas: 11200, despesas: 7800 },
  { name: 'Mar', receitas: 13400, despesas: 9100 },
  { name: 'Abr', receitas: 10800, despesas: 8500 },
  { name: 'Mai', receitas: 12450, despesas: 8320 }
];

export const MOCK_CATEGORY_DATA = [
  { name: 'Lazer', value: 2450, color: '#00d2ff' },
  { name: 'Mercado', value: 1850, color: '#10b981' },
  { name: 'Contas Fixas', value: 2100, color: '#f59e0b' },
  { name: 'Educação', value: 920, color: '#ef4444' },
  { name: 'Transporte', value: 1000, color: '#8b5cf6' },
  { name: 'Saúde', value: 1200, color: '#ec4899' },
  { name: 'Investimentos', value: 4500, color: '#6366f1' }
];

export const MOCK_TRANSACTIONS = [
  { id: 1, created_at: new Date().toISOString(), descricao: 'Apple Store - MacBook Pro', categoria: 'Equipamentos', valor: 15400.00, tipo: 'exp' },
  { id: 2, created_at: new Date().toISOString(), descricao: 'Salário Mensal - TechCorp', categoria: 'Renda', valor: 25000.00, tipo: 'inc' },
  { id: 3, created_at: new Date().toISOString(), descricao: 'Restaurante D.O.M', categoria: 'Lazer', valor: 850.40, tipo: 'exp' },
  { id: 4, created_at: new Date().toISOString(), descricao: 'Amazon Prime Video', categoria: 'Assinaturas', valor: 19.90, tipo: 'exp' },
  { id: 5, created_at: new Date().toISOString(), descricao: 'Supermercado Pão de Açúcar', categoria: 'Mercado', valor: 642.15, tipo: 'exp' },
  { id: 6, created_at: new Date().toISOString(), descricao: 'Dividendos - PETR4', categoria: 'Investimentos', valor: 320.00, tipo: 'inc' }
];

export const MOCK_CONTAS = [
  { id: '1', banco: 'Nuconta', tipo: 'Conta Corrente', saldo: 60500.56, cor_hex: '#8b5cf6', instituicao_id: 'nubank' },
  { id: '2', banco: 'Itaú', tipo: 'Conta Corrente', saldo: -126.48, cor_hex: '#f59e0b', instituicao_id: 'itau' },
  { id: '3', banco: 'Caixa', tipo: 'Poupança', saldo: 1250.00, cor_hex: '#00d2ff', instituicao_id: 'caixa' }
];

export const MOCK_CARTOES = [
  { id: 1, nome: 'Nubank Ultravioleta', bandeira: 'Mastercard', limite: 15000, fatura_atual: 3250.80, cor_hex: '#8b5cf6' },
  { id: 2, nome: 'XP Visa Infinite', bandeira: 'Visa', limite: 45000, fatura_atual: 12000.00, cor_hex: '#f59e0b' },
  { id: 3, nome: 'BTG Black', bandeira: 'Mastercard', limite: 25000, fatura_atual: 0, cor_hex: '#6366f1' }
];

export const MOCK_METAS = [
  { categoria: 'Lazer', valor_limite: 3000, gasto: 2450, percent: 81.6 },
  { categoria: 'Mercado', valor_limite: 2000, gasto: 1850, percent: 92.5 },
  { categoria: 'Investimentos', valor_limite: 5000, gasto: 4500, percent: 90.0 },
  { categoria: 'Saúde', valor_limite: 1500, gasto: 1200, percent: 80.0 }
];

export const ELITE_COLORS = [
  '#00d2ff', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Rose/Red
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#6366f1', // Indigo
  '#06b6d4', // Sky
  '#84cc16', // Lime
];
