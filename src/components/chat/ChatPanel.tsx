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
import { Copy, Check, SendHorizontal, X } from 'lucide-react';
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
  return details?.chatNodeType === 'conversation';
}

function isMessageNode(node: Node): boolean {
  const details = parseNodeDetails(node);
  return details?.chatNodeType === 'message';
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
      className="ml-2 inline-flex items-center gap-1 rounded-md border bg-white/80 px-2 py-1 text-xs text-gray-700 transition hover:bg-white"
      aria-label="Copy message"
      title={copied ? 'Copied' : 'Copy'}
      type="button"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5" />
          Copied
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          Copy
        </>
      )}
    </button>
  );
}

function UserMessage() {
  return (
    <MessagePrimitive.Root className="flex justify-end">
      <div className="flex max-w-[85%] items-start gap-2">
        <MessagePrimitive.Content
          components={{
            Text: ({ text }) => (
              <>
                <div className="rounded-2xl bg-primary px-4 py-3 text-sm text-primary-foreground">
                  {text}
                </div>
                <CopyMessageButton text={text} />
              </>
            ),
          }}
        />
      </div>
    </MessagePrimitive.Root>
  );
}

function AssistantMessage() {
  return (
    <MessagePrimitive.Root className="flex justify-start">
      <div className="flex max-w-[85%] items-start gap-2">
        <MessagePrimitive.Content
          components={{
            Text: ({ text }) => (
              <>
                <div className="rounded-2xl bg-gray-200 px-4 py-3 !text-black">
                  <div className="!text-black [&_*]:!text-black [&_p]:my-2 [&_h1]:my-3 [&_h1]:text-xl [&_h1]:font-bold [&_h2]:my-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:my-2 [&_h3]:font-semibold [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-black [&_pre]:p-3 [&_pre]:!text-white [&_code]:rounded [&_code]:bg-gray-300 [&_code]:px-1 [&_code]:py-0.5 [&_code]:!text-black [&_a]:!text-blue-700 [&_a]:underline">
                    <MarkdownRenderer content={text} />
                  </div>
                </div>
                <CopyMessageButton text={text} />
              </>
            ),
          }}
        />
      </div>
    </MessagePrimitive.Root>
  );
}

function ChatPanelShell({
  isRunning,
  title,
  embedded,
  onClose,
  messageCount,
  sessions,
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
  embedded: boolean;
  onClose?: () => void;
  messageCount: number;
  sessions: ChatSession[];
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
  const [sidebarWidth, setSidebarWidth] = useState(220);
  const isResizingRef = useRef(false);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const sendButtonRef = useRef<HTMLButtonElement | null>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const panelRef = useRef<HTMLDivElement | null>(null);
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
    <div ref={panelRef} className={`flex h-full ${embedded ? 'bg-white' : ''}`}>
      {sidebarOpen && (
        <div
          className="relative shrink-0 border-r bg-[#fafafa] flex flex-col"
          style={{ width: `${sidebarWidth}px` }}
        >
          <div className="border-b px-3 py-3">
            <Button
              onClick={onNewSession}
              type="button"
              className="w-full justify-center rounded-xl bg-[#111827] text-white shadow-sm transition hover:bg-[#1f2937]"
            >
              New chat
            </Button>
          </div>
          <div className="border-b px-3 py-3">
            <input
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              placeholder="Search conversations..."
              className="w-full rounded-md border border-[#e5e7eb] bg-white px-3 py-2 text-sm outline-none focus:border-[#c7d2fe] focus:ring-2 focus:ring-[#e0e7ff]"
              type="text"
            />
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {sessions.length === 0 && (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                No conversations found
              </div>
            )}
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`mb-2 rounded-xl border px-3 py-3 text-left text-sm transition ${
                  activeSessionId === session.id
                    ? 'border-[#c7d2fe] bg-[#eef2ff] shadow-sm'
                    : 'border-transparent bg-white hover:border-[#e5e7eb] hover:bg-[#fafafa]'
                }`}
                title={`${session.title} — Created ${new Date(session.createdAt).toLocaleString()}`}
              >
                <button
                  onClick={() => onSelectSession(session.id)}
                  className="w-full text-left"
                  type="button"
                >
                  <div className="truncate">{session.title}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {new Date(session.createdAt).toLocaleDateString()}
                  </div>
                </button>

                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      const nextTitle = window.prompt('Rename chat session', session.title);
                      if (!nextTitle || !nextTitle.trim()) return;
                      await onRenameSession(session.id, nextTitle.trim());
                    }}
                    className="inline-flex items-center rounded-md border border-[#dbeafe] bg-[#eff6ff] px-2 py-1 text-xs font-medium text-[#2563eb] transition hover:bg-[#dbeafe]"
                    type="button"
                  >
                    Rename
                  </button>

                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      const confirmed = window.confirm('Delete this conversation and all its messages?');
                      if (!confirmed) return;
                      await onDeleteSession(session.id);
                    }}
                    className="inline-flex items-center rounded-md border border-[#fecaca] bg-[#fef2f2] px-2 py-1 text-xs font-medium text-[#dc2626] transition hover:bg-[#fee2e2]"
                    type="button"
                  >
                    Delete
                  </button>
                </div>

              </div>
            ))}
          </div>

          <div
            onMouseDown={handleResizeStart}
            className="absolute right-0 top-0 h-full w-1 cursor-col-resize bg-transparent hover:bg-gray-300"
          />
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-[#ececec] px-4 py-4 bg-white">          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="inline-flex items-center rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm font-medium text-[#4b5563] transition hover:bg-[#f9fafb] hover:text-[#111827]"
              type="button"
            >
              {sidebarOpen ? 'Hide chats' : 'Show chats'}
            </button>

            <div>
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="text-xs text-muted-foreground">
                Interact with Mujarrad through text.
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
            className="flex-1 space-y-4 overflow-y-auto p-4"
          >
            {isBootstrapping ? (
              <div className="text-sm text-muted-foreground">
                Loading chat history...
              </div>
            ) : (
              <>
                <ThreadPrimitive.Messages
                  components={{
                    UserMessage,
                    AssistantMessage,
                  }}
                />

                {isRunning && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-2xl bg-muted px-4 py-3 text-sm text-foreground">
                      Processing...
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </>
            )}
          </ThreadPrimitive.Viewport>

          <div className="border-t p-4">
            <ComposerPrimitive.Root className="flex items-end gap-3">
              <ComposerPrimitive.Input
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
                placeholder="Type your message..."
                className="min-h-[56px] flex-1 resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none"
              />
              <ComposerPrimitive.Send asChild>
                <Button ref={sendButtonRef} className="gap-2">
                  <SendHorizontal className="h-4 w-4" />
                  Send
                </Button>
              </ComposerPrimitive.Send>
            </ComposerPrimitive.Root>
          </div>
        </ThreadPrimitive.Root>
      </div>
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
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Welcome to Mujarrad chat. This is the initial chat shell for Squad A.',
    },
  ]);
  const [isRunning, setIsRunning] = useState(false);

  const conversationNodeIdRef = useRef<string | null>(null);
  const messageOrderRef = useRef<number>(1);


  const rebuildSessionSearchIndex = async (conversationSessions: ChatSession[]) => {
  const entries = await Promise.all(
    conversationSessions.map(async (session) => {
      const text = await buildConversationSearchText(session.id, session.title);
      return [session.id, text] as const;
    })
  );

  setSessionSearchIndex(Object.fromEntries(entries));
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

  const createConversationSession = async (): Promise<string> => {
    const createdConversation = await nodeService.createNode(spaceSlug, {
      title: `Chat ${new Date().toLocaleString()}`,
      nodeType: NodeType.REGULAR,
      content: '',
      nodeDetails: {
        showInSpaceList: false,
        chatNodeType: 'conversation',
        createdFrom: 'assistant-ui',
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
    setSessionSearchIndex((prev) => ({...prev,
      [createdConversation.id]: createdConversation.title.toLowerCase(),
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
        chatNodeType: 'message',
        role,
        conversationNodeId,
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
        };

        setMessages((current) => [...current, assistantMessage]);
        await persistMessageNode(conversationNodeId, 'assistant', assistantText);
        const activeSession = sessions.find((session) => session.id === conversationNodeId);          if (activeSession) {
            const updatedSearchText = await buildConversationSearchText(
              conversationNodeId,
              activeSession.title
            );

            setSessionSearchIndex((prev) => ({
              ...prev,
              [conversationNodeId]: updatedSearchText,
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
        embedded={embedded}
        onClose={onClose}
        messageCount={messages.length}
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