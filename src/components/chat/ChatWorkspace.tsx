'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Copy, SendHorizontal } from 'lucide-react';
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

type ChatWorkspaceProps = {
  spaceSlug: string;
  mode?: 'page' | 'panel';
};

function fallbackCopyTextToClipboard(text: string): boolean {
  if (typeof document === 'undefined') return false;

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  textarea.style.pointerEvents = 'none';
  document.body.appendChild(textarea);
  textarea.select();

  const copied = document.execCommand('copy');
  document.body.removeChild(textarea);
  return copied;
}

async function copyTextToClipboard(text: string): Promise<boolean> {
  if (!text.trim()) return false;

  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall back to legacy copy API below.
    }
  }

  return fallbackCopyTextToClipboard(text);
}

function getMessageMarkdownText(parts: readonly unknown[]): string {
  const collected: string[] = [];

  const collectText = (value: unknown, depth = 0) => {
    if (depth > 8 || value == null) return;

    if (typeof value === 'string') {
      if (value.trim()) collected.push(value);
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => collectText(item, depth + 1));
      return;
    }

    if (typeof value !== 'object') return;

    const candidate = value as Record<string, unknown>;
    const preferredKeys = ['text', 'value', 'content', 'markdown'];
    const hasPreferredKey = preferredKeys.some((key) => key in candidate);

    if (hasPreferredKey) {
      preferredKeys.forEach((key) => {
        if (key in candidate) {
          collectText(candidate[key], depth + 1);
        }
      });
      return;
    }

    Object.values(candidate).forEach((nestedValue) => collectText(nestedValue, depth + 1));
  };

  collectText(parts);

  return collected.join('\n').trim();
}

function renderAssistantMessage(markdownContent: string, isRunning: boolean) {
  if (!markdownContent) {
    return isRunning ? <span className="text-xs text-muted-foreground">Thinking...</span> : null;
  }

  // Always render assistant text through markdown parser to avoid raw markdown symbols.
  return (
    <MarkdownRenderer
      content={markdownContent}
      className="markdown-content prose-sm max-w-none"
    />
  );
}

export function ChatWorkspace({ spaceSlug, mode = 'page' }: ChatWorkspaceProps) {
  const [lastLatencyMs, setLastLatencyMs] = useState<number | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const copiedResetTimeoutRef = useRef<number | null>(null);

  const agentServiceUrl = process.env.NEXT_PUBLIC_AGENT_SERVICE_URL;
  const { runtime, isDemoMode, isRunning } = useMujarradExternalStoreRuntime({
    agentServiceUrl,
    spaceSlug,
    onLatencyUpdate: setLastLatencyMs,
  });

  const isPanel = mode === 'panel';

  useEffect(() => {
    return () => {
      if (copiedResetTimeoutRef.current !== null) {
        window.clearTimeout(copiedResetTimeoutRef.current);
      }
    };
  }, []);

  const handleCopyMessage = async (messageId: string, text: string) => {
    const copied = await copyTextToClipboard(text);
    if (!copied) return;

    setCopiedMessageId(messageId);

    if (copiedResetTimeoutRef.current !== null) {
      window.clearTimeout(copiedResetTimeoutRef.current);
    }

    copiedResetTimeoutRef.current = window.setTimeout(() => {
      setCopiedMessageId((current) => (current === messageId ? null : current));
    }, 1500);
  };

  return (
    <div className={isPanel ? 'flex h-full flex-col p-4' : 'container mx-auto px-6 py-6'}>
      <div className={isPanel ? 'mb-4' : 'mb-6'}>
        <h1 className={isPanel ? 'text-lg font-semibold tracking-tight' : 'text-2xl font-semibold tracking-tight'}>
          Chat
        </h1>
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

      <Card className={isPanel ? 'flex min-h-0 flex-1 flex-col overflow-hidden' : 'flex h-[calc(100vh-220px)] min-h-[500px] flex-col overflow-hidden'}>
        <AssistantRuntimeProvider runtime={runtime}>
          <ThreadPrimitive.Root className="flex h-full flex-col">
            <ThreadPrimitive.Viewport
              className="flex-1 space-y-4 overflow-y-auto p-4 scroll-smooth"
              autoScroll
              turnAnchor="bottom"
              scrollToBottomOnRunStart
              scrollToBottomOnInitialize
              scrollToBottomOnThreadSwitch
            >
              <ThreadPrimitive.Messages>
                {({ message }) => (
                    (() => {
                      const messageText = getMessageMarkdownText(message.content as readonly unknown[]);
                      const isCopied = copiedMessageId === message.id;

                      if (message.role === 'user') {
                        return (
                          <MessagePrimitive.Root className="flex justify-end">
                            <div className="max-w-[80%]">
                              <div className="rounded-2xl bg-primary px-4 py-3 text-sm text-primary-foreground">
                                <div className="whitespace-pre-wrap">
                                  <MessagePrimitive.Parts />
                                </div>
                              </div>
                              <div className="mt-1 flex justify-end">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 gap-1.5 px-2 text-[11px]"
                                  onClick={() => void handleCopyMessage(message.id, messageText)}
                                  aria-label="Copy message"
                                  disabled={!messageText}
                                >
                                  {isCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                  {isCopied ? 'Copied' : 'Copy'}
                                </Button>
                              </div>
                            </div>
                          </MessagePrimitive.Root>
                        );
                      }

                      const assistantMarkdown = messageText;

                      // Skip rendering empty assistant placeholders to avoid sticky ghost bubbles.
                      if (!assistantMarkdown && !isRunning) {
                        return null;
                      }

                      return (
                        <MessagePrimitive.Root className="flex justify-start">
                          <div className="max-w-[80%]">
                            <div className="rounded-2xl bg-muted px-4 py-3 text-sm text-foreground">
                              <div className="whitespace-pre-wrap">
                                {renderAssistantMessage(assistantMarkdown, isRunning)}
                              </div>
                            </div>
                              {assistantMarkdown ? (
                                <div className="mt-1 flex justify-start">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 gap-1.5 px-2 text-[11px]"
                                    onClick={() => void handleCopyMessage(message.id, assistantMarkdown)}
                                    aria-label="Copy message"
                                  >
                                    {isCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                    {isCopied ? 'Copied' : 'Copy'}
                                  </Button>
                                </div>
                              ) : null}
                          </div>
                        </MessagePrimitive.Root>
                      );
                    })()
                )}
              </ThreadPrimitive.Messages>
            </ThreadPrimitive.Viewport>

            <div className="border-t p-4">
              <ComposerPrimitive.Root className="flex items-end gap-3">
                <ComposerPrimitive.Input
                  placeholder="Type your message..."
                  submitMode="enter"
                  onKeyDown={(event) => {
                    const isPlainEnter =
                      event.key === 'Enter' &&
                      !event.shiftKey &&
                      !event.altKey &&
                      !event.ctrlKey &&
                      !event.metaKey;

                    if (!isPlainEnter) return;
                    if (event.nativeEvent.isComposing) return;

                    // Block Enter-submit while local request state is still running.
                    if (isRunning) {
                      event.preventDefault();
                    }
                  }}
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
