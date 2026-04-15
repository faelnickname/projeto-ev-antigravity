import { NextRequest, NextResponse } from 'next/server';
import { dataService } from '@/lib/dataService';
import { whatsappService } from '@/lib/whatsapp';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const { token, descricao, valor, banco_identificador } = payload;

    // 1. Validação de Segurança Básica
    const secretToken = process.env.BANK_WEBHOOK_TOKEN || 'nexo-elite-2024';
    if (token !== secretToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!valor || !banco_identificador) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    // 2. Processamento da Transação
    const authorizedPhone = process.env.AUTHORIZED_PHONE || '5535991831298';
    const result = await dataService.processExternalTransaction(payload, authorizedPhone);

    // 3. Notificação via WhatsApp (Twilio)
    const formattedValue = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(valor));
    const cardInfo = result.card ? `no cartão ${result.card.nome}` : `no ${banco_identificador}`;
    
    const message = `💳 *Gasto Detectado!* \n\nAcabei de registrar uma despesa de *${formattedValue}* ${cardInfo}.\n\n✅ *Local:* ${descricao || 'Não informado'}\n📊 Seu dashboard já foi atualizado, Rafa!`;

    await whatsappService.sendMessage(authorizedPhone, message);

    // 4. Log do Webhook
    await supabase.from('logs').insert({
      numero_whatsapp: dataService.formatId(authorizedPhone),
      mensagem_entrada: `WEBHOOK: ${banco_identificador} - ${descricao} (${valor})`,
      resposta_enviada: message,
      tipo_acao: 'transacao'
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Transaction registered and notification sent',
      data: result.transacao 
    });

  } catch (error: any) {
    console.error('❌ Erro no Bank Webhook:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return new NextResponse('Nexo Bank Bridge ONLINE 🏦🔗', { status: 200 });
}
