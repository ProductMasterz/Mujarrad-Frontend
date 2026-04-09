'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Header } from '@/shell/components/Header';
import { Tab } from '@/shell/components/TabsBar';
import { ShareModal } from '@/shell/components/ShareModal';
import { CardType } from '@/shell/data/projects';
import { useSpace, nodeKeys } from '@/hooks/api';
import { nodeService } from '@/services/api/node.service';
import { attributeService } from '@/services/api/attribute.service';
import { useNavigationStore } from '@/stores/navigationStore';
import { BlockEditor, BlockEditorRef } from '@/components/blocks/BlockEditor';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Block } from '@/components/blocks/types';
import type { UpdateNodeRequest, Attribute } from '@/types/backend-dtos';

export default function NodeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const navigateToNode = useNavigationStore((state) => state.navigateToNode);
  const slug = params.slug as string;
  const nodeId = params.id as string;

  const { data: space, isLoading: spaceLoading } = useSpace(slug);

  const { data: node, isLoading: nodeLoading, error: nodeError } = useQuery({
    queryKey: nodeKeys.detail(slug, nodeId),
    queryFn: () => nodeService.getNode(slug, nodeId),
    enabled: !!space,
  });

  useEffect(() => {
    if (space && node) {
      navigateToNode(slug, space.id, node.id);
    }
  }, [space, node, slug, navigateToNode]);

  const blockEditorRef = useRef<BlockEditorRef>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);

  const updateNodeMutation = useMutation({
    mutationFn: (data: UpdateNodeRequest) => nodeService.updateNode(slug, nodeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nodeKeys.detail(slug, nodeId) });
      queryClient.invalidateQueries({ queryKey: nodeKeys.lists() });
    },
  });

  const [showShareModal, setShowShareModal] = useState(false);
  const [title, setTitle] = useState('');

  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: 'tab-1',
      title: 'Node',
      navigationPath: [],
      spaceId: slug,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState('tab-1');

  useEffect(() => {
    if (node) {
      setTitle(node.title || '');
      setTabs((prevTabs) =>
        prevTabs.map((tab) =>
          tab.id === 'tab-1' ? { ...tab, title: node.title } : tab
        )
      );
    }
  }, [node]);

  const handleBlocksChange = useCallback((newBlocks: Block[]) => {
    setBlocks(newBlocks);
  }, []);

  const handleFocusChange = useCallback((blockId: string | null) => {
    setFocusedBlockId(blockId);
  }, []);


  const breadcrumbPath = useMemo(() => {
    const path = [
      { id: 'home', title: 'Home' },
      { id: 'spaces', title: 'Spaces' },
    ];

    if (space) {
      path.push({ id: space.id, title: space.name });
    }

    if (node) {
      path.push({ id: node.id, title: node.title });
    }

    return path;
  }, [space, node]);

  const isLoading = spaceLoading || nodeLoading;

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  }, []);

  const handleSave = useCallback(() => {
    if (title && title !== node?.title) {
      updateNodeMutation.mutate({ title });
    }
  }, [title, node?.title, updateNodeMutation]);


  const handleHomeClick = () => {
    router.push('/');
  };

  const handleBackClick = () => {
    router.push(`/spaces/${slug}`);
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

    if (index === 2 && space) {
      router.push(`/spaces/${slug}`);
    }
  };

  const handleShareClick = () => {
    setShowShareModal(true);
  };
  

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
      title: node?.title || 'Node',
      navigationPath: [],
      spaceId: slug,
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
  };

  const { data: attributes, isLoading: isLoadingAttributes } = useQuery({
    queryKey: ['spaces', slug, 'nodes', nodeId, 'attributes', 'origin'],
    queryFn: () => attributeService.getNodeAttributes(nodeId),
    enabled: !!nodeId,
  });

  const originAttribute =
    attributes?.find((attr: Attribute) => {
      const typeValue =
        attr.attributeValue &&
        typeof attr.attributeValue === 'object' &&
        'type' in attr.attributeValue
          ? String(attr.attributeValue.type)
          : undefined;

      return (
        attr.attributeName === 'extracted_from' ||
        attr.attributeType === 'references' ||
        typeValue === 'references'
      );
    }) ?? null;

  const originNodeId = originAttribute?.targetNodeId;

  const { data: originNode, isLoading: isLoadingOriginNode } = useQuery({
    queryKey: ['spaces', slug, 'nodes', originNodeId, 'origin-node'],
    queryFn: () => nodeService.getNode(slug, originNodeId as string),
    enabled: !!originNodeId,
  });

  if (nodeError) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
          <div className="text-center">
            <h1
              className="mb-2 text-[24px] font-['Roboto:Bold',sans-serif] font-bold text-foreground"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              Node not found
            </h1>
            <p
              className="mb-4 text-[15px] font-['Roboto:Regular',sans-serif] font-normal text-muted-foreground"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              The node you&apos;re looking for doesn&apos;t exist.
            </p>
            <button
              onClick={() => router.push(`/spaces/${slug}`)}
              className="h-[36px] rounded-[100px] bg-[#248bf2] px-[20px] font-['Roboto:SemiBold',sans-serif] text-[14px] font-semibold tracking-[-0.24px] text-white transition-colors hover:bg-[#1a6bc4]"
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
      <div className="relative min-h-screen bg-background text-foreground">
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
        />

     

        <div className="px-5 pt-[126px] pb-8 transition-all duration-300">
          {isLoading ? (
            <div className="flex h-[400px] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#248bf2] border-t-transparent" />
            </div>
          ) : node && space ? (
            <div className="mx-auto max-w-4xl px-6 py-8">
              <input
                type="text"
                value={title}
                onChange={handleTitleChange}
                onBlur={handleSave}
                placeholder="Untitled"
                className="mb-2 w-full border-none bg-transparent font-['Roboto:Bold',sans-serif] text-[32px] font-bold text-foreground outline-none placeholder:text-muted-foreground"
                style={{ fontVariationSettings: "'wdth' 100" }}
              />

              <p
                className="mb-8 font-['Roboto:Regular',sans-serif] text-[13px] font-normal text-muted-foreground"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                Last edited {node.updatedAt ? new Date(node.updatedAt).toLocaleDateString() : 'recently'}
              </p>

              <div className="mb-8 rounded-[16px] border border-border bg-muted/30 p-5">
                <div className="mb-3 flex items-center gap-2">
                  <h2
                    className="font-['Roboto:SemiBold',sans-serif] text-[18px] font-semibold text-foreground"
                    style={{ fontVariationSettings: "'wdth' 100" }}
                  >
                    Source / Origin
                  </h2>
                  {originAttribute && (
                    <Badge variant="outline">Extracted From</Badge>
                  )}
                </div>

                {isLoadingAttributes || (originNodeId && isLoadingOriginNode) ? (
                  <p className="text-[14px] text-muted-foreground">Loading source information...</p>
                ) : originAttribute && originNode ? (
                  <div className="space-y-4">
                    <div className="text-[14px] text-foreground">
                      <span className="font-semibold">Source node:</span> {originNode.title}
                    </div>

                    <div className="rounded-[12px] border border-border bg-background p-4">
                      <p className="mb-2 text-[12px] uppercase tracking-wide text-muted-foreground">
                        Original Text
                      </p>
                      <p className="whitespace-pre-wrap text-[14px] text-foreground">
                        {originNode.content || 'No original text found.'}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <Link href={`/spaces/${slug}/node/${originNode.id}`}>
                        <Button variant="outline">Open Source Input</Button>
                      </Link>
                      <span className="break-all text-[12px] text-muted-foreground">
                        {originNode.id}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-[14px] text-muted-foreground">
                    No source input linked to this node.
                  </p>
                )}
              </div>

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

        {showShareModal && (
          <ShareModal
            isOpen={showShareModal}
            onClose={() => setShowShareModal(false)}
            cardId={nodeId}
            cardType={CardType.NODE}
          />
        )}

      </div>
    </ProtectedRoute>
  );
}