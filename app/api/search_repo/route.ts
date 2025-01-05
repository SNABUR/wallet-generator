import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Mapa para rastrear las solicitudes por cliente
const requestMap = new Map<string, number[]>();

function rateLimit(clientId: string, limit = 3, windowMs = 60000): boolean {
  const now = Date.now();
  const requests = requestMap.get(clientId) || [];
  
  // Filtra las solicitudes fuera de la ventana de tiempo
  const updatedRequests = requests.filter(timestamp => now - timestamp < windowMs);
  updatedRequests.push(now);

  // Actualiza el mapa con las solicitudes válidas
  requestMap.set(clientId, updatedRequests);

  return updatedRequests.length > limit;
}

export async function POST(req: NextRequest) {
  try {
    const clientId = req.headers.get('x-client-id') || 'unknown';
    
    // Verificar si el cliente excedió el límite
    if (rateLimit(clientId)) {
      return NextResponse.json({ error: 'Rate limit exceeded. Only 3 requests per minute allowed.' }, { status: 429, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    const { url } = await req.json();

    // Validar la URL
    if (!url || !url.startsWith('https://github.com/')) {
      return NextResponse.json({ error: 'Invalid URL or not a GitHub repository' }, { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    const repoMatch = url.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!repoMatch) {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } });
    }
    const [_, owner, repo] = repoMatch;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that responds in valid JSON format only.' },
        {
          role: 'user',
          content: `
            Please analyze the GitHub repository ${owner}/${repo}. Provide a JSON response with the following structure:
            {
              "repository": {
                "name": "<repository name>",
                "owner": "<repository owner>",
                "createdAt": "<repository creation date>",
                "isFork": "<true or false>",
                "languages": [
                  { "name": "<language name>", "percentage": "<percentage usage>" }
                ],
                "contributors": ["<contributor1>", "<contributor2>", "..."],
                "comment": "<a thoughtful and concise opinion about the repository>"
              }
            }
            Make sure the JSON is properly formatted and contains no errors.
          `,
        },
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    const aiResponse = completion.choices[0].message.content;

    let parsedResponse;
    try {
      if (aiResponse === null) {
        throw new Error('AI response is null');
      }
      parsedResponse = JSON.parse(aiResponse);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error parsing JSON:", error.message);
      } else {
        console.error("Error parsing JSON:", error);
      }
      return NextResponse.json({ error: 'AI response was not a valid JSON', rawResponse: aiResponse }, { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    return NextResponse.json(parsedResponse, { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
    } else {
      console.error('Error:', error);
    }
    return NextResponse.json({ error: 'Error processing the request' }, { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-client-id',
    },
  });
}