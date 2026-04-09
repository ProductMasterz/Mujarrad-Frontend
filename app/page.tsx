'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  FolderKanban,
  Network,
  PenSquare,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '@/stores';

export default function HomePage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="px-6 pb-10 pt-24">
        <div className="mx-auto max-w-7xl">
          <section className="rounded-[28px] border border-border bg-background px-8 py-10 shadow-sm">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_420px] lg:items-start">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-muted/30 px-4 py-2 text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4" />
                  Structured knowledge workspace
                </div>

                <h1 className="max-w-4xl text-5xl font-semibold leading-[1.02] tracking-tight text-foreground">
                  Build, connect, and explore knowledge with Mujarrad.
                </h1>

                <p className="mt-6 max-w-3xl text-xl leading-8 text-muted-foreground">
                  Start from your spaces, create nodes and contexts, inspect relationships in the graph,
                  and move ideas onto the whiteboard when you need a visual flow.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => router.push('/spaces')}
                    className="inline-flex h-12 items-center gap-2 rounded-2xl bg-foreground px-5 text-sm font-medium text-background transition hover:opacity-90"
                  >
                    Open Spaces
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-3xl border border-border bg-background p-5 shadow-sm">
                  <div className="mb-3 flex items-center gap-2">
                    <FolderKanban className="h-5 w-5 text-muted-foreground" />
                    <h2 className="text-xl font-semibold text-foreground">Spaces</h2>
                  </div>
                  <p className="text-base leading-7 text-muted-foreground">
                    Organize work into focused knowledge spaces for topics, projects, teams, or research threads.
                  </p>
                </div>

                <div className="rounded-3xl border border-border bg-background p-5 shadow-sm">
                  <div className="mb-3 flex items-center gap-2">
                    <PenSquare className="h-5 w-5 text-muted-foreground" />
                    <h2 className="text-xl font-semibold text-foreground">Nodes and contexts</h2>
                  </div>
                  <p className="text-base leading-7 text-muted-foreground">
                    Create structured content manually or through chat-driven workflows, then refine it as your graph grows.
                  </p>
                </div>

                <div className="rounded-3xl border border-border bg-background p-5 shadow-sm">
                  <div className="mb-3 flex items-center gap-2">
                    <Network className="h-5 w-5 text-muted-foreground" />
                    <h2 className="text-xl font-semibold text-foreground">Graph and whiteboard</h2>
                  </div>
                  <p className="text-base leading-7 text-muted-foreground">
                    Switch between relationship mapping and freeform visual thinking without leaving the same workspace.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}