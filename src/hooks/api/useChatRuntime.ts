'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { AppendMessage, useExternalStoreRuntime } from '@assistant-ui/react';

import { nodeService } from '@/services/api/node.service';
import { NodeType, UpdateNodeRequest } from '@/types';
import { useSearchNodes } from './useSearchNodes';
import { useCreateNode } from './useCreateNode';

// -------------------- helpers --------------------
function formatConversationTitle(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
}

function extractText(content: any): string {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) return content.map((p) => p?.text || '').join('');
  return '';
}

type StoredMessage = {
  role: AppendMessage['role'];
  content: string;
  createdAt: string;
};

function toAppendMessage(msg: StoredMessage): AppendMessage {
  return {
    role: msg.role,
    content: [{ type: 'text', text: msg.content }],
    createdAt: new Date(msg.createdAt),
    status: { type: 'complete', reason: 'stop' },
    metadata: {
      unstable_state: null,
      unstable_annotations: [],
      unstable_data: [],
      steps: [],
      custom: {},
    },
    parentId: null,
    sourceId: null,
    runConfig: undefined,
  };
}

// -------------------- hook --------------------

export function useChatRuntime(spaceSlug: string) {
  const [messages, setMessages] = useState<AppendMessage[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [conversationNodeId, setConversationNodeId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const messagesRef = useRef<AppendMessage[]>([]);
  const isCreatingRef = useRef(false);
  const isRunningRef = useRef(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { data: searchResults } = useSearchNodes(spaceSlug, searchQuery);
  const createNodeMutation = useCreateNode();

  const displayedConversations =
    (searchQuery.trim() ? searchResults?.content : conversations)?.filter(
      (n: any) => n.nodeDetails?.type === 'conversation'
    ) ?? [];

  // -------------------- load conversations --------------------

  const loadConversations = async () => {
    const nodes = await nodeService.getNodes(spaceSlug);
  console.log('ALL NODES', nodes);

nodes.forEach((node: any) => {
  console.log('NODE ID', node.id);
  console.log('NODE TYPE', node.nodeDetails?.type);
  console.log('NODE CONTENT', node.content);

  try {
    console.log(
      'PARSED',
      JSON.parse(node.content || '[]')
    );
  } catch (e) {
    console.log('PARSE ERROR', e);
  }
});
    const convs = nodes
      .filter((n: any) => n.nodeDetails?.type === 'conversation')
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setConversations(convs);

    return convs;
  };

  // -------------------- safe parse --------------------

  const parseMessages = (node: any): StoredMessage[] => {
    try {
      if (!node.content) return [];

      const parsed = typeof node.content === 'string' ? JSON.parse(node.content) : node.content;

      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  // -------------------- load single conversation --------------------
const loadConversation = async (conversationId: string) => {
  try {
    const node = await nodeService.getNode(spaceSlug, conversationId);

    if (node.nodeDetails?.type !== 'conversation') {
      console.warn('Invalid conversation node');
      return [];
    }

    const rawMessages = parseMessages(node);

    const formatted = rawMessages.map(toAppendMessage);

    setMessages(formatted);
    messagesRef.current = formatted;

    return formatted;
  } catch (err) {
    console.warn('Conversation not found, resetting state');

    localStorage.removeItem(`conversationId:${spaceSlug}`);
    setConversationNodeId(null);
    setMessages([]);
    messagesRef.current = [];

    return [];
  }
};

  // -------------------- create conversation --------------------

  const createConversation = async () => {
    if (isCreatingRef.current) return null;

    isCreatingRef.current = true;

    try {
      const node = await createNodeMutation.mutateAsync({
        spaceSlug,
        data: {
          title: `Chat - ${formatConversationTitle(new Date())}`,
          nodeType: NodeType.REGULAR,
          content: JSON.stringify([]),
          nodeDetails: {
            type: 'conversation',
          },
        },
      });

      return node.id;
    } finally {
      isCreatingRef.current = false;
    }
  };

  // -------------------- ensure conversation --------------------

  const ensureConversation = async (): Promise<string> => {
    let convoId = conversationNodeId || localStorage.getItem(`conversationId:${spaceSlug}`);

    if (convoId) {
      try {
       // await nodeService.getNode(spaceSlug, convoId);
       const node = await nodeService.getNode(spaceSlug, convoId);

if (node.nodeDetails?.type !== 'conversation') {
  throw new Error('Not a conversation node');
}
        return convoId;
      } catch {
        localStorage.removeItem(`conversationId:${spaceSlug}`);
      }
    }

    const newId = await createConversation();
    await loadConversations();
    if (!newId) throw new Error('Failed to create conversation');

    setConversationNodeId(newId);
    localStorage.setItem(`conversationId:${spaceSlug}`, newId);

    return newId;
  };

  // -------------------- save conversation --------------------

  const saveConversation = async (conversationId: string, msgs: StoredMessage[]) => {
    const safeMsgs = msgs.map((m) => ({
      role: m.role,
      content: String(m.content ?? ''),
      createdAt: new Date(m.createdAt ?? Date.now()).toISOString(),
    }));

    //const existingNode = await nodeService.getNode(spaceSlug, conversationId);

    /*const payload: UpdateNodeRequest = {
  title: existingNode.title,
  content: JSON.stringify(safeMsgs),
  nodeDetails: {
    type: 'conversation',
  },
};*/
    const payload: UpdateNodeRequest = {
      content: JSON.stringify(safeMsgs),
      nodeDetails: {
        type: 'conversation',
      },
    };

    console.log('SAVE PAYLOAD', payload);

    await nodeService.updateNode(spaceSlug, conversationId, payload);

    const verify = await nodeService.getNode(spaceSlug, conversationId);

    console.log('AFTER SAVE', verify.content);

    // await nodeService.updateNode(spaceSlug, conversationId, payload);
  };

  const persistMessages = async (conversationId: string, msgs: AppendMessage[]) => {
    const stored: StoredMessage[] = msgs.map((m) => ({
      role: m.role,
      content: extractText(m.content),
      createdAt: (m.createdAt ?? new Date()).toISOString(),
    }));

    await saveConversation(conversationId, stored);
    await loadConversations();
  };

  // -------------------- new message --------------------

  const handleNewMessage = useCallback(
  async (message: AppendMessage) => {
    if (isRunningRef.current) return;

    isRunningRef.current = true;
    setIsRunning(true);

    const text = extractText(message.content);

    if (!text.trim()) {
      isRunningRef.current = false;
      setIsRunning(false);
      return;
    }

    try {
      const convoId = await ensureConversation();

      const updatedMessages = [...messagesRef.current, message];

      messagesRef.current = updatedMessages;
      setMessages(updatedMessages);

      queueMicrotask(() => {
        persistMessages(convoId, updatedMessages);
      });

    } catch (err) {
      console.error('handleNewMessage error:', err);
    } finally {
      isRunningRef.current = false;
      setIsRunning(false);
    }
  },
  [spaceSlug]
);
  // -------------------- runtime --------------------

  const runtime = useExternalStoreRuntime({
    messages,
    isRunning,
    onNew: handleNewMessage,
    convertMessage: (msg: AppendMessage, idx: number) => ({
      id: String(idx),
      role: msg.role,
      content: msg.content,
    }),
  });

  // -------------------- effects --------------------

  useEffect(() => {
    loadConversations();
  }, [spaceSlug]);

  useEffect(() => {
    const stored = localStorage.getItem(`conversationId:${spaceSlug}`);

    if (!stored) return;

    const validate = async () => {
      try {
        await nodeService.getNode(spaceSlug, stored);
        setConversationNodeId(stored);
      } catch (e) {
        localStorage.removeItem(`conversationId:${spaceSlug}`);
      }
    };

    validate();
  }, [spaceSlug]);

  useEffect(() => {
    if (!conversationNodeId) return;
    loadConversation(conversationNodeId);
  }, [conversationNodeId]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const hasLoadedRef = useRef(false);

  // -------------------- actions --------------------

  const startNewConversation = async () => {
    setMessages([]);
    messagesRef.current = [];

    const id = await createConversation();
    if (!id) return;

    setConversationNodeId(id);
    localStorage.setItem(`conversationId:${spaceSlug}`, id);

    await loadConversations();
  };

  const deleteConversation = async (id: string) => {
    await nodeService.deleteNode(spaceSlug, id, true);

    setConversations((prev) => prev.filter((c) => c.id !== id));

    if (conversationNodeId === id) {
      setConversationNodeId(null);
      setMessages([]);
      messagesRef.current = [];
      localStorage.removeItem(`conversationId:${spaceSlug}`);
    }
  };

  // -------------------- return --------------------

  return {
    runtime,
    messages,
    conversations,
    displayedConversations,
    searchQuery,
    setSearchQuery,
    conversationNodeId,
    setConversationNodeId,
    loadConversations,
    loadConversation,
    startNewConversation,
    deleteConversation,
  };
}
