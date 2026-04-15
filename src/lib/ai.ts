import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-build',
});

// Função principal para processar mensagem
export async function processarMensagemAssistente(mensagem: string, contextoFinanceiro: string, historico: any[] = []) {
  try {
    const dataHoraAtual = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

    // Garantir que o histórico esteja no formato correto e sem nulos
    const safeHistory = (historico || []).filter(h => h && h.role && h.content).slice(-6);

    const messages: any[] = [
      {
        role: "system",
        content: `Você é o NEXO (Inteligência Financeira de Elite). Seu dono se chama Rafa.
        
Seu objetivo é ser o Centro de Comando Financeiro de Elite do Rafa.

Responda SEMPRE no seguinte formato JSON:
{
  "intencao": "transacao" | "chat_geral",
  "dados": { "descricao": string, "valor": number, "tipo": "exp" | "inc", "categoria": string, "subcategoria": string, "card_name": string },
  "resposta": "Sua resposta elegante com emojis aqui"
}

REGRAS DE OURO:
1. Categoria: Use "Alimentação", "Transporte", "Moradia", "Saúde", "Educação", "Lazer", "Investimento", "Despesa Coral", "Despesa Fixa".
2. Cartões: Se o usuário mencionar nomes como "Nubank", "Itaú", "Inter", "C6", "Santander", verifique se ele está se referindo a um pagamento no cartão e preencha "card_name".
3. Despesas Fixas: Automóvel, Aluguel, Netflix, Condomínio, Academias, Internet, Assinaturas são CATEGORIA: "Despesa Fixa".
4. Despesas Coral: Se citar "Coral", use CATEGORIA: "Despesa Coral" e SUBCATEGORIA: "pedagio", "hotel" ou "alimentação".
5. Tom de Voz: Profissional, eficiente e levemente futurista/elite. Use emojis como 💳, 📊, 🚀, 💎.
6. Nunca invente dados. Se não souber algo, peça para o Rafa confirmar.

CONTEXTO FINANCEIRO ATUAL:
${contextoFinanceiro}
`
      },
      ...safeHistory,
      { role: "user", content: mensagem }
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Muito mais rápido para evitar timeouts
      messages: messages,
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const output = completion.choices[0].message.content;
    if (!output) return null;
    
    return JSON.parse(output);
  } catch (error: any) {
    console.error("Erro na OpenAI API / Parse:", error);
    // Fallback amigável em caso de erro de JSON
    return {
      intencao: "chat_geral",
      resposta: `❌ Erro Técnico na IA: ${error.message || 'Erro desconhecido'}. Verifique o saldo ou a chave da OpenAI na Vercel! 🛠️`
    };
  }
}

// VISÃO: Analisa fotos de comprovantes, notas e recibos
export async function analisarImagem(imageBase64: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Você é um especialista em ler comprovantes financeiros. Extraia: Descrição do item/estabelecimento, Valor total (positivo), Data e Categoria provável. Se for do Projeto Coral (Hotel, Alimentação, Pedágio, Lavagem), identifique a subcategoria. Responda APENAS um JSON com os campos: descricao, valor, categoria, subcategoria, data." },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    console.error("Erro Vision:", error);
    return null;
  }
}

// VOZ: Transcreve áudio do WhatsApp (formato OGG/MP3/M4A)
export async function transcreverAudio(audioBuffer: Buffer) {
  try {
    const file = await OpenAI.toFile(audioBuffer, 'audio.ogg', { type: 'audio/ogg' });
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
      language: "pt"
    });
    return transcription.text;
  } catch (error) {
    console.error("Erro Whisper:", error);
    return null;
  }
}

export async function gerarAudioDoTexto(texto: string) {
  try {
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: texto,
    });
    const buffer = Buffer.from(await mp3.arrayBuffer());
    return buffer;
  } catch (error) {
    return null;
  }
}
