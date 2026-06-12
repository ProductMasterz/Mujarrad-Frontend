import { Layer1Shell } from './Layer1Shell';
import { Layer2Locked } from './Layer2Locked';
import { Layer3Locked } from './Layer3Locked';
import { LayerNavigation } from './LayerNavigation';
import { SystemDesignHeader } from './SystemDesignHeader';

export function SystemDesignShell() {
  return (
    <main className="min-h-screen bg-slate-100">
      <SystemDesignHeader />
      <LayerNavigation />

      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[1fr_360px]">
        <div>
          <Layer1Shell />
        </div>

        <aside className="space-y-4">
          <Layer2Locked />
          <Layer3Locked />
        </aside>
      </div>
    </main>
  );
}
