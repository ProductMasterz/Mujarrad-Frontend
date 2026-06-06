'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { SpaceShell } from '@/shell/components/SpaceShell';
import { NodeGrid } from '@/shell/components/NodeGrid';
import { useContextNodes, useChildContexts, useRemoveFromContext, contextNodeKeys } from '@/hooks/api/useContextNodes';
import { useSpace, nodeKeys, useRenameNodeSimple } from '@/hooks/api';
import { nodeService } from '@/services/api/node.service';
import { useContextTypes } from '@/hooks/api/useContextTypes';
import { NodeType } from '@/types/backend-dtos';
import { CardType } from '@/shell/data/projects';
import { ProjectCard } from '@/shell/components/ProjectCard';
import { FileText } from 'lucide-react';
import { VCPanel } from '@/components/virtual-contexts/VCPanel';
import { ContextSchemaSection } from '@/components/schemas/ContextSchemaSection';
import { useNotificationStore } from '@/stores/notificationStore';
import { useParentCounts } from '@/hooks/api/useParentCounts';
import { useNavigationStore } from '@/stores/navigationStore';
import type { Node } from '@/types/backend-dtos';

export default function ContextDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const spaceSlug = params.slug as string;
  const contextSlug = params.contextSlug as string;
  const addNotification = useNotificationStore((state) => state.addNotification);

  const navigateToContext = useNavigationStore((state) => state.navigateToContext);

  const { data: space } = useSpace(spaceSlug);

  useEffect(() => {
    if (space) {
      navigateToContext(spaceSlug, space.id, contextSlug);
    }
  }, [space, spaceSlug, contextSlug, navigateToContext]);
  const { data: nodes = [], isLoading, isFetching, isError } = useContextNodes(spaceSlug, contextSlug);
  const { data: childContexts = [] } = useChildContexts(spaceSlug, contextSlug);
  const { rename: renameNode } = useRenameNodeSimple(spaceSlug);
  const removeFromContext = useRemoveFromContext();

  const isBackend = space?.projectType === 'BACKEND';
  const isProduction = space?.mode === 'PRODUCTION';

  const { data: contextTypes = [] } = useContextTypes(space?.id || '');
  const contextType = useMemo(
    () => contextTypes.find((ct) => ct.slug === contextSlug) ?? null,
    [contextTypes, contextSlug]
  );

  const { data: allSpaceNodes = [] } = useQuery({
    queryKey: nodeKeys.list(spaceSlug, { page: 0, size: 100 }),
    queryFn: () => nodeService.getNodes(spaceSlug),
    enabled: !!spaceSlug,
  });
  const contextNode = useMemo(
    () => allSpaceNodes.find((n: Node) => n.slug === contextSlug && n.nodeType === NodeType.CONTEXT),
    [allSpaceNodes, contextSlug]
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'updatedAt'>('updatedAt');

  const [contextMenuNode, setContextMenuNode] = useState<Node | null>(null);
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);

  const regularNodes = useMemo(
    () => nodes.filter((n: Node) => n.nodeType !== NodeType.CONTEXT && !n.isBuiltin),
    [nodes]
  );

  const allNodeIds = useMemo(() => nodes.map((n: Node) => n.id), [nodes]);
  const parentCounts = useParentCounts(allNodeIds);

  const getNodeBadge = useCallback(
    (node: Node) => {
      const count = parentCounts.get(node.id);
      if (count && count > 1) return `${count} contexts`;
      return undefined;
    },
    [parentCounts]
  );

  const contextName = contextSlug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  const breadcrumbPath = useMemo(
    () => [
      { id: 'home', title: 'Home' },
      { id: 'spaces', title: 'Spaces' },
      { id: space?.id || spaceSlug, title: space?.name || spaceSlug },
      { id: contextSlug, title: contextName },
    ],
    [space, spaceSlug, contextSlug, contextName]
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

  const handleRename = useCallback(
    async (nodeId: string, newName: string) => {
      return renameNode(nodeId, newName);
    },
    [renameNode]
  );

  const invalidateNodes = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: nodeKeys.list(spaceSlug, { page: 0, size: 1000 }) });
  }, [queryClient, spaceSlug]);

  const handleRemoveFromContext = useCallback(
    async (node: Node) => {
      try {
        await removeFromContext.mutateAsync({
          spaceSlug,
          contextSlug,
          nodeId: node.id,
        });
        addNotification({
          type: 'success',
          source: 'node',
          title: `"${node.title}" removed from context`,
        });
      } catch {
        addNotification({
          type: 'error',
          source: 'node',
          title: 'Failed to remove node from context',
        });
      }
    },
    [removeFromContext, spaceSlug, contextSlug, addNotification]
  );

  const handleContextMenuAction = useCallback(
    (action: string, node: Node) => {
      if (action === 'removeFromContext') {
        handleRemoveFromContext(node);
      }
    },
    [handleRemoveFromContext]
  );

  return (
    <SpaceShell
      title={contextName}
      spaceSlug={spaceSlug}
      breadcrumbPath={breadcrumbPath}
      contextMenuNode={contextMenuNode}
      contextMenuPosition={contextMenuPos}
      onContextMenuClose={() => {
        setContextMenuNode(null);
        setContextMenuPos(null);
      }}
      onContextMenuAction={handleContextMenuAction}
      contextSlug={contextSlug}
      newNodeModalDefaultType="node"
      newNodeModalAvailableTypes={['node', 'context']}
      deleteSpaceSlug={spaceSlug}
      onDeleteSuccess={invalidateNodes}
      onRenameSuccess={() => invalidateNodes()}
      onRename={handleRename}
    >
      {/* View Context Content button — navigates to block editor for this context node */}
      {contextNode && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={() =>
              router.push(
                `/spaces/${spaceSlug}/node/${contextNode.id}?fromContext=${encodeURIComponent(contextSlug)}`
              )
            }
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            View Context Content
          </button>
        </div>
      )}

      {/* Schema Section — only for BACKEND spaces */}
      {isBackend && (
        <div className="mb-5">
          <ContextSchemaSection
            contextType={contextType}
            isLocked={isProduction}
          />
        </div>
      )}

      {/* Search and Sort bar */}
      <div className="mb-5 rounded-[18px] border border-border/60 bg-background px-4 py-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search nodes..."
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

      {/* Connections */}
      {space?.id && (
        <div className="mb-5 rounded-[18px] border border-border/60 bg-background px-4 py-4 shadow-sm">
          <VCPanel spaceSlug={spaceSlug} spaceId={space.id} />
        </div>
      )}

      {/* Child Contexts */}
      {childContexts.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground mb-3">
            Sub-Contexts ({childContexts.length})
          </h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
            {childContexts.map((ctx: Node) => (
              <ProjectCard
                key={ctx.id}
                title={ctx.title}
                color="#9333ea"
                type={CardType.FULFILLED_CONTEXT}
                onClick={() => router.push(`/spaces/${spaceSlug}/context/${ctx.slug}`)}
                onContextMenu={(e) => handleCardContextMenu(e, ctx)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Nodes */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Nodes ({regularNodes.length})
        </h2>
        {isFetching && !isLoading && (
          <span className="text-xs text-muted-foreground animate-pulse">Refreshing…</span>
        )}
      </div>

      {isError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-8 text-center">
          <p className="text-sm font-medium text-destructive">Failed to load nodes</p>
          <p className="mt-1 text-xs text-muted-foreground">The context may not exist or the server is unavailable.</p>
          <button
            type="button"
            onClick={() => queryClient.invalidateQueries({ queryKey: contextNodeKeys.nodes(spaceSlug, contextSlug) })}
            className="mt-3 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition"
          >
            Retry
          </button>
        </div>
      ) : (
        <NodeGrid
          nodes={regularNodes}
          isLoading={isLoading}
          emptyIcon={<FileText className="h-8 w-8 text-muted-foreground/50" />}
          emptyTitle="No nodes in this context"
          searchTerm={searchTerm}
          sortBy={sortBy}
          getNodeBadge={getNodeBadge}
          onCardClick={handleCardClick}
          onCardContextMenu={handleCardContextMenu}
        />
      )}
    </SpaceShell>
  );
}
