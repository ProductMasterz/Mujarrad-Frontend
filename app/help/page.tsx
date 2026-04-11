'use client';

import { LifeBuoy, Command, MessageSquare, Network, PenSquare, Bug, Mail } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useNotificationStore } from '@/stores/notificationStore';

export default function HelpPage() {
  const addNotification = useNotificationStore((state) => state.addNotification);

  const handlePlaceholderAction = (title: string, description: string) => {
    addNotification({
      type: 'info',
      source: 'system',
      title,
      description,
    });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background px-6 pb-10 pt-24 text-foreground">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold">Help</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Quick guidance, support, and common actions for using Mujarrad.
            </p>
          </div>

          <div className="grid gap-6">
            <section className="rounded-2xl border border-border bg-background p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2 border-b border-border pb-3">
                <LifeBuoy className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-base font-semibold text-foreground">Quick start</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-border bg-muted/20 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                    <Network className="h-4 w-4 text-muted-foreground" />
                    1. Create a space
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Start inside Spaces and open or create a focused workspace.
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-muted/20 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    2. Use chat
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Ask Mujarrad to analyze text, create nodes, and trace relationships.
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-muted/20 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                    <PenSquare className="h-4 w-4 text-muted-foreground" />
                    3. Inspect graph and whiteboard
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Review generated nodes, their origins, and visual relationships.
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-background p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2 border-b border-border pb-3">
                <Command className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-base font-semibold text-foreground">Helpful actions</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() =>
                    handlePlaceholderAction(
                      'Shortcuts',
                      'Keyboard shortcuts modal can be opened from the top menu.'
                    )
                  }
                  className="rounded-xl border border-border bg-muted/20 p-4 text-left transition hover:bg-muted/40"
                >
                  <div className="text-sm font-medium text-foreground">Keyboard shortcuts</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Learn the main actions faster.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handlePlaceholderAction(
                      'Report a bug',
                      'Bug reporting flow is not connected yet, but this is where it should live.'
                    )
                  }
                  className="rounded-xl border border-border bg-muted/20 p-4 text-left transition hover:bg-muted/40"
                >
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Bug className="h-4 w-4 text-muted-foreground" />
                    Report a bug
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Send product issues and reproduction notes.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handlePlaceholderAction(
                      'Contact support',
                      'Support contact flow is not connected yet.'
                    )
                  }
                  className="rounded-xl border border-border bg-muted/20 p-4 text-left transition hover:bg-muted/40"
                >
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Contact support
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Reach out for help with access or product usage.
                  </div>
                </button>

                <div className="rounded-xl border border-border bg-muted/20 p-4">
                  <div className="text-sm font-medium text-foreground">Version / environment</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Add build version, release tag, or deployment environment here.
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-background p-6 shadow-sm">
              <div className="text-base font-semibold text-foreground">Troubleshooting</div>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                <li>If chat seems missing, make sure a space is currently open.</li>
                <li>If graph details look incomplete, verify the node has source relationships.</li>
                <li>If whiteboard save errors appear, retry once and then refresh the page.</li>
                <li>If notifications feel noisy, refine them from Settings → Notifications.</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}