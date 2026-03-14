'use client';

import { useEffect, useRef, useState } from 'react';
import {
  AssistantRuntimeProvider,
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  useExternalStoreRuntime,
  type AppendMessage,
} from '@assistant-ui/react';
import { Copy, Check, SendHorizontal, X, Pencil, Trash2, PanelLeftClose, PanelLeftOpen, SquarePen, Search } from 'lucide-react';
import { nodeService } from '@/services/api/node.service';
import { attributeService } from '@/services/api/attribute.service';
import { Button } from '@/components/ui/button';
import { AttributeTypeMode, NodeType, type Node } from '@/types/backend-dtos';
import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer';
import { useQueryClient } from '@tanstack/react-query';
import { nodeKeys } from '@/hooks/api';

type AgentProcessResponse = {
  nodes?: unknown[];
  relationships?: unknown[];
  report?: string;
  error?: boolean;
  message?: string;
  code?: string;
};

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  createdAt: string;
};

type ChatSession = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

interface ChatPanelProps {
  spaceSlug?: string;
  title?: string;
  embedded?: boolean;
  onClose?: () => void;
}

function parseNodeDetails(node: Node): Record<string, unknown> | undefined {
  if (!node.nodeDetails) return undefined;

  if (typeof node.nodeDetails === 'string') {
    try {
      return JSON.parse(node.nodeDetails);
    } catch {
      return undefined;
    }
  }

  return node.nodeDetails as Record<string, unknown>;
}

function isConversationNode(node: Node): boolean {
  const details = parseNodeDetails(node);

  return (
    details?.chatNodeType === 'conversation' ||
    (details?.createdFrom === 'chat' && details?.role === 'conversation')
  );
}

function isMessageNode(node: Node): boolean {
  const details = parseNodeDetails(node);

  return (
    details?.chatNodeType === 'message' ||
    (details?.createdFrom === 'chat' &&
      (details?.role === 'user' || details?.role === 'assistant'))
  );
}

function formatMessageTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function CopyMessageButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#dbe1ea] bg-white/70 text-[#94a3b8] transition hover:bg-white hover:text-[#111827]"
      aria-label={copied ? 'Copied' : 'Copy message'}
      title={copied ? 'Copied' : 'Copy'}
      type="button"
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
    </button>
  );
}

function UserMessageBubble({
  text,
  createdAt,
}: {
  text: string;
  createdAt: string;
}) {
  return (
    <div className="flex justify-end">
      <div className="flex max-w-[78%] items-end gap-3">
        <div className="flex flex-col items-end">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-[11px] font-medium uppercase tracking-wide text-[#9ca3af]">
              You
            </span>
            <span className="text-[11px] text-[#94a3b8]">
              {formatMessageTime(createdAt)}
            </span>
          </div>

          <div className="group rounded-[22px] rounded-br-[8px] bg-[#2563eb] px-4 py-3 text-sm leading-6 text-white shadow-sm transition-all duration-200 hover:shadow-md">
            <div className="whitespace-pre-wrap break-words">{text}</div>
            <div className="mt-3 flex justify-end">
              <CopyMessageButton text={text} />
            </div>
          </div>
        </div>

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#dbeafe] text-xs font-semibold text-[#1d4ed8] shadow-sm">
          Y
        </div>
      </div>

    </div>
  );
}

function AssistantMessageBubble({
  text,
  createdAt,
}: {
  text: string;
  createdAt: string;
}) {
  return (
    <div className="flex justify-start">
      <div className="flex max-w-[85%] items-end gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ede9fe] text-xs font-semibold text-[#6d28d9] shadow-sm">
          M
        </div>

        <div className="flex flex-col items-start">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-[11px] font-medium uppercase tracking-wide text-[#9ca3af]">
              Mujarrad
            </span>
            <span className="text-[11px] text-[#94a3b8]">
              {formatMessageTime(createdAt)}
            </span>
          </div>

          <div className="group rounded-[22px] rounded-bl-[8px] border border-[#e5e7eb] bg-[#f3f4f6] px-4 py-3 text-sm leading-6 text-[#111827] shadow-sm transition-all duration-200 hover:shadow-md">
            <div className="text-black [&_*]:text-black [&_a]:text-[#2563eb] [&_a]:underline [&_code]:rounded [&_code]:bg-[#f3f4f6] [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-black [&_h1]:mb-2 [&_h1]:mt-3 [&_h1]:text-xl [&_h1]:font-bold [&_h2]:mb-2 [&_h2]:mt-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:mt-3 [&_h3]:font-semibold [&_li]:mb-1 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-2 [&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-[#1e293b] [&_pre]:bg-[#0f172a] [&_pre]:p-4 [&_pre]:text-white [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6">
              <MarkdownRenderer content={text} />
            </div>
            <div className="mt-3 flex justify-end">
              <CopyMessageButton text={text} />
            </div>
          </div>
        </div>

        
      </div>
    </div>
  );
}

function ChatPanelShell({
  isRunning,
  title,
  spaceSlug,
  embedded,
  onClose,
  messageCount,
  sessions,
  messages,
  sessionPreviewIndex,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onRenameSession,
  onDeleteSession,
  isBootstrapping,
  searchTerm,
  onSearchTermChange,
}: {
  isRunning: boolean;
  title: string;
  spaceSlug: string;
  embedded: boolean;
  onClose?: () => void;
  messageCount: number;
  sessions: ChatSession[];
  messages: ChatMessage[];
  sessionPreviewIndex: Record<string, string>;
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  onRenameSession: (sessionId: string, newTitle: string) => Promise<void>;
  onDeleteSession: (sessionId: string) => Promise<void>;
  isBootstrapping: boolean;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const isResizingRef = useRef(false);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const sendButtonRef = useRef<HTMLButtonElement | null>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const composerInputRef = useRef<HTMLTextAreaElement | null>(null);
  const [renameTarget, setRenameTarget] = useState<ChatSession | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<ChatSession | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const autoResizeTextarea = (el: HTMLTextAreaElement) => {
    el.style.height = '0px';
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  };

  const openRenameModal = (session: ChatSession) => {
    setRenameTarget(session);
    setRenameValue(session.title);
  };

  const closeRenameModal = () => {
    setRenameTarget(null);
    setRenameValue('');
  };

  const closeDeleteModal = () => {
    setDeleteTarget(null);
  };

  const submitRename = async () => {
    if (!renameTarget || !renameValue.trim()) return;
    setIsRenaming(true);
    try {
      await onRenameSession(renameTarget.id, renameValue.trim());
      closeRenameModal();
    } finally {
      setIsRenaming(false);
    }
  };

  const submitDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await onDeleteSession(deleteTarget.id);
      closeDeleteModal();
    } finally {
      setIsDeleting(false);
    }
  };
  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  const handleScroll = () => {
    const el = viewportRef.current;
    if (!el) return;

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const isNearBottom = distanceFromBottom < 40;
    setShouldAutoScroll(isNearBottom);
  };

  const handleResizeStart = () => {
    isResizingRef.current = true;
  };

  useEffect(() => {
    if (!isRunning && composerInputRef.current) {
      composerInputRef.current.style.height = '48px';
    }
  }, [isRunning]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!isResizingRef.current || !panelRef.current) return;

      const panelRect = panelRef.current.getBoundingClientRect();
      const nextWidth = event.clientX - panelRect.left;

      setSidebarWidth(Math.min(420, Math.max(180, nextWidth)));
    };

    const handleMouseUp = () => {
      isResizingRef.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  
  useEffect(() => {
    if (shouldAutoScroll) {
      scrollToBottom();
    }
  }, [messageCount, shouldAutoScroll, isRunning]);

  return (
    <div ref={panelRef} className={`relative flex h-full bg-[#f8fafc] ${embedded ? '' : ''}`}>
      {sidebarOpen && (
        <div
          className="relative shrink-0 border-r border-[#e5e7eb] bg-[#f8fafc] flex flex-col"
          style={{ width: `${sidebarWidth}px` }}
        >

          <div className="border-b px-3 py-3 flex items-center justify-between pr-5">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-[#9ca3af]">
                Chats
              </div>
              <div className="mt-1 text-[11px] text-[#9ca3af]">
                {sessions.length} conversation{sessions.length === 1 ? '' : 's'}
              </div>
            </div>

            <button
              onClick={onNewSession}
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#111827] text-white shadow-sm transition hover:bg-[#1f2937]"
              aria-label="New chat"
              title="New chat"
            >
              <SquarePen className="h-4 w-4" />
            </button>
          </div>

          <div className="border-b px-3 py-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
              <input
                value={searchTerm}
                onChange={(e) => onSearchTermChange(e.target.value)}
                placeholder="Search conversations..."
                className="w-full rounded-xl border border-[#e5e7eb] bg-white py-2.5 pl-9 pr-3 text-sm text-[#111827] shadow-sm outline-none placeholder:text-[#9ca3af] focus:border-[#c7d2fe] focus:ring-2 focus:ring-[#e0e7ff]"
                type="text"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 scroll-smooth">
            {sessions.length === 0 && (
              <div className="rounded-xl border border-dashed border-[#e5e7eb] bg-white px-3 py-6 text-center">
                <p className="text-sm font-medium text-[#6b7280]">
                  {searchTerm.trim() ? 'No matching conversations' : 'No conversations yet'}
                </p>
                <p className="mt-1 text-xs text-[#9ca3af]">
                  {searchTerm.trim()
                    ? 'Try a different keyword.'
                    : 'Start a new chat to begin building context.'}
                </p>
              </div>
            )}
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`group relative mb-2 rounded-xl border px-3 py-3 text-left text-sm transition ${
                  activeSessionId === session.id
                    ? 'border-[#c7d2fe] bg-[linear-gradient(180deg,#eef2ff_0%,#ffffff_100%)] shadow-[0px_8px_20px_rgba(79,70,229,0.08)]'
                    : 'border-transparent bg-white hover:border-[#e5e7eb] hover:bg-[#fafafa]'
                }`}
                title={`${session.title} — Created ${new Date(session.createdAt).toLocaleString()}`}
              >
                {activeSessionId === session.id && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#4f46e5]" />
                )}

                <button
                  onClick={() => onSelectSession(session.id)}
                  className="w-full text-left"
                  type="button"
                >
                  <div className="truncate text-sm font-semibold text-[#111827]">
                    {session.title}
                  </div>
                  <div className="mt-1 line-clamp-2 text-[12px] leading-5 text-[#9ca3af]">
                    {sessionPreviewIndex[session.id] || 'No messages yet'}
                  </div>
                </button>

                <div className="mt-1 flex items-center justify-between gap-2">
                  <div className="truncate text-[11px] text-[#9ca3af]">
                    {new Date(session.createdAt).toLocaleDateString()}
                  </div>

                  <div
                    className={`flex items-center gap-1 transition-opacity ${
                      activeSessionId === session.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openRenameModal(session);
                      }}
                      className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[#94a3b8] transition hover:bg-[#eff6ff] hover:text-[#2563eb]"
                      type="button"
                      aria-label="Rename conversation"
                      title="Rename"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(session);
                      }}
                      className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[#94a3b8] transition hover:bg-[#fef2f2] hover:text-[#dc2626]"
                      type="button"
                      aria-label="Delete conversation"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <>
            <button
              onClick={() => setSidebarOpen(false)}
              type="button"
              aria-label="Hide chats"
              title="Hide chats"
              className="absolute -right-4 top-4 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#e5e7eb] bg-white text-[#6b7280] shadow-sm transition hover:bg-[#f9fafb] hover:text-[#111827]"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>

            <div
              onMouseDown={handleResizeStart}
              className="absolute right-0 top-0 h-full w-1 cursor-col-resize bg-transparent hover:bg-gray-300"
            />
          </>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-[#ececec] bg-white px-5 py-4 shadow-[0_1px_0_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-2">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#e5e7eb] bg-white text-[#4b5563] transition hover:bg-[#f9fafb] hover:text-[#111827]"
                type="button"
                aria-label="Show chats"
                title="Show chats"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </button>
            )}

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-[#111827]">{title}</h2>
              </div>
              <p className="mt-1 text-xs text-[#6b7280]">
                Space: <span className="font-medium text-[#4b5563]">{spaceSlug}</span>
              </p>
            </div>
          </div>

          {embedded && onClose && (
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-[#6b7280] transition hover:bg-[#f3f4f6] hover:text-[#111827]"
              aria-label="Close chat"
              type="button"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

      <ThreadPrimitive.Root className="flex h-full flex-col overflow-hidden">
          <ThreadPrimitive.Viewport
            ref={viewportRef}
            onScroll={handleScroll}
            className="flex-1 space-y-5 overflow-y-auto bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_40%)] px-5 py-5 scroll-smooth">
            {isBootstrapping ? (
              <div className="rounded-2xl border border-[#e5e7eb] bg-white px-4 py-3 text-sm text-[#6b7280] shadow-sm">
                Loading chat history...
              </div>
            ) : (
              <>
                {messages.length === 1 && messages[0]?.id === 'welcome' ? (
                  <div className="rounded-3xl border border-[#e5e7eb] bg-white px-6 py-6 shadow-sm">
                    <div className="mb-2 text-sm font-semibold text-[#111827]">
                      Start building in this space
                    </div>
                    <p className="text-sm leading-6 text-[#6b7280]">
                      Use chat to explore the graph, create nodes, connect entities, or summarize what already exists in this space.
                    </p>

                    <div className="mt-4 grid gap-2 md:grid-cols-2">
                      <div className="rounded-xl border border-[#e5e7eb] bg-[#fafafa] px-3 py-3 text-sm text-[#4b5563]">
                        Summarize this space
                      </div>
                      <div className="rounded-xl border border-[#e5e7eb] bg-[#fafafa] px-3 py-3 text-sm text-[#4b5563]">
                        Create nodes from text
                      </div>
                      <div className="rounded-xl border border-[#e5e7eb] bg-[#fafafa] px-3 py-3 text-sm text-[#4b5563]">
                        Find related entities
                      </div>
                      <div className="rounded-xl border border-[#e5e7eb] bg-[#fafafa] px-3 py-3 text-sm text-[#4b5563]">
                        Explain graph structure
                      </div>
                    </div>

                    <div className="mt-5">
                      <AssistantMessageBubble
                        text={messages[0].text}
                        createdAt={messages[0].createdAt}
                      />
                    </div>
                  </div>
                ) : (
                  messages.map((message) =>
                    message.role === 'user' ? (
                      <UserMessageBubble
                        key={message.id}
                        text={message.text}
                        createdAt={message.createdAt}
                      />
                    ) : (
                      <AssistantMessageBubble
                        key={message.id}
                        text={message.text}
                        createdAt={message.createdAt}
                      />
                    )
                  )
                )}

                {isRunning && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl border border-[#e5e7eb] bg-white px-4 py-3 text-sm text-[#4b5563] shadow-sm">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-[#6366f1]" />
                        <span className="h-2 w-2 animate-pulse rounded-full bg-[#818cf8] [animation-delay:120ms]" />
                        <span className="h-2 w-2 animate-pulse rounded-full bg-[#a5b4fc] [animation-delay:240ms]" />
                        <span className="ml-2">Mujarrad is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </>
            )}
          </ThreadPrimitive.Viewport>

          <div className="border-t border-[#ececec] bg-white px-5 py-4">
            <div className="rounded-2xl border border-[#dbe1ea] bg-[#fbfcfe] px-3 py-2.5 shadow-sm">
              <ComposerPrimitive.Root className="flex items-end gap-3">
                <ComposerPrimitive.Input
                  onFocus={(e) => {
                    composerInputRef.current = e.currentTarget;
                  }}
                  onInput={(e) => autoResizeTextarea(e.currentTarget)}
                  onKeyDownCapture={(event) => {
                    if (event.key !== 'Enter') return;

                    const target = event.currentTarget as HTMLTextAreaElement;

                    if (event.shiftKey) {
                      event.preventDefault();
                      event.stopPropagation();
                      sendButtonRef.current?.click();
                      return;
                    }

                    event.preventDefault();
                    event.stopPropagation();

                    const start = target.selectionStart ?? 0;
                    const end = target.selectionEnd ?? 0;
                    const value = target.value ?? '';
                    const nextValue = value.slice(0, start) + '\n' + value.slice(end);

                    const nativeSetter = Object.getOwnPropertyDescriptor(
                      window.HTMLTextAreaElement.prototype,
                      'value'
                    )?.set;

                    nativeSetter?.call(target, nextValue);
                    target.dispatchEvent(new Event('input', { bubbles: true }));

                    requestAnimationFrame(() => {
                      target.selectionStart = target.selectionEnd = start + 1;
                    });
                  }}
                  placeholder="Message Mujarrad..."
                  className="min-h-[48px] max-h-[180px] flex-1 resize-none overflow-y-auto border-0 bg-transparent px-2 py-2 text-sm leading-6 text-[#111827] outline-none placeholder:text-[#9ca3af]"
                />
                <ComposerPrimitive.Send asChild>
                  <Button
                    ref={sendButtonRef}
                    className="h-11 rounded-xl bg-[#111827] px-4 text-white shadow-sm transition hover:bg-[#1f2937]"
                  >
                    <SendHorizontal className="h-4 w-4" />
                  </Button>
                </ComposerPrimitive.Send>
              </ComposerPrimitive.Root>


            </div>
          </div>
        </ThreadPrimitive.Root>
      </div>

      {renameTarget && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
            <div className="w-full max-w-md rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-2xl">
              <h3 className="text-lg font-semibold text-[#111827]">Rename conversation</h3>
              <p className="mt-1 text-sm text-[#6b7280]">
                Update the conversation title.
              </p>

              <input
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                className="mt-4 w-full rounded-xl border border-[#e5e7eb] bg-white px-3 py-2.5 text-sm text-[#111827] outline-none focus:border-[#c7d2fe] focus:ring-2 focus:ring-[#e0e7ff]"
                placeholder="Conversation title"
                autoFocus
              />

              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={closeRenameModal}
                  className="rounded-xl border border-[#e5e7eb] px-4 py-2 text-sm text-[#4b5563] transition hover:bg-[#f9fafb]"
                  type="button"
                >
                  Cancel
                </button>
                <button
                  onClick={submitRename}
                  disabled={isRenaming || !renameValue.trim()}
                  className="rounded-xl bg-[#111827] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1f2937] disabled:cursor-not-allowed disabled:opacity-50"
                  type="button"
                >
                  {isRenaming ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}

        {deleteTarget && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
            <div className="w-full max-w-md rounded-2xl border border-[#fecaca] bg-white p-5 shadow-2xl">
              <h3 className="text-lg font-semibold text-[#111827]">Delete conversation</h3>
              <p className="mt-1 text-sm leading-6 text-[#6b7280]">
                This will delete <span className="font-medium text-[#111827]">{deleteTarget.title}</span> and all of its stored messages.
              </p>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={closeDeleteModal}
                  className="rounded-xl border border-[#e5e7eb] px-4 py-2 text-sm text-[#4b5563] transition hover:bg-[#f9fafb]"
                  type="button"
                >
                  Cancel
                </button>
                <button
                  onClick={submitDelete}
                  disabled={isDeleting}
                  className="rounded-xl bg-[#dc2626] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#b91c1c] disabled:cursor-not-allowed disabled:opacity-50"
                  type="button"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

export function ChatPanel({
  spaceSlug = 'demo-rel-ui-fixed',
  title = 'Chat',
  embedded = false,
  onClose,
}: ChatPanelProps) {
  const agentServiceUrl = process.env.NEXT_PUBLIC_AGENT_SERVICE_URL;
  const queryClient = useQueryClient();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sessionSearchIndex, setSessionSearchIndex] = useState<Record<string, string>>({});
  const [sessionPreviewIndex, setSessionPreviewIndex] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Welcome to Mujarrad chat. This is the initial chat shell for Squad A.',
      createdAt: new Date().toISOString(),
    },
  ]);
  const [isRunning, setIsRunning] = useState(false);

  const conversationNodeIdRef = useRef<string | null>(null);
  const messageOrderRef = useRef<number>(1);


  const rebuildSessionSearchIndex = async (conversationSessions: ChatSession[]) => {
    const entries = await Promise.all(
      conversationSessions.map(async (session) => {
        const [searchText, preview] = await Promise.all([
          buildConversationSearchText(session.id, session.title),
          buildConversationPreview(session.id),
        ]);

        return {
          id: session.id,
          searchText,
          preview,
        };
      })
    );

    setSessionSearchIndex(
      Object.fromEntries(entries.map((entry) => [entry.id, entry.searchText]))
    );

    setSessionPreviewIndex(
      Object.fromEntries(entries.map((entry) => [entry.id, entry.preview]))
    );
  };


  const buildConversationSearchText = async (conversationId: string, conversationTitle: string) => {
    try {
      const attributes = await attributeService.getNodeAttributes(conversationId);

      const messageLinks = attributes.filter((attr) => attr.attributeName === 'contains');

      if (messageLinks.length === 0) {
        return conversationTitle.toLowerCase();
      }

      const messageNodes = await Promise.all(
        messageLinks.map((attr) => nodeService.getNode(spaceSlug, attr.targetNodeId))
      );

      const messageText = messageNodes
        .filter((node) => isMessageNode(node))
        .map((node) => node.content || '')
        .join(' ')
        .toLowerCase();

      return `${conversationTitle} ${messageText}`.toLowerCase();
    } catch {
      return conversationTitle.toLowerCase();
    }
  };
  
  const buildConversationPreview = async (conversationId: string): Promise<string> => {
    try {
      const attributes = await attributeService.getNodeAttributes(conversationId);

      const messageLinks = attributes
        .filter((attr) => attr.attributeName === 'contains')
        .sort((a, b) => {
          const aOrder =
            a.attributeValue && typeof a.attributeValue === 'object' && 'order' in a.attributeValue
              ? Number(a.attributeValue.order)
              : 0;
          const bOrder =
            b.attributeValue && typeof b.attributeValue === 'object' && 'order' in b.attributeValue
              ? Number(b.attributeValue.order)
              : 0;
          return bOrder - aOrder;
        });

      if (messageLinks.length === 0) return 'No messages yet';

      const latestMessage = await nodeService.getNode(spaceSlug, messageLinks[0].targetNodeId);
      const preview = (latestMessage.content || '').trim();

      if (!preview) return 'No messages yet';
      return preview.length > 90 ? `${preview.slice(0, 90)}…` : preview;
    } catch {
      return 'No messages yet';
    }
  };
  const createConversationSession = async (): Promise<string> => {
    const createdConversation = await nodeService.createNode(spaceSlug, {
      title: `Conversation ${new Date().toLocaleString()}`,
      nodeType: NodeType.REGULAR,
      content: '',
      nodeDetails: {
        showInSpaceList: false,
        createdFrom: 'chat',
        chatNodeType: 'conversation',
        role: 'conversation',
        sessionType: 'default',
        scope: 'account-space',
        spaceSlug,
      },
    });

    const newSession: ChatSession = {
      id: createdConversation.id,
      title: createdConversation.title,
      createdAt: createdConversation.createdAt,
      updatedAt: createdConversation.updatedAt,
    };

    setSessions((prev) => [newSession, ...prev]);
    setSessionSearchIndex((prev) => ({
      ...prev,
      [createdConversation.id]: createdConversation.title.toLowerCase(),
    }));

    setSessionPreviewIndex((prev) => ({
      ...prev,
      [createdConversation.id]: 'No messages yet',
    }));
    setActiveSessionId(createdConversation.id);
    conversationNodeIdRef.current = createdConversation.id;
    messageOrderRef.current = 1;

    return createdConversation.id;
  };

  const ensureConversationNode = async () => {
    if (conversationNodeIdRef.current) {
      return conversationNodeIdRef.current;
    }

    if (activeSessionId) {
      conversationNodeIdRef.current = activeSessionId;
      return activeSessionId;
    }

    return createConversationSession();
  };

  const persistMessageNode = async (
    conversationNodeId: string,
    role: 'user' | 'assistant',
    text: string
  ) => {
    const createdMessage = await nodeService.createNode(spaceSlug, {
      title: `${role === 'user' ? 'User' : 'Assistant'} Message ${Date.now()}`,
      nodeType: NodeType.REGULAR,
      content: text,
      nodeDetails: {
        showInSpaceList: false,
        createdFrom: 'chat',
        chatNodeType: 'message',
        role,
        conversationNodeId,
        messageType: role,
      },
    });

    await attributeService.createAttribute(conversationNodeId, {
      sourceNodeId: conversationNodeId,
      targetNodeId: createdMessage.id,
      attributeType: 'CUSTOM',
      attributeTypeMode: AttributeTypeMode.SCHEMALESS,
      attributeName: 'contains',
      attributeValue: {
        order: messageOrderRef.current++,
        relation: 'conversation',
      },
    });

    return createdMessage.id;
  };

  const loadSessionMessages = async (conversationId: string): Promise<ChatMessage[]> => {
    const attributes = await attributeService.getNodeAttributes(conversationId);

    const messageLinks = attributes
      .filter((attr) => attr.attributeName === 'contains')
      .sort((a, b) => {
        const aOrder =
          a.attributeValue && typeof a.attributeValue === 'object' && 'order' in a.attributeValue
            ? Number(a.attributeValue.order)
            : 0;
        const bOrder =
          b.attributeValue && typeof b.attributeValue === 'object' && 'order' in b.attributeValue
            ? Number(b.attributeValue.order)
            : 0;
        return aOrder - bOrder;
      });

    if (messageLinks.length === 0) {
      messageOrderRef.current = 1;
      return [];
    }

    const messageNodes = await Promise.all(
      messageLinks.map((attr) => nodeService.getNode(spaceSlug, attr.targetNodeId))
    );

    const hydratedMessages = messageNodes
      .filter((node) => isMessageNode(node))
      .map((node) => {
        const details = parseNodeDetails(node);
        const role = details?.role === 'assistant' ? 'assistant' : 'user';

        return {
          id: node.id,
          role,
          text: node.content || '',
          createdAt: node.createdAt || new Date().toISOString(),
        } as ChatMessage;
      });

    messageOrderRef.current = messageLinks.length + 1;
    return hydratedMessages;
  };

  const bootstrapSessions = async () => {
    setIsBootstrapping(true);

    try {
      const allNodes = await nodeService.getNodes(spaceSlug, { page: 1, size: 1000 });

      const conversationNodes = allNodes
        .filter((node) => isConversationNode(node))
        .sort(
          (a, b) =>
            new Date(b.updatedAt || b.createdAt).getTime() -
            new Date(a.updatedAt || a.createdAt).getTime()
        );

      const mappedSessions: ChatSession[] = conversationNodes.map((node) => ({
        id: node.id,
        title: node.title,
        createdAt: node.createdAt,
        updatedAt: node.updatedAt,
      }));

      setSessions(mappedSessions);
      await rebuildSessionSearchIndex(mappedSessions);

      if (conversationNodes.length === 0) {
        const createdId = await createConversationSession();
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            text: 'Welcome to Mujarrad chat. This is the initial chat shell for Squad A.',
            createdAt: new Date().toISOString(),
          },
        ]);
        setActiveSessionId(createdId);
        conversationNodeIdRef.current = createdId;
        return;
      }

      const latestSession = conversationNodes[0];
      setActiveSessionId(latestSession.id);
      conversationNodeIdRef.current = latestSession.id;

      const restoredMessages = await loadSessionMessages(latestSession.id);

      if (restoredMessages.length === 0) {
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            text: 'Welcome to Mujarrad chat. This is the initial chat shell for Squad A.',
            createdAt: new Date().toISOString(),
          },
        ]);
      } else {
        setMessages(restoredMessages);
      }
    } finally {
      setIsBootstrapping(false);
    }
  };

  const handleSelectSession = async (sessionId: string) => {
    setActiveSessionId(sessionId);
    conversationNodeIdRef.current = sessionId;
    setIsBootstrapping(true);

    try {
      const restoredMessages = await loadSessionMessages(sessionId);
      setMessages(
        restoredMessages.length > 0
          ? restoredMessages
          : [
              {
                id: 'welcome',
                role: 'assistant',
                text: 'Welcome to Mujarrad chat. This is the initial chat shell for Squad A.',
                createdAt: new Date().toISOString(),
              },
            ]
      );
    } finally {
      setIsBootstrapping(false);
    }
  };

  const handleNewSession = async () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        text: 'Welcome to Mujarrad chat. This is the initial chat shell for Squad A.',
        createdAt: new Date().toISOString(),
      },
    ]);
    setSearchTerm('');
    conversationNodeIdRef.current = null;
    setActiveSessionId(null);
    await createConversationSession();
    await refreshWorkspaceViews();
  };
  const renameSession = async (sessionId: string, newTitle: string) => {
    await nodeService.updateNode(spaceSlug, sessionId, {
      title: newTitle,
    });

    setSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId ? { ...session, title: newTitle } : session
      )
    );
    const updatedSearchText = await buildConversationSearchText(sessionId, newTitle);

    setSessionSearchIndex((prev) => ({
      ...prev,
      [sessionId]: updatedSearchText,
    }));

    const updatedPreview = await buildConversationPreview(sessionId);

    setSessionPreviewIndex((prev) => ({
      ...prev,
      [sessionId]: updatedPreview,
    }));

    await refreshWorkspaceViews();
  };
  useEffect(() => {
    bootstrapSessions();
  }, [spaceSlug]);

  const deleteSession = async (sessionId: string) => {
    const attributes = await attributeService.getNodeAttributes(sessionId);

    const messageLinks = attributes.filter((attr) => attr.attributeName === 'contains');

    await Promise.all(
      messageLinks.map(async (attr) => {
        try {
          await nodeService.deleteNode(spaceSlug, attr.targetNodeId, true);
        } catch {
          // ignore single message delete failure for now
        }
      })
    );

    await nodeService.deleteNode(spaceSlug, sessionId, true);

    const remainingSessions = sessions.filter((session) => session.id !== sessionId);
    setSessions(remainingSessions);
    setSessionSearchIndex((prev) => {
      const next = { ...prev };
      delete next[sessionId];
      return next;
    });

    setSessionPreviewIndex((prev) => {
      const next = { ...prev };
      delete next[sessionId];
      return next;
    });

    const wasActive = activeSessionId === sessionId;

    if (!wasActive) {
      await refreshWorkspaceViews();
      return;
    }

    if (remainingSessions.length > 0) {
      const nextSession = remainingSessions[0];
      setActiveSessionId(nextSession.id);
      conversationNodeIdRef.current = nextSession.id;

      const restoredMessages = await loadSessionMessages(nextSession.id);
      setMessages(
        restoredMessages.length > 0
          ? restoredMessages
          : [
              {
                id: 'welcome',
                role: 'assistant',
                text: 'Welcome to Mujarrad chat. This is the initial chat shell for Squad A.',
                createdAt: new Date().toISOString(),
              },
            ]
      );
    } else {
      conversationNodeIdRef.current = null;
      setActiveSessionId(null);
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          text: 'Welcome to Mujarrad chat. This is the initial chat shell for Squad A.',
          createdAt: new Date().toISOString(),
        },
      ]);
    }

    await refreshWorkspaceViews();
  };
  const refreshWorkspaceViews = async () => {
    await queryClient.invalidateQueries({
      queryKey: nodeKeys.list(spaceSlug, { page: 1, size: 1000 }),
    });

    await queryClient.invalidateQueries({
      queryKey: ['spaces', spaceSlug, 'graph-page', 'nodes'],
    });

    await queryClient.invalidateQueries({
      queryKey: ['spaces', spaceSlug, 'graph-page', 'node-attributes'],
    });

    await queryClient.invalidateQueries({
      queryKey: ['spaces', spaceSlug, 'graph-page', 'selected-node'],
    });

    await queryClient.invalidateQueries({
      queryKey: ['spaces', spaceSlug, 'graph-page', 'selected-node-attributes'],
    });
  };


  const runtime = useExternalStoreRuntime<ChatMessage>({
    messages,
    setMessages,
    isRunning,
    convertMessage: (message) => ({
      id: message.id,
      role: message.role,
      createdAt: message.createdAt,
      content: [
        {
          type: 'text',
          text: message.text,
        },
      ],
    }),
    onNew: async (message: AppendMessage) => {
      const firstPart = message.content[0];
      if (!firstPart || firstPart.type !== 'text') return;

      const userText = firstPart.text.trim();
      if (!userText) return;

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        text: userText,
        createdAt: new Date().toISOString(),
      };

      setMessages((current) => [...current, userMessage]);
      setIsRunning(true);

      try {
        const conversationNodeId = await ensureConversationNode();
        await persistMessageNode(conversationNodeId, 'user', userText);

        let assistantText = '';

        if (!agentServiceUrl) {
          assistantText = 'Agent service is not available yet. Squad B backend is not connected.';
        } else {
          try {
            const response = await fetch(`${agentServiceUrl}/api/agents/process`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                text: userText,
                space_slug: spaceSlug,
              }),
            });

            const data: AgentProcessResponse = await response.json();

            if (!response.ok || data.error) {
              assistantText = data.message || 'The agent service returned an error.';
            } else {
              assistantText = data.report || 'Your message was processed successfully.';
            }
          } catch {
            assistantText = 'Could not reach the agent service. Please try again.';
          }
        }

        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          text: assistantText,
          createdAt: new Date().toISOString(),
        };

        setMessages((current) => [...current, assistantMessage]);
        await persistMessageNode(conversationNodeId, 'assistant', assistantText);
        const activeSession = sessions.find((session) => session.id === conversationNodeId);
        if (activeSession) {
          const [updatedSearchText, updatedPreview] = await Promise.all([
            buildConversationSearchText(conversationNodeId, activeSession.title),
            buildConversationPreview(conversationNodeId),
          ]);

          setSessionSearchIndex((prev) => ({
            ...prev,
            [conversationNodeId]: updatedSearchText,
          }));

          setSessionPreviewIndex((prev) => ({
            ...prev,
            [conversationNodeId]: updatedPreview,
          }));
        }
        await refreshWorkspaceViews();
      } finally {
        setIsRunning(false);
      }
    },
  });
  const filteredSessions = sessions.filter((session) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;

    const indexedText = sessionSearchIndex[session.id] || session.title.toLowerCase();
    return indexedText.includes(term);
  });
  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <ChatPanelShell
        isRunning={isRunning}
        title={title}
        spaceSlug={spaceSlug}
        embedded={embedded}
        onClose={onClose}
        messageCount={messages.length}
        messages={messages}
        sessionPreviewIndex={sessionPreviewIndex}
        sessions={filteredSessions}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
        onRenameSession={renameSession}
        onDeleteSession={deleteSession}
        isBootstrapping={isBootstrapping}
      />
    </AssistantRuntimeProvider>
  );
}