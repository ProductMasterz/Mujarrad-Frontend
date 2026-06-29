'use client';

import { useEffect } from 'react';

import { useLayer1Store } from '../../stores/useLayer1Store';
import { AgenticLanding } from './AgenticLanding';
import { AgenticWorkspace } from './AgenticWorkspace';

export function AgenticExperience() {
  const hasHydrated = useLayer1Store((state) => state.hasHydrated);
  // Switch to the workspace the moment the user submits — before the input is
  // processed — so navigation is instant and the AI "thinks" on page two.
  const hasStarted = useLayer1Store(
    (state) =>
      Boolean(state.graphState.processedInput) ||
      state.graphState.rawInputs.length > 0,
  );

  useEffect(() => {
    void useLayer1Store.persist.rehydrate();
  }, []);

  if (!hasHydrated) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          <p className="text-sm font-semibold">Restoring your session…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground">
      {hasStarted ? <AgenticWorkspace /> : <AgenticLanding />}
    </div>
  );
}
