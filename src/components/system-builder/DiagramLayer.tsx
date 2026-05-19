'use client';

import { useState, useRef, useEffect } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Send, Loader2, MessageSquarePlus, GripVertical } from 'lucide-react';
import { DrawioEmbed } from './DrawioEmbed';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function ChatMessage({ message, index }: { message: Message; index: number }) {
  const isUser = message.role === 'user';
  return (
    <div
      className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div
        className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed shadow-sm ${
          isUser
            ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-md'
            : 'bg-muted/60 text-foreground rounded-2xl rounded-bl-md'
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}

export function DiagramLayer() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [xml, setXml] = useState('');
  const [currentXml, setCurrentXml] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function resetChat() {
    setMessages([]);
    setXml('');
    setCurrentXml('');
    setInput('');
    setError('');
  }

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setError('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = '60px';
    }

    try {
      const res = await fetch('/api/system-builder/generate-diagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          currentXml: currentXml || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');

      setXml(data.xml);
      setCurrentXml(data.xml);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Diagram updated. You can keep editing it or ask for changes.' },
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Error: ${msg}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      send();
    }
  }

  function handleTextareaInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    const ta = e.target;
    ta.style.height = '60px';
    ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`;
  }

  return (
    <div style={{ paddingTop: '4rem', height: '100vh', boxSizing: 'border-box' }}>
    <PanelGroup
      direction="horizontal"
      style={{ height: '100%', width: '100%', padding: '1rem' }}
    >
      {/* Left: draw.io canvas */}
      <Panel defaultSize={67} minSize={30}>
        <div style={{ height: '100%', overflow: 'hidden', borderRadius: '0.75rem', border: '1px solid var(--border)' }}>
          {xml ? (
            <DrawioEmbed xml={xml} onXmlChange={setCurrentXml} className="h-full w-full" />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
              <MessageSquarePlus className="h-10 w-10 opacity-30" />
              <p className="text-sm">Describe your system in the chat to generate a diagram.</p>
            </div>
          )}
        </div>
      </Panel>

      {/* Resize handle */}
      <PanelResizeHandle className="group flex w-2 items-center justify-center">
        <GripVertical className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
      </PanelResizeHandle>

      {/* Right: chat panel */}
      <Panel defaultSize={33} minSize={20} maxSize={50}>
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '0.75rem', border: '1px solid hsl(var(--border) / 0.3)', background: 'hsl(var(--card))' }}>

          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">AI System Builder</span>
            </div>
            <button
              onClick={resetChat}
              title="New diagram"
              className="rounded-lg p-1.5 text-muted-foreground/60 hover:bg-muted hover:text-muted-foreground transition-colors"
            >
              <MessageSquarePlus className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <main className="flex-1 overflow-y-auto px-4 py-4">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                <p className="text-sm text-muted-foreground">
                  Describe the system you want to design.<br />
                  You can keep chatting to refine the diagram.
                </p>
                <p className="text-xs text-muted-foreground/60">Ctrl+Enter to send</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {messages.map((m, i) => (
                  <ChatMessage key={i} message={m} index={i} />
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-bl-md bg-muted/60 px-4 py-3">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </main>

          {/* Input */}
          <div className="border-t border-border/50 bg-card/50 p-4">
            {error && (
              <p className="mb-2 rounded-lg bg-destructive/10 px-3 py-1.5 text-xs text-destructive">
                {error}
              </p>
            )}
            <div className="relative rounded-2xl border border-border bg-background focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleTextareaInput}
                onKeyDown={handleKeyDown}
                placeholder="Describe your system or ask for changes…"
                rows={1}
                disabled={loading}
                className="w-full resize-none border-0 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground/60 scrollbar-thin"
                style={{ minHeight: '60px', maxHeight: '200px' }}
              />
              <div className="flex items-center justify-end gap-1 border-t border-border/50 px-3 py-2">
                <button
                  onClick={send}
                  disabled={loading || !input.trim()}
                  className="flex h-8 items-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-medium text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {loading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  Send
                </button>
              </div>
            </div>
          </div>

        </div>
      </Panel>
    </PanelGroup>
    </div>
  );
}
