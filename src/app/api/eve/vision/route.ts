import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { imageBase64, question, persona } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Remove o prefixo base64 se existir
    const cleanBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;

    const result = await model.generateContent([
      `${persona}\n\nAnalise esta imagem da minha tela/workspace e responda: ${question}`,
      {
        inlineData: {
          data: cleanBase64,
          mimeType: 'image/jpeg'
        }
      }
    ]);

    return NextResponse.json({ response: result.response.text() });

  } catch (error: any) {
    console.error('EVE Vision Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
