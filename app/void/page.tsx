'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { CloudOff, Trash2, ArrowRightCircle, Home, ChevronRight } from 'lucide-react';
import { useVoidNodes, useDeleteVoidNode } from '@/hooks/api/useVoidNodes';
import { useNotificationStore } from '@/stores/notificationStore';
import { AssignVoidDialog } from '@/components/void/AssignVoidDialog';
import { NodeCard } from '@/shell/components/NodeCard';
import { CardType } from '@/shell/data/projects';
import { Button } from '@/components/ui/button';
import type { Node } from '@/types/backend-dtos';

export default function VoidPage() {
  const router = useRouter();
  const { data: nodes, isLoading } = useVoidNodes();
  const deleteMutation = useDeleteVoidNode();
  const addNotification = useNotificationStore((s) => s.addNotification);
  const [assignNodeId, setAssignNodeId] = useState<string | null>(null);

  const handleDelete = (nodeId: string) => {
    deleteMutation.mutate(nodeId, {
      onSuccess: () => {
        addNotification({ type: 'success', source: 'node', title: 'Note deleted' });
      },
    });
  };

  const voidNodes: Node[] = Array.isArray(nodes) ? nodes : [];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <div className="border-b bg-card/50 px-6 py-4">
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
            <button onClick={() => router.push('/')} className="hover:text-foreground transition-colors">
              <Home className="h-3.5 w-3.5" />
            </button>
            <ChevronRight className="h-3 w-3" />
            <button onClick={() => router.push('/spaces')} className="hover:text-foreground transition-colors">
              Spaces
            </button>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">The Void</span>
          </nav>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-200 dark:bg-neutral-800">
              <CloudOff className="h-5 w-5 text-neutral-500" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-neutral-700 dark:text-neutral-300">The Void</h1>
              <p className="text-xs text-muted-foreground">
                {voidNodes.length} quick {voidNodes.length === 1 ? 'note' : 'notes'} — assign to a space when ready
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-6 max-w-6xl">
          {isLoading ? (
            <div className="flex items-center justify-center h-[300px]">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : voidNodes.length === 0 ? (
            <div className="rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 p-12 text-center">
              <CloudOff className="h-8 w-8 mx-auto text-neutral-400 mb-2" />
              <p className="text-sm text-muted-foreground">No quick notes yet</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Use the New button to capture ideas fast</p>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
              {voidNodes.map((node: Node) => {
                const preview = (node.content || '').trim().slice(0, 120) || undefined;
                const meta = `Created ${new Date(node.createdAt).toLocaleDateString()}`;

                return (
                  <div key={node.id} className="relative group">
                    <NodeCard
                      title={node.title}
                      preview={preview}
                      meta={meta}
                      type={CardType.NODE}
                      nodeKindLabel="Void Note"
                      onClick={() => setAssignNodeId(node.id)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        handleDelete(node.id);
                      }}
                    />
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 bg-background/80"
                        onClick={(e) => { e.stopPropagation(); setAssignNodeId(node.id); }}
                      >
                        <ArrowRightCircle className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 bg-background/80 text-destructive hover:text-destructive"
                        onClick={(e) => { e.stopPropagation(); handleDelete(node.id); }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {assignNodeId && (
          <AssignVoidDialog
            nodeId={assignNodeId}
            open={!!assignNodeId}
            onOpenChange={(open) => { if (!open) setAssignNodeId(null); }}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
