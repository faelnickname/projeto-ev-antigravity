/**
 * MORDOMO NEXO - Agente Principal
 * Orquestra todos os serviços: dispositivos, calendário, notícias, IA
 */

import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export type MordomoIntencao =
  | 'dispositivo_ligar'
  | 'dispositivo_desligar'
  | 'dispositivo_status'
  | 'dispositivo_cor'
  | 'dispositivo_volume'
  | 'agenda_hoje'
  | 'agenda_criar'
  | 'agenda_proximos'
  | 'noticias'
  | 'musica_tocar'
  | 'musica_pausar'
  | 'tv_ligar'
  | 'tv_desligar'
  | 'computador_ligar'
  | 'conversa';

export interface MordomoResposta {
  intencao: MordomoIntencao;
  resposta: string;
  dados?: Record<string, any>;
}

const SYSTEM_PROMPT = `Você é o Mordomo Nexo, assistente pessoal inteligente do Rafael.
Você controla dispositivos inteligentes (lâmpadas, TV Samsung, tomadas, LEDs, câmeras),
gerencia agenda e fornece notícias.

DISPOSITIVOS DISPONÍVEIS:
- Luzes da sala, quarto, cozinha, banheiro, área externa
- LEDs coloridos (sala e quarto)
- TV Samsung (sala)
- Tomadas inteligentes (diversos cômodos)
- Computador (wake-on-LAN)

Ao receber um comando, responda SEMPRE com JSON válido neste formato:
{
  "intencao": "dispositivo_ligar" | "dispositivo_desligar" | "dispositivo_cor" | "agenda_hoje" | "agenda_criar" | "noticias" | "musica_tocar" | "tv_ligar" | "tv_desligar" | "computador_ligar" | "conversa",
  "resposta": "resposta natural em português, curta e direta (max 2 frases)",
  "dados": {
    "dispositivo": "nome do dispositivo se aplicável",
    "cor": "nome da cor se aplicável",
    "brilho": 0-100,
    "titulo": "título do evento se agenda",
    "data": "ISO date se agenda",
    "topico": "tópico de notícias se aplicável"
  }
}

Seja conciso, como um mordomo profissional. Use tom natural e elegante.`;

export async function processarComandoMordomo(texto: string): Promise<MordomoResposta> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: texto }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
    max_tokens: 300
  });

  const raw = completion.choices[0].message.content || '{}';

  try {
    const parsed = JSON.parse(raw);
    return {
      intencao: parsed.intencao || 'conversa',
      resposta: parsed.resposta || 'Entendido.',
      dados: parsed.dados
    };
  } catch {
    return {
      intencao: 'conversa',
      resposta: raw,
    };
  }
}

export async function gerarAudioResposta(texto: string): Promise<Buffer> {
  const mp3 = await openai.audio.speech.create({
    model: 'tts-1',
    voice: 'onyx', // Voz masculina, elegante para mordomo
    input: texto,
    speed: 1.0
  });

  const buffer = Buffer.from(await mp3.arrayBuffer());
  return buffer;
}

export async function transcreverAudio(audioBuffer: Buffer, mimeType: string = 'audio/webm'): Promise<string> {
  const { Readable } = require('stream');

  const stream = new Readable();
  stream.push(audioBuffer);
  stream.push(null);
  (stream as any).name = `audio.webm`;

  const file = new File([audioBuffer as any], 'audio.webm', { type: mimeType });

  const transcription = await openai.audio.transcriptions.create({
    file: file,
    model: 'whisper-1',
    language: 'pt',
    response_format: 'text'
  });

  return transcription as unknown as string;
}
