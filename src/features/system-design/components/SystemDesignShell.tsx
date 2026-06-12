import { Layer1Shell } from './Layer1Shell';
import { LayerNavigation } from './LayerNavigation';
import { SystemDesignHeader } from './SystemDesignHeader';

export function SystemDesignShell() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dbeafe_0,#f8fafc_35%,#eef2ff_100%)] pt-20">
      <SystemDesignHeader />
      <LayerNavigation />

      <div className="mx-auto max-w-7xl px-6 py-5">
        <Layer1Shell />
      </div>
    </main>
  );
}