'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Header } from '@/shell/components/Header';
import { Sidebar } from '@/shell/components/Sidebar';
import { ContextMenu } from '@/shell/components/ContextMenu';
import { NewNodeModal, EntityType } from '@/shell/components/NewNodeModal';
import { ShareModal } from '@/shell/components/ShareModal';
import { Tab } from '@/shell/components/TabsBar';
import { CardType, Card } from '@/shell/data/projects';
import { DeleteNodeDialog } from '@/components/nodes/DeleteNodeDialog';
import { RenameModal } from '@/shell/components/RenameModal';
import { useSpace, nodeKeys, useRenameNodeSimple } from '@/hooks/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { nodeService } from '@/services/api/node.service';
import { useNavigationStore } from '@/stores/navigationStore';
import type { Node } from '@/types/backend-dtos';
import { NodeType } from '@/types/backend-dtos';
import { ProjectCard } from '@/shell/components/ProjectCard';
import { spaceService } from '@/services/api';
import { useNotificationStore } from '@/stores/notificationStore';
import { FolderOpen } from 'lucide-react';
import { getNodeRoute } from '@/lib/routing';
import { LockedBanner } from '@/components/locking/LockedBanner';
import { SpaceLockToggle } from '@/components/locking/SpaceLockToggle';
import { SpaceModeToggle } from '@/components/locking/SpaceModeToggle';
import { BlankBadge } from '@/components/blank/BlankBadge';
import { MakeChildOfDialog } from '@/components/contexts/MakeChildOfDialog';

function isAgentCreatedNode(node: Node): boolean {
  let details: Record<string, unknown> | undefined;

  if (typeof node.nodeDetails === 'string') {
    try {
      details = JSON.parse(node.nodeDetails);
    } catch {
      details = undefined;
    }
  } else {
    details = node.nodeDetails as Record<string, unknown> | undefined;
  }

  return (
    details?.createdFrom === 'chat' ||
    details?.createdFrom === 'agent' ||
    details?.source === 'chat' ||
    details?.source === 'agent' ||
    details?.generatedBy === 'chat' ||
    details?.generatedBy === 'agent' ||
    details?.chatNodeType === 'entity'
  );
}

// Convert Node to Scratchup Card format
function nodeToCard(node: Node): Card {
  // Determine card type based on node type
  let cardType = CardType.NODE;
  if (node.nodeType === NodeType.CONTEXT) {
    cardType = CardType.FULFILLED_CONTEXT;
  } else if (node.nodeType === NodeType.REGULAR) {
    cardType = CardType.NODE;
  }

  return {
    id: node.id,
    title: node.title,
    color: '#248bf2', // Default blue color
    type: cardType,
  };
}

function getNodeDetails(node: Node): Record<string, unknown> | undefined {
  if (typeof node.nodeDetails === 'string') {
    try {
      return JSON.parse(node.nodeDetails);
    } catch {
      return undefined;
    }
  }

  return node.nodeDetails as Record<string, unknown> | undefined;
}

function isDisplayableNode(node: Node): boolean {
  const details = getNodeDetails(node);

  if (details?.showInSpaceList === false) return false;
  if (details?.blockType) return false;

  return true;
}



export default function SpaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const navigateToSpace = useNavigationStore((state) => state.navigateToSpace);
  const slug = params.slug as string;
  const { rename: renameNode } = useRenameNodeSimple(slug);
  // Fetch space data
  const { data: space, isLoading: spaceLoading, error: spaceError } = useSpace(slug);

  // Set navigation scope when space loads
  useEffect(() => {
    if (space) {
      navigateToSpace(slug, space.id);
    }
  }, [space, slug, navigateToSpace]);

  // Fetch nodes for this space using standardized query keys
  const { data: nodes, isLoading: nodesLoading } = useQuery({
    queryKey: nodeKeys.list(slug, { page: 0, size: 1000 }),
    queryFn: () => nodeService.getNodes(slug, { page: 0, size: 1000 }),
    enabled: !!space,
  });

  const { data: allSpaces = [] } = useQuery({
    queryKey: ['spaces'],
    queryFn: () => spaceService.getSpaces(),
  });

  // UI State
  const [showNewNodeModal, setShowNewNodeModal] = useState(false);
  const [modalDefaultType, setModalDefaultType] = useState<EntityType>('node');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showClearSpaceDialog, setShowClearSpaceDialog] = useState(false);
  const [isClearingSpace, setIsClearingSpace] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<Node | null>(null);
  const [nodeToRename, setNodeToRename] = useState<Node | null>(null);
  const [selectedCardId, setSelectedCardId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'updatedAt'>('updatedAt');
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    cardId: string;
  } | null>(null);
  const [makeChildOfNode, setMakeChildOfNode] = useState<Node | null>(null);

  // Navigation state
  const addNotification = useNotificationStore((state) => state.addNotification);
  // Tabs state
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: 'tab-1',
      title: 'Space',
      navigationPath: [],
      spaceId: slug,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState('tab-1');

  // Update tab title when space loads
  useEffect(() => {
    if (space) {
      setTabs((prevTabs) =>
        prevTabs.map((tab) =>
          tab.id === 'tab-1' ? { ...tab, title: space.name } : tab
        )
      );
    }
  }, [space]);


  const allDisplayableNodes = useMemo(() => {
    return (nodes || []).filter(isDisplayableNode);
  }, [nodes]);



  const contexts = useMemo(() => {
    return allDisplayableNodes.filter(n => n.nodeType === NodeType.CONTEXT && !n.isBuiltin);
  }, [allDisplayableNodes]);

  const filteredContexts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let result = contexts;
    if (term) {
      result = result.filter(ctx => ctx.title.toLowerCase().includes(term));
    }
    return result.sort((a, b) => {
      if (sortBy === 'name') return a.title.localeCompare(b.title);
      if (sortBy === 'createdAt') return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      return new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime();
    });
  }, [contexts, searchTerm, sortBy]);

  const totalNodeCount = allDisplayableNodes.length;

  const aiNodeCount = useMemo(
    () => allDisplayableNodes.filter((node) => isAgentCreatedNode(node)).length,
    [allDisplayableNodes]
  );

  const contextCount = useMemo(
    () => allDisplayableNodes.filter((node) => node.nodeType === NodeType.CONTEXT).length,
    [allDisplayableNodes]
  );

  const sidebarData = useMemo(() => allDisplayableNodes.map(nodeToCard), [allDisplayableNodes]);

  const chatAvailableSpaces = useMemo(
    () =>
      (Array.isArray(allSpaces) ? allSpaces : []).map((space) => ({
        id: space.id,
        name: space.name,
        slug: space.slug,
      })),
    [allSpaces]
  );


  // Build breadcrumb
  const breadcrumbPath = useMemo(() => {
    return [
      { id: 'home', title: 'Home' },
      { id: 'spaces', title: 'Spaces' },
      { id: space?.id || slug, title: space?.name || slug },
    ];
  }, [space, slug]);

  // Loading state
  const isLoading = spaceLoading || nodesLoading;

  // Handlers
  const toggleSidebar = () => {};

  const handleCardClick = (cardId: string) => {
    // Navigate to node detail page (markdown editor)
    router.push(`/spaces/${slug}/node/${cardId}`);
  };

  const handleSidebarNavigate = (path: string[]) => {
    if (path.length > 0) {
      const nodeId = path[path.length - 1];
      const node = nodes?.find((n) => n.id === nodeId);
      if (node) {
        router.push(getNodeRoute(slug, node));
      } else {
        router.push(`/spaces/${slug}/node/${nodeId}`);
      }
    }
  };

  const handleHomeClick = () => {
    router.push('/');
  };

  const handleBackClick = () => {
    router.push('/spaces');
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === -1 || index === 0) {
      router.push('/');
      return;
    }

    if (index === 1) {
      router.push('/spaces');
      return;
    }

    if (index === 2) {
      router.push(`/spaces/${slug}`);
    }
  };

  const handleAddNode = () => {
    setModalDefaultType('node');
    setShowNewNodeModal(true);
  };

  const handleAddContext = () => {
    setModalDefaultType('context');
    setShowNewNodeModal(true);
  };

  const handleCardContextMenu = (e: React.MouseEvent, cardId: string) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      cardId,
    });
  };

  const handleContextMenuAction = (action: string) => {
    if (!contextMenu) return;

    const node = nodes?.find((n) => n.id === contextMenu.cardId);

    switch (action) {
      case 'openNewTab':
        if (node) {
          if (node.nodeType === NodeType.CONTEXT && node.slug) {
            window.open(`/spaces/${slug}/context/${node.slug}`, '_blank');
          } else {
            window.open(`/spaces/${slug}/node/${node.id}`, '_blank');
          }
        }
        break;
      case 'openAsNode':
        if (node) {
          if (node.nodeType === NodeType.CONTEXT && node.slug) {
            router.push(`/spaces/${slug}/context/${node.slug}`);
          } else {
            router.push(`/spaces/${slug}/node/${node.id}`);
          }
        }
        break;
      case 'rename':
        if (node) {
          setNodeToRename(node);
          setShowRenameModal(true);
        }
        break;
      case 'share':
        setSelectedCardId(contextMenu.cardId);
        setShowShareModal(true);
        break;
      case 'assign':
        if (node) {
          setMakeChildOfNode(node);
        }
        break;
      case 'delete':
        if (node) {
          setNodeToDelete(node);
          setShowDeleteDialog(true);
        }
        break;
    }
    setContextMenu(null);
  };

  const handleShareClick = () => {
    setSelectedCardId('current-project');
    setShowShareModal(true);
  };

  const handleWhiteboardClick = () => {
    router.push(`/spaces/${slug}/whiteboard`);

  };

  const handleGraphClick = () => {
    router.push(`/spaces/${slug}/graph`);
  };

 

  // Tab management
  const handleTabClick = (tabId: string) => {
    setActiveTabId(tabId);
  };

  const handleTabClose = (tabId: string) => {
    if (tabs.length === 1) return;
    const newTabs = tabs.filter((t) => t.id !== tabId);
    setTabs(newTabs);
    if (activeTabId === tabId) {
      setActiveTabId(newTabs[0].id);
    }
  };

  const handleNewTab = () => {
    const newTab: Tab = {
      id: `tab-${Date.now()}`,
      title: space?.name || 'Space',
      navigationPath: [],
      spaceId: slug,
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
  };

  const handleDeleteSuccess = () => {
    const deletedTitle = nodeToDelete?.title || 'Node';

    addNotification({
      type: 'warning',
      source: 'node',
      title: 'Node deleted',
      description: `${deletedTitle} was removed from this space.`,
    });

    setShowDeleteDialog(false);
    setNodeToDelete(null);
    queryClient.invalidateQueries({ queryKey: nodeKeys.list(slug, { page: 0, size: 1000 }) });
  };

  // Handle node rename using shared hook
  const handleRename = async (newName: string) => {
    if (!nodeToRename) return;

    const result = await renameNode(nodeToRename.id, newName);

    if (result.success) {
      addNotification({
        type: 'info',
        source: 'node',
        title: 'Node renamed',
        description: `Node renamed to "${newName}".`,
      });

      queryClient.invalidateQueries({
        queryKey: nodeKeys.list(slug, { page: 0, size: 1000 }),
      });
    } else {
      addNotification({
        type: 'error',
        source: 'node',
        title: 'Rename failed',
        description: result.error || 'Failed to rename node.',
      });

      throw new Error(result.error || 'Failed to rename node');
    }
  };


  const handleConfirmClearSpace = async () => {
    if (!nodes || nodes.length === 0) {
      setShowClearSpaceDialog(false);
      return;
    }

    setIsClearingSpace(true);

    try {
      await Promise.all(nodes.map((node) => nodeService.deleteNode(slug, node.id)));

      addNotification({
        type: 'warning',
        source: 'node',
        title: 'Space cleared',
        description: `All nodes were removed from ${space?.name || 'this space'}.`,
      });

      queryClient.invalidateQueries({
        queryKey: nodeKeys.list(slug, { page: 0, size: 1000 }),
      });
    } catch (error) {
      console.error('Failed to clear space:', error);

      addNotification({
        type: 'error',
        source: 'node',
        title: 'Clear space failed',
        description: `Could not clear ${space?.name || 'this space'}.`,
      });
    } finally {
      setIsClearingSpace(false);
      setShowClearSpaceDialog(false);
    }
  };

  // Error state
  if (spaceError) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
          <div className="text-center">
            <h1
              className="text-[24px] font-['Roboto:Bold',sans-serif] font-bold text-foreground mb-2"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              Space not found
            </h1>
            <p
              className="text-[15px] font-['Roboto:Regular',sans-serif] font-normal text-muted-foreground mb-4"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              The space you&apos;re looking for doesn&apos;t exist.
            </p>
            <button
              onClick={() => router.push('/spaces')}
              className="h-[36px] rounded-[100px] bg-primary px-[20px] font-['Roboto:SemiBold',sans-serif] text-[14px] font-semibold tracking-[-0.24px] text-primary-foreground transition hover:opacity-90"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              Back to Spaces
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="bg-background text-foreground min-h-screen relative">
        <Header
          onMenuClick={toggleSidebar}
          onBackClick={handleBackClick}
          showBackButton={true}
          breadcrumbPath={breadcrumbPath}
          onHomeClick={handleHomeClick}
          onBreadcrumbClick={handleBreadcrumbClick}
          onShare={handleShareClick}
          tabs={tabs}
          activeTabId={activeTabId}
          onTabClick={handleTabClick}
          onTabClose={handleTabClose}
          onNewTab={handleNewTab}
          chatAvailableSpaces={chatAvailableSpaces}
          onChatChangeSpace={(nextSpaceSlug) => {
            router.push(`/spaces/${nextSpaceSlug}`);
          }}
          onCreateNode={() => setShowNewNodeModal(true)}
        />

        <Sidebar
          isOpen={false}
          selectedItem={null}
          onNavigate={handleSidebarNavigate}
          items={sidebarData}
        />

        {/* Main content */}

        <div
          className="px-5 pt-[126px] pb-8 transition-all duration-300"
          style={{
            marginLeft: '0',
          }}
        >
          {space?.isLocked && (
            <div className="mb-4">
              <LockedBanner spaceSlug={slug} />
            </div>
          )}

          <div className="mb-4 rounded-[22px] border border-border bg-background px-5 py-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-[28px] font-semibold leading-tight text-foreground">
                    {space?.name || 'Space'}
                  </h1>
                  <BlankBadge spaceSlug={slug} />
                  {space?.isLocked && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/40 dark:text-red-200">
                      Locked
                    </span>
                  )}
                </div>
                <p className="mt-1 max-w-[680px] text-sm leading-5 text-muted-foreground">
                  Review, create, and organize structured nodes and contexts in this space.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleAddNode}
                  className="inline-flex h-9 items-center rounded-xl bg-foreground px-3.5 text-sm font-medium text-background transition hover:opacity-90"
                  type="button"
                >
                  New Node
                </button>

                <button
                  onClick={() => setShowNewNodeModal(true)}
                  className="inline-flex h-9 items-center rounded-xl border border-border bg-background px-3.5 text-sm font-medium text-foreground transition hover:bg-muted"
                  type="button"
                >
                  New
                </button>

                <button
                  onClick={handleGraphClick}
                  className="inline-flex h-9 items-center rounded-xl border border-border bg-background px-3.5 text-sm font-medium text-foreground transition hover:bg-muted"
                  type="button"
                >
                  Graph
                </button>

                <button
                  onClick={handleWhiteboardClick}
                  className="inline-flex h-9 items-center rounded-xl border border-border bg-background px-3.5 text-sm font-medium text-foreground transition hover:bg-muted"
                  type="button"
                >
                  Whiteboard
                </button>

                <SpaceModeToggle
                  spaceId={space?.id || ''}
                  currentMode={space?.mode || null}
                  projectType={space?.projectType || 'CONSUMER'}
                  isLocked={!!space?.isLocked}
                />
                <SpaceLockToggle spaceSlug={slug} isLocked={!!space?.isLocked} />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2.5">
              <div className="min-w-[120px] rounded-2xl border border-border/60 bg-muted/20 px-4 py-3">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Nodes</div>
                <div className="mt-1 text-xl font-semibold leading-none text-foreground">{totalNodeCount}</div>
              </div>

              <div className="min-w-[120px] rounded-2xl border border-border/60 bg-muted/20 px-4 py-3">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">AI Created</div>
                <div className="mt-1 text-xl font-semibold leading-none text-foreground">{aiNodeCount}</div>

              </div>

              <div className="min-w-[120px] rounded-2xl border border-border/60 bg-muted/20 px-4 py-3">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Contexts</div>
                <div className="mt-1 text-xl font-semibold leading-none text-foreground">{contextCount}</div>
              </div>
            </div>
          </div>
          <div className="mb-5 rounded-[18px] border border-border/60 bg-background px-4 py-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search contexts by name..."
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

          {isLoading ? (
            <div className="flex items-center justify-center h-[400px]">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            <>
              {/* Contexts Section */}
              <div className="mb-6">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                    Contexts ({filteredContexts.length})
                  </h2>
                </div>
                {filteredContexts.length === 0 ? (
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
                    <div className="rounded-lg border border-dashed border-purple-200 dark:border-purple-800 p-6 text-center col-span-full sm:col-span-1">
                      <FolderOpen className="h-6 w-6 mx-auto text-purple-400 mb-1" />
                      <p className="text-xs text-muted-foreground">
                        {searchTerm.trim() ? 'No matching contexts' : 'No contexts yet'}
                      </p>
                    </div>
                    <ProjectCard
                      title="The Blank"
                      color="#9ca3af"
                      type={CardType.FULFILLED_CONTEXT}
                      onClick={() => {
                        router.push(`/spaces/${slug}/blank`);
                      }}
                      onContextMenu={(e) => e.preventDefault()}
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
                    {filteredContexts.map((ctx) => (
                      <ProjectCard
                        key={ctx.id}
                        title={ctx.title}
                        color="#9333ea"
                        type={CardType.FULFILLED_CONTEXT}
                        onClick={() => router.push(`/spaces/${slug}/context/${ctx.slug}`)}
                        onContextMenu={(e) => handleCardContextMenu(e, ctx.id)}
                      />
                    ))}
                    {/* The Blank card — always visible alongside contexts */}
                    <ProjectCard
                      title="The Blank"
                      color="#9ca3af"
                      type={CardType.FULFILLED_CONTEXT}
                      onClick={() => {
                        router.push(`/spaces/${slug}/blank`);
                      }}
                      onContextMenu={(e) => e.preventDefault()}
                    />
                  </div>
                )}
              </div>

            </>
          )}
        </div>

        {/* New Node Modal - at space level, default based on which action was triggered */}
        {space && (
          <NewNodeModal
            isOpen={showNewNodeModal}
            onClose={() => setShowNewNodeModal(false)}
            spaceSlug={slug}
            defaultType={modalDefaultType}
            availableTypes={['node', 'context']}
          />
        )}

        {/* Context Menu */}
        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={() => setContextMenu(null)}
            onOpenNewTab={() => handleContextMenuAction('openNewTab')}
            onOpenAsNode={() => handleContextMenuAction('openAsNode')}
            openAsLabel="Open Context"
            onMakeChildOf={() => handleContextMenuAction('assign')}
            onRename={() => handleContextMenuAction('rename')}
            onDuplicate={() => handleContextMenuAction('duplicate')}
            onShare={() => handleContextMenuAction('share')}
            onDelete={() => handleContextMenuAction('delete')}
          />
        )}

        {/* Make a Child Of Dialog */}
        {makeChildOfNode && (
          <MakeChildOfDialog
            spaceSlug={slug}
            node={makeChildOfNode}
            open={!!makeChildOfNode}
            onOpenChange={(open) => { if (!open) setMakeChildOfNode(null); }}
            onSuccess={() => {
              setMakeChildOfNode(null);
              queryClient.invalidateQueries({ queryKey: nodeKeys.list(slug, { page: 0, size: 1000 }) });
            }}
          />
        )}

        {/* Delete Node Dialog */}
        {showDeleteDialog && nodeToDelete && (
          <DeleteNodeDialog
            spaceSlug={slug}
            nodeId={nodeToDelete.id}
            nodeName={nodeToDelete.title}
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            onSuccess={handleDeleteSuccess}
            showTrigger={false}
          />
        )}

        {/* Share Modal */}
        {showShareModal && (
          <ShareModal
            isOpen={showShareModal}
            onClose={() => setShowShareModal(false)}
            cardId={selectedCardId}
            cardType={CardType.FULFILLED_CONTEXT}
          />
        )}

  

        {/* Rename Modal */}
        {nodeToRename && (
          <RenameModal
            isOpen={showRenameModal}
            onClose={() => {
              setShowRenameModal(false);
              setNodeToRename(null);
            }}
            currentName={nodeToRename.title}
            onRename={handleRename}
            entityLabel={nodeToRename.nodeType === NodeType.CONTEXT ? 'Context' : 'Node'}
          />
        )}

        {/* Clear Space Confirmation Dialog */}
        {showClearSpaceDialog && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50">
            <div className="bg-background border border-border rounded-[16px] p-[24px] w-[400px] shadow-lg">
              <h2
                className="text-[18px] font-['Roboto:Bold',sans-serif] font-bold text-foreground mb-[12px]"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                Clear Space
              </h2>
              <p
                className="text-[14px] font-['Roboto:Regular',sans-serif] font-normal text-muted-foreground mb-[24px]"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                Are you sure you want to delete all {nodes?.length || 0} nodes in this space? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-[12px]">
                <button
                  onClick={() => setShowClearSpaceDialog(false)}
                  disabled={isClearingSpace}
                  className="h-[36px] px-[20px] bg-secondary rounded-[100px] font-['Roboto:SemiBold',sans-serif] font-semibold text-[14px] text-foreground tracking-[-0.24px] hover:bg-accent transition-colors disabled:opacity-50"
                  style={{ fontVariationSettings: "'wdth' 100" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmClearSpace}
                  disabled={isClearingSpace}
                  className="h-[36px] px-[20px] bg-[#d4183d] rounded-[100px] font-['Roboto:SemiBold',sans-serif] font-semibold text-[14px] text-white tracking-[-0.24px] hover:bg-[#b31533] transition-colors disabled:opacity-50 flex items-center gap-[8px]"
                  style={{ fontVariationSettings: "'wdth' 100" }}
                >
                  {isClearingSpace ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      Clearing...
                    </>
                  ) : (
                    'Clear All Nodes'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}