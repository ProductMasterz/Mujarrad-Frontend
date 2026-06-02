'use client';

import { useMemo, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Header } from '@/shell/components/Header';
import { Sidebar } from '@/shell/components/Sidebar';
import { ProjectCard } from '@/shell/components/ProjectCard';
import { NodeCard } from '@/shell/components/NodeCard';
import { NewNodeModal, EntityType } from '@/shell/components/NewNodeModal';
import { Tab } from '@/shell/components/TabsBar';
import { CardType, Card } from '@/shell/data/projects';
import { useSpace } from '@/hooks/api';
import { NodeType } from '@/types/backend-dtos';
import type { Node } from '@/types/backend-dtos';
import { spaceService } from '@/services/api';
import { useNavigationStore } from '@/stores/navigationStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { nodeService } from '@/services/api/node.service';
import { useContextNodes, useChildContexts } from '@/hooks/api/useContextNodes';
import {
  FolderOpen,
  FileText,
} from 'lucide-react';

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

function getContextCardColor(node: Node): string {
  const details = getNodeDetails(node);

  if (typeof details?.contextColor === "string") {
    return details.contextColor;
  }

  if (typeof details?.entityColor === "string") {
    return details.entityColor;
  }

  return "#9333ea";
}

function isDisplayableNode(node: Node): boolean {
  const details = getNodeDetails(node);
  const title = String(node.title || '').toLowerCase();
  const slugValue = String(node.slug || '').toLowerCase();

  if (node.isBuiltin) return false;
  if (details?.showInSpaceList === false) return false;
  if (details?.blockType) return false;

  // Hide system/chat infrastructure nodes
  if (details?.systemContext === 'chat') return false;
  if (details?.chatNodeType) return false;
  if (details?.createdFrom === 'chat') return false;
  if (details?.createdFrom === 'assistant-ui') return false;

  // Hide stored chat messages/conversations
  if (details?.role === 'conversation') return false;
  if (details?.role === 'user') return false;
  if (details?.role === 'assistant') return false;

  // Hide known system containers / infrastructure by title or slug
  if (title === 'mujarrad chat') return false;
  if (slugValue === 'mujarrad-chat') return false;
  if (title.includes('conversation')) return false;
  if (title.includes('assistant message')) return false;
  if (title.includes('user message')) return false;

  return true;
}

function isAgentCreatedNode(node: Node): boolean {
  const details = getNodeDetails(node);

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

function nodeToCard(node: Node): Card {
  let cardType = CardType.NODE;

  if (node.nodeType === NodeType.CONTEXT) {
    cardType = CardType.FULFILLED_CONTEXT;
  } else if (node.nodeType === NodeType.REGULAR) {
    cardType = CardType.NODE;
  }

  return {
    id: node.id,
    title: node.title,
    color: '#248bf2',
    type: cardType,
  };
}

function getContextName(contextSlug: string, childContexts: Node[], nodes: Node[]) {
  const matchingContext =
    childContexts.find((ctx) => ctx.slug === contextSlug) ||
    nodes.find((node) => node.slug === contextSlug);

  if (matchingContext?.title) return matchingContext.title;

  return contextSlug.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function ContextDetailPage() {
  const params = useParams();
  const router = useRouter();
  const navigateToSpace = useNavigationStore((state) => state.navigateToSpace);
  const addNotification = useNotificationStore((state) => state.addNotification);

  const spaceSlug = params.slug as string;
  const contextSlug = params.contextSlug as string;
  const [showNewNodeModal, setShowNewNodeModal] = useState(false);
  const [modalDefaultType, setModalDefaultType] = useState<EntityType>('node');
  const { data: space, isLoading: spaceLoading, error: spaceError } = useSpace(spaceSlug);
  const { data: nodes = [], isLoading: nodesLoading } = useContextNodes(spaceSlug, contextSlug);
  const { data: childContexts = [], isLoading: childContextsLoading } = useChildContexts(spaceSlug, contextSlug);
  
  const { data: currentContextNode, isLoading: currentContextLoading } = useQuery({
    queryKey: ['context-page-current-context', spaceSlug, contextSlug],
    queryFn: async () => {
      const allNodes = await nodeService.getNodes(spaceSlug, {
        page: 0,
        size: 1000,
      });

      return (
        allNodes.find(
          (node) =>
            node.nodeType === NodeType.CONTEXT &&
            node.slug === contextSlug
        ) || null
      );
    },
    enabled: !!spaceSlug && !!contextSlug,
  });

  const { data: allSpaces = [] } = useQuery({
    queryKey: ['spaces'],
    queryFn: () => spaceService.getSpaces(),
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'updatedAt'>('updatedAt');

  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: 'tab-1',
      title: 'Context',
      navigationPath: [],
      spaceId: spaceSlug,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState('tab-1');

  useEffect(() => {
    if (space) {
      navigateToSpace(spaceSlug, space.id);
    }
  }, [space, spaceSlug, navigateToSpace]);

  const allContextItems = useMemo(() => {
    return [...childContexts, ...nodes].filter(isDisplayableNode);
  }, [childContexts, nodes]);

  const displayableChildContexts = useMemo(() => {
    return childContexts
      .filter(isDisplayableNode)
      .filter((node) => node.nodeType === NodeType.CONTEXT);
  }, [childContexts]);

  const regularNodes = useMemo(() => {
    return nodes
      .filter(isDisplayableNode)
      .filter((node) => node.nodeType !== NodeType.CONTEXT);
  }, [nodes]);

  const contextName = useMemo(() => {
    if (currentContextNode?.title) return currentContextNode.title;

    return getContextName(contextSlug, childContexts, nodes);
  }, [currentContextNode, contextSlug, childContexts, nodes]);

  useEffect(() => {
    setTabs((prevTabs) =>
      prevTabs.map((tab) =>
        tab.id === 'tab-1' ? { ...tab, title: contextName } : tab
      )
    );
  }, [contextName]);

  const filteredChildContexts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    let result = displayableChildContexts;

    if (term) {
      result = result.filter((ctx) => ctx.title.toLowerCase().includes(term));
    }

    return [...result].sort((a, b) => {
      if (sortBy === 'name') return a.title.localeCompare(b.title);
      if (sortBy === 'createdAt') {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }

      return (
        new Date(b.updatedAt || b.createdAt || 0).getTime() -
        new Date(a.updatedAt || a.createdAt || 0).getTime()
      );
    });
  }, [displayableChildContexts, searchTerm, sortBy]);

  const filteredRegularNodes = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    let result = regularNodes;

    if (term) {
      result = result.filter((node) => {
        const content = String(node.content || '').toLowerCase();
        return node.title.toLowerCase().includes(term) || content.includes(term);
      });
    }

    return [...result].sort((a, b) => {
      if (sortBy === 'name') return a.title.localeCompare(b.title);
      if (sortBy === 'createdAt') {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }

      return (
        new Date(b.updatedAt || b.createdAt || 0).getTime() -
        new Date(a.updatedAt || a.createdAt || 0).getTime()
      );
    });
  }, [regularNodes, searchTerm, sortBy]);

  const totalNodeCount = regularNodes.length;

  const aiNodeCount = useMemo(
    () => regularNodes.filter((node) => isAgentCreatedNode(node)).length,
    [regularNodes]
  );

  const contextCount = displayableChildContexts.length;

  const sidebarData = useMemo(() => allContextItems.map(nodeToCard), [allContextItems]);

  const chatAvailableSpaces = useMemo(
    () =>
      (Array.isArray(allSpaces) ? allSpaces : []).map((spaceItem) => ({
        id: spaceItem.id,
        name: spaceItem.name,
        slug: spaceItem.slug,
      })),
    [allSpaces]
  );

  const breadcrumbPath = useMemo(() => {
    return [
      { id: 'home', title: 'Home' },
      { id: 'spaces', title: 'Spaces' },
      { id: space?.id || spaceSlug, title: space?.name || spaceSlug },
      {
        id: contextSlug,
        title: contextName,
      },
    ];
  }, [space, spaceSlug, contextSlug, contextName]);

  const isLoading =
    spaceLoading ||
    nodesLoading ||
    childContextsLoading ||
    currentContextLoading;

  const toggleSidebar = () => {};

  const handleBackClick = () => {
    router.push(`/spaces/${spaceSlug}`);
  };

  const handleHomeClick = () => {
    router.push('/');
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
      router.push(`/spaces/${spaceSlug}`);
      return;
    }

    if (index === 3) {
      router.push(`/spaces/${spaceSlug}/context/${contextSlug}`);
    }
  };

  const handleTabClick = (tabId: string) => {
    setActiveTabId(tabId);
  };

  const handleTabClose = (tabId: string) => {
    if (tabs.length === 1) return;

    const newTabs = tabs.filter((tab) => tab.id !== tabId);
    setTabs(newTabs);

    if (activeTabId === tabId) {
      setActiveTabId(newTabs[0].id);
    }
  };

  const handleNewTab = () => {
    const newTab: Tab = {
      id: `tab-${Date.now()}`,
      title: contextName,
      navigationPath: [],
      spaceId: spaceSlug,
    };

    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
  };

  const handleSidebarNavigate = (path: string[]) => {
    if (path.length === 0) return;

    const nodeId = path[path.length - 1];
    router.push(`/spaces/${spaceSlug}/node/${nodeId}?context=${contextSlug}`);
  };


  const handleNewNode = () => {
    setModalDefaultType('node');
    setShowNewNodeModal(true);
  };

  if (spaceError) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
          <div className="text-center">
            <h1 className="mb-2 text-[24px] font-bold text-foreground">
              Context not found
            </h1>
            <p className="mb-4 text-[15px] text-muted-foreground">
              The context you&apos;re looking for doesn&apos;t exist.
            </p>
            <button
              onClick={() => router.push(`/spaces/${spaceSlug}`)}
              className="h-[36px] rounded-[100px] bg-primary px-[20px] text-[14px] font-semibold text-primary-foreground transition hover:opacity-90"
              type="button"
            >
              Back to Space
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="relative min-h-screen bg-background text-foreground">
        <Header
          onMenuClick={toggleSidebar}
          onBackClick={handleBackClick}
          showBackButton={true}
          breadcrumbPath={breadcrumbPath}
          onHomeClick={handleHomeClick}
          onBreadcrumbClick={handleBreadcrumbClick}
          tabs={tabs}
          activeTabId={activeTabId}
          onTabClick={handleTabClick}
          onTabClose={handleTabClose}
          onNewTab={handleNewTab}
          chatAvailableSpaces={chatAvailableSpaces}
          onChatChangeSpace={(nextSpaceSlug) => {
            router.push(`/spaces/${nextSpaceSlug}`);
          }}
          chatSpaceId={space?.id}
          chatIsSpaceLocked={!!space?.isLocked}
          chatActiveContextSlug={contextSlug}
          chatActiveContextId={currentContextNode?.id}
        />

        <Sidebar
          isOpen={false}
          selectedItem={null}
          onNavigate={handleSidebarNavigate}
          items={sidebarData}
        />

        <div
          className="px-5 pt-[126px] pb-8 transition-all duration-300"
          style={{ marginLeft: '0' }}
        >
          <div className="mb-4 rounded-[22px] border border-border bg-background px-5 py-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2">

                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-900/40">
                    <FolderOpen className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                  </div>

                  <div>
                    <h1 className="text-[28px] font-semibold leading-tight text-foreground">
                      {contextName}
                    </h1>
                    <p className="mt-1 max-w-[680px] text-sm leading-5 text-muted-foreground">
                      Review, create, and organize nodes inside this context.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleNewNode}
                  className="inline-flex h-9 items-center rounded-xl bg-foreground px-3.5 text-sm font-medium text-background transition hover:opacity-90"
                  type="button"
                >
                  New Node
                </button>

                <button
                  onClick={() => router.push(`/spaces/${spaceSlug}/graph?context=${contextSlug}`)}
                  className="inline-flex h-9 items-center rounded-xl border border-border bg-background px-3.5 text-sm font-medium text-foreground transition hover:bg-muted"
                  type="button"
                >
                  Graph
                </button>

                <button
                  onClick={() => router.push(`/spaces/${spaceSlug}/whiteboard`)}
                  className="inline-flex h-9 items-center rounded-xl border border-border bg-background px-3.5 text-sm font-medium text-foreground transition hover:bg-muted"
                  type="button"
                >
                  Whiteboard
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2.5">
              <div className="min-w-[120px] rounded-2xl border border-border/60 bg-muted/20 px-4 py-3">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Nodes
                </div>
                <div className="mt-1 text-xl font-semibold leading-none text-foreground">
                  {totalNodeCount}
                </div>
              </div>

              <div className="min-w-[120px] rounded-2xl border border-border/60 bg-muted/20 px-4 py-3">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  AI Created
                </div>
                <div className="mt-1 text-xl font-semibold leading-none text-foreground">
                  {aiNodeCount}
                </div>
              </div>

              <div className="min-w-[120px] rounded-2xl border border-border/60 bg-muted/20 px-4 py-3">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Sub-Contexts
                </div>
                <div className="mt-1 text-xl font-semibold leading-none text-foreground">
                  {contextCount}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-5 rounded-[18px] border border-border/60 bg-background px-4 py-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search nodes and sub-contexts..."
                className="h-[42px] w-full rounded-xl border border-border/70 bg-background px-4 text-[14px] text-foreground outline-none transition placeholder:text-muted-foreground/80 focus:border-primary focus:ring-2 focus:ring-primary/15 sm:flex-1"
              />

              <div className="flex items-center gap-2">
                <span className="text-[13px] font-medium text-muted-foreground">
                  Sort by
                </span>
                <select
                  value={sortBy}
                  onChange={(event) =>
                    setSortBy(event.target.value as 'name' | 'createdAt' | 'updatedAt')
                  }
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
            <div className="flex h-[400px] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                    Sub-Contexts ({filteredChildContexts.length})
                  </h2>
                </div>

                {filteredChildContexts.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-purple-200 p-6 text-center dark:border-purple-800">
                    <FolderOpen className="mx-auto mb-1 h-6 w-6 text-purple-400" />
                    <p className="text-xs text-muted-foreground">
                      {searchTerm.trim() ? 'No matching sub-contexts' : 'No sub-contexts yet'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
                    {filteredChildContexts.map((ctx) => (
                      <ProjectCard
                        key={ctx.id}
                        title={ctx.title}
                        color={getContextCardColor(ctx)}
                        type={CardType.FULFILLED_CONTEXT}
                        onClick={() => router.push(`/spaces/${spaceSlug}/context/${ctx.slug}`)}
                        onContextMenu={(event) => event.preventDefault()}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="mb-6">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                    Nodes ({filteredRegularNodes.length})
                  </h2>
                </div>

                {filteredRegularNodes.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border p-12 text-center">
                    <FileText className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">
                      {searchTerm.trim() ? 'No matching nodes' : 'No nodes in this context'}
                    </p>
                    <button
                      onClick={handleNewNode}
                      className="mt-3 inline-flex h-9 items-center rounded-xl border border-border bg-background px-3.5 text-sm font-medium text-foreground transition hover:bg-muted"
                      type="button"
                    >
                      Create first node
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
                    {filteredRegularNodes.map((node) => {
                      const preview = (node.content || '').trim().slice(0, 120) || undefined;
                      const meta = node.updatedAt
                        ? `Updated ${new Date(node.updatedAt).toLocaleDateString()}`
                        : `Created ${new Date(node.createdAt).toLocaleDateString()}`;

                      return (
                        <NodeCard
                          key={node.id}
                          title={node.title}
                          preview={preview}
                          meta={meta}
                          type={CardType.NODE}
                          nodeKindLabel={node.nodeType === 'ATTRIBUTE' ? 'Attribute' : 'Regular'}
                          onClick={() => router.push(`/spaces/${spaceSlug}/node/${node.id}?context=${contextSlug}`)}
                          onContextMenu={(event) => event.preventDefault()}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}


        {space && (
          <NewNodeModal
            isOpen={showNewNodeModal}
            onClose={() => setShowNewNodeModal(false)}
            spaceSlug={spaceSlug}
            defaultType={modalDefaultType}
            availableTypes={['node']}
            defaultContextSlug={contextSlug}
            hideContextSelector={true}
          />
)}
      </div>

      <NodeGrid
        nodes={regularNodes}
        isLoading={isLoading}
        emptyIcon={<FileText className="h-8 w-8 text-muted-foreground/50" />}
        emptyTitle="No nodes in this context"
        searchTerm={searchTerm}
        sortBy={sortBy}
        onCardClick={handleCardClick}
        onCardContextMenu={handleCardContextMenu}
      />
    </SpaceShell>
  );
}