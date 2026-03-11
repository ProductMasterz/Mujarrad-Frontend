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
import { SendHorizontal, X } from 'lucide-react';
import { nodeService } from '@/services/api/node.service';
import { attributeService } from '@/services/api/attribute.service';
import { Button } from '@/components/ui/button';
import { AttributeTypeMode, NodeType } from '@/types/backend-dtos';
import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer';

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

interface ChatPanelProps {
  spaceSlug?: string;
  title?: string;
  embedded?: boolean;
  onClose?: () => void;
}

function UserMessage() {
  return (
    <MessagePrimitive.Root className="flex justify-end">
      <div className="max-w-[85%] rounded-2xl bg-primary px-4 py-3 text-sm text-primary-foreground">
        <MessagePrimitive.Parts />
      </div>
    </MessagePrimitive.Root>
  );
}

function AssistantMessage() {
  return (
    <MessagePrimitive.Root className="flex justify-start">
      <div className="max-w-[85%] rounded-2xl bg-gray-200 px-4 py-3 !text-black">
        <MessagePrimitive.Content
          components={{
            Text: ({ text }) => (
              <div className="!text-black [&_*]:!text-black [&_p]:my-2 [&_h1]:my-3 [&_h1]:text-xl [&_h1]:font-bold [&_h2]:my-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:my-2 [&_h3]:font-semibold [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-black [&_pre]:p-3 [&_pre]:!text-white [&_code]:rounded [&_code]:bg-gray-300 [&_code]:px-1 [&_code]:py-0.5 [&_code]:!text-black [&_a]:!text-blue-700 [&_a]:underline">
                <MarkdownRenderer content={text} />
              </div>
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
}: {
  isRunning: boolean;
  title: string;
  embedded: boolean;
  onClose?: () => void;
  messageCount: number;
}) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

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

  useEffect(() => {
    if (shouldAutoScroll) {
      scrollToBottom();
    }
  }, [messageCount,shouldAutoScroll, isRunning]);

  return (
    <div className={`flex h-full flex-col ${embedded ? 'bg-white' : ''}`}>
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-xs text-muted-foreground">Interact with Mujarrad through text.</p>
        </div>

        {embedded && onClose && (
          <button
            onClick={onClose}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close chat"
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
        </ThreadPrimitive.Viewport>

        <div className="border-t p-4">
          <ComposerPrimitive.Root className="flex items-end gap-3">
            <ComposerPrimitive.Input
              placeholder="Type your message..."
              className="min-h-[56px] flex-1 resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none"
            />
            <ComposerPrimitive.Send asChild>
              <Button className="gap-2">
                <SendHorizontal className="h-4 w-4" />
                Send
              </Button>
            </ComposerPrimitive.Send>
          </ComposerPrimitive.Root>
        </div>
      </ThreadPrimitive.Root>
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

  const ensureConversationNode = async () => {
    if (conversationNodeIdRef.current) {
      return conversationNodeIdRef.current;
    }

    const createdConversation = await nodeService.createNode(spaceSlug, {
      title: `Conversation ${new Date().toLocaleString()}`,
      nodeType: NodeType.REGULAR,
      content: '',
      nodeDetails: {
        showInSpaceList: false,
        chatNodeType: 'conversation',
        createdFrom: 'assistant-ui',
      },
    });

    conversationNodeIdRef.current = createdConversation.id;
    return createdConversation.id;
  };

  const persistMessageNode = async (
    conversationNodeId: string,
    role: 'user' | 'assistant',
    text: string,
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
      } finally {
        setIsRunning(false);
      }
    },
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <ChatPanelShell
        isRunning={isRunning}
        title={title}
        embedded={embedded}
        onClose={onClose}
        messageCount={messages.length}
      />
    </AssistantRuntimeProvider>
  );
}