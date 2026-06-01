'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { GraphVisualization } from '@/components/graph/GraphVisualization';
import { useSpace } from '@/hooks/api';
import { nodeService } from '@/services/api/node.service';
import { attributeService } from '@/services/api/attribute.service';
import { useEffect, useState } from 'react';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { spaceService } from '@/services/api';
import { Header } from '@/shell/components/Header';
import { Tab } from '@/shell/components/TabsBar';
import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer';
import { getNodeEntityType } from '@/lib/entity-types';
import { useEntityTypeStore } from '@/stores/entityType.store';

function parseNodeDetails(node: { nodeDetails?: unknown }): Record<string, unknown> | undefined {
  if (!node.nodeDetails) return undefined;

  if (typeof node.nodeDetails === 'string') {
    try {
      return JSON.parse(node.nodeDetails);
    } catch {
      return undefined;
    }
  }

  return node.nodeDetails as Record<string, unknown>;
}

function formatGraphContentForMarkdown(content: string) {
  if (!content) return content;
  let formatted = content.trim();

  const isPipelineReport = /MUSGHI PIPELINE REPORT/i.test(formatted);
  if (!isPipelineReport) return formatted;

  formatted = formatted.replace(/^={3,}\s*$/gm, '');
  formatted = formatted.replace(/^-{3,}\s*$/gm, '');

  formatted = formatted.replace(
    /^MUSGHI PIPELINE REPORT\s*-\s*(.+)$/gim,
    '## Musghi Pipeline Report\n\n**Message ID:** $1'
  );

  formatted = formatted.replace(
    /^Space:\s*(.+?)\s+Input:\s*(.+)$/gim,
    '**Space:** $1\n\n**Input:** $2'
  );

  formatted = formatted.replace(/^SPACE OVERVIEW$/gm, '### Space Overview');
  formatted = formatted.replace(/^FOCUS AREAS$/gm, '### Focus Areas');
  formatted = formatted.replace(/^MOST CONNECTED NODES$/gm, '### Most Connected Nodes');
  formatted = formatted.replace(/^KEY FINDINGS$/gm, '### Key Findings');
  formatted = formatted.replace(/^EXTRACTED ENTITIES$/gm, '### Extracted Entities');
  formatted = formatted.replace(/^IDENTIFIED RELATIONSHIPS.*$/gm, '### Identified Relationships');
  formatted = formatted.replace(/^TRACEABILITY LINKS.*$/gm, '### Traceability Links');
  formatted = formatted.replace(/^MUJARRAD ATTRIBUTES$/gm, '### Mujarrad Attributes');
  formatted = formatted.replace(/^INTERPRETATION$/gm, '### Interpretation');

  formatted = formatted.replace(/^\s*•\s+/gm, '- ');
  formatted = formatted.replace(/^\s*→\s+/gm, '- ');
  formatted = formatted.replace(/^\s*\*\s+/gm, '- ');

  formatted = formatted.replace(
    /^\s*\[(.+?)\]\s+(.+?)\s+→\s+(.+?)$/gm,
    '- **$1**: $2 → $3'
  );

  formatted = formatted.replace(/\n{3,}/g, '\n\n');

  return formatted.trim();
}

export default function SpaceGraphPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const getEntityType = useEntityTypeStore((state) => state.getType);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: 'tab-1',
      title: 'Graph',
      navigationPath: [],
      spaceId: slug,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState('tab-1');

  const { data: space, isLoading: spaceLoading } = useSpace(slug);

  useEffect(() => {
    if (space) {
      setTabs((prevTabs) =>
        prevTabs.map((tab) =>
          tab.id === 'tab-1' ? { ...tab, title: `${space.name} Graph` } : tab
        )
      );
    }
  }, [space]);

  const { data: spaces = [] } = useQuery({
    queryKey: ['spaces'],
    queryFn: () => spaceService.getSpaces(),
  });

  const chatAvailableSpaces = Array.isArray(spaces)
    ? spaces.map((space) => ({
        id: space.id,
        name: space.name,
        slug: space.slug,
      }))
    : [];

  const { data: nodes = [], isLoading: nodesLoading } = useQuery({
    queryKey: ['spaces', slug, 'graph-page', 'nodes'],
    queryFn: () => nodeService.getNodes(slug, { page: 1, size: 1000 }),
    enabled: !!slug,
  });

  const { data: attributes = [], isLoading: attributesLoading } = useQuery({
    queryKey: ['spaces', slug, 'graph-page', 'node-attributes', nodes.map((n) => n.id).join(',')],
    queryFn: async () => {
      if (!nodes.length) return [];

      const attributeGroups = await Promise.all(
        nodes.map((node) => attributeService.getNodeAttributes(node.id))
      );

      const merged = attributeGroups.flat();

      const deduped = merged.filter(
        (attr, index, self) => index === self.findIndex((a) => a.id === attr.id)
      );

      return deduped;
    },
    enabled: nodes.length > 0,
  });

  const { data: selectedNode } = useQuery({
    queryKey: ['spaces', slug, 'graph-page', 'selected-node', selectedNodeId],
    queryFn: () => nodeService.getNode(slug, selectedNodeId as string),
    enabled: !!selectedNodeId,
  });

  const { data: selectedNodeAttributes = [] } = useQuery({
    queryKey: ['spaces', slug, 'graph-page', 'selected-node-attributes', selectedNodeId],
    queryFn: () => attributeService.getNodeAttributes(selectedNodeId as string),
    enabled: !!selectedNodeId,
  });

  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const isLoading = spaceLoading || nodesLoading || attributesLoading;
  
  const extractedFromAttributes = selectedNodeAttributes.filter((attr) => {
    const attrName = String(attr.attributeName || '').toLowerCase();
    const attrType = String(attr.attributeType || '').toLowerCase();

    return (
      attrName === 'extracted_from' ||
      attrName === 'source' ||
      attrType === 'references'
    );
  });

  const originSourceNodeIds = extractedFromAttributes
    .map((attr) => attr.sourceNodeId === selectedNodeId ? attr.targetNodeId : attr.sourceNodeId)
    .filter((id): id is string => id !== null);

  const originSourceNodes = originSourceNodeIds
    .map((id) => nodeMap.get(id))
    .filter((node): node is typeof nodes[number] => Boolean(node));

  const originMessageNodes = originSourceNodes.filter((node) => {
    const details = parseNodeDetails(node);
    const title = String(node.title || '').toLowerCase();
    const chatNodeType = String(details?.chatNodeType || '').toLowerCase();
    const role = String(details?.role || '').toLowerCase();

    return (
      chatNodeType === 'message' ||
      role === 'user' ||
      role === 'assistant' ||
      title.includes('input') ||
      title.includes('message') ||
      title.includes('msg-')
    );
  });

  const selectedNodeDisplayContent =
    (selectedNode?.content || '').trim() ||
    originMessageNodes
      .map((node) => (node.content || '').trim())
      .find((content) => !!content) ||
    originSourceNodes
      .map((node) => (node.content || '').trim())
      .find((content) => !!content) ||
    'No content';

  const selectedNodeDisplayContentMarkdown =
    formatGraphContentForMarkdown(selectedNodeDisplayContent);

  const conversationNodesFromOrigin = originSourceNodes.flatMap((originNode) => {
      if (!originNode) return [];

      const originNodeAttributes = attributes.filter(
        (attr) =>
          attr.sourceNodeId === originNode.id || attr.targetNodeId === originNode.id
      );

      return originNodeAttributes
        .map((attr) =>
          attr.sourceNodeId === originNode.id ? attr.targetNodeId : attr.sourceNodeId
        )
        .filter((id): id is string => id !== null)
        .map((id) => nodeMap.get(id))
        .filter((node) => {
          if (!node) return false;
          const details = parseNodeDetails(node);

          return (
            details?.chatNodeType === 'conversation' ||
            ((details?.createdFrom === 'chat' || details?.createdFrom === 'assistant-ui') &&
              details?.role === 'conversation') ||
            String(details?.role || '').toLowerCase() === 'conversation' ||
            String(node.title || '').toLowerCase().includes('conversation')
          );
        });
    });

  const uniqueConversationNodes = conversationNodesFromOrigin.filter(
    (node, index, self) => node && index === self.findIndex((n) => n?.id === node.id)
  );
  let selectedNodeDetails: Record<string, unknown> | undefined;

  if (selectedNode?.nodeDetails) {
    if (typeof selectedNode.nodeDetails === 'string') {
      try {
        selectedNodeDetails = JSON.parse(selectedNode.nodeDetails);
      } catch {
        selectedNodeDetails = undefined;
      }
    } else {
      selectedNodeDetails = selectedNode.nodeDetails as Record<string, unknown>;
    }
  }

  

  const selectedEntityType = selectedNode ? getNodeEntityType(selectedNode) : 'unknown';

  const selectedEntityConfig = getEntityType(selectedEntityType);

  const hasSelectedSemanticType =
    selectedEntityType && selectedEntityType !== 'unknown';

  const selectedEntityLabel = hasSelectedSemanticType
    ? selectedEntityConfig.label
    : 'Unclassified';

  const selectedEntityColor = hasSelectedSemanticType
    ? selectedEntityConfig.color
    : '#94a3b8';


  const summaryEntries = [
    {
      label: 'Node Type',
      value: selectedNode?.nodeType || '—',
    },
    {
      label: 'Semantic Type',
      value: hasSelectedSemanticType ? selectedEntityLabel : '—',
    },
    {
      label: 'Created From',
      value:
        typeof selectedNodeDetails?.createdFrom === 'string'
          ? selectedNodeDetails.createdFrom
          : '—',
    },
    {
      label: 'Chat Type',
      value:
        typeof selectedNodeDetails?.chatNodeType === 'string'
          ? selectedNodeDetails.chatNodeType
          : '—',
    },
    {
      label: 'Show In Space',
      value:
        typeof selectedNodeDetails?.showInSpaceList === 'boolean'
          ? selectedNodeDetails.showInSpaceList
            ? 'Yes'
            : 'No'
          : '—',
    },
  ].filter((item) => item.value !== '—');

  const toggleSidebar = () => {};

  const handleHomeClick = () => {
    router.push('/');
  };

  const handleBackClick = () => {
    router.push(`/spaces/${slug}`);
  };

  const breadcrumbPath = [
    { id: 'spaces', title: 'Spaces' },
    { id: space?.id || slug, title: space?.name || 'Space' },
    { id: 'graph', title: 'Graph' },
  ];

  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      router.push('/');
      return;
    }

    if (index === 0) {
      router.push('/spaces');
      return;
    }

    if (index === 1) {
      router.push(`/spaces/${slug}`);
    }
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
      title: space?.name ? `${space.name} Graph` : 'Graph',
      navigationPath: [],
      spaceId: slug,
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background text-foreground">
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
            router.push(`/spaces/${nextSpaceSlug}/graph`);
          }}
        />

        <div className="pt-[126px]">
          <div
            className="transition-all duration-300"
            style={{
              marginRight: `${chatOpen ? 620 : selectedNodeId ? 430 : 0}px`,
            }}
          >
            <div className="h-[calc(100vh-126px)]">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#248bf2] border-t-transparent" />
                </div>
              ) : (
                <GraphVisualization
                  nodes={nodes}
                  attributes={attributes}
                  onNodeClick={(nodeId) => {
                    setChatOpen(false);
                    setSelectedNodeId(nodeId);
                  }}
                />
              )}
            </div>
          </div>

          {!chatOpen && selectedNodeId && selectedNode && (
            <div className="fixed right-0 top-[126px] z-[70] h-[calc(100vh-126px)] w-[430px] overflow-y-auto border-l border-border bg-background shadow-2xl">
              <div className="sticky top-0 z-10 border-b border-border bg-background px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
                        {selectedNode.nodeType}
                      </span>

                      {hasSelectedSemanticType && (
                        <span
                          className="rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide"
                          style={{
                            backgroundColor: `${selectedEntityColor}22`,
                            color: selectedEntityColor,
                          }}
                        >
                          {selectedEntityLabel}
                        </span>
                      )}
                    </div>

                    <h2 className="truncate text-xl font-semibold text-foreground">
                      {selectedNode.title}
                    </h2>
                  </div>

                  <button
                    onClick={() => setSelectedNodeId(null)}
                    className="rounded-xl border border-border bg-background px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    type="button"
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="space-y-5 p-5">
                <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
                  <h3 className="mb-3 text-sm font-semibold text-foreground">Content</h3>
                  <div className="rounded-xl bg-muted/40 px-4 py-3 text-sm leading-6 text-foreground">
                    <div className="[&_a]:text-blue-600 dark:[&_a]:text-blue-400 [&_a]:underline [&_code]:rounded [&_code]:bg-background [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[12px] [&_code]:text-foreground [&_p]:my-2 [&_li]:mb-1 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_h1]:mb-2 [&_h1]:mt-3 [&_h1]:text-base [&_h1]:font-semibold [&_h2]:mb-2 [&_h2]:mt-3 [&_h2]:text-sm [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:mt-3 [&_h3]:text-sm [&_h3]:font-semibold [&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-slate-700 [&_pre]:bg-slate-950 [&_pre]:p-4 [&_pre]:text-[12px] [&_pre]:text-white">
                      <MarkdownRenderer content={selectedNodeDisplayContentMarkdown} />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
                  <h3 className="mb-3 text-sm font-semibold text-foreground">Summary</h3>
                  {summaryEntries.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No structured metadata available</p>
                  ) : (
                    <div className="grid gap-3">
                      {summaryEntries.map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center justify-between gap-3 rounded-xl bg-muted/40 px-3 py-2"
                        >
                          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            {item.label}
                          </span>
                          <span className="text-sm font-medium text-foreground">
                            {String(item.value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
                  <h3 className="mb-3 text-sm font-semibold text-foreground">Origin / Chat Source</h3>
                  <div className="space-y-3">
                    {originSourceNodes.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No chat source linked</p>
                    ) : (
                      <>
                        {originMessageNodes.map((node) => (
                          <div
                            key={`origin-message-${node?.id}`}
                            className="rounded-xl border border-border bg-muted/40 p-3"
                          >
                            <div className="mb-2 flex items-center gap-2">
                              <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
                                Message node
                              </span>
                            </div>

                            <div className="text-sm font-semibold text-foreground">
                              {node?.title || 'Untitled message'}
                            </div>

                            <div className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                              {node?.content || 'No message content'}
                            </div>
                          </div>
                        ))}

                        {uniqueConversationNodes.map((node) => (
                          <div
                            key={`origin-conversation-${node?.id}`}
                            className="rounded-xl border border-border bg-muted/40 p-3"
                          >
                            <div className="mb-2 flex items-center gap-2">
                              <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[11px] font-medium text-violet-700 dark:bg-violet-900/40 dark:text-violet-200">
                                Conversation
                              </span>
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                Space: {space?.name || slug}
                              </span>
                            </div>

                            <div className="text-sm font-semibold text-foreground">
                              {node?.title || 'Untitled conversation'}
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
                  <h3 className="mb-3 text-sm font-semibold text-foreground">Relationships</h3>
                  <div className="space-y-3">
                    {selectedNodeAttributes.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No relationships</p>
                    ) : (
                      selectedNodeAttributes.map((attr) => {
                        const otherNodeId =
                          attr.sourceNodeId === selectedNodeId
                            ? attr.targetNodeId
                            : attr.sourceNodeId;

                        const otherNode = nodeMap.get(otherNodeId);

                        return (
                          <div
                            key={attr.id}
                            className="rounded-xl border border-border bg-muted/40 p-3"
                          >
                            <div className="mb-2 flex items-center justify-between gap-3">
                              <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-violet-700 dark:bg-violet-900/40 dark:text-violet-200">
                                {attr.attributeName || attr.attributeType}
                              </span>
                              <span className="text-[11px] font-medium text-muted-foreground">
                                {attr.sourceNodeId === selectedNodeId ? 'Outgoing' : 'Incoming'}
                              </span>
                            </div>

                            <div className="text-sm font-medium text-foreground">
                              {otherNode?.title || otherNodeId}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <details className="rounded-2xl border border-border bg-background p-4 shadow-sm">
                  <summary className="cursor-pointer text-sm font-semibold text-foreground">
                    Technical details
                  </summary>
                  <pre className="mt-3 overflow-x-auto rounded-xl bg-muted/40 p-3 text-xs leading-5 text-muted-foreground">
                    {JSON.stringify(selectedNode.nodeDetails ?? {}, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          )}

          {chatOpen && (
            <div className="fixed right-0 top-[126px] z-[80] h-[calc(100vh-126px)] w-[620px] overflow-hidden rounded-l-[24px] border-l border-border bg-background shadow-2xl">
              <ChatPanel
                spaceSlug={slug}
                title="Chat"
                embedded={true}
                onClose={() => setChatOpen(false)}
                availableSpaces={chatAvailableSpaces}
                onChangeSpace={(nextSpaceSlug) => {
                  setSelectedNodeId(null);
                  setChatOpen(false);
                  router.push(`/spaces/${nextSpaceSlug}/graph`);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}