/**
 * EVOLUTION API SERVICE
 * Substitui o Twilio para envio de mensagens WhatsApp.
 * Sem limite diário, sem custo, usa seu próprio número.
 */
import { supabase } from './supabase';


const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || '';
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || '';
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE || 'nexofinanceiro';

export const evolutionService = {
  /**
   * Envia mensagem de texto via Evolution API
   */
  async sendMessage(to: string, text: string): Promise<boolean> {
    try {
      if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
        console.error('[EVOLUTION] ⚠️ EVOLUTION_API_URL ou EVOLUTION_API_KEY não configurados.');
        return false;
      }

      // Usa o número exatamente como chegou (ex: 553591831298 ou 5535991831298)
      // Remove APENAS caracteres não-numéricos (mantém o formato original)
      const numero = to.replace(/\D/g, '');

      const url = `${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`;

      console.log(`[EVOLUTION] Enviando para ${numero}...`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': EVOLUTION_API_KEY
        },
        body: JSON.stringify({
          number: numero,
          text: text
        })
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('[EVOLUTION] ❌ Erro ao enviar:', result);
        await supabase.from('logs').insert({
          numero_whatsapp: 'ERROR_SENDER',
          mensagem_entrada: `Instance: ${EVOLUTION_INSTANCE} | To: ${numero}`,
          resposta_enviada: `Error: ${JSON.stringify(result)}`,
          tipo_acao: 'debug'
        });
        return false;
      }

      console.log(`[EVOLUTION] ✅ Mensagem enviada! ID: ${result.key?.id || 'ok'}`);
      return true;

    } catch (err: any) {
      console.error('[EVOLUTION] ❌ Exceção:', err.message);
      return false;
    }
  }
};
