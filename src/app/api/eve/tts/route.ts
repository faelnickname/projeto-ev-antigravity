import { NextResponse } from 'next/server';
import { MsEdgeTTS } from 'edge-tts-node';

export async function POST(req: Request): Promise<Response> {
  try {
    const { text, voice = 'pt-BR-ThalitaNeural' } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const tts = new MsEdgeTTS({});
    await tts.setMetadata(voice, MsEdgeTTS.OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    
    // Converte stream para Buffer para enviar via NextResponse
    const stream = tts.toStream(text, voice);
    const chunks: any[] = [];
    
    return new Promise<Response>((resolve) => {
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => {
            const buffer = Buffer.concat(chunks);
            resolve(new Response(buffer, {
                headers: {
                    'Content-Type': 'audio/mpeg',
                    'Content-Length': buffer.length.toString(),
                }
            }));
        });
        stream.on('error', (err) => {
            console.error('TTS Stream Error:', err);
            resolve(NextResponse.json({ error: 'TTS failed' }, { status: 500 }));
        });
    });

  } catch (error: any) {
    console.error('EVE TTS Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
