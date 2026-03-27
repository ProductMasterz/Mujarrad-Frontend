'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { SendHorizontal } from 'lucide-react';
import {
  AssistantRuntimeProvider,
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
} from '@assistant-ui/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer';
import { useMujarradExternalStoreRuntime } from '@/components/chat/useMujarradExternalStoreRuntime';

function getMessageMarkdownText(parts: readonly unknown[]): string {
  return parts
    .filter((part): part is { text: string } => {
      if (!part || typeof part !== 'object') return false;
      return typeof (part as { text?: unknown }).text === 'string';
    })
    .map((part) => part.text)
    .join('\n')
    .trim();
}

function renderAssistantMessage(parts: readonly unknown[]) {
  const markdownContent = getMessageMarkdownText(parts);

  if (!markdownContent) {
    return <MessagePrimitive.Parts />;
  }

  return (
    <MarkdownRenderer
      content={markdownContent}
      className="markdown-content prose-sm max-w-none"
    />
  );
}

export default function ChatPage() {
  const searchParams = useSearchParams();
  const [lastLatencyMs, setLastLatencyMs] = useState<number | null>(null);

  const agentServiceUrl = process.env.NEXT_PUBLIC_AGENT_SERVICE_URL;
  const spaceSlug = searchParams.get('space_slug') || 'demo-space';
  const { runtime, isDemoMode, isRunning } = useMujarradExternalStoreRuntime({
    agentServiceUrl,
    spaceSlug,
    onLatencyUpdate: setLastLatencyMs,
  });

  return (
    <div className="container mx-auto px-6 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Chat</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Interact with Mujarrad through text.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Space: {spaceSlug}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Mode: {isDemoMode ? 'Demo (no backend URL)' : 'Live backend'}
          {lastLatencyMs !== null ? ` • Last response: ${lastLatencyMs}ms` : ''}
        </p>
      </div>

      <Card className="flex h-[calc(100vh-220px)] min-h-[500px] flex-col overflow-hidden">
        <AssistantRuntimeProvider runtime={runtime}>
          <ThreadPrimitive.Root className="flex h-full flex-col">
            <ThreadPrimitive.Viewport className="flex-1 space-y-4 overflow-y-auto p-4" autoScroll>
              <ThreadPrimitive.Messages>
                {({ message }) => (
                  <MessagePrimitive.Root
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">
                        {message.role === 'assistant' ? (
                          renderAssistantMessage(message.content)
                        ) : (
                          <MessagePrimitive.Parts />
                        )}
                      </div>
                    </div>
                  </MessagePrimitive.Root>
                )}
              </ThreadPrimitive.Messages>
            </ThreadPrimitive.Viewport>

            <div className="border-t p-4">
              <ComposerPrimitive.Root className="flex items-end gap-3">
                <ComposerPrimitive.Input
                  placeholder="Type your message..."
                  className="min-h-[60px] w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <ComposerPrimitive.Send asChild>
                  <Button className="gap-2" disabled={isRunning}>
                    <SendHorizontal className="h-4 w-4" />
                    {isRunning ? 'Sending...' : 'Send'}
                  </Button>
                </ComposerPrimitive.Send>
              </ComposerPrimitive.Root>
            </div>
          </ThreadPrimitive.Root>
        </AssistantRuntimeProvider>
      </Card>
    </div>
  );
}