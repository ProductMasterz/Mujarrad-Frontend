'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Header } from '@/scratchup/components/Header';
import { BlockOutlineSidebar } from '@/scratchup/components/BlockOutlineSidebar';
import { Tab } from '@/scratchup/components/TabsBar';
import { FeedbackModal } from '@/scratchup/components/FeedbackModal';
import { ShareModal } from '@/scratchup/components/ShareModal';
import { CardType } from '@/scratchup/data/projects';
import { useSpace } from '@/hooks/api';
import { nodeService } from '@/services/api/node.service';
import { useAuthStore } from '@/stores/auth.store';
import { BlockEditor, BlockEditorRef } from '@/components/blocks/BlockEditor';
import type { Block } from '@/components/blocks/types';
import type { UpdateNodeRequest } from '@/types/backend-dtos';

export default function NodeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { logout } = useAuthStore();
  const slug = params.slug as string;
  const nodeId = params.id as string;

  // Fetch space data
  const { data: space, isLoading: spaceLoading } = useSpace(slug);

  // Fetch the current node
  const { data: node, isLoading: nodeLoading, error: nodeError } = useQuery({
    queryKey: ['node', slug, nodeId],
    queryFn: () => nodeService.getNode(slug, nodeId),
    enabled: !!space,
  });

  // BlockEditor ref for scrolling to blocks
  const blockEditorRef = useRef<BlockEditorRef>(null);

  // State for blocks (from BlockEditor)
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);

  // Update node mutation (for title changes)
  const updateNodeMutation = useMutation({
    mutationFn: (data: UpdateNodeRequest) => nodeService.updateNode(slug, nodeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['node', slug, nodeId] });
      queryClient.invalidateQueries({ queryKey: ['space-nodes', slug] });
    },
  });

  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [title, setTitle] = useState('');

  // Tabs state
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: 'tab-1',
      title: 'Node',
      navigationPath: [],
      spaceId: slug,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState('tab-1');

  // Initialize title when node loads
  useEffect(() => {
    if (node) {
      setTitle(node.title || '');
      setTabs(prevTabs =>
        prevTabs.map(tab =>
          tab.id === 'tab-1' ? { ...tab, title: node.title } : tab
        )
      );
    }
  }, [node]);

  // Handle blocks change from BlockEditor
  const handleBlocksChange = useCallback((newBlocks: Block[]) => {
    setBlocks(newBlocks);
  }, []);

  // Handle focus change from BlockEditor
  const handleFocusChange = useCallback((blockId: string | null) => {
    setFocusedBlockId(blockId);
  }, []);

  // Handle block click in sidebar - scroll to block
  const handleBlockClick = useCallback((blockId: string) => {
    if (blockEditorRef.current) {
      blockEditorRef.current.scrollToBlock(blockId);
    }
  }, []);

  // Build breadcrumb
  const breadcrumbPath = useMemo(() => {
    const path = [{ id: 'spaces', title: 'Spaces' }];
    if (space) {
      path.push({ id: space.id, title: space.name });
    }
    if (node) {
      path.push({ id: node.id, title: node.title });
    }
    return path;
  }, [space, node]);

  // Loading state
  const isLoading = spaceLoading || nodeLoading;

  // Handle title change
  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  }, []);

  // Save title on blur
  const handleSave = useCallback(() => {
    if (title && title !== node?.title) {
      updateNodeMutation.mutate({ title });
    }
  }, [title, node?.title, updateNodeMutation]);

  // Handlers
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleHomeClick = () => {
    router.push('/spaces');
  };

  const handleBackClick = () => {
    router.push(`/spaces/${slug}`);
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === 0) {
      router.push('/spaces');
    } else if (index === 1 && space) {
      router.push(`/spaces/${slug}`);
    }
  };

  const handleShareClick = () => {
    setShowShareModal(true);
  };

  const handleWhiteboardClick = () => {
    router.push(`/spaces/${slug}/whiteboard`);
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
    const newTabs = tabs.filter(t => t.id !== tabId);
    setTabs(newTabs);
    if (activeTabId === tabId) {
      setActiveTabId(newTabs[0].id);
    }
  };

  const handleNewTab = () => {
    const newTab: Tab = {
      id: `tab-${Date.now()}`,
      title: node?.title || 'Node',
      navigationPath: [],
      spaceId: slug,
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
  };

  // Error state
  if (nodeError) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1
              className="text-[24px] font-['Roboto:Bold',sans-serif] font-bold text-[#333] mb-2"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              Node not found
            </h1>
            <p
              className="text-[15px] font-['Roboto:Regular',sans-serif] font-normal text-[#828282] mb-4"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              The node you&apos;re looking for doesn&apos;t exist.
            </p>
            <button
              onClick={() => router.push(`/spaces/${slug}`)}
              className="h-[36px] px-[20px] bg-[#248bf2] rounded-[100px] font-['Roboto:SemiBold',sans-serif] font-semibold text-[14px] text-white tracking-[-0.24px] hover:bg-[#1a6bc4] transition-colors"
              style={{ fontVariationSettings: "'wdth' 100" }}
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
      <div className="bg-white min-h-screen relative">
        <Header
          onMenuClick={toggleSidebar}
          onBackClick={handleBackClick}
          showBackButton={true}
          breadcrumbPath={breadcrumbPath}
          onAddClick={() => {}}
          onNotificationClick={() => {}}
          onSearchClick={() => {}}
          onMoreClick={() => {}}
          onHomeClick={handleHomeClick}
          onBreadcrumbClick={handleBreadcrumbClick}
          onShare={handleShareClick}
          onOpenInNewTab={handleNewTab}
          onWhiteboard={handleWhiteboardClick}
          onDelete={() => {}}
          tabs={tabs}
          activeTabId={activeTabId}
          onTabClick={handleTabClick}
          onTabClose={handleTabClose}
          onNewTab={handleNewTab}
          onFeedback={handleFeedback}
        />

        <BlockOutlineSidebar
          isOpen={sidebarOpen}
          blocks={blocks}
          selectedBlockId={focusedBlockId}
          onBlockClick={handleBlockClick}
          onLogout={handleLogout}
        />

        {/* Main content */}
        <div
          className="pt-[76px] transition-all duration-300"
          style={{
            marginLeft: sidebarOpen ? '276px' : '0',
          }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-[400px]">
              <div className="animate-spin h-8 w-8 border-4 border-[#248bf2] border-t-transparent rounded-full" />
            </div>
          ) : node && space ? (
            <div className="max-w-4xl mx-auto py-8 px-6">
              {/* Page Title - Editable */}
              <input
                type="text"
                value={title}
                onChange={handleTitleChange}
                onBlur={handleSave}
                placeholder="Untitled"
                className="w-full text-[32px] font-['Roboto:Bold',sans-serif] font-bold text-[#333] mb-2 outline-none border-none bg-transparent placeholder:text-[#bdbdbd]"
                style={{ fontVariationSettings: "'wdth' 100" }}
              />

              {/* Metadata */}
              <p
                className="text-[13px] font-['Roboto:Regular',sans-serif] font-normal text-[#bdbdbd] mb-8"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                Last edited {node.updatedAt ? new Date(node.updatedAt).toLocaleDateString() : 'recently'}
              </p>

              {/* Notion-like Block Editor */}
              <BlockEditor
                ref={blockEditorRef}
                pageId={node.id}
                spaceSlug={slug}
                spaceId={space.id}
                onBlocksChange={handleBlocksChange}
                onFocusChange={handleFocusChange}
              />
            </div>
          ) : null}
        </div>

        {/* Share Modal */}
        {showShareModal && (
          <ShareModal
            isOpen={showShareModal}
            onClose={() => setShowShareModal(false)}
            cardId={nodeId}
            cardType={CardType.NODE}
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
