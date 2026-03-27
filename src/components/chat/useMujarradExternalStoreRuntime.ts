'use client';

import { useMemo, useRef, useState } from 'react';
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
    await new Promise((resolve) => setTimeout(resolve, 900));
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

  const onNew = useMemo(() => {
    return async (message: AppendMessage) => {
      const userText = extractTextFromAppendMessage(message);
      if (!userText || isRunning) return;

      const userMessage = createUserMessage(userText);
      setMessages((prev) => [...prev, userMessage]);
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
        const assistantMessage = createAssistantMessage(assistantText);
        setMessages((prev) => [...prev, assistantMessage]);

        if (agentServiceUrl) {
          try {
            await Promise.all([
              persistMessageAsNode(spaceSlug, 'user', userText),
              persistMessageAsNode(spaceSlug, 'assistant', assistantText),
            ]);
          } catch (persistError) {
            console.warn('[Chat Runtime] Message persistence failed:', persistError);
          }
        }
      } catch (error) {
        if ((error as { name?: string } | null)?.name === 'AbortError') {
          const canceledMessage = createAssistantMessage('Request canceled.');
          setMessages((prev) => [...prev, canceledMessage]);
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
        abortControllerRef.current = null;
      }
    };
  }, [agentServiceUrl, isRunning, onLatencyUpdate, spaceSlug]);

  const onCancel = useMemo(() => {
    return async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      setIsRunning(false);
    };
  }, []);

  const adapter = useMemo<ExternalStoreAdapter<ThreadMessage>>(
    () => ({
      messages,
      isRunning,
      onNew,
      onCancel,
    }),
    [isRunning, messages, onCancel, onNew],
  );

  const runtime = useExternalStoreRuntime(adapter);

  return {
    runtime,
    isRunning,
    isDemoMode: !agentServiceUrl,
  };
}
