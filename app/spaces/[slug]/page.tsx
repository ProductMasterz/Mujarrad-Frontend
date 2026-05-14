'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Header } from '@/shell/components/Header';
import { Sidebar } from '@/shell/components/Sidebar';
import { ProjectCard } from '@/shell/components/ProjectCard';
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
import { attributeService } from '@/services/api/attribute.service';
import { useAuthStore } from '@/stores/auth.store';
import { useNavigationStore } from '@/stores/navigationStore';
import type { Node, Attribute } from '@/types/backend-dtos';
import { NodeType } from '@/types/backend-dtos';
import { getEffectiveVisibility, NodeVisibility } from '@/types/node-system';
import { GraphVisualization } from '@/components/graph/GraphVisualization';
import { ENTITY_VISUAL_STYLES, getNodeEntityVisualStyle } from '@/lib/node-entity-visuals';

// Convert Node to Scratchup Card format
function nodeToCard(node: Node): Card {
  // Determine card type based on node type
  let cardType = CardType.NODE;
  if (node.nodeType === NodeType.CONTEXT) {
    cardType = CardType.FULFILLED_CONTEXT;
  } else if (node.nodeType === NodeType.REGULAR) {
    cardType = CardType.NODE;
  }

  const visual = getNodeEntityVisualStyle(node);

  return {
    id: node.id,
    title: node.title,
    color: visual.color,
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
  const { logout } = useAuthStore();
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

  // Fetch relationships for graph visualization
  const { data: attributes, isLoading: attributesLoading, isError: attributesError } = useQuery<Attribute[]>({
    queryKey: ['spaces', slug, 'attributes'],
    queryFn: () => attributeService.getSpaceAttributes(String(space!.id)),
    enabled: !!space?.id,
  });

  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    cardId: string;
  } | null>(null);
  const [workspaceView, setWorkspaceView] = useState<'cards' | 'graph'>('cards');
  const [selectedGraphNodeId, setSelectedGraphNodeId] = useState<string | null>(null);

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

  const visibleNodes = useMemo(() => {
    return (nodes || []).filter((node) => {
      // Handle nodeDetails being a string (JSON) or object
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

      const visibility = getEffectiveVisibility(details as Record<string, unknown> | undefined);

      const nodeTitle = (node.title || '').toLowerCase().trim();
      const isLegacyChatMessageTitle = /^input:\s*msg-\d+$/.test(nodeTitle) || /^output:\s*msg-\d+$/.test(nodeTitle);
      const isChatRuntimeNode = details?.source === 'chat-runtime' || details?.chatNodeType === 'conversation' || details?.chatNodeType === 'message';

      // Only show nodes that should appear in the space list
      // Use visibility system first, then hide only chat runtime scaffolding.
      if (visibility !== NodeVisibility.VISIBLE) {
        return false;
      }

      if (isChatRuntimeNode || isLegacyChatMessageTitle) {
        return false;
      }

      return true;
    });
  }, [nodes]);

  // Convert nodes to card format
  const cards = useMemo(() => {
    return visibleNodes.map(nodeToCard);
  }, [visibleNodes]);

  const selectedGraphNode = useMemo(() => {
    if (!selectedGraphNodeId) return null;
    return visibleNodes.find((node) => node.id === selectedGraphNodeId) || null;
  }, [visibleNodes, selectedGraphNodeId]);

  const graphRelationships = useMemo(() => {
    if (!selectedGraphNodeId || !attributes) return [];

    const nodeTitleById = new Map(visibleNodes.map((node) => [node.id, node.title]));

    return attributes
      .filter(
        (attr) =>
          attr.sourceNodeId === selectedGraphNodeId || attr.targetNodeId === selectedGraphNodeId
      )
      .map((attr) => {
        const isOutgoing = attr.sourceNodeId === selectedGraphNodeId;
        const connectedNodeId = isOutgoing ? attr.targetNodeId : attr.sourceNodeId;

        return {
          id: attr.id,
          direction: isOutgoing ? 'Outgoing' : 'Incoming',
          relationshipType: attr.attributeName || attr.attributeType || 'related',
          connectedNodeId,
          connectedNodeTitle: nodeTitleById.get(connectedNodeId) || 'Unknown node',
        };
      });
  }, [attributes, selectedGraphNodeId, visibleNodes]);

  const legendItems = useMemo(
    () => [
      ENTITY_VISUAL_STYLES.person,
      ENTITY_VISUAL_STYLES.place,
      ENTITY_VISUAL_STYLES.event,
      ENTITY_VISUAL_STYLES.topic,
      ENTITY_VISUAL_STYLES.action,
    ],
    []
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
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

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

  const handleDeleteClick = () => {
    // Show clear all confirmation
    console.log('Delete current context');
  };

  const handleFeedback = () => {
    setShowFeedbackModal(true);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
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
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1
              className="text-[24px] font-['Roboto:Bold',sans-serif] font-bold text-[#333] mb-2"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              Space not found
            </h1>
            <p
              className="text-[15px] font-['Roboto:Regular',sans-serif] font-normal text-[#828282] mb-4"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              The space you&apos;re looking for doesn&apos;t exist.
            </p>
            <button
              onClick={() => router.push('/spaces')}
              className="h-[36px] px-[20px] bg-[#248bf2] rounded-[100px] font-['Roboto:SemiBold',sans-serif] font-semibold text-[14px] text-white tracking-[-0.24px] hover:bg-[#1a6bc4] transition-colors"
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
      <div className="bg-white min-h-screen relative">
        <Header
          onMenuClick={toggleSidebar}
          onBackClick={handleBackClick}
          showBackButton={true}
          breadcrumbPath={breadcrumbPath}
          onNotificationClick={() => {}}
          onSearchClick={() => {}}
          onHomeClick={handleHomeClick}
          onBreadcrumbClick={handleBreadcrumbClick}
          // Add menu actions - create node/context at space level
          onCreateNode={handleAddNode}
          onCreateContext={handleAddContext}
          // More menu actions
          onShare={handleShareClick}
          onOpenInNewTab={handleOpenInNewTab}
          onWhiteboard={handleWhiteboardClick}
          onDelete={handleDeleteClick}
          onClearSpace={handleClearSpace}
          tabs={tabs}
          activeTabId={activeTabId}
          onTabClick={handleTabClick}
          onTabClose={handleTabClose}
          onNewTab={handleNewTab}
          onFeedback={handleFeedback}
        />

        <Sidebar
          isOpen={sidebarOpen}
          onItemClick={(id) => handleSidebarNavigate([id])}
          selectedItem={null}
          onNavigate={handleSidebarNavigate}
          onLogout={handleLogout}
          items={cards}
        />

        {/* Main content */}
        <div
          className="pt-[76px] px-[14px] transition-all duration-300"
          style={{
            marginLeft: sidebarOpen ? '276px' : '0',
          }}
        >
          <div className="mb-4 flex items-center gap-2">
            <button
              onClick={() => {
                setWorkspaceView('cards');
                setSelectedGraphNodeId(null);
              }}
              className={`h-[34px] px-[14px] rounded-[100px] text-[13px] font-['Roboto:Medium',sans-serif] transition-colors ${
                workspaceView === 'cards'
                  ? 'bg-[#248bf2] text-white'
                  : 'bg-[#f3f3f5] text-[#4f4f4f] hover:bg-[#e9ebef]'
              }`}
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              Cards
            </button>
            <button
              onClick={() => setWorkspaceView('graph')}
              className={`h-[34px] px-[14px] rounded-[100px] text-[13px] font-['Roboto:Medium',sans-serif] transition-colors ${
                workspaceView === 'graph'
                  ? 'bg-[#248bf2] text-white'
                  : 'bg-[#f3f3f5] text-[#4f4f4f] hover:bg-[#e9ebef]'
              }`}
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              Graph
            </button>
          </div>

          <div className="mb-4 rounded-[12px] border border-[#e0e0e0] bg-white px-3 py-2">
            <div
              className="text-[12px] font-['Roboto:Medium',sans-serif] text-[#4f4f4f] mb-2"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              Entity Type Legend
            </div>
            <div className="flex flex-wrap gap-3">
              {legendItems.map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span
                    className="text-[12px] font-['Roboto:Regular',sans-serif] text-[#4f4f4f]"
                    style={{ fontVariationSettings: "'wdth' 100" }}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-[400px]">
              <div className="animate-spin h-8 w-8 border-4 border-[#248bf2] border-t-transparent rounded-full" />
            </div>
          ) : cards.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-center">
              <p
                className="text-[15px] font-['Roboto:Regular',sans-serif] font-normal text-[#828282] tracking-[-0.24px]"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                No nodes in this space
              </p>
              <p
                className="text-[13px] font-['Roboto:Regular',sans-serif] font-normal text-[#bdbdbd] mt-2 tracking-[-0.24px]"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                Click the + button to create your first node
              </p>
            </div>
          ) : workspaceView === 'graph' ? (
            <div className="h-[calc(100vh-180px)] w-full rounded-[12px] border border-[#e0e0e0] bg-white p-2 flex gap-2">
              {attributesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin h-8 w-8 border-4 border-[#248bf2] border-t-transparent rounded-full" />
                </div>
              ) : attributesError ? (
                <div className="flex items-center justify-center h-full text-center px-4">
                  <p
                    className="text-[14px] font-['Roboto:Regular',sans-serif] font-normal text-[#828282] tracking-[-0.24px]"
                    style={{ fontVariationSettings: "'wdth' 100" }}
                  >
                    Could not load relationships right now. Please try again in a moment.
                  </p>
                </div>
              ) : (
                <>
                  <div className={`${selectedGraphNode ? 'flex-1' : 'w-full'} min-w-0`}>
                    <GraphVisualization
                      nodes={visibleNodes}
                      attributes={attributes || []}
                      onNodeClick={(nodeId) => setSelectedGraphNodeId(nodeId)}
                    />
                  </div>

                  {selectedGraphNode && (
                    <aside className="w-[360px] border border-[#e0e0e0] rounded-[12px] p-4 bg-[#fafafa] overflow-auto">
                      <div className="flex items-center justify-between mb-4">
                        <h3
                          className="text-[16px] font-['Roboto:Bold',sans-serif] font-bold text-[#333]"
                          style={{ fontVariationSettings: "'wdth' 100" }}
                        >
                          Node Details
                        </h3>
                        <button
                          onClick={() => setSelectedGraphNodeId(null)}
                          className="h-[28px] px-3 rounded-[100px] bg-[#f3f3f5] text-[#4f4f4f] hover:bg-[#e9ebef] text-[12px]"
                        >
                          Close
                        </button>
                      </div>

                      <div className="space-y-3 text-[13px] text-[#4f4f4f]">
                        <div>
                          <span className="font-semibold text-[#333]">Entity Type:</span>{' '}
                          <span
                            className="inline-flex items-center rounded-full px-2 py-[2px] text-[11px] font-medium"
                            style={{
                              backgroundColor: `${getNodeEntityVisualStyle(selectedGraphNode).color}22`,
                              color: getNodeEntityVisualStyle(selectedGraphNode).color,
                            }}
                          >
                            {getNodeEntityVisualStyle(selectedGraphNode).label}
                          </span>
                        </div>
                        <div><span className="font-semibold text-[#333]">Title:</span> {selectedGraphNode.title}</div>
                        <div><span className="font-semibold text-[#333]">Type:</span> {selectedGraphNode.nodeType}</div>
                        <div><span className="font-semibold text-[#333]">ID:</span> {selectedGraphNode.id}</div>
                        <div><span className="font-semibold text-[#333]">Space ID:</span> {selectedGraphNode.spaceId}</div>
                        <div><span className="font-semibold text-[#333]">Slug:</span> {selectedGraphNode.slug}</div>
                        <div><span className="font-semibold text-[#333]">Current Version ID:</span> {selectedGraphNode.currentVersionId}</div>
                        <div><span className="font-semibold text-[#333]">Created By:</span> {selectedGraphNode.createdBy}</div>
                        <div><span className="font-semibold text-[#333]">Modified By:</span> {selectedGraphNode.modifiedBy}</div>
                        <div><span className="font-semibold text-[#333]">Created At:</span> {selectedGraphNode.createdAt}</div>
                        <div><span className="font-semibold text-[#333]">Updated At:</span> {selectedGraphNode.updatedAt}</div>
                        <div>
                          <div className="font-semibold text-[#333] mb-1">Content:</div>
                          <div className="p-2 rounded border border-[#e0e0e0] bg-white whitespace-pre-wrap break-words">
                            {selectedGraphNode.content || 'No content'}
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold text-[#333] mb-1">Node Details:</div>
                          <pre className="p-2 rounded border border-[#e0e0e0] bg-white whitespace-pre-wrap break-all text-[12px]">
{JSON.stringify(selectedGraphNode.nodeDetails || {}, null, 2)}
                          </pre>
                        </div>
                        <div>
                          <div className="font-semibold text-[#333] mb-2">Relationships:</div>
                          {graphRelationships.length === 0 ? (
                            <p className="text-[#828282]">No connected relationships</p>
                          ) : (
                            <div className="space-y-2">
                              {graphRelationships.map((rel) => (
                                <div key={rel.id} className="p-2 rounded border border-[#e0e0e0] bg-white">
                                  <div><span className="font-semibold text-[#333]">Type:</span> {rel.relationshipType}</div>
                                  <div><span className="font-semibold text-[#333]">Direction:</span> {rel.direction}</div>
                                  <div>
                                    <span className="font-semibold text-[#333]">Connected Node:</span>{' '}
                                    <button
                                      onClick={() => setSelectedGraphNodeId(rel.connectedNodeId)}
                                      className="text-[#248bf2] hover:underline"
                                    >
                                      {rel.connectedNodeTitle}
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </aside>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="flex gap-[19px] flex-wrap pt-[15px]">
              {cards.map((card) => (
                <ProjectCard
                  key={card.id}
                  title={card.title}
                  color={card.color}
                  type={card.type}
                  onClick={() => handleCardClick(card.id)}
                  onContextMenu={(e) => handleCardContextMenu(e, card.id)}
                />
              ))}
            </div>
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
            <div className="bg-white rounded-[16px] p-[24px] w-[400px] shadow-lg">
              <h2
                className="text-[18px] font-['Roboto:Bold',sans-serif] font-bold text-[#333] mb-[12px]"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                Clear Space
              </h2>
              <p
                className="text-[14px] font-['Roboto:Regular',sans-serif] font-normal text-[#828282] mb-[24px]"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                Are you sure you want to delete all {nodes?.length || 0} nodes in this space? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-[12px]">
                <button
                  onClick={() => setShowClearSpaceDialog(false)}
                  disabled={isClearingSpace}
                  className="h-[36px] px-[20px] bg-[#f5f5f5] rounded-[100px] font-['Roboto:SemiBold',sans-serif] font-semibold text-[14px] text-[#333] tracking-[-0.24px] hover:bg-[#e5e5e5] transition-colors disabled:opacity-50"
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
