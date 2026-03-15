'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Header } from '@/shell/components/Header';
import { Sidebar } from '@/shell/components/Sidebar';
import { ProjectCard } from '@/shell/components/ProjectCard';
import { ContextMenu } from '@/shell/components/ContextMenu';
import { NewNodeModal } from '@/shell/components/NewNodeModal';
import { RenameModal } from '@/shell/components/RenameModal';
import { ShareModal } from '@/shell/components/ShareModal';
import { FeedbackModal } from '@/shell/components/FeedbackModal';
import { Tab } from '@/shell/components/TabsBar';
import { CardType, Card } from '@/shell/data/projects';
import { spaceService } from '@/services/api';
import { useRenameSpace } from '@/hooks/api';
import type { Space } from '@/types/backend-dtos';
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
  const { rename: renameSpace } = useRenameSpace();

  // Set navigation scope on mount
  useEffect(() => {
    navigateToSpaces();
  }, [navigateToSpaces]);

  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNewNodeModal, setShowNewNodeModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [spaceToRename, setSpaceToRename] = useState<Space | null>(null);
  const [selectedCardId, setSelectedCardId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'updatedAt'>('updatedAt');
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
  const filteredAndSortedSpaces = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    const filtered = apiSpaces.filter((space) => {
      if (!term) return true;
      return (
        space.name.toLowerCase().includes(term) ||
        space.slug.toLowerCase().includes(term)
      );
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
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

    return sorted;
  }, [apiSpaces, searchTerm, sortBy]);

  const cards = useMemo(() => filteredAndSortedSpaces.map(spaceToCard), [filteredAndSortedSpaces]);

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
      case 'rename':
        if (space) {
          setSpaceToRename(space);
          setShowRenameModal(true);
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

  // Quick create space from sidebar - creates "Untitled" space immediately
  const handleQuickCreateSpace = async () => {
    try {
      const space = await spaceService.createSpace({ name: 'Untitled' });
      // Refresh the spaces list
      const updatedSpaces = await spaceService.getSpaces();
      setApiSpaces(Array.isArray(updatedSpaces) ? updatedSpaces : []);
      // Navigate to the new space
      router.push(`/spaces/${space.slug}`);
    } catch (error) {
      console.error('Failed to quick create space:', error);
    }
  };

  // Handle space rename using shared hook
  const handleRename = async (newName: string) => {
    if (!spaceToRename) return;

    const result = await renameSpace(spaceToRename.id, newName);
    if (result.success) {
      // Refresh the spaces list
      const updatedSpaces = await spaceService.getSpaces();
      setApiSpaces(Array.isArray(updatedSpaces) ? updatedSpaces : []);
    } else {
      throw new Error(result.error || 'Failed to rename space');
    }
  };

  // Build sidebar data from API spaces
  const sidebarData = useMemo(
    () => spacesToSidebarData(filteredAndSortedSpaces),
    [filteredAndSortedSpaces]
  );
  return (
    <ProtectedRoute>
      <div className="bg-background text-foreground min-h-screen relative">
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
          isSpacesLevel={true}
          onQuickCreateSpace={handleQuickCreateSpace}
        />
       
        {/* Main content */}

        <div
          className="pt-[76px] px-[14px] transition-all duration-300"
          style={{
            marginLeft: sidebarOpen ? '276px' : '0',
          }}
        >
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search spaces..."
              className="h-[42px] w-full max-w-[320px] rounded-xl border border-border bg-background px-4 text-[14px] text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"

            />

            <div className="flex items-center gap-2">
              <span className="text-[13px] font-medium text-muted-foreground">Sort by</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'createdAt' | 'updatedAt')}
                className="h-[42px] rounded-xl border border-border bg-background px-3 text-[14px] text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="updatedAt">Date modified</option>
                <option value="createdAt">Date created</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>

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
                className="text-[13px] font-['Roboto:Regular',sans-serif] font-normal text-muted-foreground mt-2 tracking-[-0.24px]"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                {error.message || 'An unknown error occurred'}
              </p>
            </div>
          ) : cards.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-center">
              <p
                className="text-[15px] font-['Roboto:Regular',sans-serif] font-normal text-muted-foreground tracking-[-0.24px]"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                {searchTerm.trim() ? 'No matching spaces' : 'No spaces yet'}
              </p>
              <p
                className="text-[13px] font-['Roboto:Regular',sans-serif] font-normal text-muted-foreground/70 mt-2 tracking-[-0.24px]"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                {searchTerm.trim()
                  ? 'Try a different search term.'
                  : 'Click the + button to create your first space'}
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

        {/* New Node Modal - at spaces level, default to space creation */}

        <NewNodeModal
          isOpen={showNewNodeModal}
          onClose={() => setShowNewNodeModal(false)}
          currentPath={navigationPath}
          currentSpace={currentSpace}
          spaces={spaces}
          onAddSpace={handleAddSpace}
          onSpaceChange={handleSpaceChange}
          defaultType="space"
          availableTypes={['space']}
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

        {/* Rename Modal */}
        {spaceToRename && (
          <RenameModal
            isOpen={showRenameModal}
            onClose={() => {
              setShowRenameModal(false);
              setSpaceToRename(null);
            }}
            currentName={spaceToRename.name}
            onRename={handleRename}
            entityLabel="Space"
          />
        )}
      </div>
    </ProtectedRoute>
  );
}