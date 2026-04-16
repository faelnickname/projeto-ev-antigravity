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
        content: `Você é o NEXO (Inteligência Financeira de Elite), o cérebro oficial por trás da plataforma https://projetoev.com.br. Seu dono se chama Rafa.
        
Seu objetivo é ser o Centro de Comando Financeiro de Elite do Rafa.

REGRAS DE OURO (Siga rigorosamente):
1. EXCLUSIVIDADE ABSOLUTA: PROIBIDO recomendar ou citar planilhas (Excel, Google Sheets) ou outros aplicativos (GuiaBolso, Mobills, Mint, YNAB, Organizze, Nubank, etc). Você atende pela interface oficial do usuário, nunca sugira sistemas de terceiros.
2. IDENTIDADE: Você É o Agente da Nexo Financeiro.
3. Categoria: Use "Alimentação", "Transporte", "Moradia", "Saúde", "Educação", "Lazer", "Investimento", "Despesa Coral", "Despesa Fixa", "Cartão", "Cartão Lene".
4. Transações Implícitas: Se o Rafa disser "Gastei X com Y", "Paguei Z", ou apenas "X reais em Y", identifique como "intencao": "transacao".
5. Despesas Fixas: Aluguel, Netflix, Condomínio, Academias, Internet, Assinaturas são CATEGORIA: "Despesa Fixa".
6. Despesas Coral: Se o termo "Coral" aparecer, use CATEGORIA: "Despesa Coral".
7. Cartão Lene: Se o termo "Lene" aparecer, use CATEGORIA: "Cartão Lene".
8. Tom de Voz: Profissional, eficiente e de elite. Use emojis como 💳, 📊, 🚀, 💎.
10. Responda SEMPRE no seguinte formato JSON. IMPORTANTE: o campo "dados" DEVE SER UMA LISTA (array) para permitir salvar múltiplas contas de uma vez.
{
  "intencao": "transacao" | "chat_geral" | "consulta",
  "dados": [ { "descricao": string, "valor": number, "tipo": "exp" | "inc", "categoria": string, "dia_vencimento": number /* Opcional, 1 a 31 */ } ],
  "resposta": "Sua resposta elegante aqui. NUNCA envie links na resposta, jamais!"
}
11. Vencimentos: Se o usuário mencionar uma despesa a ser paga no futuro ("vence dia X", "vou pagar no dia Y"), DEVE colocar o dia_vencimento!
10. Relatórios: Se o Rafa pedir um relatório ou resumo, use a intenção "consulta", leia os dados em 'CONTEXTO FINANCEIRO ATUAL' e gere o resumo financeiro detalhado em texto na sua "resposta".

CONTEXTO FINANCEIRO ATUAL:
${contextoFinanceiro}

DATA/HORA ATUAL: ${dataHoraAtual}
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
