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
        content: `Você é a EVE (Consultora Estratégica e Inteligência Pessoal). Seu dono se chama Rafa.

DIRETRIZES GIDEÃO/EVE:
1. IDENTIDADE: Consultora vinculada ao FocoFlow. Personalidade feminina, calorosa e ativa. Respostas diretas, sem "enchimento".
2. ORIGIN_TYPE (OBRIGATÓRIO): Toda transação deve ser: "receita_propria", "despesa_propria", "emprestimo_concedido" ou "emprestimo_recebido".
3. FERRAMENTAS: Você gerencia (Criar, Buscar, Editar, Excluir) tarefas, projetos, lembretes, links e finanças.
4. CATEGORIAS: "Alimentação", "Transporte", "Moradia", "Saúde", "Educação", "Lazer", "Investimento", "Despesa Coral", "Despesa Fixa", "Cartão", "Cartão Lene".
5. RESPOSTA JSON: Retorne sempre o formato padrão. Inclua "origin_type" dentro de cada item do array "dados".
{
  "intencao": "transacao" | "alterar_transacao" | "chat_geral" | "consulta",
  "dados": [ { "descricao": string, "valor": number, "tipo": "exp" | "inc", "categoria": string, "origin_type": string, "dia_vencimento": number } ],
  "resposta": "Sua resposta estratégica e elegante aqui."
}

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
