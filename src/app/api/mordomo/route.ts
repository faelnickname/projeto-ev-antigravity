import { NextRequest } from 'next/server';
import { processarComandoMordomo, gerarAudioResposta, transcreverAudio } from '@/lib/mordomo';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 30;

// POST /api/mordomo — recebe áudio ou texto, retorna JSON + áudio base64
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    let texto = '';

    if (contentType.includes('multipart/form-data')) {
      // Recebeu arquivo de áudio
      const form = await request.formData();
      const audioFile = form.get('audio') as File;
      if (!audioFile) return Response.json({ error: 'Nenhum áudio recebido' }, { status: 400 });

      const buffer = Buffer.from(await audioFile.arrayBuffer());
      texto = await transcreverAudio(buffer, audioFile.type);

    } else {
      // Recebeu texto direto
      const body = await request.json();
      texto = body.texto || '';
    }

    if (!texto.trim()) {
      return Response.json({ error: 'Nenhum texto para processar' }, { status: 400 });
    }

    console.log(`[MORDOMO] Processando: "${texto}"`);

    // Processa com IA
    const resultado = await processarComandoMordomo(texto);

    // Gera áudio da resposta
    const audioBuffer = await gerarAudioResposta(resultado.resposta);
    const audioBase64 = audioBuffer.toString('base64');

    return Response.json({
      transcricao: texto,
      intencao: resultado.intencao,
      resposta: resultado.resposta,
      dados: resultado.dados,
      audio: `data:audio/mp3;base64,${audioBase64}`
    });

  } catch (err: any) {
    console.error('[MORDOMO ERROR]', err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ status: 'Mordomo NEXO online 🤖' });
}
