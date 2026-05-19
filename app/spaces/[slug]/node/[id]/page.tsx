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
import { getNodeEntityType, withUpdatedEntityType } from '@/lib/entity-types';
import { useEntityTypeStore } from '@/stores/entityType.store';
import { LayoutTemplate, Info } from 'lucide-react';
import { NodeTemplateModal } from '@/components/templates/NodeTemplateModal';
import type { NodeTemplate } from '@/components/templates/nodeTemplates';

export default function NodeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const navigateToNode = useNavigationStore((state) => state.navigateToNode);
  const entityTypeMap = useEntityTypeStore((state) => state.types);
  const ensureEntityType = useEntityTypeStore((state) => state.ensureType);
  const getEntityType = useEntityTypeStore((state) => state.getType);
  const upsertEntityType = useEntityTypeStore((state) => state.upsertType);
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
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showNodeDetails, setShowNodeDetails] = useState(false);
  const [title, setTitle] = useState('');
  const [entityTypeValue, setEntityTypeValue] = useState('');
  const [entityColorValue, setEntityColorValue] = useState('#94a3b8');

  const entityTypes = useMemo(() => Object.values(entityTypeMap), [entityTypeMap]);
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

      const entityType = getNodeEntityType(node);
      const entityConfig = ensureEntityType(entityType);

      setEntityTypeValue(entityConfig.key);
      setEntityColorValue(entityConfig.color);

      setTabs((prevTabs) =>
        prevTabs.map((tab) =>
          tab.id === 'tab-1' ? { ...tab, title: node.title } : tab
        )
      );
    }
  }, [node, ensureEntityType, slug]);

  const handleBlocksChange = useCallback((newBlocks: Block[]) => {
    setBlocks(newBlocks);
  }, []);

  const handleFocusChange = useCallback((blockId: string | null) => {
    setFocusedBlockId(blockId);
  }, []);


  const breadcrumbPath = useMemo(() => {
    return [
      { id: 'home', title: 'Home' },
      { id: 'spaces', title: 'Spaces' },
      { id: space?.id || slug, title: space?.name || slug },
      { id: node?.id || nodeId, title: node?.title || 'Node' },
    ];
  }, [space, node, slug, nodeId]);

  const isLoading = spaceLoading || nodeLoading;

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  }, []);

  const handleSave = useCallback(() => {
    if (title && title !== node?.title) {
      updateNodeMutation.mutate({ title });
    }
  }, [title, node?.title, updateNodeMutation]);

  const handleSaveEntityType = useCallback(() => {
    if (!node || !entityTypeValue.trim()) return;

    const normalizedType = entityTypeValue.trim().toLowerCase().replace(/\s+/g, '_');

    upsertEntityType({
      key: normalizedType,
      label: normalizedType.replace(/_/g, ' '),
      color: entityColorValue,
    });

    updateNodeMutation.mutate({
      nodeDetails: withUpdatedEntityType(node.nodeDetails, normalizedType),
    });
  }, [node, entityTypeValue, entityColorValue, upsertEntityType, updateNodeMutation]);

  const handleUseTemplate = useCallback(
    async (template: NodeTemplate, mode: 'replace' | 'append') => {
      await blockEditorRef.current?.applyTemplateBlocks(template.blocks, mode);

      if (template.semanticType && node) {
        const normalizedType = template.semanticType
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '_');

        upsertEntityType({
          key: normalizedType,
          label: normalizedType.replace(/_/g, ' '),
          color: template.accentColor ?? entityColorValue,
        });

        setEntityTypeValue(normalizedType);
        setEntityColorValue(template.accentColor ?? entityColorValue);

        updateNodeMutation.mutate({
          nodeDetails: withUpdatedEntityType(node.nodeDetails, normalizedType),
        });
      }
    },
    [entityColorValue, node, updateNodeMutation, upsertEntityType]
  );

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

    if (index === 2) {
      router.push(`/spaces/${slug}`);
      return;
    }

    if (index === 3) {
      router.push(`/spaces/${slug}/node/${nodeId}`);
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
                className="mb-4 font-['Roboto:Regular',sans-serif] text-[13px] font-normal text-muted-foreground"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                Last edited {node.updatedAt ? new Date(node.updatedAt).toLocaleDateString() : 'recently'}
              </p>

              <div className="mb-8 flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowTemplateModal(true)}
                  className="gap-2 rounded-xl"
                >
                  <LayoutTemplate className="h-4 w-4" />
                  Templates
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNodeDetails((prev) => !prev)}
                  className="gap-2 rounded-xl"
                >
                  <Info className="h-4 w-4" />
                  {showNodeDetails ? 'Hide node details' : 'Node details'}
                </Button>
              </div>

              {showNodeDetails && (
                <>

              
              <div className="mb-8 rounded-[16px] border border-border bg-muted/20 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-[15px] font-semibold text-foreground">
                      Semantic type
                    </h2>
                    <p className="mt-1 text-[12px] text-muted-foreground">
                      This is the dynamic AI/user type, not the structural node type.
                    </p>
                  </div>

                  <span
                    className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide"
                    style={{
                      backgroundColor: `${entityColorValue}22`,
                      color: entityColorValue,
                    }}
                  >
                    {entityTypeValue || 'unknown'}
                  </span>
                </div>

                <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto_auto]">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                      Choose existing type
                    </label>
                    <select
                      value={entityTypeValue}
                      onChange={(e) => {
                        const selected = getEntityType(e.target.value);
                        setEntityTypeValue(selected.key);
                        setEntityColorValue(selected.color);
                      }}
                      className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
                    >
                      {entityTypes.map((type) => (
                        <option key={type.key} value={type.key}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                      Or write new type
                    </label>
                    <input
                      value={entityTypeValue}
                      onChange={(e) => setEntityTypeValue(e.target.value)}
                      onBlur={handleSaveEntityType}
                      placeholder="person, action, supplier..."
                      className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                      Color
                    </label>
                    <input
                      type="color"
                      value={entityColorValue}
                      onChange={(e) => setEntityColorValue(e.target.value)}
                      onBlur={handleSaveEntityType}
                      className="h-10 w-14 rounded-xl border border-border bg-background p-1"
                    />
                  </div>

                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSaveEntityType}
                      disabled={updateNodeMutation.isPending}
                    >
                      {updateNodeMutation.isPending ? 'Saving...' : 'Save type'}
                    </Button>
                  </div>
                </div>
              </div>

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
                </>
)}

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
        {showTemplateModal && (
          <NodeTemplateModal
            isOpen={showTemplateModal}
            onClose={() => setShowTemplateModal(false)}
            onUseTemplate={handleUseTemplate}
            showApplyMode={true}
          />
        )}

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