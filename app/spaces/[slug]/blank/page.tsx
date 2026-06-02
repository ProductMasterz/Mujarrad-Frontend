'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useBlankNodes, useBlankCount } from '@/hooks/api/useBlankNodes';
import { useSpace } from '@/hooks/api';
import { NodeCard } from '@/shell/components/NodeCard';
import { CardType } from '@/shell/data/projects';
import { Button } from '@/components/ui/button';
import { AssignToContextDialog } from '@/components/blank/AssignToContextDialog';
import {
  ChevronRight,
  Home,
  Inbox,
  ArrowLeft,
} from 'lucide-react';
import type { Node } from '@/types/backend-dtos';

export default function BlankPage() {
  const params = useParams();
  const router = useRouter();
  const spaceSlug = params.slug as string;

  const { data: space } = useSpace(spaceSlug);
  const { data: nodes = [], isLoading } = useBlankNodes(spaceSlug);
  const { data: count = 0 } = useBlankCount(spaceSlug);

  const [assignNodeIds, setAssignNodeIds] = useState<string[]>([]);
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const blankNodes = Array.isArray(nodes) ? nodes : [];

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
            <button onClick={() => router.push(`/spaces/${spaceSlug}`)} className="hover:text-foreground transition-colors">
              {space?.name || spaceSlug}
            </button>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">The Blank</span>
          </nav>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push(`/spaces/${spaceSlug}`)}
                className="p-1.5 rounded-md hover:bg-muted transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-800">
                <Inbox className="h-5 w-5 text-gray-500" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-700 dark:text-gray-300">The Blank</h1>
                <p className="text-xs text-muted-foreground">
                  {count} unorganized {count === 1 ? 'node' : 'nodes'}
                </p>
              </div>
            </div>

            {selectedIds.size > 0 && (
              <Button
                size="sm"
                onClick={() => {
                  setAssignNodeIds(Array.from(selectedIds));
                  setAssignOpen(true);
                }}
              >
                Assign {selectedIds.size} to Context
              </Button>
            )}
          </div>
        </div>

        <div className="px-6 py-6 max-w-6xl">
          {isLoading ? (
            <div className="flex items-center justify-center h-[300px]">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : blankNodes.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
              <Inbox className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-muted-foreground">No unorganized nodes</p>
              <p className="text-xs text-muted-foreground/70 mt-1">All nodes in this space are assigned to a context</p>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
              {blankNodes.map((node: Node) => {
                const preview = (node.content || '').trim().slice(0, 120) || undefined;
                const meta = node.updatedAt
                  ? `Updated ${new Date(node.updatedAt).toLocaleDateString()}`
                  : `Created ${new Date(node.createdAt).toLocaleDateString()}`;

                return (
                  <div key={node.id} className="relative">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(node.id)}
                      onChange={() => {
                        setSelectedIds(prev => {
                          const next = new Set(prev);
                          if (next.has(node.id)) next.delete(node.id);
                          else next.add(node.id);
                          return next;
                        });
                      }}
                      className="absolute top-2 left-2 z-10"
                    />
                    <NodeCard
                      title={node.title}
                      preview={preview}
                      meta={meta}
                      type={CardType.NODE}
                      nodeKindLabel={node.nodeType === 'ATTRIBUTE' ? 'Attribute' : 'Regular'}
                      onClick={() => router.push(`/spaces/${spaceSlug}/node/${node.id}`)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setAssignNodeIds([node.id]);
                        setAssignOpen(true);
                      }}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <AssignToContextDialog
          spaceSlug={spaceSlug}
          nodeIds={assignNodeIds}
          open={assignOpen}
          onOpenChange={setAssignOpen}
          onAssigned={() => {
            setSelectedIds(new Set());
            setAssignNodeIds([]);
          }}
        />
      </div>
    </ProtectedRoute>
  );
}
