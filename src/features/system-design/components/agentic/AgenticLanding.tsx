'use client';

import { useState } from 'react';

import { useLayer1Store } from '../../stores/useLayer1Store';
import type { RawInputPayload } from '../../types/input.types';
import { createIsoTimestamp, createSystemDesignId } from '../../utils/id';
import { ChatComposer } from './ChatComposer';

export function AgenticLanding() {
  const graphState = useLayer1Store((state) => state.graphState);
  const syncFromGraphState = useLayer1Store((state) => state.syncFromGraphState);
  const history = useLayer1Store((state) => state.history);
  const loadRun = useLayer1Store((state) => state.loadRun);

  const recentRuns = [...history]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, 4);

  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSend(text: string) {
    if (isSubmitting) {
      return;
    }

    const rawInput: RawInputPayload = {
      id: createSystemDesignId('raw-input'),
      sourceType: 'typed_text',
      rawText: text,
      createdAt: createIsoTimestamp(),
    };

    const nextState = {
      ...graphState,
      rawInputs: [...graphState.rawInputs, rawInput],
      stage: 'clarification' as const,
      activeStep: 'clarification' as const,
      nextAction: 'process_input' as const,
      updatedAt: new Date().toISOString(),
    };

    // Brief "charging up" moment: the gradient around the box speeds up, then we
    // navigate to the workspace where the assistant continues thinking.
    setIsSubmitting(true);
    window.setTimeout(() => {
      syncFromGraphState(nextState);
    }, 2000);
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-gradient-to-b from-background to-muted/30 px-6 py-16">
      <div className="w-full max-w-2xl text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-primary/25">
          {/* Chat turns into a connected system diagram */}
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-9 w-9 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 8.5A2.5 2.5 0 0 1 5.5 6H11a2.5 2.5 0 0 1 2.5 2.5v1A2.5 2.5 0 0 1 11 12H7l-3 2.5V12a2.5 2.5 0 0 1-1-2z" />
            <circle cx="18.5" cy="6" r="2" />
            <circle cx="18.5" cy="15.5" r="2" />
            <circle cx="9.5" cy="18.5" r="2" />
            <path d="M18.5 8v5.5" />
            <path d="M16.8 16.6 11.2 18" />
            <path d="m19.8 3 .45 1.25L21.5 4.7l-1.25.45L19.8 6.4l-.45-1.25L18.1 4.7l1.25-.45z" fill="currentColor" stroke="none" />
          </svg>
        </div>

        <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
          Let&rsquo;s design your system
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">
          Describe the product you have in mind in plain language. I&rsquo;ll ask a few
          clarifying questions, then turn it into an editable diagram.
        </p>

        <div className="relative mt-8">
          {/* Soft magical glow behind the box */}
          <div
            aria-hidden
            className={`magic-gradient pointer-events-none absolute -inset-1.5 rounded-[30px] blur-xl transition-opacity duration-300 ${
              isSubmitting ? 'magic-gradient-fast opacity-80' : 'opacity-40'
            }`}
          />
          {/* Flowing gradient border frame */}
          <div
            className={`magic-gradient relative rounded-[24px] p-[2px] shadow-xl shadow-primary/10 ${
              isSubmitting ? 'magic-gradient-fast' : ''
            }`}
          >
            <div className="rounded-[22px] bg-card">
              <ChatComposer
                onSend={handleSend}
                loading={isSubmitting}
                autoFocus
                size="lg"
                frameless
                placeholder="Describe your system"
              />
            </div>
          </div>
        </div>

        {recentRuns.length > 0 ? (
          <div className="mt-10 text-left">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Recent designs
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {recentRuns.map((run) => (
                <button
                  key={run.id}
                  type="button"
                  onClick={() => loadRun(run.id)}
                  className="flex flex-col rounded-xl border border-border bg-card px-4 py-3 text-left transition hover:border-primary/40 hover:bg-accent disabled:opacity-50"
                >
                  <span className="truncate text-sm font-semibold text-foreground">
                    {run.title}
                  </span>
                  <span className="mt-0.5 text-xs text-muted-foreground">
                    {new Date(run.updatedAt).toLocaleDateString()}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
