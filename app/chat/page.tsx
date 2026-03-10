'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  AssistantRuntimeProvider,
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  useLocalRuntime,
  type ChatModelAdapter,
} from '@assistant-ui/react';

type AgentProcessResponse = {
  nodes?: unknown[];
  relationships?: unknown[];
  report?: string;
  error?: boolean;
  message?: string;
  code?: string;
};

type SimpleMessage = {
  role: string;
  content?: Array<{
    type?: string;
    text?: string;
  }>;
};

function getLastUserText(messages: readonly unknown[]): string {
  const normalized = messages as SimpleMessage[];

  for (let i = normalized.length - 1; i >= 0; i -= 1) {
    const message = normalized[i];
    if (message?.role !== 'user') continue;

    const text = (message.content || [])
      .filter((part) => part?.type === 'text' && typeof part?.text === 'string')
      .map((part) => part.text ?? '')
      .join('\n')
      .trim();

    if (text) return text;
  }

  return '';
}

function UserMessage() {
  return (
    <MessagePrimitive.Root className="flex justify-end">
      <div className="max-w-[80%] rounded-2xl bg-primary px-4 py-3 text-sm text-primary-foreground">
        <MessagePrimitive.Parts />
      </div>
    </MessagePrimitive.Root>
  );
}

function AssistantMessage() {
  return (
    <MessagePrimitive.Root className="flex justify-start">
      <div className="max-w-[80%] rounded-2xl bg-muted px-4 py-3 text-sm text-foreground">
        <MessagePrimitive.Parts />
      </div>
    </MessagePrimitive.Root>
  );
}

function ChatShell() {
  return (
    <div className="container mx-auto px-6 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Chat</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Interact with Mujarrad through text.
        </p>
      </div>

      <div className="flex h-[calc(100vh-220px)] min-h-[500px] flex-col overflow-hidden rounded-lg border bg-card">
        <ThreadPrimitive.Root className="flex h-full flex-col">
          <ThreadPrimitive.Viewport className="flex-1 space-y-4 overflow-y-auto p-4">
            <ThreadPrimitive.Messages
              components={{
                UserMessage,
                AssistantMessage,
              }}
            />

            <ThreadPrimitive.Empty>
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl bg-muted px-4 py-3 text-sm text-foreground">
                  Welcome to Mujarrad chat. This is the initial chat shell for Squad A.
                </div>
              </div>
            </ThreadPrimitive.Empty>
          </ThreadPrimitive.Viewport>

          <div className="border-t p-4">
            <ComposerPrimitive.Root className="flex items-end gap-3">
              <ComposerPrimitive.Input
                placeholder="Type your message..."
                className="min-h-[60px] flex-1 resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none"
              />
              <ComposerPrimitive.Send className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:pointer-events-none disabled:opacity-50">
                Send
              </ComposerPrimitive.Send>
            </ComposerPrimitive.Root>
          </div>
        </ThreadPrimitive.Root>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const searchParams = useSearchParams();
  const spaceSlug = searchParams.get('space_slug') || 'demo-space';
  const agentServiceUrl = process.env.NEXT_PUBLIC_AGENT_SERVICE_URL;

  const modelAdapter = useMemo<ChatModelAdapter>(
    () => ({
      async run({ messages, abortSignal }) {
        const text = getLastUserText(messages);

        if (!text) {
          return {
            content: [
              {
                type: 'text',
                text: 'Please type a message.',
              },
            ],
          };
        }

        if (!agentServiceUrl) {
          return {
            content: [
              {
                type: 'text',
                text: 'Agent service is not available yet. Squad B backend is not connected.',
              },
            ],
          };
        }

        try {
          const response = await fetch(`${agentServiceUrl}/api/agents/process`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text,
              space_slug: spaceSlug,
            }),
            signal: abortSignal,
          });

          const data: AgentProcessResponse = await response.json();

          if (!response.ok || data.error) {
            return {
              content: [
                {
                  type: 'text',
                  text: data.message || 'The agent service returned an error.',
                },
              ],
            };
          }

          return {
            content: [
              {
                type: 'text',
                text: data.report || 'Your message was processed successfully.',
              },
            ],
          };
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            throw error;
          }

          return {
            content: [
              {
                type: 'text',
                text: 'Could not reach the agent service. Please try again.',
              },
            ],
          };
        }
      },
    }),
    [agentServiceUrl, spaceSlug],
  );

  const runtime = useLocalRuntime(modelAdapter);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <ChatShell />
    </AssistantRuntimeProvider>
  );
}