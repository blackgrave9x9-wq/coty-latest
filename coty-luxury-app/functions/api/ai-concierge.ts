import OpenAI from 'openai';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type Env = {
  OPENAI_API_KEY: string;
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

export const onRequestPost = async (context: { env: Env; request: Request }) => {
  try {
    if (!context.env.OPENAI_API_KEY) {
      return json({ error: 'OPENAI_API_KEY is missing in Cloudflare environment.' }, 500);
    }

    const body = (await context.request.json()) as {
      model?: string;
      messages?: ChatMessage[];
      systemPrompt?: string;
    };

    const model = body.model || 'gpt-4.1-mini';
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const systemPrompt = typeof body.systemPrompt === 'string' ? body.systemPrompt : '';

    const tools = [
      {
        type: 'function' as const,
        name: 'placeOrder',
        description: "Place an order for the user with specified items. ONLY call this after the user says 'ndio' to confirm the list and total.",
        parameters: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  productId: { type: 'string' },
                  name: { type: 'string' },
                  quantity: { type: 'number' },
                  price: { type: 'number' },
                },
                required: ['productId', 'name', 'quantity', 'price'],
              },
            },
            totalAmount: { type: 'number' },
          },
          required: ['items', 'totalAmount'],
          additionalProperties: false,
        },
      },
      {
        type: 'function' as const,
        name: 'showRegistrationForm',
        description: 'Show the registration or profile completion form to the user.',
        parameters: {
          type: 'object',
          properties: {},
          additionalProperties: false,
        },
      },
      {
        type: 'function' as const,
        name: 'checkLoyaltyStatus',
        description: "Check the user's current loyalty points and credits.",
        parameters: {
          type: 'object',
          properties: {},
          additionalProperties: false,
        },
      },
    ];

    const client = new OpenAI({ apiKey: context.env.OPENAI_API_KEY });
    const response = await client.responses.create({
      model,
      input: messages,
      instructions: systemPrompt,
      tools,
      tool_choice: 'auto',
    });

    const toolCalls = (response.output || [])
      .filter((item: any) => item.type === 'function_call')
      .map((item: any) => ({
        name: item.name,
        args: item.arguments ? JSON.parse(item.arguments) : {},
      }));

    return json({
      text: response.output_text || '',
      toolCalls,
    });
  } catch (error: any) {
    return json({ error: error?.message || 'Unexpected AI error' }, 500);
  }
};
