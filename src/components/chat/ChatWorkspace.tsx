'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { Check, Copy, LayoutGrid, Loader2, Search, SendHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import {
  AssistantRuntimeProvider,
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
} from '@assistant-ui/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer';
import { nodeKeys } from '@/hooks/api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
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
      className="chat-message-markdown"
    />
  );
}

export function ChatWorkspace({ spaceSlug, mode = 'page' }: ChatWorkspaceProps) {
  const [lastLatencyMs, setLastLatencyMs] = useState<number | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [historyExtensionOpen, setHistoryExtensionOpen] = useState(false);
  const copiedResetTimeoutRef = useRef<number | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isWorkspaceTransitionPending, startWorkspaceTransition] = useTransition();

  const agentServiceUrl = process.env.NEXT_PUBLIC_AGENT_SERVICE_URL?.trim() || 'https://mujarrad-agents-api.onrender.com';
  const { runtime, isDemoMode, isRunning, conversations, activeConversationId, loadConversationById, startNewConversation, deleteConversation, renameConversation } = useMujarradExternalStoreRuntime({
    agentServiceUrl,
    spaceSlug,
    onLatencyUpdate: setLastLatencyMs,
    onWorkspaceDataChange: () => {
      queryClient.invalidateQueries({ queryKey: nodeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['spaces', spaceSlug, 'attributes'] });
      queryClient.invalidateQueries({ queryKey: ['spaces', spaceSlug, 'graph'] });
    },
  });

  const filteredConversations = conversations.filter(c => {
    if (!searchQuery) return true;
    return c.searchableContent?.includes(searchQuery.toLowerCase());
  });
  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null;

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
        <div className="mt-2 flex flex-wrap items-center justify-between gap-y-2 bg-transparent">
          <h1 className={isPanel ? 'text-lg font-semibold tracking-tight' : 'text-2xl font-semibold tracking-tight'}>
            Chat
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                startWorkspaceTransition(() => {
                  queryClient.invalidateQueries({
                    queryKey: nodeKeys.list(spaceSlug, { page: 1, size: 1000 }),
                  });
                  router.push(`/spaces/${spaceSlug}`);
                });
              }}
              disabled={!spaceSlug || isWorkspaceTransitionPending}
            >
              <LayoutGrid className="mr-2 h-4 w-4" />
              Workspace
            </Button>
            <Button variant="outline" size="sm" onClick={() => void startNewConversation()}>
              New Conversation
            </Button>
          </div>
        </div>

        <p className="mt-2 text-sm text-muted-foreground">
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

      <Card className={isPanel ? 'flex min-h-0 flex-1 flex-col overflow-visible' : 'flex h-[calc(100vh-220px)] min-h-[500px] flex-col overflow-visible'}>
        <AssistantRuntimeProvider runtime={runtime}>
          <div className="relative h-full min-h-0">
            <aside
              className={`absolute inset-y-0 right-full z-20 mr-3 flex w-[min(18rem,80vw)] flex-col rounded-xl border bg-background shadow-lg transition-all duration-200 ${
                historyExtensionOpen
                  ? 'translate-x-0 opacity-100'
                  : 'pointer-events-none translate-x-3 opacity-0'
              }`}
            >
              <div className="flex items-center justify-between border-b px-3 py-2">
                <p className="text-sm font-semibold">Conversations</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => setHistoryExtensionOpen(false)}
                >
                  Hide
                </Button>
              </div>

              <div className="space-y-3 p-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="h-8 w-full bg-background pl-9 text-sm"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" className="w-full justify-start" onClick={() => void startNewConversation()}>
                  New chat
                </Button>
              </div>

              <div className="min-h-0 flex-1 space-y-1 overflow-y-auto px-2 pb-3">
                {filteredConversations.length > 0 ? (
                  filteredConversations.map((c) => {
                    const fallbackDate = new Date(c.createdAt);
                    const dateStr = fallbackDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                    const timeStr = fallbackDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
                    const isActive = c.id === activeConversationId;

                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => void loadConversationById(c.id)}
                        className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                          isActive
                            ? 'border-primary/50 bg-primary/10'
                            : 'border-transparent hover:border-border hover:bg-background/70'
                        }`}
                        aria-label={`Open conversation ${c.title || c.id}`}
                      >
                        <p className="truncate text-sm font-medium">{c.title || 'Untitled conversation'}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{dateStr} {timeStr}</p>
                      </button>
                    );
                  })
                ) : (
                  <div className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
                    {searchQuery ? 'No conversations match your search.' : 'No saved conversations yet.'}
                  </div>
                )}
              </div>

              {activeConversationId ? (
                <div className="border-t p-3">
                  <div className="grid grid-cols-2 gap-2">
                    <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setNewTitle(activeConversation?.title || '');
                          }}
                        >
                          Rename
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="z-[130]">
                        <DialogHeader>
                          <DialogTitle>Rename Conversation</DialogTitle>
                          <DialogDescription>
                            Enter a new title for this conversation.
                          </DialogDescription>
                        </DialogHeader>
                        <Input
                          autoFocus
                          placeholder="Title"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              void renameConversation(activeConversationId, newTitle);
                              setRenameDialogOpen(false);
                            }
                          }}
                        />
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogClose>
                          <Button
                            onClick={() => {
                              void renameConversation(activeConversationId, newTitle);
                              setRenameDialogOpen(false);
                            }}
                          >
                            Save
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="z-[130]">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this conversation? This will permanently remove all messages within it.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => void deleteConversation(activeConversationId)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ) : null}

            </aside>

            <ThreadPrimitive.Root className="flex h-full min-h-0 flex-col overflow-hidden rounded-[inherit]">
              <div className="flex items-center gap-2 border-b px-4 py-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 shrink-0 px-2"
                  onClick={() => setHistoryExtensionOpen((current) => !current)}
                >
                  {historyExtensionOpen ? 'Hide conversations' : 'Conversations'}
                </Button>
                <p className="min-w-0 flex-1 truncate text-sm font-medium">{activeConversation?.title || 'Current conversation'}</p>
              </div>

              <ThreadPrimitive.Viewport
                className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 scroll-smooth"
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
                            <div className="max-w-[88%] lg:max-w-[82%]">
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
                          <div className="max-w-[88%] lg:max-w-[82%]">
                            <div className="rounded-2xl border border-border/70 bg-card px-4 py-3 text-sm text-foreground shadow-sm">
                              <div className="min-w-0">
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

                {isRunning ? (
                  <div className="flex justify-start">
                    <div className="max-w-[88%] lg:max-w-[82%]">
                      <div className="rounded-2xl border border-border/70 bg-card px-4 py-3 text-sm text-foreground shadow-sm">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Mujarrad is thinking</span>
                        </div>
                        <div className="mt-2 flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-foreground/45 animate-bounce" />
                          <span
                            className="h-2 w-2 rounded-full bg-foreground/45 animate-bounce"
                            style={{ animationDelay: '120ms' }}
                          />
                          <span
                            className="h-2 w-2 rounded-full bg-foreground/45 animate-bounce"
                            style={{ animationDelay: '240ms' }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
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
                      {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
                      {isRunning ? 'Sending...' : 'Send'}
                    </Button>
                  </ComposerPrimitive.Send>
                </ComposerPrimitive.Root>
              </div>
            </ThreadPrimitive.Root>
          </div>
        </AssistantRuntimeProvider>
      </Card>
    </div>
  );
}
