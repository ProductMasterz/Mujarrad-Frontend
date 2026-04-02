'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { GraphVisualization } from '@/components/graph/GraphVisualization';
import { Button } from '@/components/ui/button';
import { useSpace } from '@/hooks/api';
import { nodeService } from '@/services/api/node.service';
import { attributeService } from '@/services/api/attribute.service';
import { useState } from 'react';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { spaceService } from '@/services/api';
import { ArrowLeft, MessageSquare } from 'lucide-react';
export default function SpaceGraphPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const { data: space, isLoading: spaceLoading } = useSpace(slug);


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
        (attr, index, self) =>
          index === self.findIndex((a) => a.id === attr.id)
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
  const chatSourceAttributes = selectedNodeAttributes.filter((attr) => {
  const otherNodeId =
    attr.sourceNodeId === selectedNodeId ? attr.targetNodeId : attr.sourceNodeId;

  const otherNode = nodeMap.get(otherNodeId);
    if (!otherNode) return false;

    let details: Record<string, unknown> | undefined;

    if (typeof otherNode.nodeDetails === 'string') {
      try {
        details = JSON.parse(otherNode.nodeDetails);
      } catch {
        details = undefined;
      }
    } else {
      details = otherNode.nodeDetails as Record<string, unknown> | undefined;
    }

    const chatNodeType = details?.chatNodeType;
    const createdFrom = details?.createdFrom;
    const role = details?.role;

    const isConversation =
      chatNodeType === 'conversation' ||
      ((createdFrom === 'chat' || createdFrom === 'assistant-ui') &&
        role === 'conversation');

    const isMessage =
      chatNodeType === 'message' ||
      ((createdFrom === 'chat' || createdFrom === 'assistant-ui') &&
        (role === 'user' || role === 'assistant'));

    return isConversation || isMessage;
  });
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

  const selectedEntityType =
    typeof selectedNodeDetails?.entityType === 'string'
      ? selectedNodeDetails.entityType
      : undefined;

  const summaryEntries = [
    {
      label: 'Node Type',
      value: selectedNode?.nodeType || '—',
    },
    {
      label: 'Entity Type',
      value: selectedEntityType || '—',
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
  return (
    <ProtectedRoute>
      <div className="flex h-screen flex-col bg-background text-foreground">
        <div className="flex items-center justify-between border-b border-border bg-background px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/spaces/${slug}`)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Space
            </Button>

            <h1 className="text-lg font-semibold">
              {space ? `${space.name} - Graph View` : 'Graph View'}
            </h1>
          </div>

          <button
            onClick={() => {
              setSelectedNodeId(null);
              setChatOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground transition hover:bg-muted"
            type="button"
          >
            <MessageSquare className="h-4 w-4" />
            Chat
          </button>
        </div>

        <div
          className="flex-1 transition-all duration-300"
          style={{
            marginRight: `${chatOpen ? 620 : selectedNodeId ? 430 : 0}px`,
          }}
        >
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-[#248bf2] border-t-transparent rounded-full" />
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

        {!chatOpen && selectedNodeId && selectedNode && (
          <div className="fixed right-0 top-16 z-[70] h-[calc(100vh-64px)] w-[430px] overflow-y-auto border-l border-border bg-background shadow-2xl">
            <div className="sticky top-0 z-10 border-b border-border bg-background px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
                      {selectedNode.nodeType}
                    </span>

                    {selectedEntityType && (
                      <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {selectedEntityType}
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
                <div className="whitespace-pre-wrap rounded-xl bg-muted/40 px-4 py-3 text-sm leading-6 text-foreground">
                  {selectedNode.content || 'No content'}
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
                  {chatSourceAttributes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No chat source linked</p>
                  ) : (
                    chatSourceAttributes.map((attr) => {
                      const otherNodeId =
                        attr.sourceNodeId === selectedNodeId ? attr.targetNodeId : attr.sourceNodeId;

                      const otherNode = nodeMap.get(otherNodeId);

                      return (
                        <div
                          key={`chat-source-${attr.id}`}
                          className="rounded-xl border border-border bg-muted/40 p-3"
                        >
                          <div className="text-sm font-semibold text-foreground">
                            {otherNode?.title || otherNodeId}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
                              {attr.attributeName || attr.attributeType}
                            </span>
                            <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                              {attr.sourceNodeId === selectedNodeId ? 'Outgoing' : 'Incoming'}
                            </span>
                          </div>
                        </div>
                      );
                    })
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
          <div className="fixed right-4 top-20 z-[80] h-[calc(100vh-96px)] w-[620px] overflow-hidden rounded-[24px] border border-border bg-background shadow-2xl">
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
    </ProtectedRoute>
  );
}