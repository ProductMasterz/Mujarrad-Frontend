'use client';

import { Layer1UnderstandingPanel } from './Layer1UnderstandingPanel';
import { QuestionHistory } from './QuestionHistory';
import { useLayer1Store } from '../stores/useLayer1Store';

export function Layer1QuestionLoop() {
  const graphState = useLayer1Store((state) => state.graphState);

  const { questions, understanding } = graphState;

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70">
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
          Live system definition
        </p>

        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
          Current Architecture Context
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Expand any section to review the latest understanding or accepted answers.
        </p>
      </div>

      <div className="space-y-3">
        <CollapsibleSection title="System Understanding">
          <Layer1UnderstandingPanel understanding={understanding} />
        </CollapsibleSection>

        <CollapsibleSection title="Q&A History">
          <QuestionHistory
            questions={questions}
            conversation={graphState.conversation}
          />
        </CollapsibleSection>
      </div>
    </section>
  );
}

function CollapsibleSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <details className="group overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
      <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-black text-slate-900 transition hover:bg-slate-100">
        <span>{title}</span>

        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-5 w-5 text-slate-500 transition-transform duration-200 group-open:rotate-180"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>

      <div className="border-t border-slate-200 bg-white p-4">
        {children}
      </div>
    </details>
  );
}
