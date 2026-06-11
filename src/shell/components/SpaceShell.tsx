'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { spaceService } from '@/services/api';
import { useNotificationStore } from '@/stores/notificationStore';
import type { Node } from '@/types/backend-dtos';
import { NodeType } from '@/types/backend-dtos';
import { MakeChildOfDialog } from '@/components/contexts/MakeChildOfDialog';
import { MigrateNodeDialog } from '@/components/migration/MigrateNodeDialog';
import { getNodeRoute } from '@/lib/routing';

interface SpaceShellProps {
  title: string;
  spaceSlug?: string;
  breadcrumbPath: Array<{ id: string; title: string }>;
  children: React.ReactNode;
  sidebarItems?: Card[];
  // Context menu
  contextMenuNode?: Node | null;
  contextMenuPosition?: { x: number; y: number } | null;
  onContextMenuClose?: () => void;
  onContextMenuAction?: (action: string, node: Node) => void;
  // NewNodeModal config
  newNodeModalDefaultType?: EntityType;
  newNodeModalAvailableTypes?: EntityType[];
  // Optional override for delete — if not provided, uses spaceSlug-based delete
  deleteSpaceSlug?: string;
  // Callbacks after delete/rename
  onDeleteSuccess?: () => void;
  onRenameSuccess?: (newName: string) => void;
  // Rename hook — caller provides since it may differ per page
  onRename?: (nodeId: string, newName: string) => Promise<{ success: boolean; error?: string }>;
  // Context slug — when viewing inside a context, enables "Remove from Context" and "Make a Child Of"
  contextSlug?: string;
  // Override internal sidebar navigation with type-aware routing from the caller
  onSidebarNavigate?: (path: string[]) => void;
}

export function SpaceShell({
  title,
  spaceSlug,
  breadcrumbPath,
  children,
  sidebarItems = [],
  contextMenuNode,
  contextMenuPosition,
  onContextMenuClose,
  onContextMenuAction,
  newNodeModalDefaultType = 'node',
  newNodeModalAvailableTypes = ['node', 'context'],
  deleteSpaceSlug,
  onDeleteSuccess,
  onRenameSuccess,
  onRename,
  contextSlug,
  onSidebarNavigate,
}: SpaceShellProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore((state) => state.addNotification);

  // UI State
  const [showNewNodeModal, setShowNewNodeModal] = useState(false);
  const [modalDefaultType, setModalDefaultType] = useState<EntityType>(newNodeModalDefaultType);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<Node | null>(null);
  const [nodeToRename, setNodeToRename] = useState<Node | null>(null);
  const [selectedCardId, setSelectedCardId] = useState('');
  const [makeChildOfNode, setMakeChildOfNode] = useState<Node | null>(null);
  const [migrateNode, setMigrateNode] = useState<Node | null>(null);

  // Tabs state
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: 'tab-1',
      title: title,
      navigationPath: [],
      spaceId: spaceSlug || '',
    },
  ]);
  const [activeTabId, setActiveTabId] = useState('tab-1');

  // Update tab title when title changes
  useEffect(() => {
    setTabs((prevTabs) =>
      prevTabs.map((tab) =>
        tab.id === 'tab-1' ? { ...tab, title } : tab
      )
    );
  }, [title]);

  // Fetch all spaces for chat panel
  const { data: allSpaces = [] } = useQuery({
    queryKey: ['spaces'],
    queryFn: () => spaceService.getSpaces(),
  });

  const chatAvailableSpaces = useMemo(
    () =>
      (Array.isArray(allSpaces) ? allSpaces : []).map((space) => ({
        id: space.id,
        name: space.name,
        slug: space.slug,
      })),
    [allSpaces]
  );

  // Handle context menu actions internally (delete, rename, share) or delegate
  const handleContextMenuActionInternal = (action: string) => {
    if (!contextMenuNode) return;

    switch (action) {
      case 'openNewTab':
        if (spaceSlug) {
          window.open(getNodeRoute(spaceSlug, contextMenuNode), '_blank');
        }
        break;
      case 'openAsNode':
        if (spaceSlug) {
          router.push(getNodeRoute(spaceSlug, contextMenuNode));
        }
        break;
      case 'rename':
        setNodeToRename(contextMenuNode);
        setShowRenameModal(true);
        break;
      case 'share':
        setSelectedCardId(contextMenuNode.id);
        setShowShareModal(true);
        break;
      case 'assign':
        setMakeChildOfNode(contextMenuNode);
        break;
      case 'moveTo':
        setMigrateNode(contextMenuNode);
        break;
      case 'delete':
        setNodeToDelete(contextMenuNode);
        setShowDeleteDialog(true);
        break;
      default:
        // Delegate unknown actions to parent
        onContextMenuAction?.(action, contextMenuNode);
        break;
    }
    onContextMenuClose?.();
  };

  // Navigation handlers
  const handleHomeClick = () => router.push('/');
  const handleBackClick = () => {
    if (spaceSlug) {
      router.push(`/spaces/${spaceSlug}`);
    } else {
      router.push('/spaces');
    }
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
    if (index === 2 && spaceSlug) {
      router.push(`/spaces/${spaceSlug}`);
      return;
    }
  };

  const handleSidebarNavigate = (path: string[]) => {
    if (onSidebarNavigate) {
      onSidebarNavigate(path);
      return;
    }
    if (path.length > 0 && spaceSlug) {
      const nodeId = path[path.length - 1];
      router.push(`/spaces/${spaceSlug}/node/${nodeId}`);
    }
  };

  const handleShareClick = () => {
    setSelectedCardId('current-project');
    setShowShareModal(true);
  };

  // Tab management
  const handleTabClick = (tabId: string) => setActiveTabId(tabId);

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
      title,
      navigationPath: [],
      spaceId: spaceSlug || '',
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
  };

  // Delete success
  const handleDeleteSuccess = () => {
    const deletedTitle = nodeToDelete?.title || 'Node';
    addNotification({
      type: 'warning',
      source: 'node',
      title: 'Node deleted',
      description: `${deletedTitle} was removed.`,
    });
    setShowDeleteDialog(false);
    setNodeToDelete(null);
    onDeleteSuccess?.();
  };

  // Rename
  const handleRename = async (newName: string) => {
    if (!nodeToRename || !onRename) return;

    const result = await onRename(nodeToRename.id, newName);

    if (result.success) {
      addNotification({
        type: 'info',
        source: 'node',
        title: 'Node renamed',
        description: `Node renamed to "${newName}".`,
      });
      onRenameSuccess?.(newName);
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

  const effectiveDeleteSlug = deleteSpaceSlug || spaceSlug || '';

  return (
    <ProtectedRoute>
      <div className="bg-background text-foreground min-h-screen relative">
        <Header
          onMenuClick={() => {}}
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
          onCreateNode={() => {
            setModalDefaultType(newNodeModalDefaultType);
            setShowNewNodeModal(true);
          }}
        />

        <Sidebar
          isOpen={false}
          selectedItem={null}
          onNavigate={handleSidebarNavigate}
          items={sidebarItems}
        />

        {/* Main content */}
        <div
          className="px-5 pt-[126px] pb-8 transition-all duration-300"
          style={{ marginLeft: '0' }}
        >
          {children}
        </div>

        {/* New Node Modal */}
        <NewNodeModal
          isOpen={showNewNodeModal}
          onClose={() => setShowNewNodeModal(false)}
          spaceSlug={spaceSlug}
          defaultType={modalDefaultType}
          availableTypes={newNodeModalAvailableTypes}
          contextSlug={contextSlug}
        />

        {/* Context Menu */}
        {contextMenuPosition && (
          <ContextMenu
            x={contextMenuPosition.x}
            y={contextMenuPosition.y}
            onClose={() => onContextMenuClose?.()}
            onOpenNewTab={() => handleContextMenuActionInternal('openNewTab')}
            onOpenAsNode={() => handleContextMenuActionInternal('openAsNode')}
            openAsLabel={contextMenuNode?.nodeType === NodeType.CONTEXT ? 'Open Context' : 'Open Node'}
            onMakeChildOf={spaceSlug ? () => handleContextMenuActionInternal('assign') : undefined}
            onMoveTo={spaceSlug ? () => handleContextMenuActionInternal('moveTo') : undefined}
            onRemoveFromContext={contextSlug ? () => {
              if (contextMenuNode) onContextMenuAction?.('removeFromContext', contextMenuNode);
              onContextMenuClose?.();
            } : undefined}
            contextName={contextSlug ? contextSlug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) : undefined}
            onRename={() => handleContextMenuActionInternal('rename')}
            onDuplicate={() => handleContextMenuActionInternal('duplicate')}
            onShare={() => handleContextMenuActionInternal('share')}
            onDelete={() => handleContextMenuActionInternal('delete')}
          />
        )}

        {/* Delete Node Dialog */}
        {showDeleteDialog && nodeToDelete && effectiveDeleteSlug && (
          <DeleteNodeDialog
            spaceSlug={effectiveDeleteSlug}
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
        {/* Make a Child Of Dialog */}
        {makeChildOfNode && spaceSlug && (
          <MakeChildOfDialog
            spaceSlug={spaceSlug}
            node={makeChildOfNode}
            open={!!makeChildOfNode}
            onOpenChange={(open) => { if (!open) setMakeChildOfNode(null); }}
            onSuccess={() => { setMakeChildOfNode(null); onDeleteSuccess?.(); }}
          />
        )}

        {/* Migrate Node Dialog */}
        {migrateNode && spaceSlug && (
          <MigrateNodeDialog
            spaceSlug={spaceSlug}
            nodeId={migrateNode.id}
            nodeTitle={migrateNode.title}
            open={!!migrateNode}
            onOpenChange={(open) => { if (!open) setMigrateNode(null); }}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
