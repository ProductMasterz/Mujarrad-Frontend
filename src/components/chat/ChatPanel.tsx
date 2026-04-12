'use client';

import { useEffect, useRef, useState } from 'react';
import {
  AssistantRuntimeProvider,
  ComposerPrimitive,
  ThreadPrimitive,
  useExternalStoreRuntime,
  type AppendMessage,
} from '@assistant-ui/react';
import { Copy, Check, SendHorizontal, X, Pencil, Trash2, PanelLeftClose, PanelLeftOpen, SquarePen, Search } from 'lucide-react';
import { nodeService } from '@/services/api/node.service';
import { attributeService } from '@/services/api/attribute.service';
import { Button } from '@/components/ui/button';
import { AttributeTypeMode, NodeType, type Node as BackendNode } from '@/types/backend-dtos';
import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer';
import { useQueryClient } from '@tanstack/react-query';
import { nodeKeys } from '@/hooks/api';
import { useAuthStore } from '@/stores/auth.store';
import { useNotificationStore } from '@/stores/notificationStore';

type AgentProcessNode = Record<string, unknown>;
type AgentProcessRelationship = Record<string, unknown>;

type AgentProcessResponse = {
  nodes?: AgentProcessNode[];
  relationships?: AgentProcessRelationship[];
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
  onChangeSpace?: (nextSpaceSlug: string) => void;
  availableSpaces?: Array<{ id: string; name: string; slug: string }>;
}

function parseNodeDetails(node: BackendNode): Record<string, unknown> | undefined {
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

function isConversationNode(node: BackendNode): boolean {
  const details = parseNodeDetails(node);

  return (
    details?.chatNodeType === 'conversation' ||
    (details?.createdFrom === 'chat' && details?.role === 'conversation')
  );
}

function isMessageNode(node: BackendNode): boolean {
  const details = parseNodeDetails(node);

  return (
    details?.chatNodeType === 'message' ||
    (details?.createdFrom === 'chat' &&
      (details?.role === 'user' || details?.role === 'assistant'))
  );
}

function getAgentSummary(data: AgentProcessResponse | null) {
  const nodes = Array.isArray(data?.nodes) ? data!.nodes : [];
  const relationships = Array.isArray(data?.relationships) ? data!.relationships : [];
  const report = typeof data?.report === 'string' ? data.report : '';
  const message = typeof data?.message === 'string' ? data.message : '';
  const code = typeof data?.code === 'string' ? data.code : '';

  return {
    nodes,
    relationships,
    report,
    message,
    code,
  };
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

function CopyMessageButton({
  text,
  getText,
}: {
  text?: string;
  getText?: () => string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const value = getText ? getText() : text || '';
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-background/70 text-muted-foreground transition hover:bg-background hover:text-foreground"
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
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              You
            </span>
            <span className="text-[11px] text-muted-foreground">
              {formatMessageTime(createdAt)}
            </span>
          </div>

          <div className="group rounded-[13px] rounded-br-[8px] bg-primary text-primary-foreground px-4 py-3 text-[12px] leading-5 text-white shadow-sm transition-all duration-200 hover:shadow-md">
            <div className="whitespace-pre-wrap break-words">{text}</div>
            <div className="mt-3 flex justify-end">
              <CopyMessageButton text={text} />
            </div>
          </div>
        </div>

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700 shadow-sm dark:bg-blue-900/40 dark:text-blue-200">
          Y
        </div>
      </div>

    </div>
  );
}
function formatAssistantContent(text: string) {
  if (!text) return text;

  let formatted = text.trim();

  const isPipelineReport = /MUSGHI PIPELINE REPORT/i.test(formatted);
  if (!isPipelineReport) return formatted;

  formatted = formatted.replace(/^={3,}\s*$/gm, '');
  formatted = formatted.replace(/^-{3,}\s*$/gm, '');

  formatted = formatted.replace(
    /^MUSGHI PIPELINE REPORT\s*-\s*(.+)$/gim,
    '## Musghi Pipeline Report\n\n**Message ID:** $1'
  );

  formatted = formatted.replace(
    /^Space:\s*(.+?)\s+Input:\s*(.+)$/gim,
    '**Space:** $1\n\n**Input:** $2'
  );

  formatted = formatted.replace(/^SPACE OVERVIEW$/gm, '### Space Overview');
  formatted = formatted.replace(/^FOCUS AREAS$/gm, '### Focus Areas');
  formatted = formatted.replace(/^MOST CONNECTED NODES$/gm, '### Most Connected Nodes');
  formatted = formatted.replace(/^KEY FINDINGS$/gm, '### Key Findings');
  formatted = formatted.replace(/^EXTRACTED ENTITIES$/gm, '### Extracted Entities');
  formatted = formatted.replace(/^IDENTIFIED RELATIONSHIPS.*$/gm, '### Identified Relationships');
  formatted = formatted.replace(/^TRACEABILITY LINKS.*$/gm, '### Traceability Links');
  formatted = formatted.replace(/^MUJARRAD ATTRIBUTES$/gm, '### Mujarrad Attributes');
  formatted = formatted.replace(/^INTERPRETATION$/gm, '### Interpretation');

  formatted = formatted.replace(/^\s*•\s+/gm, '- ');
  formatted = formatted.replace(/^\s*→\s+/gm, '- ');
  formatted = formatted.replace(/^\s*\*\s+/gm, '- ');

  formatted = formatted.replace(
    /^\s*\[(.+?)\]\s+(.+?)\s+→\s+(.+?)$/gm,
    '- **$1**: $2 → $3'
  );

  formatted = formatted.replace(
    /^\s*(PERSON|PLACE|ACTION|TOPIC|EVENT)\s+\((\d+)\)$/gm,
    '#### $1 ($2)'
  );

  formatted = formatted.replace(
    /### Extracted Entities\s*(?=###|$)/gms,
    '### Extracted Entities\n\n_No entities extracted._\n\n'
  );

  formatted = formatted.replace(
    /### Traceability Links\s*(?=###|$)/gms,
    '### Traceability Links\n\n_No traceability links._\n\n'
  );

  formatted = formatted.replace(/\n{3,}/g, '\n\n');

  return formatted.trim();
}

function AssistantMessageBubble({
  text,
  createdAt,
}: {
  text: string;
  createdAt: string;
}) {
  const formattedText = formatAssistantContent(text);
  const renderedContentRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="flex justify-start">
      <div className="flex max-w-[85%] items-end gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-700 shadow-sm dark:bg-violet-900/40 dark:text-violet-200">
          M
        </div>

        <div className="flex flex-col items-start">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Mujarrad
            </span>
            <span className="text-[11px] text-muted-foreground">
              {formatMessageTime(createdAt)}
            </span>
          </div>

          <div className="group rounded-[18px] rounded-bl-[10px] border border-border bg-muted px-4 py-3 shadow-sm transition-all duration-200 hover:shadow-md">
            <div
              ref={renderedContentRef}
              className="text-[12px] leading-5 text-foreground [&_*]:text-[12px] [&_*]:leading-5 [&_*]:text-foreground [&_a]:text-blue-600 dark:[&_a]:text-blue-400 [&_a]:underline [&_code]:rounded [&_code]:bg-background [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[12px] [&_code]:text-foreground [&_p]:my-2 [&_li]:mb-1 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_h1]:mb-2 [&_h1]:mt-3 [&_h1]:text-[12px] [&_h1]:font-semibold [&_h2]:mb-2 [&_h2]:mt-3 [&_h2]:text-[12px] [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:mt-3 [&_h3]:text-[12px] [&_h3]:font-semibold [&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-slate-700 [&_pre]:bg-slate-950 [&_pre]:p-4 [&_pre]:text-[12px] [&_pre]:text-white"
            >
              <MarkdownRenderer content={formattedText} />
            </div>

            <div className="mt-3 flex justify-end">
              <CopyMessageButton
                getText={() => renderedContentRef.current?.innerText?.trim() || ''}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatPanelShell({
  hasActiveSpace,
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
  availableSpaces,
  onChangeSpace,
}: {
  hasActiveSpace: boolean;
  isRunning: boolean;
  title: string;
  spaceSlug?: string;
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
  availableSpaces: Array<{ id: string; name: string; slug: string }>;
  onChangeSpace?: (nextSpaceSlug: string) => void;
}) {
  const [showSpaceMenu, setShowSpaceMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(240);
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
  const spaceMenuRef = useRef<HTMLDivElement | null>(null);
  const autoResizeTextarea = (el: HTMLTextAreaElement) => {
    el.style.height = '0px';
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  };

  const currentSpaceName =
    availableSpaces.find((space) => space.slug === spaceSlug)?.name ||
    (spaceSlug?.trim() ? spaceSlug : 'No space selected');


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
    setShowSpaceMenu(false);
  }, [spaceSlug]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        spaceMenuRef.current &&
        !spaceMenuRef.current.contains(event.target as globalThis.Node)
      ) {
        setShowSpaceMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
    <div
      ref={panelRef}
      className={`relative flex h-full overflow-hidden rounded-[24px] bg-background text-foreground ${embedded ? '' : ''}`}
    >
      
      {sidebarOpen && (
        <div
          className="relative flex shrink-0 flex-col border-r border-border bg-muted/40"
          style={{ width: `${sidebarWidth}px` }}
        >

          <div className="flex items-center justify-between border-b border-border px-3 py-3 pr-5">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Chats
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">
                {sessions.length} conversation{sessions.length === 1 ? '' : 's'}
              </div>
            </div>

            <button
              onClick={onNewSession}
              disabled={!hasActiveSpace}
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-foreground text-background shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="New chat"
              title="New chat"
            >
              <SquarePen className="h-4 w-4" />
            </button>
          </div>

          <div className="border-b px-3 py-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={searchTerm}
                onChange={(e) => onSearchTermChange(e.target.value)}
                disabled={!hasActiveSpace}
                placeholder="Search conversations..."
                className="w-full rounded-xl border border-border bg-background py-2.5 pl-9 pr-3 text-sm text-foreground shadow-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
                type="text"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 scroll-smooth">
            {sessions.length === 0 && (
              <div className="rounded-xl border border-dashed border-border bg-background px-3 py-6 text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  {!hasActiveSpace
                    ? 'No space selected'
                    : searchTerm.trim()
                    ? 'No matching conversations'
                    : 'No conversations yet'}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {!hasActiveSpace
                    ? 'Open a space to view or create conversations.'
                    : searchTerm.trim()
                    ? 'Try a different keyword.'
                    : 'Start a new chat to begin building context.'}
                </p>
              </div>
            )}
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`group relative mb-2 rounded-2xl border px-3 py-3 text-left text-sm transition ${
                  activeSessionId === session.id
                    ? 'border-primary/30 bg-primary/5 shadow-[0px_8px_20px_rgba(59,130,246,0.10)]'
                    : 'border-transparent bg-background hover:border-border hover:bg-muted/50'
                }`}
                title={`${session.title} — Created ${new Date(session.createdAt).toLocaleString()}`}
              >
                {activeSessionId === session.id && (
                  <div className="absolute bottom-2 left-0 top-2 w-1 rounded-r-full bg-primary"/>
                )}

                <button
                  onClick={() => onSelectSession(session.id)}
                  className="w-full text-left"
                  type="button"
                >
                  <div className="truncate text-sm font-semibold text-foreground">
                    {session.title}
                  </div>
                  <div className="mt-1 line-clamp-2 text-[12px] leading-5 text-muted-foreground">
                    {sessionPreviewIndex[session.id] || 'No messages yet'}
                  </div>
                </button>

                <div className="mt-1 flex items-center justify-between gap-2">
                  <div className="truncate text-[11px] text-muted-foreground">
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
                      className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40 dark:hover:text-blue-300"
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
                      className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-300"
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
              className="absolute -right-4 top-4 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>

            <div
              onMouseDown={handleResizeStart}
              className="absolute right-0 top-0 h-full w-1 cursor-col-resize bg-transparent hover:bg-border"
            />
          </>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-border bg-background px-5 py-4 shadow-[0_1px_0_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-2">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition hover:bg-muted hover:text-foreground"
                type="button"
                aria-label="Show chats"
                title="Show chats"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </button>
            )}

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-foreground">{title}</h2>
              </div>
              <div ref={spaceMenuRef} className="relative mt-1 text-xs text-muted-foreground">
                Space:{' '}
                <button
                  type="button"
                  onClick={() => setShowSpaceMenu((prev) => !prev)}
                  className="font-medium text-foreground underline-offset-2 hover:underline"
                >
                  {currentSpaceName}
                </button>

                {showSpaceMenu && (
                  <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-[260px] rounded-2xl border border-border bg-background p-2 shadow-2xl">
                    <div className="mb-2 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Switch space
                    </div>

                    <div className="max-h-[240px] overflow-y-auto">
                      {availableSpaces.length === 0 ? (
                        <div className="px-2 py-2 text-sm text-muted-foreground">
                          No spaces available
                        </div>
                      ) : (
                        availableSpaces.map((space) => (
                          <button
                            key={space.id}
                            type="button"
                            onClick={() => {
                              setShowSpaceMenu(false);
                              if (space.slug !== spaceSlug) {
                                onChangeSpace?.(space.slug);
                              }
                            }}
                            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition hover:bg-muted ${
                              space.slug === spaceSlug ? 'bg-muted font-medium text-foreground' : 'text-foreground'
                            }`}
                          >
                            <span className="truncate">{space.name}</span>
                            {space.slug === spaceSlug && (
                              <span className="ml-2 text-[11px] text-muted-foreground">Current</span>
                            )}
                          </button>
                        ))
                      )}
                    </div>

              
                  </div>
                )}
              </div>
            </div>
          </div>

          {embedded && onClose && (
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
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
            className="flex-1 space-y-5 overflow-y-auto bg-[linear-gradient(180deg,hsl(var(--muted)/0.35)_0%,hsl(var(--background))_40%)] px-5 py-5 scroll-smooth">
            {isBootstrapping ? (
              <div className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground shadow-sm">
                Loading chat history...
              </div>
            ) : (
              <>
                {messages.length === 1 && messages[0]?.id === 'welcome' ? (
                  <div className="rounded-[28px] border border-border bg-background px-6 py-6 shadow-sm">
                    <div className="mb-2 text-sm font-semibold text-foreground">
                      {hasActiveSpace ? 'Start building in this space' : 'Open a space to begin'}
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {hasActiveSpace
                        ? 'Use chat to explore the graph, create nodes, connect entities, or summarize what already exists in this space.'
                        : 'Open any space first, then use chat to explore and build inside that space.'}
                    </p>

                    <div className="mt-4 grid gap-2 md:grid-cols-2">
                      <div className="rounded-xl border border-border bg-muted/40 px-3 py-3 text-sm text-foreground">
                        Summarize this space
                      </div>
                      <div className="rounded-xl border border-border bg-muted/40 px-3 py-3 text-sm text-foreground">
                        Create nodes from text
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
                    <div className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground shadow-sm">
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

          <div className="border-t border-border bg-background px-5 py-4">
            <div className="rounded-[22px] border border-border bg-muted/30 px-3 py-2.5 shadow-sm">
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
                  disabled={!hasActiveSpace}
                  placeholder={hasActiveSpace ? 'Message Mujarrad...' : 'Open a space to start chatting...'}
                  className="min-h-[48px] max-h-[180px] flex-1 resize-none overflow-y-auto border-0 bg-transparent px-2 py-2 text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:text-muted-foreground"
                />
                <ComposerPrimitive.Send asChild>
                  <Button
                    ref={sendButtonRef}
                    disabled={!hasActiveSpace}
                    className="h-11 rounded-xl bg-foreground px-4 text-background shadow-sm transition hover:opacity-90 disabled:opacity-50"
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
            <div className="w-full max-w-md rounded-[24px] border border-border bg-background p-5 shadow-2xl">
              <h3 className="text-lg font-semibold text-foreground">Rename conversation</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Update the conversation title.
              </p>

              <input
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                className="mt-4 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Conversation title"
                autoFocus
              />

              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={closeRenameModal}
                  className="rounded-xl border border-border px-4 py-2 text-sm text-foreground transition hover:bg-muted"
                  type="button"
                >
                  Cancel
                </button>
                <button
                  onClick={submitRename}
                  disabled={isRenaming || !renameValue.trim()}
                  className="rounded-xl bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
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
            <div className="w-full max-w-md rounded-[24px] border border-red-200 bg-background p-5 shadow-2xl dark:border-red-900/50">
              <h3 className="text-lg font-semibold text-foreground">Delete conversation</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                This will delete <span className="font-medium text-foreground">{deleteTarget.title}</span> and all of its stored messages.
              </p>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={closeDeleteModal}
                  className="rounded-xl border border-border px-4 py-2 text-sm text-foreground transition hover:bg-muted"
                  type="button"
                >
                  Cancel
                </button>
                <button
                  onClick={submitDelete}
                  disabled={isDeleting}
                  className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
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
  spaceSlug,
  title = 'Chat',
  embedded = false,
  onClose,
  onChangeSpace,
  availableSpaces = [],
}: ChatPanelProps) {
  const addNotification = useNotificationStore((state) => state.addNotification);
  const token = useAuthStore((state) => state.token);
  const hasActiveSpace = !!spaceSlug?.trim();
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
      text: 'Welcome to Mujarrad chat. Ask questions, create nodes, and explore your space.',
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
    if (!spaceSlug) return conversationTitle.toLowerCase();
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
    if (!spaceSlug) return 'No messages yet';

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

      const rawPreview = (latestMessage.content || '').trim();
      if (!rawPreview) return 'No messages yet';

      const formattedPreview =
        latestMessage.nodeDetails &&
        typeof latestMessage.nodeDetails === 'object' &&
        'role' in latestMessage.nodeDetails &&
        latestMessage.nodeDetails.role === 'assistant'
          ? formatAssistantContent(rawPreview)
          : rawPreview;

      const plainPreview = formattedPreview
        .replace(/[#*_>`~-]/g, '')
        .replace(/\n+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      return plainPreview.length > 90 ? `${plainPreview.slice(0, 90)}…` : plainPreview;
    } catch {
      return 'No messages yet';
    }
  };

  const createConversationSession = async (): Promise<string> => {
    if (!spaceSlug) throw new Error('spaceSlug is required');
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
    if (!spaceSlug) return null;

    if (conversationNodeIdRef.current) {
      return conversationNodeIdRef.current;
    }

    if (activeSessionId) {
      conversationNodeIdRef.current = activeSessionId;
      return activeSessionId;
    }

    return await createConversationSession();
  };

  const persistMessageNode = async (
    conversationNodeId: string,
    role: 'user' | 'assistant',
    text: string
  ) => {
    if (!spaceSlug) throw new Error('spaceSlug is required');

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
    if (!spaceSlug) return [];
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
      if (!spaceSlug) {
        setIsBootstrapping(false);
        return;
        }
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
    if (!spaceSlug) return;
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
    if (!spaceSlug) return;
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
    addNotification({
      type: 'info',
      source: 'chat',
      title: 'New conversation',
      description: 'A new chat session was started.',
    });
    
    await refreshWorkspaceViews();
  };
  const renameSession = async (sessionId: string, newTitle: string) => {
    if (!spaceSlug) return;
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
    if (!hasActiveSpace) {
      setSessions([]);
      setActiveSessionId(null);
      setSessionSearchIndex({});
      setSessionPreviewIndex({});
      setSearchTerm('');
      conversationNodeIdRef.current = null;
      messageOrderRef.current = 1;
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          text: 'Open a space to start chatting in context.',
          createdAt: new Date().toISOString(),
        },
      ]);
      setIsBootstrapping(false);
      return;
    }

    setSessions([]);
    setActiveSessionId(null);
    setSessionSearchIndex({});
    setSessionPreviewIndex({});
    setSearchTerm('');
    conversationNodeIdRef.current = null;
    messageOrderRef.current = 1;
    setIsBootstrapping(true);

    bootstrapSessions();
  }, [spaceSlug, hasActiveSpace]);

  const deleteSession = async (sessionId: string) => {
    if (!spaceSlug) return;
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
    const deletedSessionTitle =
      sessions.find((session) => session.id === sessionId)?.title || 'Conversation';

    addNotification({
      type: 'warning',
      source: 'chat',
      title: 'Conversation deleted',
      description: `${deletedSessionTitle} was removed.`,
    });

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
    if (!spaceSlug) return;

    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: nodeKeys.list(spaceSlug, { page: 1, size: 1000 }),
      }),
      queryClient.invalidateQueries({
        queryKey: ['spaces'],
      }),
      queryClient.invalidateQueries({
        queryKey: ['spaces', spaceSlug, 'graph-page', 'nodes'],
      }),
      queryClient.invalidateQueries({
        queryKey: ['spaces', spaceSlug, 'graph-page', 'node-attributes'],
      }),
      queryClient.invalidateQueries({
        queryKey: ['spaces', spaceSlug, 'graph-page', 'selected-node'],
      }),
      queryClient.invalidateQueries({
        queryKey: ['spaces', spaceSlug, 'graph-page', 'selected-node-attributes'],
      }),
    ]);
  };

  const handleRuntimeMessagesChange = (nextMessages: readonly ChatMessage[]) => {
    setMessages([...nextMessages]);
  };

  const runtime = useExternalStoreRuntime<ChatMessage>({
    messages,
    setMessages: handleRuntimeMessagesChange,
    isRunning,
    convertMessage: (message) => ({
      id: message.id,
      role: message.role,
      createdAt: new Date(message.createdAt),
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

      if (!hasActiveSpace) {
        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          text: 'No space is currently open. Please open a space first to use this chat.',
          createdAt: new Date().toISOString(),
        };

        setMessages((current) => [...current, assistantMessage]);
        setIsRunning(false);
        return;
      }

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
          if (!conversationNodeId) {
            throw new Error('Could not create or resolve conversation node.');
          }

          const inputMessageNodeId = await persistMessageNode(
            conversationNodeId,
            'user',
            userText
          );

        let assistantText = '';

        if (!agentServiceUrl) {
          assistantText = 'Agent service is not available yet. Squad B backend is not connected.';
        } else {
          try {
            console.log('CHAT TOKEN FROM STORE:', token);
            console.log('AUTH STORE SNAPSHOT:', useAuthStore.getState());
            const response = await fetch(`${agentServiceUrl}/api/agents/process`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: JSON.stringify({
                text: userText,
                space_slug: spaceSlug,
              }),
            });
            let data: AgentProcessResponse | null = null;

            try {
              data = await response.json();
            } catch {
              data = null;
            }

            const { nodes, relationships, report, message, code } = getAgentSummary(data);

            console.log('Agent /process response:', {
              ok: response.ok,
              status: response.status,
              code,
              nodesCount: nodes.length,
              relationshipsCount: relationships.length,
              data,
            });

            if (!response.ok || data?.error) {
              assistantText = message || 'The agent service returned an error.';

            } else {
              assistantText =
                report ||
                `Processed successfully. Returned ${nodes.length} nodes and ${relationships.length} relationships.`;
            }
            if (response.ok && !data?.error) {
              addNotification({
                type: 'success',
                source: 'chat',
                title: 'Chat analyzed',
                description:
                  nodes.length > 0 || relationships.length > 0
                    ? `${nodes.length} candidate node${nodes.length === 1 ? '' : 's'} and ${relationships.length} candidate relationship${relationships.length === 1 ? '' : 's'} returned by the agent.`
                    : 'The agent finished processing your message.',
              });
            }
          } catch (error) {
            console.error('Could not reach the agent service:', error);
            assistantText = 'Could not reach the agent service. Please try again.';

            addNotification({
              type: 'error',
              source: 'chat',
              title: 'Agent unavailable',
              description: 'Could not reach the agent service.',
            });
          }
        }

        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          text: assistantText,
          createdAt: new Date().toISOString(),
        };

        setMessages((current) => [...current, assistantMessage]);

        const assistantMessageNodeId = await persistMessageNode(
          conversationNodeId,
          'assistant',
          assistantText
        );

        await attributeService.createAttribute(inputMessageNodeId, {
          sourceNodeId: inputMessageNodeId,
          targetNodeId: assistantMessageNodeId,
          attributeType: 'CUSTOM',
          attributeTypeMode: AttributeTypeMode.SCHEMALESS,
          attributeName: 'assistant_reply',
          attributeValue: {
            relation: 'reply_to_input',
          },
        });
        
        
        const conversationNode = sessions.find((session) => session.id === conversationNodeId);

        const conversationTitle =
          conversationNode?.title || `Conversation ${new Date().toLocaleString()}`;

        const [updatedSearchText, updatedPreview] = await Promise.all([
          buildConversationSearchText(conversationNodeId, conversationTitle),
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
        hasActiveSpace={hasActiveSpace}
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
        availableSpaces={availableSpaces}
        onChangeSpace={onChangeSpace}
      />
    </AssistantRuntimeProvider>
  );
}