'use client';

import { Layer1CompletenessPanel } from './Layer1CompletenessPanel';
import { Layer1ReadinessHeader } from './Layer1ReadinessHeader';
import { Layer1UnderstandingPanel } from './Layer1UnderstandingPanel';
import { QuestionHistory } from './QuestionHistory';
import { Task4AiUsagePanel } from './Task4AiUsagePanel';
import { useLayer1Store } from '../stores/useLayer1Store';

export function Layer1QuestionLoop() {
  const graphState = useLayer1Store(
    (state) => state.graphState,
  );

  const {
    questions,
    qaHistory,
    understanding,
    completeness,
    task4AiUsage,
  } = graphState;

  return (
    <div className="space-y-6">
      <Layer1ReadinessHeader
        report={completeness}
      />

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
            Task 4
          </p>

          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
            System Understanding
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Review the current understanding and completeness
            status while the clarification conversation continues
            in the assistant panel.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 2xl:grid-cols-2">
          <Layer1CompletenessPanel
            report={completeness}
          />

          <Layer1UnderstandingPanel
            understanding={understanding}
          />
        </div>
      </section>

      <Task4AiUsagePanel
        calls={task4AiUsage.calls}
      />

      <QuestionHistory
        questions={questions}
        qaHistory={qaHistory}
      />
    </div>
  );
}
