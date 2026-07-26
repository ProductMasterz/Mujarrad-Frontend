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
  provider: string;
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

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value?.trim()) {
    throw new Error(`${name} is missing. Add it to .env.local.`);
  }

  return value.trim();
}

function getModelForRole(options?: AiRequestOptions): string {
  if (options?.model?.trim()) {
    return options.model.trim();
  }

  const role = options?.modelRole ?? 'default';

  if (role === 'clarification') {
    return (
      process.env.SYSTEM_BUILDER_CLARIFICATION_MODEL?.trim() ||
      getRequiredEnv('SYSTEM_BUILDER_DEFAULT_MODEL')
    );
  }

  if (role === 'diagram') {
    return (
      process.env.SYSTEM_BUILDER_DIAGRAM_MODEL?.trim() ||
      getRequiredEnv('SYSTEM_BUILDER_DEFAULT_MODEL')
    );
  }

  if (role === 'markdown') {
    return (
      process.env.SYSTEM_BUILDER_MARKDOWN_MODEL?.trim() ||
      getRequiredEnv('SYSTEM_BUILDER_DEFAULT_MODEL')
    );
  }

  return getRequiredEnv('SYSTEM_BUILDER_DEFAULT_MODEL');
}

function getProviderConfig(options?: AiRequestOptions): {
  provider: string;
  apiKey: string;
  url: string;
  model: string;
  extraHeaders: Record<string, string>;
} {
  const provider = getRequiredEnv('SYSTEM_BUILDER_AI_PROVIDER');
  const apiKey = getRequiredEnv('SYSTEM_BUILDER_API_KEY');
  const url = getRequiredEnv('SYSTEM_BUILDER_AI_BASE_URL');

  const extraHeaders: Record<string, string> = {};

  if (process.env.SYSTEM_BUILDER_HTTP_REFERER?.trim()) {
    extraHeaders['HTTP-Referer'] =
      process.env.SYSTEM_BUILDER_HTTP_REFERER.trim();
  }

  if (process.env.SYSTEM_BUILDER_APP_TITLE?.trim()) {
    extraHeaders['X-Title'] =
      process.env.SYSTEM_BUILDER_APP_TITLE.trim();
  }

  return {
    provider,
    apiKey,
    url,
    model: getModelForRole(options),
    extraHeaders,
  };
}

function getPromptCharacterCount(
  messages: AiMessage[],
): number {
  return messages.reduce(
    (total, message) => total + message.content.length,
    0,
  );
}

function shouldLogAiProfile(): boolean {
  return (
    process.env.SYSTEM_BUILDER_LOG_AI_PROFILE
      ?.trim()
      .toLowerCase() === 'true'
  );
}

export async function callAiProviderWithUsage(
  messages: AiMessage[],
  options?: AiRequestOptions,
): Promise<AiProviderResult> {
  const config = getProviderConfig(options);
  const startedAt = Date.now();

  const requestBody: Record<string, unknown> = {
    model: config.model,
    messages,
    temperature: options?.temperature ?? 0.3,
  };

  if (typeof options?.maxTokens === 'number') {
    requestBody.max_tokens = options.maxTokens;
  }

  if (options?.responseFormat === 'json_object') {
    requestBody.response_format = { type: 'json_object' };
  }

  const response = await fetch(config.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
      ...config.extraHeaders,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorBody = await response.text();

    if (shouldLogAiProfile()) {
      console.info('[system-builder-ai-profile]', {
        provider: config.provider,
        model: config.model,
        role: options?.modelRole ?? 'default',
        responseFormat: options?.responseFormat ?? 'text',
        promptCharacters: getPromptCharacterCount(messages),
        durationMs: Date.now() - startedAt,
        status: response.status,
        ok: false,
      });
    }

    throw new Error(
      `AI provider request failed: ${response.status} ${response.statusText}. ${errorBody}`,
    );
  }

  const data = (await response.json()) as AiProviderResponse;
  const content = data.choices?.[0]?.message?.content;

  if (!content || typeof content !== 'string') {
    throw new Error('AI provider returned an empty response.');
  }

  if (shouldLogAiProfile()) {
    console.info('[system-builder-ai-profile]', {
      provider: config.provider,
      model: data.model ?? config.model,
      role: options?.modelRole ?? 'default',
      responseFormat: options?.responseFormat ?? 'text',
      promptCharacters: getPromptCharacterCount(messages),
      responseCharacters: content.length,
      durationMs: Date.now() - startedAt,
      ok: true,
    });
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
 * Existing callers can continue receiving only the content.
 */
export async function callAiProvider(
  messages: AiMessage[],
  options?: AiRequestOptions,
): Promise<string> {
  const result = await callAiProviderWithUsage(messages, options);

  return result.content;
}
