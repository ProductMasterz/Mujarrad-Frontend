export interface AiRequestOptions {
  model?: string;
  modelRole?: 'clarification' | 'diagram' | 'markdown' | 'default';
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'text' | 'json_object';
}

export interface AiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AiTokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost?: number;
  provider: 'groq' | 'openrouter';
  model: string;
}

export interface AiProviderResult {
  content: string;
  usage: AiTokenUsage | null;
}

interface AiProviderChoice {
  message?: {
    content?: string;
  };
}

interface AiProviderResponse {
  model?: string;
  choices?: AiProviderChoice[];
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
    cost?: number;
  };
}

function getModelForRole(options?: AiRequestOptions): string {
  if (options?.model) {
    return options.model;
  }

  const role = options?.modelRole ?? 'default';

  if (role === 'clarification') {
    return (
      process.env.SYSTEM_BUILDER_CLARIFICATION_MODEL ??
      process.env.SYSTEM_BUILDER_DEFAULT_MODEL ??
      'google/gemini-2.5-flash'
    );
  }

  if (role === 'diagram') {
    return (
      process.env.SYSTEM_BUILDER_DIAGRAM_MODEL ??
      process.env.SYSTEM_BUILDER_DEFAULT_MODEL ??
      'google/gemini-2.5-flash'
    );
  }

  if (role === 'markdown') {
    return (
      process.env.SYSTEM_BUILDER_MARKDOWN_MODEL ??
      process.env.SYSTEM_BUILDER_DEFAULT_MODEL ??
      'google/gemini-2.5-flash'
    );
  }

  return (
    process.env.SYSTEM_BUILDER_DEFAULT_MODEL ??
    'google/gemini-2.5-flash'
  );
}

function getProviderConfig(options?: AiRequestOptions): {
  provider: 'groq' | 'openrouter';
  apiKey: string;
  url: string;
  model: string;
  extraHeaders: Record<string, string>;
} {
  const provider = process.env.SYSTEM_BUILDER_AI_PROVIDER ?? 'openrouter';
  const apiKey = process.env.SYSTEM_BUILDER_API_KEY;

  if (!apiKey) {
    throw new Error('SYSTEM_BUILDER_API_KEY is missing. Add it to .env.local.');
  }

  if (provider === 'groq') {
    return {
      provider: 'groq',
      apiKey,
      url: 'https://api.groq.com/openai/v1/chat/completions',
      model: getModelForRole(options),
      extraHeaders: {},
    };
  }

  if (provider === 'openrouter') {
    return {
      provider: 'openrouter',
      apiKey,
      url: 'https://openrouter.ai/api/v1/chat/completions',
      model: getModelForRole(options),
      extraHeaders: {
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Mujarrad System Design',
      },
    };
  }

  throw new Error(
    `Unsupported SYSTEM_BUILDER_AI_PROVIDER "${provider}". Use "openrouter" or "groq".`,
  );
}

export async function callAiProviderWithUsage(
  messages: AiMessage[],
  options?: AiRequestOptions,
): Promise<AiProviderResult> {
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

  const providerUsage = data.usage;

  const usage: AiTokenUsage | null = providerUsage
    ? {
        promptTokens: providerUsage.prompt_tokens ?? 0,
        completionTokens: providerUsage.completion_tokens ?? 0,
        totalTokens:
          providerUsage.total_tokens ??
          (providerUsage.prompt_tokens ?? 0) +
            (providerUsage.completion_tokens ?? 0),
        cost:
          typeof providerUsage.cost === 'number'
            ? providerUsage.cost
            : undefined,
        provider: config.provider,
        model: data.model ?? config.model,
      }
    : null;

  return {
    content,
    usage,
  };
}

/**
 * Backward-compatible AI call.
 *
 * Existing callers such as Task 5 can continue receiving only the content.
 */
export async function callAiProvider(
  messages: AiMessage[],
  options?: AiRequestOptions,
): Promise<string> {
  const result = await callAiProviderWithUsage(messages, options);

  return result.content;
}
