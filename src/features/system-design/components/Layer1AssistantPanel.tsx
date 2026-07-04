'use client';

import { DiagramRevisionHistory } from './DiagramRevisionHistory';
import { Layer1DiagramRefinement } from './Layer1DiagramRefinement';
import { Task1InputAssistant } from './Task1InputAssistant';
import { Task4ClarificationAssistant } from './Task4ClarificationAssistant';
import { Task6DiagramAssistant } from './Task6DiagramAssistant';
import { useLayer1Store } from '../stores/useLayer1Store';

export function Layer1AssistantPanel() {
  const graphState = useLayer1Store(
    (state) => state.graphState,
  );

  if (graphState.activeStep === 'input') {
    return (
      <AssistantContainer>
        <Task1InputAssistant />
      </AssistantContainer>
    );
  }

  if (
    graphState.activeStep ===
    'clarification'
  ) {
    return (
      <AssistantContainer>
        <Task4ClarificationAssistant />
      </AssistantContainer>
    );
  }

  if (
    graphState.activeStep === 'diagram' &&
    Boolean(graphState.drawioXml)
  ) {
    return (
      <div className="space-y-4">
        <AssistantContainer>
          <Task6DiagramAssistant />
        </AssistantContainer>

        <Layer1DiagramRefinement />

        <DiagramRevisionHistory />
      </div>
    );
  }

  return null;
}

function AssistantContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <aside className="flex h-[680px] max-h-[calc(100vh-3rem)] min-h-[520px] flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
      {children}
    </aside>
  );
}
