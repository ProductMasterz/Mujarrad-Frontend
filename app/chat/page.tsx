'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { SendHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

type AgentProcessResponse = {
  nodes?: unknown[];
  relationships?: unknown[];
  report?: string;
  error?: boolean;
  message?: string;
  code?: string;
};

export default function ChatPage() {
  const searchParams = useSearchParams();
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Welcome to Mujarrad chat. This is the initial chat shell for Squad A.',
    },
  ]);

  const agentServiceUrl = process.env.NEXT_PUBLIC_AGENT_SERVICE_URL;
  const spaceSlug = searchParams.get('space_slug') || 'demo-space';

  const appendMessage = (role: 'user' | 'assistant', content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role,
        content,
      },
    ]);
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    appendMessage('user', trimmed);
    setInput('');
    setIsSending(true);

    if (!agentServiceUrl) {
      appendMessage('assistant', 'Agent service URL is not configured.');
      setIsSending(false);
      return;
    }

    try {
      const response = await fetch(`${agentServiceUrl}/api/agents/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: trimmed,
          space_slug: spaceSlug,
        }),
      });

      const data: AgentProcessResponse = await response.json();

      if (!response.ok || data.error) {
        appendMessage(
          'assistant',
          data.message || 'The agent service returned an error.',
        );
        return;
      }

      appendMessage(
        'assistant',
        data.report || 'Your message was processed successfully.',
      );
    } catch {
      appendMessage(
        'assistant',
        'Could not reach the agent service. Please try again.',
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Chat</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Interact with Mujarrad through text.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Space: {spaceSlug}
        </p>
      </div>

      <Card className="flex h-[calc(100vh-220px)] min-h-[500px] flex-col overflow-hidden">
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}

          {isSending && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl bg-muted px-4 py-3 text-sm text-foreground">
                Processing...
              </div>
            </div>
          )}
        </div>

        <div className="border-t p-4">
          <div className="flex items-end gap-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="min-h-[60px] resize-none"
              disabled={isSending}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void handleSend();
                }
              }}
            />
            <Button onClick={() => void handleSend()} className="gap-2" disabled={isSending}>
              <SendHorizontal className="h-4 w-4" />
              {isSending ? 'Sending...' : 'Send'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}