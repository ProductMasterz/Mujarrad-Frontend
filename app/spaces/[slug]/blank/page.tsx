'use client';

import { useState, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { SpaceShell } from '@/shell/components/SpaceShell';
import { NodeGrid } from '@/shell/components/NodeGrid';
import { useBlankNodes, useBlankCount } from '@/hooks/api/useBlankNodes';
import { useSpace, nodeKeys, useRenameNodeSimple } from '@/hooks/api';
import { AssignToContextDialog } from '@/components/blank/AssignToContextDialog';
import { Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Node } from '@/types/backend-dtos';

export default function BlankPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const spaceSlug = params.slug as string;

  const { data: space } = useSpace(spaceSlug);
  const { data: nodes = [], isLoading } = useBlankNodes(spaceSlug);
  const { data: count = 0 } = useBlankCount(spaceSlug);
  const { rename: renameNode } = useRenameNodeSimple(spaceSlug);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'updatedAt'>('updatedAt');

  // Assign to context
  const [assignNodeIds, setAssignNodeIds] = useState<string[]>([]);
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Context menu state
  const [contextMenuNode, setContextMenuNode] = useState<Node | null>(null);
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);

  const blankNodes = useMemo(() => (Array.isArray(nodes) ? nodes : []), [nodes]);

  const breadcrumbPath = useMemo(
    () => [
      { id: 'home', title: 'Home' },
      { id: 'spaces', title: 'Spaces' },
      { id: space?.id || spaceSlug, title: space?.name || spaceSlug },
      { id: 'blank', title: 'The Blank' },
    ],
    [space, spaceSlug]
  );

  const handleCardClick = useCallback(
    (node: Node) => {
      router.push(`/spaces/${spaceSlug}/node/${node.id}`);
    },
    [router, spaceSlug]
  );

  const handleCardContextMenu = useCallback((e: React.MouseEvent, node: Node) => {
    e.preventDefault();
    setContextMenuNode(node);
    setContextMenuPos({ x: e.clientX, y: e.clientY });
  }, []);

  const handleContextMenuAction = useCallback(
    (action: string, node: Node) => {
      if (action === 'assign' || action === 'duplicate') {
        setAssignNodeIds([node.id]);
        setAssignOpen(true);
      }
    },
    []
  );

  const handleRename = useCallback(
    async (nodeId: string, newName: string) => {
      return renameNode(nodeId, newName);
    },
    [renameNode]
  );

  const invalidateNodes = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: nodeKeys.list(spaceSlug, { page: 0, size: 1000 }) });
  }, [queryClient, spaceSlug]);

  return (
    <SpaceShell
      title="The Blank"
      spaceSlug={spaceSlug}
      breadcrumbPath={breadcrumbPath}
      contextMenuNode={contextMenuNode}
      contextMenuPosition={contextMenuPos}
      onContextMenuClose={() => {
        setContextMenuNode(null);
        setContextMenuPos(null);
      }}
      onContextMenuAction={handleContextMenuAction}
      newNodeModalDefaultType="node"
      newNodeModalAvailableTypes={['node']}
      deleteSpaceSlug={spaceSlug}
      onDeleteSuccess={invalidateNodes}
      onRenameSuccess={() => invalidateNodes()}
      onRename={handleRename}
    >
      {/* Title area */}
      <div className="mb-4 rounded-[22px] border border-border bg-background px-5 py-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[28px] font-semibold leading-tight text-foreground">The Blank</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {count} unorganized {count === 1 ? 'node' : 'nodes'}
            </p>
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

      {/* Search and Sort bar */}
      <div className="mb-5 rounded-[18px] border border-border/60 bg-background px-4 py-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search blank nodes..."
            className="h-[42px] w-full sm:flex-1 rounded-xl border border-border/70 bg-background px-4 text-[14px] text-foreground outline-none transition placeholder:text-muted-foreground/80 focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-medium text-muted-foreground">Sort by</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'createdAt' | 'updatedAt')}
              className="h-[42px] min-w-[180px] rounded-xl border border-border/70 bg-background px-4 text-[14px] text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            >
              <option value="updatedAt">Date modified</option>
              <option value="createdAt">Date created</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>
      </div>

      <NodeGrid
        nodes={blankNodes}
        isLoading={isLoading}
        emptyIcon={<Inbox className="h-8 w-8 text-gray-400" />}
        emptyTitle="No unorganized nodes"
        emptySubtitle="All nodes in this space are assigned to a context"
        searchTerm={searchTerm}
        sortBy={sortBy}
        onCardClick={handleCardClick}
        onCardContextMenu={handleCardContextMenu}
        renderCardWrapper={(node, card) => (
          <div className="relative">
            <input
              type="checkbox"
              checked={selectedIds.has(node.id)}
              onChange={() => {
                setSelectedIds((prev) => {
                  const next = new Set(prev);
                  if (next.has(node.id)) next.delete(node.id);
                  else next.add(node.id);
                  return next;
                });
              }}
              className="absolute top-2 left-2 z-10"
            />
            {card}
          </div>
        )}
      />

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
    </SpaceShell>
  );
}
