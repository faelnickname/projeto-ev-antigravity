import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-build',
});

export async function processarMensagemAssistente(mensagem: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Você é a EV, uma assistente financeira e pessoal inteligente e carismática.
Sua tarefa é analisar a mensagem do usuário e extrair uma transação financeira ou compromisso em formato JSON.

Retorne EXATAMENTE este JSON puro:
{
  "intencao": "transacao" | "agenda" | "outro",
  "dados": {
    "descricao": "Nome descritivo",
    "valor": 10.50, // positivo se aplicavel
    "tipo": "exp" | "inc",
    "categoria": "Categoria aqui",
    "data_hora": "YYYY-MM-DD"
  },
  "resposta": "Sua resposta humana amigável e extremamente curta confirmando a ação ou respondendo a dúvida, que será posteriormente lida por voz."
}
`
        },
        {
          role: "user",
          content: mensagem,
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2
    });

    const output = completion.choices[0].message.content;
    if (output) {
      return JSON.parse(output);
    }
    return null;
  } catch (error) {
    console.error("Erro na OpenAI API (Texto):", error);
    return null;
  }
}

// Função para gerar o buffer Base64 do áudio (Texto -> Voz)
export async function gerarAudioDoTexto(texto: string) {
  try {
    const mp3Response = await openai.audio.speech.create({
      model: "tts-1",
      voice: "nova",
      input: texto,
    });
    
    // Converte o retorno pra buffer e depois Base64
    const buffer = Buffer.from(await mp3Response.arrayBuffer());
    return buffer.toString('base64');
  } catch (error) {
    console.error("Erro na OpenAI API (Voz):", error);
    return null;
  }
}
