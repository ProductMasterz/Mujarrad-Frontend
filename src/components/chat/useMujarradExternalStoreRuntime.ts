'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import {
  useExternalStoreRuntime,
  type AppendMessage,
  type ExternalStoreAdapter,
  type ThreadMessage,
} from '@assistant-ui/react';
import { nodeService } from '@/services/api/node.service';
import { NodeType } from '@/types/backend-dtos';

type AgentProcessResponse = {
  nodes?: unknown[];
  relationships?: unknown[];
  report?: string;
  error?: boolean;
  message?: string;
  code?: string;
};

type RuntimeOptions = {
  agentServiceUrl?: string;
  spaceSlug: string;
  onLatencyUpdate?: (ms: number) => void;
};

function createUserMessage(text: string): ThreadMessage {
  return {
    id: crypto.randomUUID(),
    role: 'user',
    createdAt: new Date(),
    content: [{ type: 'text', text }],
    attachments: [],
    metadata: {
      custom: {},
    },
  };
}

function createAssistantMessage(text: string): ThreadMessage {
  return {
    id: crypto.randomUUID(),
    role: 'assistant',
    createdAt: new Date(),
    content: [{ type: 'text', text }],
    status: { type: 'complete', reason: 'stop' },
    metadata: {
      unstable_state: null,
      unstable_annotations: [],
      unstable_data: [],
      steps: [],
      custom: {},
    },
  };
}

function extractTextFromAppendMessage(message: AppendMessage): string {
  return message.content
    .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
    .map((part) => part.text)
    .join('\n')
    .trim();
}

function buildChatNodeTitle(role: 'user' | 'assistant', text: string): string {
  const prefix = role === 'user' ? 'Chat User' : 'Chat Assistant';
  const compact = text.replace(/\s+/g, ' ').trim();
  const preview = compact.length > 80 ? `${compact.slice(0, 80)}...` : compact;
  return `${prefix}: ${preview || 'Message'}`;
}

async function persistMessageAsNode(
  spaceSlug: string,
  role: 'user' | 'assistant',
  content: string,
): Promise<void> {
  await nodeService.createNode(spaceSlug, {
    title: buildChatNodeTitle(role, content),
    nodeType: NodeType.REGULAR,
    content,
    nodeDetails: {
      source: 'chat-runtime',
      chatRole: role,
      persistedAt: new Date().toISOString(),
    },
  });
}

async function getAgentResponse(
  agentServiceUrl: string | undefined,
  text: string,
  spaceSlug: string,
  signal?: AbortSignal,
): Promise<AgentProcessResponse> {
  if (!agentServiceUrl) {
    await new Promise<void>((resolve, reject) => {
      const onAbort = () => {
        clearTimeout(timeoutId);
        const abortError = new Error('Request canceled.');
        abortError.name = 'AbortError';
        reject(abortError);
      };

      const timeoutId = setTimeout(() => {
        signal?.removeEventListener('abort', onAbort);
        resolve();
      }, 900);

      if (!signal) return;

      if (signal.aborted) {
        onAbort();
        return;
      }

      signal.addEventListener('abort', onAbort, { once: true });
    });

    return {
      report: [
        '# Demo Summary',
        '',
        `**Input:** ${text}`,
        '',
        '## Extracted',
        '- 1 node idea',
        '- 1 relationship idea',
        '',
        '```ts',
        "const spaceSlug = '" + spaceSlug + "';",
        '```',
        '',
        '[Open space](#/spaces)',
      ].join('\n'),
    };
  }

  const response = await fetch(`${agentServiceUrl}/api/agents/process`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal,
    body: JSON.stringify({
      text,
      space_slug: spaceSlug,
    }),
  });

  const data: AgentProcessResponse = await response.json();

  if (!response.ok || data.error) {
    throw new Error(data.message || 'The agent service returned an error.');
  }

  return data;
}

export function useMujarradExternalStoreRuntime({
  agentServiceUrl,
  spaceSlug,
  onLatencyUpdate,
}: RuntimeOptions) {
  const [messages, setMessages] = useState<ThreadMessage[]>([
    createAssistantMessage('Welcome to Mujarrad chat. This is the initial chat shell for Squad A.'),
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isRunningRef = useRef(false);

  const onNew = useCallback(async (message: AppendMessage) => {
    const userText = extractTextFromAppendMessage(message);
    if (!userText || isRunningRef.current) return;

    isRunningRef.current = true;
    setMessages((prev) => [...prev, createUserMessage(userText)]);
    setIsRunning(true);

    const startedAt = Date.now();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const data = await getAgentResponse(
        agentServiceUrl,
        userText,
        spaceSlug,
        controller.signal,
      );

      const assistantText = data.report || 'Your message was processed successfully.';
      setMessages((prev) => [...prev, createAssistantMessage(assistantText)]);

      if (agentServiceUrl) {
        // Persistence should never block chat completion state.
        void Promise.all([
          persistMessageAsNode(spaceSlug, 'user', userText),
          persistMessageAsNode(spaceSlug, 'assistant', assistantText),
        ]).catch((persistError) => {
          console.warn('[Chat Runtime] Message persistence failed:', persistError);
        });
      }
    } catch (error) {
      if ((error as { name?: string } | null)?.name === 'AbortError') {
        setMessages((prev) => [...prev, createAssistantMessage('Request canceled.')]);
      } else {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Could not reach the agent service. Please try again.';
        setMessages((prev) => [...prev, createAssistantMessage(errorMessage)]);
      }
    } finally {
      onLatencyUpdate?.(Date.now() - startedAt);
      setIsRunning(false);
      isRunningRef.current = false;
      abortControllerRef.current = null;
    }
  }, [agentServiceUrl, onLatencyUpdate, spaceSlug]);

  const onCancel = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    isRunningRef.current = false;
    setIsRunning(false);
  }, []);

  const adapter = useMemo<ExternalStoreAdapter<ThreadMessage>>(
    () => ({
      messages,
      // Keep runtime auto-optimistic placeholders disabled; we control pending UI explicitly.
      isRunning: false,
      setMessages: (nextMessages) => setMessages([...nextMessages]),
      onNew,
      onCancel,
    }),
    [messages, onCancel, onNew],
  );

  const runtime = useExternalStoreRuntime(adapter);

  return {
    runtime,
    isRunning,
    isDemoMode: !agentServiceUrl,
    messages,
  };
}
