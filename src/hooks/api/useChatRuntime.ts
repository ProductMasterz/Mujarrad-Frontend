'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { AppendMessage, useExternalStoreRuntime } from '@assistant-ui/react';

import { ChatMessage, sendChatMessage } from '@/services/api/chatService';
import { nodeService } from '@/services/api/node.service';
import { NodeType } from '@/types';

// -------------------- helpers --------------------

function extractText(content: any): string {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content.map((p) => p?.text || '').join('');
  }
  return '';
}

function mapToBackendMessages(messages: AppendMessage[]): ChatMessage[] {
  return messages
    .filter(
      (msg): msg is AppendMessage & { role: 'user' | 'assistant' } =>
        msg.role === 'user' || msg.role === 'assistant'
    )
    .map((msg) => ({
      role: msg.role,
      content: extractText(msg.content),
    }));
}

function createAssistantMessage(text: string): AppendMessage {
  return {
    role: 'assistant',
    content: [{ type: 'text', text }],
    createdAt: new Date(),
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

async function linkMessageToConversation(conversationId: string, messageNodeId: string) {
  await fetch(`/api/nodes/${conversationId}/attributes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      targetNodeId: messageNodeId,
      type: 'CONTAINS',
    }),
  });
}

function toAppendMessage(node: any): AppendMessage {
  return {
    role: node.nodeDetails?.role || 'assistant',
    content: [{ type: 'text', text: node.content }],
    createdAt: new Date(node.createdAt),
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

export function useChatRuntime(spaceId: string) {
  const [messages, setMessages] = useState<AppendMessage[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [conversationNodeId, setConversationNodeId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const creatingConversationRef = useRef(false);
  const messagesRef = useRef<AppendMessage[]>([]);

  const loadConversations = async (spaceSlug: string) => {
    const nodes = await nodeService.getNodes(spaceSlug);

    const conversationNodes = nodes
      .filter((node: any) => node.nodeDetails?.type === 'conversation')
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setConversations(conversationNodes);
    return conversationNodes;
  };

  const loadConversationHistory = async (conversationId: string) => {
    const spaceSlug = spaceId;

    const allNodes = await nodeService.getNodes(spaceSlug);

    const messageNodes = allNodes
      .filter((node: any) => node.nodeDetails?.type === 'message')
      .filter((node: any) =>
        node.attributes?.some(
          (attr: any) => attr.type === 'CONTAINS' && attr.sourceNodeId === conversationId
        )
      )
      .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return messageNodes.map(toAppendMessage);
  };

  const startNewConversation = async () => {
    const spaceSlug = spaceId;

    // clear current messages
    setMessages([]);
    messagesRef.current = [];

    // reset current conversation
    setConversationNodeId(null);

    // clear persisted conversation
    localStorage.removeItem('conversationId');

    // create fresh conversation
    const newConversationId = await createConversationNode(spaceSlug);

    // set active conversation
    setConversationNodeId(newConversationId);

    // persist it
    localStorage.setItem('conversationId', newConversationId);

    // reload conversation list
    await loadConversations(spaceSlug);
  };

  useEffect(() => {
    loadConversations(spaceId);
  }, [spaceId]);

  useEffect(() => {
    setMessages([]);
    setConversationNodeId(null);
    messagesRef.current = [];

    const stored = localStorage.getItem(`conversationId:${spaceId}`);
    if (stored) setConversationNodeId(stored);
  }, [spaceId]);

  useEffect(() => {
  if (!conversationNodeId) return;

  const load = async () => {
    try {
      const history =
        await loadConversationHistory(conversationNodeId);

      setMessages(history);
      messagesRef.current = history;

      localStorage.setItem(
        `conversationId:${spaceId}`,
        conversationNodeId
      );
    } catch (err) {
      console.error('Failed loading conversation', err);
    }
  };

  load();
}, [conversationNodeId, spaceId]);

  const createConversationNode = async (spaceSlug: string) => {
    const now = new Date();
    const title = `Chat - ${now.toISOString().slice(0, 16).replace('T', ' ')}`;

    const node = await nodeService.createNode(spaceSlug, {
      title,
      nodeType: NodeType.REGULAR,
      content: title,
      nodeDetails: {
        type: 'conversation',
      },
    });

    return node.id;
  };

  const handleNewMessage = useCallback(
    async (message: AppendMessage) => {
      if (isRunning) return;

      const spaceSlug = spaceId;
      const text = extractText(message.content);

      setIsRunning(true);

      setMessages((prev) => {
        const updated = [...prev, message];
        messagesRef.current = updated;
        return updated;
      });

      try {
        // 1. ensure conversation exists
        let convoId = conversationNodeId ?? localStorage.getItem(`conversationId:${spaceId}`);

        if (!convoId && !creatingConversationRef.current) {
          creatingConversationRef.current = true;

          try {
            convoId = await createConversationNode(spaceSlug);
            setConversationNodeId(convoId);
            localStorage.setItem(`conversationId:${spaceId}`, convoId);
          } finally {
            creatingConversationRef.current = false;
          }
        }

        if (!convoId) throw new Error('Conversation not created');

        // 2. create user message node
        const userNode = await nodeService.createNode(spaceSlug, {
          title: 'user-message',
          content: text,
          nodeType: NodeType.REGULAR,
          nodeDetails: {
            type: 'message',
            role: 'user',
            content: text,
          },
        });

        await linkMessageToConversation(convoId, userNode.id);

        // 3. send
        const response = await sendChatMessage(mapToBackendMessages(messagesRef.current));

        const assistantMessage = createAssistantMessage(response.reply);

        setMessages((prev) => {
          const updated = [...prev, assistantMessage];
          messagesRef.current = updated;
          return updated;
        });

        // 4. create assistant node
        const agentNode = await nodeService.createNode(spaceSlug, {
          title: 'agent-message',
          content: response.reply,
          nodeType: NodeType.REGULAR,
          nodeDetails: {
            type: 'message',
            role: 'assistant',
            content: response.reply,
          },
        });

        await linkMessageToConversation(convoId, agentNode.id);
      } catch (err) {
        console.error('handleNewMessage error:', err);
      } finally {
        setIsRunning(false);
      }
    },
    [isRunning, conversationNodeId, spaceId]
  );

  const runtime = useExternalStoreRuntime({
    messages: [...messages],
    isRunning,
    onNew: handleNewMessage,
    convertMessage: (message: AppendMessage, idx: number) => ({
      id: String(idx),
      role: message.role,
      content: message.content,
    }),
  });

  return {
    runtime,
    conversations,
    conversationNodeId,
    setConversationNodeId,
    loadConversationHistory,
    loadConversations,
    startNewConversation,
  };
}
