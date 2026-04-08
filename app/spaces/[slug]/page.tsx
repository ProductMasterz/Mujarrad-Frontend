'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Header } from '@/shell/components/Header';
import { Sidebar } from '@/shell/components/Sidebar';
import { ContextMenu } from '@/shell/components/ContextMenu';
import { NewNodeModal, EntityType } from '@/shell/components/NewNodeModal';
import { ShareModal } from '@/shell/components/ShareModal';
import { FeedbackModal } from '@/shell/components/FeedbackModal';
import { Tab } from '@/shell/components/TabsBar';
import { CardType, Card } from '@/shell/data/projects';
import { DeleteNodeDialog } from '@/components/nodes/DeleteNodeDialog';
import { RenameModal } from '@/shell/components/RenameModal';
import { useSpace, nodeKeys, useRenameNodeSimple } from '@/hooks/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { nodeService } from '@/services/api/node.service';
import { useAuthStore } from '@/stores/auth.store';
import { useNavigationStore } from '@/stores/navigationStore';
import type { Node } from '@/types/backend-dtos';
import { NodeType } from '@/types/backend-dtos';
import { NodeCard } from '@/shell/components/NodeCard';
import { spaceService } from '@/services/api';

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

type SpaceItem = {
  id: string;
  name: string;
};

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
    queryKey: nodeKeys.list(slug, { page: 1, size: 1000 }),
    queryFn: () => nodeService.getNodes(slug, { page: 1, size: 1000 }),
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
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showClearSpaceDialog, setShowClearSpaceDialog] = useState(false);
  const [isClearingSpace, setIsClearingSpace] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<Node | null>(null);
  const [nodeToRename, setNodeToRename] = useState<Node | null>(null);
  const [selectedCardId, setSelectedCardId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'updatedAt'>('updatedAt');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterNodeType, setFilterNodeType] = useState<'ALL' | 'REGULAR' | 'CONTEXT' | 'ASSUMPTION' | 'TEMPLATE'>('ALL');
  const [filterEntityType, setFilterEntityType] = useState<'ALL' | '' | 'person' | 'place' | 'action' | 'topic' | 'event'>('ALL');
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    cardId: string;
  } | null>(null);

  // Navigation state
  const [navigationPath, setNavigationPath] = useState<string[]>([]);
  const [currentSpace, setCurrentSpace] = useState('void');
  const [spaces, setSpaces] = useState<SpaceItem[]>([{ id: 'void', name: 'Void' }]);

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
    return (nodes || []).filter((node) => {
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

      if (details?.showInSpaceList === false) return false;
      if (details?.blockType) return false;

      return true;
    });
  }, [nodes]);

  // Convert nodes to card format - filter out block nodes (showInSpaceList: false)
  const visibleNodes = useMemo(() => {
    return (nodes || [])
      .filter((node) => {
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

        if (details?.showInSpaceList === false) return false;
        if (details?.blockType) return false;


        const term = searchTerm.trim().toLowerCase();
        const entityType =
          typeof details?.entityType === 'string'
            ? details.entityType.toLowerCase()
            : '';

        const matchesSearch =
          !term ||
          node.title.toLowerCase().includes(term) ||
          (node.content || '').toLowerCase().includes(term) ||
          entityType.includes(term);

        const nodeTypeValue = String(node.nodeType).toUpperCase();

        const matchesNodeType =
          filterNodeType === 'ALL' || nodeTypeValue === filterNodeType;

        const matchesEntityType =
          filterEntityType === 'ALL' || entityType === filterEntityType;

        return matchesSearch && matchesNodeType && matchesEntityType;
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          return a.title.localeCompare(b.title);
        }

        if (sortBy === 'createdAt') {
          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );
        }

        return (
          new Date(b.updatedAt || b.createdAt || 0).getTime() -
          new Date(a.updatedAt || a.createdAt || 0).getTime()
        );
      });
  }, [nodes, searchTerm, sortBy, filterNodeType, filterEntityType]);

  const totalNodeCount = allDisplayableNodes.length;

  const aiNodeCount = useMemo(
    () => allDisplayableNodes.filter((node) => isAgentCreatedNode(node)).length,
    [allDisplayableNodes]
  );

  const contextCount = useMemo(
    () => allDisplayableNodes.filter((node) => node.nodeType === NodeType.CONTEXT).length,
    [allDisplayableNodes]
  );

  const sidebarData = useMemo(() => visibleNodes.map(nodeToCard), [visibleNodes]);

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
    const path = [{ id: 'spaces', title: 'Spaces' }];
    if (space) {
      path.push({ id: space.id, title: space.name });
    }
    return path;
  }, [space]);

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
      router.push(`/spaces/${slug}/node/${nodeId}`);

    }
  };

  const handleHomeClick = () => {
    router.push('/spaces');
  };

  const handleBackClick = () => {
    router.push('/spaces');
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === -1 || index === 0) {
      router.push('/spaces');
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
          window.open(`/spaces/${slug}/node/${node.id}`, '_blank');

        }
        break;
      case 'openAsNode':
        if (node) {
          router.push(`/spaces/${slug}/node/${node.id}`);

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

  const handleDeleteClick = () => {
    // Show clear all confirmation
    console.log('Delete current context');
  };

  const handleFeedback = () => {
    setShowFeedbackModal(true);
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

  const handleOpenInNewTab = () => {
    handleNewTab();
  };

  const handleSpaceChange = (spaceId: string) => {
    setCurrentSpace(spaceId);
  };

  const handleAddSpace = (spaceName: string) => {
    const newSpace: SpaceItem = {
      id: spaceName.toLowerCase().replace(/\s+/g, '-'),
      name: spaceName,
    };
    setSpaces([...spaces, newSpace]);
    setCurrentSpace(newSpace.id);
  };

  const handleDeleteSuccess = () => {
    setShowDeleteDialog(false);
    setNodeToDelete(null);
    queryClient.invalidateQueries({ queryKey: nodeKeys.list(slug, { page: 1, size: 1000 }) });
  };

  // Handle node rename using shared hook
  const handleRename = async (newName: string) => {
    if (!nodeToRename) return;

    const result = await renameNode(nodeToRename.id, newName);
    if (result.success) {
      // Refresh the nodes list
      queryClient.invalidateQueries({ queryKey: nodeKeys.list(slug, { page: 1, size: 1000 }) });
    } else {
      throw new Error(result.error || 'Failed to rename node');
    }
  };

  const handleClearSpace = () => {
    setShowClearSpaceDialog(true);
  };

  const handleConfirmClearSpace = async () => {
    if (!nodes || nodes.length === 0) {
      setShowClearSpaceDialog(false);
      return;
    }

    setIsClearingSpace(true);
    try {
      // Delete all nodes in the space
      await Promise.all(nodes.map((node) => nodeService.deleteNode(slug, node.id)));
      queryClient.invalidateQueries({ queryKey: nodeKeys.list(slug, { page: 1, size: 1000 }) });
    } catch (error) {
      console.error('Failed to clear space:', error);
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
          // Add menu actions - create node/context at space level
          onCreateNode={handleAddNode}
          onCreateContext={handleAddContext}
          // More menu actions
          onShare={handleShareClick}
          onOpenInNewTab={handleOpenInNewTab}
          onGraph={handleGraphClick}
          onWhiteboard={handleWhiteboardClick}
          onDelete={handleDeleteClick}
          onClearSpace={handleClearSpace}
          tabs={tabs}
          activeTabId={activeTabId}
          onTabClick={handleTabClick}
          onTabClose={handleTabClose}
          onNewTab={handleNewTab}
          onFeedback={handleFeedback}
          chatAvailableSpaces={chatAvailableSpaces}
          onChatChangeSpace={(nextSpaceSlug) => {
            router.push(`/spaces/${nextSpaceSlug}`);
          }}
          showChatCreateSpace={false}
        />

        <Sidebar
          isOpen={false}
          selectedItem={null}
          onNavigate={handleSidebarNavigate}
          items={sidebarData}
        />

        {/* Main content */}

        <div
          className="pt-[88px] px-5 pb-8 transition-all duration-300"
          style={{
            marginLeft: '0',
          }}
        >
          <div className="mb-4 rounded-[22px] border border-border bg-background px-5 py-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-[28px] font-semibold leading-tight text-foreground">
                  {space?.name || 'Space'}
                </h1>
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
                  onClick={handleAddContext}
                  className="inline-flex h-9 items-center rounded-xl border border-border bg-background px-3.5 text-sm font-medium text-foreground transition hover:bg-muted"
                  type="button"
                >
                  New Context
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
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(320px,1.4fr)_minmax(220px,0.8fr)_minmax(220px,0.8fr)]">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search nodes by title, content, or entity type..."
                  className="h-[42px] w-full rounded-xl border border-border/70 bg-background px-4 text-[14px] text-foreground outline-none transition placeholder:text-muted-foreground/80 focus:border-primary focus:ring-2 focus:ring-primary/15"
                />

                <select
                  value={filterNodeType}
                  onChange={(e) =>
                    setFilterNodeType(
                      e.target.value as 'ALL' | 'REGULAR' | 'CONTEXT' | 'ASSUMPTION' | 'TEMPLATE'
                    )
                  }
                  className="h-[42px] w-full rounded-xl border border-border/70 bg-background px-4 text-[14px] text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                >
                  <option value="ALL">All node types</option>
                  <option value="REGULAR">Regular</option>
                  <option value="CONTEXT">Context</option>
                  <option value="ASSUMPTION">Assumption</option>
                  <option value="TEMPLATE">Template</option>
                </select>

                <select
                  value={filterEntityType}
                  onChange={(e) =>
                    setFilterEntityType(
                      e.target.value as 'ALL' | '' | 'person' | 'place' | 'action' | 'topic' | 'event'
                    )
                  }
                  className="h-[42px] w-full rounded-xl border border-border/70 bg-background px-4 text-[14px] text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                >
                  <option value="ALL">All entity types</option>
                  <option value="">No entity type</option>
                  <option value="person">Person</option>
                  <option value="place">Place</option>
                  <option value="action">Action</option>
                  <option value="topic">Topic</option>
                  <option value="event">Event</option>
                </select>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium text-muted-foreground">Sort by</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'name' | 'createdAt' | 'updatedAt')}
                    className="h-[40px] min-w-[180px] rounded-xl border border-border/70 bg-background px-4 text-[14px] text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                  >
                    <option value="updatedAt">Date modified</option>
                    <option value="createdAt">Date created</option>
                    <option value="name">Name</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium text-muted-foreground">View</span>

                  <div className="inline-flex rounded-xl border border-border/70 bg-background p-1">
                    <button
                      type="button"
                      onClick={() => setViewMode('grid')}
                      className={`rounded-lg px-3 py-1.5 text-sm transition ${
                        viewMode === 'grid'
                          ? 'bg-foreground text-background'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      Grid
                    </button>

                    <button
                      type="button"
                      onClick={() => setViewMode('list')}
                      className={`rounded-lg px-3 py-1.5 text-sm transition ${
                        viewMode === 'list'
                          ? 'bg-foreground text-background'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      List
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-[400px]">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : visibleNodes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-center">
              <p
                className="text-[15px] font-['Roboto:Regular',sans-serif] font-normal text-muted-foreground tracking-[-0.24px]"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                {searchTerm.trim() || filterNodeType !== 'ALL' || filterEntityType !== 'ALL'
                  ? 'No matching nodes'
                  : 'No nodes in this space'}
              </p>
              <p
                className="text-[13px] font-['Roboto:Regular',sans-serif] font-normal text-muted-foreground/70 mt-2 tracking-[-0.24px]"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                {searchTerm.trim() || filterNodeType !== 'ALL' || filterEntityType !== 'ALL'
                  ? 'Try changing your search or filters.'
                  : 'Use the New Node or New Context actions above to get started.'}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Nodes</h2>
              </div>

              {viewMode === 'grid' ? (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4 pt-1">
                  {visibleNodes.map((node) => {
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

                    const isAgentCreated = isAgentCreatedNode(node);
                    const previewSource =
                      (node.content || '').trim() ||
                      (typeof details?.entityType === 'string'
                        ? `Entity type: ${details.entityType}`
                        : node.nodeType === NodeType.CONTEXT
                        ? 'Context node'
                        : 'No preview available');

                    const preview = previewSource.replace(/\s+/g, ' ').slice(0, 110);

                    const meta =
                      node.updatedAt
                        ? `Updated ${new Date(node.updatedAt).toLocaleDateString()}`
                        : node.createdAt
                        ? `Created ${new Date(node.createdAt).toLocaleDateString()}`
                        : undefined;

                    return (
                      <NodeCard
                        key={node.id}
                        title={node.title}
                        preview={preview}
                        meta={meta}
                        type={node.nodeType === NodeType.CONTEXT ? CardType.FULFILLED_CONTEXT : CardType.NODE}
                        entityType={
                          typeof details?.entityType === 'string'
                            ? details.entityType
                            : undefined
                        }
                        badge={isAgentCreated ? 'AI' : 'Manual'}
                        onClick={() => handleCardClick(node.id)}
                        onContextMenu={(e) => handleCardContextMenu(e, node.id)}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-border/70 bg-background">
                  {visibleNodes.map((node) => {
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

                    const isAgentCreated = isAgentCreatedNode(node);
                    const entityType =
                      typeof details?.entityType === 'string' ? details.entityType : '';

                    const typeBadgeClasses =
                      entityType.toLowerCase() === 'person'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200'
                        : entityType.toLowerCase() === 'place'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200'
                        : entityType.toLowerCase() === 'action'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200'
                        : entityType.toLowerCase() === 'topic'
                        ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-200'
                        : entityType.toLowerCase() === 'event'
                        ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-200'
                        : node.nodeType === NodeType.CONTEXT
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200';

                    const preview =
                      ((node.content || '').trim() || 'No preview available')
                        .replace(/\s+/g, ' ')
                        .slice(0, 120);

                    const meta =
                      node.updatedAt
                        ? `Updated ${new Date(node.updatedAt).toLocaleDateString()}`
                        : node.createdAt
                        ? `Created ${new Date(node.createdAt).toLocaleDateString()}`
                        : '—';

                    return (
                      <button
                        key={node.id}
                        type="button"
                        onClick={() => handleCardClick(node.id)}
                        onContextMenu={(e) => handleCardContextMenu(e, node.id)}
                        className="grid w-full grid-cols-[minmax(0,2fr)_120px_110px_140px] items-center gap-4 border-b border-border/60 px-4 py-3 text-left transition hover:bg-muted/40 last:border-b-0"
                      >
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-foreground">
                            {node.title}
                          </div>
                          <div className="mt-1 truncate text-xs text-muted-foreground">
                            {preview}
                          </div>
                        </div>

                        <div>
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${typeBadgeClasses}`}
                          >
                            {entityType || (node.nodeType === NodeType.CONTEXT ? 'Context' : 'Node')}
                          </span>
                        </div>

                        <div>
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${
                              isAgentCreated
                                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                            }`}
                          >
                            {isAgentCreated ? 'AI' : 'Manual'}
                          </span>
                        </div>

                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                          {meta}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* New Node Modal - at space level, default based on which action was triggered */}
        {space && (
          <NewNodeModal
            isOpen={showNewNodeModal}
            onClose={() => setShowNewNodeModal(false)}
            spaceSlug={slug}
            spaceId={space.id}
            currentPath={navigationPath}
            currentSpace={currentSpace}
            spaces={spaces}
            onAddSpace={handleAddSpace}
            onSpaceChange={handleSpaceChange}
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
            onRename={() => handleContextMenuAction('rename')}
            onDuplicate={() => handleContextMenuAction('duplicate')}
            onShare={() => handleContextMenuAction('share')}
            onDelete={() => handleContextMenuAction('delete')}
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

        {/* Feedback Modal */}
        {showFeedbackModal && (
          <FeedbackModal
            isOpen={showFeedbackModal}
            onClose={() => setShowFeedbackModal(false)}
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