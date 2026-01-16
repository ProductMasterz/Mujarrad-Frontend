'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Header } from '@/scratchup/components/Header';
import { Sidebar } from '@/scratchup/components/Sidebar';
import { ProjectCard } from '@/scratchup/components/ProjectCard';
import { ContextMenu } from '@/scratchup/components/ContextMenu';
import { NewNodeModal } from '@/scratchup/components/NewNodeModal';
import { ShareModal } from '@/scratchup/components/ShareModal';
import { FeedbackModal } from '@/scratchup/components/FeedbackModal';
import { Tab } from '@/scratchup/components/TabsBar';
import { CardType, Card } from '@/scratchup/data/projects';
import { DeleteNodeDialog } from '@/components/nodes/DeleteNodeDialog';
import { useSpace } from '@/hooks/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { nodeService } from '@/services/api/node.service';
import { useAuthStore } from '@/stores/auth.store';
import type { Node } from '@/types/backend-dtos';
import { NodeType } from '@/types/backend-dtos';

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
  const { logout } = useAuthStore();
  const slug = params.slug as string;

  // Fetch space data
  const { data: space, isLoading: spaceLoading, error: spaceError } = useSpace(slug);

  // Fetch nodes for this space
  const { data: nodes, isLoading: nodesLoading } = useQuery({
    queryKey: ['space-nodes', slug],
    queryFn: () => nodeService.getNodes(slug, { page: 1, size: 1000 }),
    enabled: !!space,
  });

  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNewNodeModal, setShowNewNodeModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showClearSpaceDialog, setShowClearSpaceDialog] = useState(false);
  const [isClearingSpace, setIsClearingSpace] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<Node | null>(null);
  const [selectedCardId, setSelectedCardId] = useState('');
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

  // Convert nodes to card format - filter out block nodes (showInSpaceList: false)
  const cards = useMemo(() => {
    const filteredNodes = (nodes || []).filter((node) => {
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

      // Only show nodes that should appear in the space list
      // Block nodes have showInSpaceList: false or blockType set
      if (details?.showInSpaceList === false) {
        return false;
      }
      if (details?.blockType) {
        return false;
      }
      return true;
    });
    return filteredNodes.map(nodeToCard);
  }, [nodes]);

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

  const handleAddClick = () => {
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
    queryClient.invalidateQueries({ queryKey: ['space-nodes', slug] });
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
      queryClient.invalidateQueries({ queryKey: ['space-nodes', slug] });
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
          onAddClick={handleAddClick}
          onNotificationClick={() => {}}
          onSearchClick={() => {}}
          onMoreClick={() => {}}
          onHomeClick={handleHomeClick}
          onBreadcrumbClick={handleBreadcrumbClick}
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

        {/* New Node Modal */}
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
