'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SpaceShell } from '@/shell/components/SpaceShell';
import { NodeGrid } from '@/shell/components/NodeGrid';
import { useVoidNodes, useDeleteVoidNode } from '@/hooks/api/useVoidNodes';
import { useNotificationStore } from '@/stores/notificationStore';
import { AssignVoidDialog } from '@/components/void/AssignVoidDialog';
import { CloudOff, ArrowRightCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Node } from '@/types/backend-dtos';

export default function VoidPage() {
  const router = useRouter();
  const { data: nodes, isLoading } = useVoidNodes();
  const deleteMutation = useDeleteVoidNode();
  const addNotification = useNotificationStore((s) => s.addNotification);

  const [assignNodeId, setAssignNodeId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'updatedAt'>('updatedAt');

  // Context menu state
  const [contextMenuNode, setContextMenuNode] = useState<Node | null>(null);
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);

  const voidNodes: Node[] = useMemo(() => (Array.isArray(nodes) ? nodes : []), [nodes]);

  const breadcrumbPath = useMemo(
    () => [
      { id: 'home', title: 'Home' },
      { id: 'spaces', title: 'Spaces' },
      { id: 'void', title: 'The Void' },
    ],
    []
  );

  const handleDelete = useCallback(
    (nodeId: string) => {
      deleteMutation.mutate(nodeId, {
        onSuccess: () => {
          addNotification({ type: 'success', source: 'node', title: 'Note deleted' });
        },
      });
    },
    [deleteMutation, addNotification]
  );

  const handleCardClick = useCallback(
    (node: Node) => {
      setAssignNodeId(node.id);
    },
    []
  );

  const handleCardContextMenu = useCallback((e: React.MouseEvent, node: Node) => {
    e.preventDefault();
    setContextMenuNode(node);
    setContextMenuPos({ x: e.clientX, y: e.clientY });
  }, []);

  const handleContextMenuAction = useCallback(
    (action: string, node: Node) => {
      if (action === 'assign') {
        setAssignNodeId(node.id);
      }
    },
    []
  );

  return (
    <SpaceShell
      title="The Void"
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
    >
      {/* Search and Sort bar */}
      <div className="mb-5 rounded-[18px] border border-border/60 bg-background px-4 py-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search void notes..."
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
        nodes={voidNodes}
        isLoading={isLoading}
        emptyIcon={<CloudOff className="h-8 w-8 text-neutral-400" />}
        emptyTitle="No quick notes yet"
        emptySubtitle="Use the New button to capture ideas fast"
        searchTerm={searchTerm}
        sortBy={sortBy}
        onCardClick={handleCardClick}
        onCardContextMenu={handleCardContextMenu}
        getNodeKindLabel={() => 'Void Note'}
        renderCardWrapper={(node, card) => (
          <div className="relative group">
            {card}
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 bg-background/80"
                onClick={(e) => {
                  e.stopPropagation();
                  setAssignNodeId(node.id);
                }}
              >
                <ArrowRightCircle className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 bg-background/80 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(node.id);
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      />

      {assignNodeId && (
        <AssignVoidDialog
          nodeId={assignNodeId}
          open={!!assignNodeId}
          onOpenChange={(open) => {
            if (!open) setAssignNodeId(null);
          }}
        />
      )}
    </SpaceShell>
  );
}
