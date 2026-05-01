'use client';

import { useState, useCallback, useRef } from 'react';
import { AppendMessage, useExternalStoreRuntime } from '@assistant-ui/react';

import { ChatMessage, sendChatMessage } from '@/services/api/chatService';
import { nodeService } from '@/services/api/node.service';
import { NodeType } from '@/types';
import { attributeService } from '@/services/api';
import { AttributeKey, AttributeTypeMode } from '@/types/backend-dtos';

// ---------------- Helpers ----------------

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

// ---------------- Hook ----------------

export function useChatRuntime() {
  const [messages, setMessages] = useState<AppendMessage[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const conversationRef = useRef<string | null>(null);
  const creatingRef = useRef(false);
  const messageOrderRef = useRef(1);

  const [conversationCache, setConversationCache] = useState<
    Record<string, AppendMessage[]>
  >({});

  // ---------------- Conversation ----------------

  const createConversationNode = async () => {
    const spaceSlug = 'default-space';

    const node = await nodeService.createNode(spaceSlug, {
      title: `Conversation ${new Date().toLocaleString()}`,
      nodeType: NodeType.REGULAR,
      content: '',
      nodeDetails: {
        createdFrom: 'chat',
        chatNodeType: 'conversation',
        role: 'conversation',
      },
    });

    return node.id;
  };

  const ensureConversation = async () => {
    if (conversationRef.current) return conversationRef.current;
    if (creatingRef.current) return null;

    creatingRef.current = true;

    const id = await createConversationNode();

    conversationRef.current = id;
    setConversationId(id);

    creatingRef.current = false;

    return id;
  };

  // ---------------- Delete ----------------

  const deleteConversation = useCallback(
    async (id: string) => {
      const spaceSlug = 'default-space';

      try {
        const attributes = await attributeService.getNodeAttributes(id);

        const messageLinks = attributes.filter(
          (attr) => attr.attributeName === 'contains'
        );

        await Promise.all(
          messageLinks.map(async (attr) => {
            try {
              await nodeService.deleteNode(spaceSlug, attr.targetNodeId, true);
            } catch {}
          })
        );

        await nodeService.deleteNode(spaceSlug, id, true);

        if (conversationId === id) {
          setConversationId(null);
          conversationRef.current = null;
          setMessages([]);
        }

        setConversationCache((prev) => {
          const updated = { ...prev };
          delete updated[id];
          return updated;
        });
      } catch (err) {
        console.error('Delete failed', err);
      }
    },
    [conversationId]
  );

  // ---------------- Load History ----------------

  const loadConversationHistory = useCallback(async (id: string) => {
    const spaceSlug = 'default-space';

    try {
      const attributes = await attributeService.getNodeAttributes(id, {
        attributeType: AttributeKey.CONTAINS,
      });

      if (!attributes.length) {
        setMessages([]);
        return;
      }

      //  ORDER FIX
      const ordered = attributes.sort((a, b) => {
        const aOrder = Number(a.attributeValue?.order || 0);
        const bOrder = Number(b.attributeValue?.order || 0);
        return aOrder - bOrder;
      });

      const nodes = await Promise.all(
        ordered.map((attr) =>
          nodeService.getNode(spaceSlug, attr.targetNodeId)
        )
      );

      const historyMessages: AppendMessage[] = nodes.map((node) => ({
        role:
          node.nodeDetails?.role === 'assistant' ? 'assistant' : 'user',
        content: [{ type: 'text', text: node.content || '' }],
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
      }));

      setMessages(historyMessages);

      setConversationCache((prev) => ({
        ...prev,
        [id]: historyMessages,
      }));
    } catch (error) {
      console.error('Failed to load history', error);
    }
  }, []);

  // ---------------- Switch ----------------

  const switchConversation = useCallback(
    async (id: string) => {
      setConversationId(id);
      conversationRef.current = id; //  FIX

      if (conversationCache[id]) {
        setMessages(conversationCache[id]);
        return;
      }

      setMessages([]);
      await loadConversationHistory(id);
    },
    [conversationCache, loadConversationHistory]
  );

  // ---------------- New Message ----------------

  const handleNewMessage = useCallback(
    async (message: AppendMessage) => {
      const spaceSlug = 'default-space';
      const text = extractText(message.content);

      setIsRunning(true);

      const newMessages = [...messages, message];
      setMessages(newMessages);

      try {
        const currentConversationId = await ensureConversation();
        if (!currentConversationId) return;

        // USER NODE
        const userNode = await nodeService.createNode(spaceSlug, {
          title: 'user-message',
          content: text,
          nodeType: NodeType.REGULAR,
          nodeDetails: {
            createdFrom: 'chat',
            chatNodeType: 'message',
            role: 'user',
          },
        });

        await attributeService.createAttribute(currentConversationId, {
          sourceNodeId: currentConversationId,
          targetNodeId: userNode.id,
          attributeType: 'CUSTOM',
          attributeTypeMode: AttributeTypeMode.SCHEMALESS,
          attributeName: 'contains',
          attributeValue: {
            order: messageOrderRef.current++,
          },
        });

        // AI CALL
        const response = await sendChatMessage(
          mapToBackendMessages(newMessages)
        );
        const assistantText = response.reply;

        // ASSISTANT NODE
        const assistantNode = await nodeService.createNode(spaceSlug, {
          title: 'agent-message',
          content: assistantText,
          nodeType: NodeType.REGULAR,
          nodeDetails: {
            createdFrom: 'chat',
            chatNodeType: 'message',
            role: 'assistant',
          },
        });

        await attributeService.createAttribute(currentConversationId, {
          sourceNodeId: currentConversationId,
          targetNodeId: assistantNode.id,
          attributeType: 'CUSTOM',
          attributeTypeMode: AttributeTypeMode.SCHEMALESS,
          attributeName: 'contains',
          attributeValue: {
            order: messageOrderRef.current++,
          },
        });

        // reply link
        await attributeService.createAttribute(userNode.id, {
          sourceNodeId: userNode.id,
          targetNodeId: assistantNode.id,
          attributeType: 'CUSTOM',
          attributeTypeMode: AttributeTypeMode.SCHEMALESS,
          attributeName: 'assistant_reply',
          attributeValue: {},
        });

        // UI update
        const assistantMessage = createAssistantMessage(assistantText);

        setMessages((prev) => [...prev, assistantMessage]);

        setConversationCache((prev) => ({
          ...prev,
          [currentConversationId]: [...newMessages, assistantMessage],
        }));
      } catch (error) {
        console.error(error);
      } finally {
        setIsRunning(false);
      }
    },
    [messages]
  );

  // ---------------- Runtime ----------------

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

  // ---------------- Start New ----------------

const startNewConversation = useCallback(async () => {
  setMessages([]);
  conversationRef.current = null;
  messageOrderRef.current = 1;

  const id = await createConversationNode();
  conversationRef.current = id;
  setConversationId(id);
}, []);

  return {
    runtime,
    startNewConversation,
    switchConversation,
    conversationId,
    deleteConversation,
  };
}