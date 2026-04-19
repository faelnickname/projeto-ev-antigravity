import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { googleCalendar } from '@/lib/googleCalendar';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

const tools = [
  {
    functionDeclarations: [
      {
        name: "listCalendarEvents",
        description: "Lista os eventos da agenda do Google do usuário.",
        parameters: {
          type: "OBJECT",
          properties: {
            timeMin: { type: "STRING", description: "Data de início (ISO string)." },
            timeMax: { type: "STRING", description: "Data de fim (ISO string)." }
          }
        }
      },
      {
        name: "createCalendarEvent",
        description: "Cria um novo compromisso na agenda do Google.",
        parameters: {
          type: "OBJECT",
          properties: {
            summary: { type: "STRING", description: "Título do evento" },
            start: { type: "STRING", description: "Data/Hora de início (ISO string)" },
            end: { type: "STRING", description: "Data/Hora de fim (ISO string)" },
            description: { type: "STRING", description: "Descrição opcional" }
          },
          required: ["summary", "start", "end"]
        }
      },
      {
          name: "deleteCalendarEvent",
          description: "Exclui um compromisso da agenda do Google.",
          parameters: {
              type: "OBJECT",
              properties: {
                  eventId: { type: "STRING", description: "ID do evento a ser removido" }
              },
              required: ["eventId"]
          }
      }
    ]
  }
];

export async function POST(req: Request) {
  try {
    const { message, history = [], persona } = await req.json();

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      tools: tools as any
    });

    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: persona }] },
        { role: 'model', parts: [{ text: "Entendido. Estou pronta." }] },
        { role: 'user', parts: [{ text: `A data e hora atual do sistema é: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}.` }] },
        { role: 'model', parts: [{ text: "Referência temporal capturada." }] },
        ...history
      ]
    });

    let result = await chat.sendMessage(message);
    let response = result.response;

    let callCount = 0;
    while (response.candidates?.[0].content.parts.some(p => p.functionCall) && callCount < 5) {
      callCount++;
      const toolResults: any[] = [];

      for (const part of response.candidates[0].content.parts) {
        if (part.functionCall) {
          const { name, args } = part.functionCall;
          console.log(`[EVE API] Tool Call: ${name}`, args);

          try {
            let data;
            switch (name) {
              case "listCalendarEvents":
                data = await googleCalendar.listEvents(args.timeMin as string, args.timeMax as string);
                break;
              case "createCalendarEvent":
                data = await googleCalendar.createEvent(args.summary as string, args.start as string, args.end as string, args.description as string);
                break;
              case "deleteCalendarEvent":
                data = await googleCalendar.deleteEvent(args.eventId as string);
                break;
              default:
                data = { error: "Ferramenta não encontrada." };
            }
            toolResults.push({
              functionResponse: { name, response: { content: data } }
            });
          } catch (err: any) {
            toolResults.push({
              functionResponse: { name, response: { content: { error: err.message } } }
            });
          }
        }
      }
      result = await chat.sendMessage(toolResults);
      response = result.response;
    }

    return NextResponse.json({ response: response.text() });

  } catch (error: any) {
    console.error('EVE Chat Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
