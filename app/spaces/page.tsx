'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Header } from '@/shell/components/Header';
import { Sidebar } from '@/shell/components/Sidebar';
import { ProjectCard } from '@/shell/components/ProjectCard';
import { ContextMenu } from '@/shell/components/ContextMenu';
import { NewNodeModal } from '@/shell/components/NewNodeModal';
import { ShareModal } from '@/shell/components/ShareModal';
import { FeedbackModal } from '@/shell/components/FeedbackModal';
import { Tab } from '@/shell/components/TabsBar';
import { CardType, Card } from '@/shell/data/projects';
import { spaceService } from '@/services/api';
import type { Space } from '@/types/backend-dtos';
import { NodeType } from '@/types/backend-dtos';
import { useAuthStore } from '@/stores/auth.store';
import { useNavigationStore } from '@/stores/navigationStore';

// Convert Space to Scratchup Card format
function spaceToCard(space: Space): Card {
  return {
    id: space.id,
    title: space.name,
    color: '#248bf2', // Default blue color for spaces
    type: CardType.FULFILLED_CONTEXT,
  };
}

// Convert spaces to sidebar data format
function spacesToSidebarData(spaces: Space[]): Card[] {
  return spaces.map((space) => ({
    id: space.id,
    title: space.name,
    color: '#248bf2',
    type: CardType.FULFILLED_CONTEXT,
  }));
}

type SpaceItem = {
  id: string;
  name: string;
};

export default function SpacesPage() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const navigateToSpaces = useNavigationStore((state) => state.navigateToSpaces);

  // Set navigation scope on mount
  useEffect(() => {
    navigateToSpaces();
  }, [navigateToSpaces]);

  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNewNodeModal, setShowNewNodeModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
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
      title: 'Spaces',
      navigationPath: [],
      spaceId: 'void',
    },
  ]);
  const [activeTabId, setActiveTabId] = useState('tab-1');

  // Data state
  const [apiSpaces, setApiSpaces] = useState<Space[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch spaces on mount
  useEffect(() => {
    spaceService
      .getSpaces()
      .then((data) => {
        setApiSpaces(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('[SpacesPage] Error fetching spaces:', err);
        setError(err);
        setIsLoading(false);
      });
  }, []);

  // Convert API spaces to card format
  const cards = useMemo(() => apiSpaces.map(spaceToCard), [apiSpaces]);

  // Build breadcrumb
  const breadcrumbPath = useMemo(() => {
    return [{ id: 'home', title: 'Spaces' }];
  }, []);

  // Handlers
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleCardClick = (cardId: string) => {
    const space = apiSpaces.find((s) => s.id === cardId);
    if (space) {
      router.push(`/spaces/${space.slug}`);
    }
  };

  const handleSidebarNavigate = (path: string[]) => {
    if (path.length > 0) {
      const spaceId = path[0];
      const space = apiSpaces.find((s) => s.id === spaceId);
      if (space) {
        router.push(`/spaces/${space.slug}`);
      }
    }
  };

  const handleHomeClick = () => {
    router.push('/spaces');
  };

  const handleBackClick = () => {
    router.back();
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

    const space = apiSpaces.find((s) => s.id === contextMenu.cardId);

    switch (action) {
      case 'openNewTab':
        if (space) {
          window.open(`/spaces/${space.slug}`, '_blank');
        }
        break;
      case 'openAsNode':
        if (space) {
          router.push(`/spaces/${space.slug}`);
        }
        break;
      case 'share':
        setSelectedCardId(contextMenu.cardId);
        setShowShareModal(true);
        break;
      case 'delete':
        // TODO: Implement delete functionality
        console.log('Delete space:', contextMenu.cardId);
        break;
    }
    setContextMenu(null);
  };

  const handleShareClick = () => {
    setSelectedCardId('current-project');
    setShowShareModal(true);
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
      title: 'Spaces',
      navigationPath: [],
      spaceId: 'void',
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

  // Build sidebar data from API spaces
  const sidebarData = useMemo(() => spacesToSidebarData(apiSpaces), [apiSpaces]);

  return (
    <ProtectedRoute>
      <div className="bg-white min-h-screen relative">
        <Header
          onMenuClick={toggleSidebar}
          onBackClick={handleBackClick}
          showBackButton={false}
          breadcrumbPath={breadcrumbPath}
          onNotificationClick={() => {}}
          onSearchClick={() => {}}
          onHomeClick={handleHomeClick}
          onBreadcrumbClick={handleBreadcrumbClick}
          // Add menu actions - only create space at spaces level
          onCreateSpace={handleAddClick}
          // More menu actions
          onShare={handleShareClick}
          onOpenInNewTab={handleOpenInNewTab}
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
          items={sidebarData}
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
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-center">
              <p
                className="text-[15px] font-['Roboto:Regular',sans-serif] font-normal text-[#d4183d] tracking-[-0.24px]"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                Error loading spaces
              </p>
              <p
                className="text-[13px] font-['Roboto:Regular',sans-serif] font-normal text-[#828282] mt-2 tracking-[-0.24px]"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                {error.message || 'An unknown error occurred'}
              </p>
            </div>
          ) : cards.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-center">
              <p
                className="text-[15px] font-['Roboto:Regular',sans-serif] font-normal text-[#828282] tracking-[-0.24px]"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                No spaces yet
              </p>
              <p
                className="text-[13px] font-['Roboto:Regular',sans-serif] font-normal text-[#bdbdbd] mt-2 tracking-[-0.24px]"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                Click the + button to create your first space
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
        <NewNodeModal
          isOpen={showNewNodeModal}
          onClose={() => setShowNewNodeModal(false)}
          spaceSlug={currentSpace}
          spaceId={currentSpace}
          currentPath={navigationPath}
          currentSpace={currentSpace}
          spaces={spaces}
          onAddSpace={handleAddSpace}
          onSpaceChange={handleSpaceChange}
        />

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
      </div>
    </ProtectedRoute>
  );
}
