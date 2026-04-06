'use client';

import { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import {
  useExternalStoreRuntime,
  type AppendMessage,
  type ExternalStoreAdapter,
  type ThreadMessage,
} from '@assistant-ui/react';
import { nodeService } from '@/services/api/node.service';
import { attributeService } from '@/services/api/attribute.service';
import { NodeType, AttributeKey, AttributeTypeMode } from '@/types/backend-dtos';

type AgentProcessResponse = {
  nodes?: unknown[];
  relationships?: unknown[];
  report?: string;
  error?: boolean;
  message?: string;
  code?: string;
};

type RuntimeOptions = {
  agentServiceUrl?: string;
  spaceSlug: string;
  onLatencyUpdate?: (ms: number) => void;
};

function createUserMessage(text: string): ThreadMessage {
  return {
    id: crypto.randomUUID(),
    role: 'user',
    createdAt: new Date(),
    content: [{ type: 'text', text }],
    attachments: [],
    metadata: {
      custom: {},
    },
  };
}

function createAssistantMessage(text: string): ThreadMessage {
  return {
    id: crypto.randomUUID(),
    role: 'assistant',
    createdAt: new Date(),
    content: [{ type: 'text', text }],
    status: { type: 'complete', reason: 'stop' },
    metadata: {
      unstable_state: null,
      unstable_annotations: [],
      unstable_data: [],
      steps: [],
      custom: {},
    },
  };
}

function extractTextFromAppendMessage(message: AppendMessage): string {
  return message.content
    .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
    .map((part) => part.text)
    .join('\n')
    .trim();
}

function buildConversationNodeTitle(): string {
  const date = new Date();
  const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  return `Conversation (${dateStr} ${timeStr})`;
}

async function createConversationNode(
  spaceSlug: string,
): Promise<string> {
  const node = await nodeService.createNode(spaceSlug, {
    title: buildConversationNodeTitle(),
    nodeType: NodeType.REGULAR,
    content: '',
    nodeDetails: {
      source: 'chat-runtime',
      chatNodeType: 'conversation',
      persistedAt: new Date().toISOString(),
      showInSpaceList: false,
    },
  });
  return node.id;
}

async function createMessageNode(
  spaceSlug: string,
  conversationNodeId: string,
  role: 'user' | 'assistant',
  content: string,
): Promise<void> {
  try {
    const title = role === 'user' ? 'user-message' : 'agent-message';
    
    // Create message node
    const messageNode = await nodeService.createNode(spaceSlug, {
      title,
      nodeType: NodeType.REGULAR,
      content,
      nodeDetails: {
        source: 'chat-runtime',
        chatNodeType: 'message',
        chatRole: role,
        persistedAt: new Date().toISOString(),
        showInSpaceList: false,
      },
    });

    // Create contains relationship attribute linking conversation->message
    await attributeService.createAttribute(conversationNodeId, {
      sourceNodeId: conversationNodeId,
      targetNodeId: messageNode.id,
      attributeType: AttributeKey.CONTAINS,
      attributeTypeMode: AttributeTypeMode.TYPED,
      attributeName: 'contains',
      attributeValue: { role, date: new Date().toISOString() },
    });
  } catch (error) {
    console.error('[Chat Runtime] Failed to create message node and attribute:', error);
  }
}

async function getAgentResponse(
  agentServiceUrl: string | undefined,
  text: string,
  spaceSlug: string,
  signal?: AbortSignal,
): Promise<AgentProcessResponse> {
  if (!agentServiceUrl) {
    await new Promise<void>((resolve, reject) => {
      const onAbort = () => {
        clearTimeout(timeoutId);
        const abortError = new Error('Request canceled.');
        abortError.name = 'AbortError';
        reject(abortError);
      };

      const timeoutId = setTimeout(() => {
        signal?.removeEventListener('abort', onAbort);
        resolve();
      }, 900);

      if (!signal) return;

      if (signal.aborted) {
        onAbort();
        return;
      }

      signal.addEventListener('abort', onAbort, { once: true });
    });

    return {
      report: [
        '# Demo Summary',
        '',
        `**Input:** ${text}`,
        '',
        '## Extracted',
        '- 1 node idea',
        '- 1 relationship idea',
        '',
        '```ts',
        "const spaceSlug = '" + spaceSlug + "';",
        '```',
        '',
        '[Open space](#/spaces)',
      ].join('\n'),
    };
  }

  const response = await fetch(`${agentServiceUrl}/api/agents/process`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal,
    body: JSON.stringify({
      text,
      space_slug: spaceSlug,
    }),
  });

  const data: AgentProcessResponse = await response.json();

  if (!response.ok || data.error) {
    throw new Error(data.message || 'The agent service returned an error.');
  }

  return data;
}

export function useMujarradExternalStoreRuntime({
  agentServiceUrl,
  spaceSlug,
  onLatencyUpdate,
}: RuntimeOptions) {
  const [messages, setMessages] = useState<ThreadMessage[]>([
    createAssistantMessage('Welcome to Mujarrad chat. This is the initial chat shell for Squad A.'),
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [conversations, setConversations] = useState<{ id: string; title: string; createdAt: string; searchableContent: string }[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isRunningRef = useRef(false);
  const conversationNodeIdRef = useRef<string | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      const allNodes = await nodeService.getNodes(spaceSlug);
      const allEdges = await attributeService.getSpaceAttributes(spaceSlug).catch(() => []);

      const messageToConversationMap = new Map<string, string>();
      for (const edge of allEdges) {
        if (edge.attributeType === AttributeKey.CONTAINS) {
          messageToConversationMap.set(edge.targetNodeId, edge.sourceNodeId);
        }
      }

      const conversationTextMap = new Map<string, string[]>();
      for (const node of allNodes) {
        if (node.nodeDetails?.chatNodeType === 'message') {
          const convId = messageToConversationMap.get(node.id);
          if (convId) {
            const existing = conversationTextMap.get(convId) || [];
            existing.push((node.content || '').toLowerCase());
            conversationTextMap.set(convId, existing);
          }
        }
      }

      const convs = allNodes
        .filter((n) => n.nodeDetails?.chatNodeType === 'conversation')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .map(n => {
          const title = n.title || '';
          const combinedContent = `${title.toLowerCase()} ${(conversationTextMap.get(n.id) || []).join(' ')}`;
          return { id: n.id, title: n.title, createdAt: n.createdAt, searchableContent: combinedContent };
        });
      setConversations(convs);
      return convs;
    } catch (error) {
      console.error('[Chat Runtime] Failed to fetch conversations:', error);
      return [];
    }
  }, [spaceSlug]);

  const startNewConversation = useCallback(async () => {
    try {
      const newId = await createConversationNode(spaceSlug);
      conversationNodeIdRef.current = newId;
      setActiveConversationId(newId);
      setMessages([]);
      await fetchConversations();
      return newId;
    } catch (error) {
      console.error('[Chat Runtime] Failed to start new conversation:', error);
      return null;
    }
  }, [spaceSlug, fetchConversations]);

  const renameConversation = useCallback(async (id: string, newTitle: string) => {
    try {
      if (!newTitle.trim()) return;
      await nodeService.updateNode(spaceSlug, id, { title: newTitle.trim() });
      await fetchConversations();
    } catch (error) {
      console.error('[Chat Runtime] Failed to rename conversation:', error);
    }
  }, [spaceSlug, fetchConversations]);

  const deleteConversation = useCallback(async (id: string) => {
    try {
      const attributes = await attributeService.getNodeAttributes(id, {
        attributeType: AttributeKey.CONTAINS,
      });

      // Delete all child message nodes
      await Promise.all(
        attributes.map((attr) => nodeService.deleteNode(spaceSlug, attr.targetNodeId))
      );

      // Delete the conversation node itself
      await nodeService.deleteNode(spaceSlug, id);

      if (conversationNodeIdRef.current === id) {
        conversationNodeIdRef.current = null;
        setActiveConversationId(null);
        setMessages([]);
      }

      await fetchConversations();
    } catch (error) {
      console.error('[Chat Runtime] Failed to delete conversation:', error);
    }
  }, [spaceSlug, fetchConversations]);

  const loadConversationById = useCallback(async (id: string) => {
    try {
      conversationNodeIdRef.current = id;
      setActiveConversationId(id);
      setMessages([]); // Clear chat immediately upon selecting a new conversation to switch
      const attributes = await attributeService.getNodeAttributes(id, {
        attributeType: AttributeKey.CONTAINS,
      });

      if (!attributes.length) {
        setMessages([createAssistantMessage('No messages in this conversation yet.')]);
        return;
      }

      const messageNodes = await Promise.all(
        attributes.map((attr) => nodeService.getNode(spaceSlug, attr.targetNodeId))
      );

      const restoredMessages = messageNodes
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        .map((node) => {
          const role = node.title === 'user-message' ? 'user' : 'assistant';
          const textContent = node.content || '';
          const msgId = node.id || crypto.randomUUID();
          const createdAt = new Date(node.createdAt);
          
          if (role === 'user') {
            const msg = createUserMessage(textContent);
            return { ...msg, id: msgId, createdAt };
          } else {
            const msg = createAssistantMessage(textContent);
            return { ...msg, id: msgId, createdAt };
          }
        });

      if (restoredMessages.length > 0) {
        setMessages(restoredMessages);
      }
    } catch (error) {
      console.error('[Chat Runtime] Failed to load specific conversation:', error);
    }
  }, [spaceSlug]);

  // Load conversation history on mount
  useEffect(() => {
    let mounted = true;

    async function loadHistory() {
      const convs = await fetchConversations();
      if (!convs.length) return;

      const latestConversation = convs[0];
      if (mounted) {
        await loadConversationById(latestConversation.id);
      }
    }

    loadHistory();

    return () => {
      mounted = false;
    };
  }, [fetchConversations, loadConversationById]);

  const onNew = useCallback(async (message: AppendMessage) => {
    const userText = extractTextFromAppendMessage(message);
    if (!userText || isRunningRef.current) return;

    isRunningRef.current = true;
    setMessages((prev) => [...prev, createUserMessage(userText)]);
    setIsRunning(true);

    const startedAt = Date.now();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const data = await getAgentResponse(
        agentServiceUrl,
        userText,
        spaceSlug,
        controller.signal,
      );

      const assistantText = data.report || 'Your message was processed successfully.';
      setMessages((prev) => [...prev, createAssistantMessage(assistantText)]);

      if (agentServiceUrl) {
        // Persistence should never block chat completion state.
        (async () => {
          try {
            if (!conversationNodeIdRef.current) {
              const newId = await createConversationNode(spaceSlug);
              conversationNodeIdRef.current = newId;
              setActiveConversationId(newId);
              await fetchConversations();
            }
            await createMessageNode(spaceSlug, conversationNodeIdRef.current, 'user', userText);
            await createMessageNode(spaceSlug, conversationNodeIdRef.current, 'assistant', assistantText);
          } catch (persistError) {
            console.warn('[Chat Runtime] Message persistence failed:', persistError);
          }
        })();
      }
    } catch (error) {
      if ((error as { name?: string } | null)?.name === 'AbortError') {
        setMessages((prev) => [...prev, createAssistantMessage('Request canceled.')]);
      } else {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Could not reach the agent service. Please try again.';
        setMessages((prev) => [...prev, createAssistantMessage(errorMessage)]);
      }
    } finally {
      onLatencyUpdate?.(Date.now() - startedAt);
      setIsRunning(false);
      isRunningRef.current = false;
      abortControllerRef.current = null;
    }
  }, [agentServiceUrl, onLatencyUpdate, spaceSlug, fetchConversations]);

  const onCancel = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    isRunningRef.current = false;
    setIsRunning(false);
  }, []);

  const adapter = useMemo<ExternalStoreAdapter<ThreadMessage>>(
    () => ({
      messages,
      // Keep runtime auto-optimistic placeholders disabled; we control pending UI explicitly.
      isRunning: false,
      setMessages: (nextMessages) => setMessages([...nextMessages]),
      onNew,
      onCancel,
    }),
    [messages, onCancel, onNew],
  );

  const runtime = useExternalStoreRuntime(adapter);

  return {
    runtime,
    isRunning,
    isDemoMode: !agentServiceUrl,
    messages,
    conversations,
    activeConversationId,
    loadConversationById,
    startNewConversation,
    deleteConversation,
    renameConversation
  };
}
