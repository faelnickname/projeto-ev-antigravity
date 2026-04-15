import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER || 'whatsapp:+14155238886'; // Sandbox default

const client = twilio(accountSid, authToken);

export const whatsappService = {
  /**
   * Envia uma mensagem de texto proativa via Twilio WhatsApp
   */
  async sendMessage(to: string, text: string) {
    try {
      if (!accountSid || !authToken) {
        console.warn('⚠️ TWILIO_ACCOUNT_SID ou AUTH_TOKEN não configurados.');
        return null;
      }

      // Garante o formato 'whatsapp:+55...'
      // Remove o prefixo whatsapp: se vier, mantém apenas dígitos e sinal +
      const stripped = to.replace('whatsapp:', '').trim();
      const digits = stripped.replace(/\D/g, '');
      const formattedTo = `whatsapp:+${digits}`;

      console.log(`[TWILIO] Enviando mensagem para ${formattedTo}...`);

      const message = await client.messages.create({
        from: twilioNumber.startsWith('whatsapp:') ? twilioNumber : `whatsapp:${twilioNumber}`,
        body: text,
        to: formattedTo
      });

      console.log(`[TWILIO] Mensagem enviada com sucesso! SID: ${message.sid}`);
      return message;
    } catch (error: any) {
      console.error('❌ Erro Twilio API (sendMessage):', error.message);
      if (error.code) console.error(`   Code: ${error.code} - ${error.moreInfo}`);
      return null;
    }
  }
};
