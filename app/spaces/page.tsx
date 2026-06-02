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
import { Tab } from '@/shell/components/TabsBar';
import { CardType, Card } from '@/shell/data/projects';
import { spaceService } from '@/services/api';
import { useRenameSpace } from '@/hooks/api';
import type { Space } from '@/types/backend-dtos';
import { useNavigationStore } from '@/stores/navigationStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { DeleteSpaceModal } from '@/shell/components/DeleteSpaceModal';

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

export default function SpacesPage() {
  const router = useRouter();
  const navigateToSpaces = useNavigationStore((state) => state.navigateToSpaces);
  const { rename: renameSpace } = useRenameSpace();
  const addNotification = useNotificationStore((state) => state.addNotification);
  // Set navigation scope on mount
  useEffect(() => {
    navigateToSpaces();
  }, [navigateToSpaces]);

  // UI State
  const [showNewNodeModal, setShowNewNodeModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [spaceToRename, setSpaceToRename] = useState<Space | null>(null);
  const [selectedCardId, setSelectedCardId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'updatedAt'>('updatedAt');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    cardId: string;
  } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [spaceToDelete, setSpaceToDelete] = useState<Space | null>(null);
 
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

  const chatAvailableSpaces = useMemo(
    () =>
      apiSpaces.map((space) => ({
        id: space.id,
        name: space.name,
        slug: space.slug,
      })),
    [apiSpaces]
  );

  // Build breadcrumb
  const breadcrumbPath = useMemo(() => {
    return [{ id: 'spaces', title: 'Spaces' }];
  }, []);

  // Handlers
  const toggleSidebar = () => {};
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
    router.push('/');
  };

  const handleBackClick = () => {
    router.back();
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === -1 || index === 0) {
      router.push('/');
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

  const handleContextMenuAction = async (action: string) => {
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

      case 'duplicate':
        if (space) {
          try {
            const duplicated = await spaceService.createSpace({
              name: `${space.name} Copy`,
              slug: `${space.slug}-copy-${Date.now()}`,
            });

            setApiSpaces((prev) => [duplicated, ...prev]);

            addNotification({
              type: 'info',
              source: 'space',
              title: 'Space duplicated',
              description: `"${space.name}" was duplicated as "${duplicated.name}".`,
            });
          } catch (err) {
            console.error('[SpacesPage] Duplicate failed:', err);

            addNotification({
              type: 'error',
              source: 'space',
              title: 'Duplicate failed',
              description: 'Failed to duplicate space.',
            });
          }
        }
        break;

      case 'share':
        setSelectedCardId(contextMenu.cardId);
        setShowShareModal(true);
        break;

      case 'delete':
        if (space) {
          setSpaceToDelete(space);
          setShowDeleteModal(true);
        }
        break;
    }

    setContextMenu(null);
  };

  const handleShareClick = () => {
    setSelectedCardId('current-project');
    setShowShareModal(true);
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

  // Handle space rename using shared hook
  const handleRename = async (newName: string) => {
    if (!spaceToRename) return;

    const oldName = spaceToRename.name;
    const result = await renameSpace(spaceToRename.id, newName);

    if (result.success) {
      const updatedSpaces = await spaceService.getSpaces();
      setApiSpaces(Array.isArray(updatedSpaces) ? updatedSpaces : []);

      addNotification({
        type: 'info',
        source: 'space',
        title: 'Space renamed',
        description: `"${oldName}" was renamed to "${newName}".`,
      });
    } else {
      addNotification({
        type: 'error',
        source: 'space',
        title: 'Rename failed',
        description: result.error || 'Failed to rename space.',
      });

      throw new Error(result.error || 'Failed to rename space');
    }
  };


  const handleDeleteSpace = async () => {
    if (!spaceToDelete) return;

    const deletedName = spaceToDelete.name;

    try {
      await spaceService.deleteSpace(spaceToDelete.id);

      setApiSpaces((prev) => prev.filter((space) => space.id !== spaceToDelete.id));

      addNotification({
        type: 'info',
        source: 'space',
        title: 'Space deleted',
        description: `"${deletedName}" was deleted.`,
      });

      setSpaceToDelete(null);
    } catch (err) {
      console.error('[SpacesPage] Delete failed:', err);

      addNotification({
        type: 'error',
        source: 'space',
        title: 'Delete failed',
        description: 'Failed to delete space.',
      });

      throw err;
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
          className="px-[14px] pt-[126px] pb-6 transition-all duration-300"
          style={{
            marginLeft: '0',
          }}
        >
          <div className="mb-6 rounded-[24px] border border-border bg-background px-6 py-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-foreground">Spaces</h1>
                <p className="mt-2 max-w-[680px] text-sm leading-6 text-muted-foreground">
                  Create, organize, and explore structured knowledge workspaces in Mujarrad.
                </p>
              </div>

              <button
                onClick={() => setShowNewNodeModal(true)}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-foreground px-4 text-sm font-medium text-background transition hover:opacity-90"
                type="button"
              >
                New
              </button>
            </div>
          </div>
          <div className="mb-5 rounded-[18px] border border-border/60 bg-background px-4 py-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search spaces..."
                className="h-[42px] w-full sm:max-w-[320px] rounded-xl border border-border/70 bg-background px-4 text-[14px] text-foreground outline-none transition placeholder:text-muted-foreground/80 focus:border-primary focus:ring-2 focus:ring-primary/15"
              />

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
                  : 'Use the New Space button to create your first space.'}
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
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
              {/* The Void card — always visible */}
              <ProjectCard
                title="The Void"
                color="#525252"
                type={CardType.FULFILLED_CONTEXT}
                onClick={() => router.push('/void')}
                onContextMenu={(e) => e.preventDefault()}
              />
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border/70 bg-background">
              {filteredAndSortedSpaces.map((space) => {
                const meta =
                  space.updatedAt
                    ? `Updated ${new Date(space.updatedAt).toLocaleDateString()}`
                    : space.createdAt
                    ? `Created ${new Date(space.createdAt).toLocaleDateString()}`
                    : '—';

                return (
                  <button
                    key={space.id}
                    type="button"
                    onClick={() => handleCardClick(space.id)}
                    onContextMenu={(e) => handleCardContextMenu(e, space.id)}
                    className="grid w-full grid-cols-[minmax(0,2fr)_160px_140px] items-center gap-4 border-b border-border/60 px-4 py-3 text-left transition hover:bg-muted/40 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-foreground flex items-center gap-1.5">
                        {space.name}
                        {space.isLocked && (
                          <span className="inline-flex items-center rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-700 dark:bg-red-900/40 dark:text-red-200">
                            Locked
                          </span>
                        )}
                      </div>
                      <div className="mt-1 truncate text-xs text-muted-foreground">
                        {space.slug}
                      </div>
                    </div>

                    <div>
                      <span className="inline-flex rounded-full bg-purple-100 px-2.5 py-1 text-[11px] font-medium text-purple-700 dark:bg-purple-900/40 dark:text-purple-200">
                        Space
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
        </div>

        {/* New Node Modal - at spaces level, default to space creation */}

        <NewNodeModal
          isOpen={showNewNodeModal}
          onClose={() => setShowNewNodeModal(false)}
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


        {spaceToDelete && (
          <DeleteSpaceModal
            isOpen={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setSpaceToDelete(null);
            }}
            spaceName={spaceToDelete.name}
            onDelete={handleDeleteSpace}
          />
        )}


      </div>
    </ProtectedRoute>
  );
}