'use client';

import { useEffect } from 'react';

import { FinalArtifactsStep } from './FinalArtifactsStep';
import { PreviewFinalArtifactsStep } from './PreviewFinalArtifactsStep';
import { Layer1AssistantPanel } from './Layer1AssistantPanel';
import { Layer1DiagramStep } from './Layer1DiagramStep';
import { Layer1InputPanel } from './Layer1InputPanel';
import { Layer1QuestionLoop } from './Layer1QuestionLoop';
import { Layer1StepNavigation } from './Layer1StepNavigation';
import { SaveLayer1ToMujarradStep } from './SaveLayer1ToMujarradStep';
import { useLayer1Store } from '../stores/useLayer1Store';
import type { Layer1StepId } from '../types/layer1.types';

export function Layer1Shell() {
  const graphState = useLayer1Store((state) => state.graphState);
  const hasHydrated = useLayer1Store((state) => state.hasHydrated);
  const syncFromGraphState = useLayer1Store((state) => state.syncFromGraphState);

  useEffect(() => {
    void useLayer1Store.persist.rehydrate();
  }, []);

  const activeStep = graphState.activeStep;
  const completedSteps = graphState.completedSteps;
  const availableSteps = graphState.availableSteps;

  const showAssistant =
    activeStep === 'input' ||
    activeStep === 'clarification' ||
    (activeStep === 'diagram' && Boolean(graphState.mermaidSource));

  if (!hasHydrated) {
    return (
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/70">
        <div className="text-lg font-black text-slate-950">Loading saved Layer 1 run...</div>
        <div className="mt-2 text-sm font-medium text-slate-500">
          Restoring local System Builder state.
        </div>
      </div>
    );
  }

  function handleStepChange(stepId: Layer1StepId) {
    if (!availableSteps.includes(stepId)) {
      return;
    }

    syncFromGraphState({
      ...graphState,
      activeStep: stepId,
    });
  }

  return (
    <div className="w-[98vw] max-w-[98vw] space-y-6">
      <Layer1StepNavigation
        activeStep={activeStep}
        completedSteps={completedSteps}
        availableSteps={availableSteps}
        onStepChange={handleStepChange}
      />

      <div
        className={showAssistant ? 'grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_520px]' : ''}
      >
        <main className="min-w-0 w-full">
          {activeStep === 'input' ? (
            <Layer1InputPanel />
          ) : activeStep === 'clarification' ? (
            <Layer1QuestionLoop />
          ) : activeStep === 'diagram' ? (
            <Layer1DiagramStep />
          ) : activeStep === 'save_to_mujarrad' ? (
            <SaveLayer1ToMujarradStep />
          ) : activeStep === 'final_artifacts' ? (
            <FinalArtifactsStep />
          ) : activeStep === 'preview_artifacts' ? (
            <PreviewFinalArtifactsStep />
          ) : null}
        </main>

        {showAssistant && (
          <div className="xl:sticky xl:top-6 xl:self-start">
            <Layer1AssistantPanel />
          </div>
        )}
      </div>
    </div>
  );
}
