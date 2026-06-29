'use client';

import { useEffect, useRef } from 'react';

import { ChatComposer } from './ChatComposer';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  category?: string;
  reason?: string;
}

interface ConversationPanelProps {
  messages: ChatMessage[];
  isThinking: boolean;
  canAnswer: boolean;
  onSendAnswer: (text: string) => Promise<void>;
  statusNote?: string | null;
  noticeTone?: 'success' | 'error';
  onRetry?: () => void;
  retryLabel?: string;
  errorNote?: string | null;
}

function AssistantAvatar() {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm">
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
        <rect x="3" y="8" width="18" height="12" rx="3" />
        <path d="M12 8V4" />
        <circle cx="12" cy="3" r="1" />
        <path d="M9 13h.01" />
        <path d="M15 13h.01" />
      </svg>
    </div>
  );
}

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-3 shadow-sm">
      <span className="h-2 w-2 animate-bounce rounded-full bg-primary/60 [animation-delay:-0.3s]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-primary/60 [animation-delay:-0.15s]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-primary/60" />
    </div>
  );
}

export function ConversationPanel({
  messages,
  isThinking,
  canAnswer,
  onSendAnswer,
  statusNote,
  noticeTone = 'success',
  onRetry,
  retryLabel = 'Ask another question',
  errorNote,
}: ConversationPanelProps) {
  const isErrorNotice = noticeTone === 'error';
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, isThinking]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-2 border-b border-border px-5 py-3">
        <AssistantAvatar />
        <div>
          <p className="text-sm font-bold text-foreground">Design assistant</p>
          <p className="text-xs text-muted-foreground">Clarifying your requirements</p>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        {messages.map((message) =>
          message.role === 'assistant' ? (
            <div key={message.id} className="flex items-start gap-3">
              <AssistantAvatar />
              <div className="max-w-[85%]">
                {message.category ? (
                  <span className="mb-1 inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                    {message.category.replace(/_/g, ' ')}
                  </span>
                ) : null}
                <div className="rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-3 text-sm leading-6 text-card-foreground shadow-sm">
                  {message.text}
                </div>
                {message.reason ? (
                  <p className="mt-1 px-1 text-xs italic text-muted-foreground">
                    Why: {message.reason}
                  </p>
                ) : null}
              </div>
            </div>
          ) : (
            <div key={message.id} className="flex items-start justify-end gap-3">
              <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tr-sm bg-gradient-to-br from-blue-600 to-indigo-600 px-4 py-3 text-sm leading-6 text-white shadow-sm">
                {message.text}
              </div>
            </div>
          ),
        )}

        {isThinking ? (
          <div className="flex items-start gap-3">
            <AssistantAvatar />
            <ThinkingDots />
          </div>
        ) : null}

        {!isThinking && statusNote ? (
          <div className="flex items-start gap-3">
            <AssistantAvatar />
            <div
              className={`max-w-[85%] rounded-2xl rounded-tl-sm border px-4 py-3 text-sm leading-6 ${
                isErrorNotice
                  ? 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                  : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
              }`}
            >
              {statusNote}
              {onRetry ? (
                <button
                  type="button"
                  onClick={onRetry}
                  className={`mt-2 block rounded-lg px-3 py-1.5 text-xs font-bold text-white transition ${
                    isErrorNotice
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {retryLabel}
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        <div ref={bottomRef} />
      </div>

      <div className="border-t border-border bg-muted/30 p-3">
        {errorNote ? (
          <div className="mb-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-700 dark:text-amber-300">
            {errorNote}
          </div>
        ) : null}
        <ChatComposer
          onSend={onSendAnswer}
          disabled={!canAnswer}
          loading={isThinking}
          placeholder={
            canAnswer ? 'Type your answer…' : 'Waiting for the assistant…'
          }
        />
      </div>
    </div>
  );
}
