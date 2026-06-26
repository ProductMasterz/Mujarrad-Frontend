export interface AiRequestOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'text' | 'json_object';
}

export interface AiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AiProviderChoice {
  message?: {
    content?: string;
  };
}

interface AiProviderResponse {
  choices?: AiProviderChoice[];
}

function getProviderConfig(options?: AiRequestOptions): {
  apiKey: string;
  url: string;
  model: string;
  extraHeaders: Record<string, string>;
} {
  const provider = process.env.SYSTEM_BUILDER_AI_PROVIDER ?? 'openrouter';

  if (provider === 'groq') {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      throw new Error('GROQ_API_KEY is missing. Add it to .env.local.');
    }

    return {
      apiKey,
      url: 'https://api.groq.com/openai/v1/chat/completions',
      model:
        options?.model ??
        process.env.SYSTEM_BUILDER_MODEL ??
        'llama-3.1-8b-instant',
      extraHeaders: {},
    };
  }

  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error(
      'OPENROUTER_API_KEY is missing. Add it to .env.local or set SYSTEM_BUILDER_AI_PROVIDER=groq with GROQ_API_KEY.',
    );
  }

  return {
    apiKey,
    url: 'https://openrouter.ai/api/v1/chat/completions',
    model:
      options?.model ??
      process.env.SYSTEM_BUILDER_MODEL ??
      'google/gemini-2.5-flash',
    extraHeaders: {
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'Mujarrad System Design',
    },
  };
}

export async function callAiProvider(
  messages: AiMessage[],
  options?: AiRequestOptions,
): Promise<string> {
  const config = getProviderConfig(options);

  const response = await fetch(config.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
      ...config.extraHeaders,
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: options?.temperature ?? 0.3,
      max_tokens: options?.maxTokens ?? 700,
      response_format:
        options?.responseFormat === 'json_object'
          ? { type: 'json_object' }
          : undefined,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `AI provider request failed: ${response.status} ${response.statusText}. ${errorBody}`,
    );
  }

  const data = (await response.json()) as AiProviderResponse;
  const content = data.choices?.[0]?.message?.content;

  if (!content || typeof content !== 'string') {
    throw new Error('AI provider returned an empty response.');
  }

  return content;
}
