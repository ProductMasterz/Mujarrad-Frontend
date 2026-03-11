'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { GraphVisualization } from '@/components/graph/GraphVisualization';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useSpace } from '@/hooks/api';
import { nodeService } from '@/services/api/node.service';
import { attributeService } from '@/services/api/attribute.service';
import { useState } from 'react';

export default function SpaceGraphPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const { data: space, isLoading: spaceLoading } = useSpace(slug);

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

    return (
      chatNodeType === 'conversation' ||
      chatNodeType === 'message' ||
      String(otherNode.title || '').startsWith('Conversation ') ||
      String(otherNode.title || '').startsWith('User Message ') ||
      String(otherNode.title || '').startsWith('Assistant Message ')
    );
  });
  return (
    <ProtectedRoute>
      <div className="h-screen flex flex-col bg-white">
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/spaces/${slug}`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Space
          </Button>

          <h1 className="text-lg font-semibold">
            {space ? `${space.name} - Graph View` : 'Graph View'}
          </h1>
        </div>

        <div
          className="flex-1 transition-all duration-300"
          style={{ marginRight: selectedNodeId ? '420px' : '0' }}
        >
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-[#248bf2] border-t-transparent rounded-full" />
            </div>
          ) : (
            <GraphVisualization
              nodes={nodes}
              attributes={attributes}
              onNodeClick={(nodeId) => setSelectedNodeId(nodeId)}
            />
          )}
        </div>

        {selectedNodeId && selectedNode && (
          <div className="fixed right-0 top-16 z-[70] h-[calc(100vh-64px)] w-[420px] overflow-y-auto border-l border-[#e6e6e6] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <h2 className="text-lg font-semibold text-[#333]">{selectedNode.title}</h2>
                <p className="text-xs text-[#828282]">{selectedNode.nodeType}</p>
              </div>
              <button
                onClick={() => setSelectedNodeId(null)}
                className="rounded-md px-2 py-1 text-sm text-[#828282] hover:bg-[#f5f5f5]"
                type="button"
              >
                Close
              </button>
            </div>

            <div className="space-y-6 p-4">
              <div>
                <h3 className="mb-2 text-sm font-semibold text-[#333]">Content</h3>
                <div className="whitespace-pre-wrap rounded-[12px] border border-[#e6e6e6] bg-[#fafafa] p-3 text-sm text-[#4f4f4f]">
                  {selectedNode.content || 'No content'}
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold text-[#333]">Node Details</h3>
                <pre className="overflow-x-auto rounded-[12px] border border-[#e6e6e6] bg-[#fafafa] p-3 text-xs text-[#4f4f4f]">
                  {JSON.stringify(selectedNode.nodeDetails ?? {}, null, 2)}
                </pre>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold text-[#333]">Origin / Chat Source</h3>
                <div className="space-y-2">
                  {chatSourceAttributes.length === 0 ? (
                    <p className="text-sm text-[#828282]">No chat source linked</p>
                  ) : (
                    chatSourceAttributes.map((attr) => {
                      const otherNodeId =
                        attr.sourceNodeId === selectedNodeId ? attr.targetNodeId : attr.sourceNodeId;

                      const otherNode = nodeMap.get(otherNodeId);

                      return (
                        <div
                          key={`chat-source-${attr.id}`}
                          className="rounded-[12px] border border-[#e6e6e6] bg-[#fafafa] p-3"
                        >
                          <div className="text-sm font-medium text-[#333]">
                            {otherNode?.title || otherNodeId}
                          </div>
                          <div className="mt-1 text-xs text-[#828282]">
                            Relation: {attr.attributeName || attr.attributeType}
                          </div>
                          <div className="mt-1 text-xs text-[#828282]">
                            Direction: {attr.sourceNodeId === selectedNodeId ? 'Outgoing' : 'Incoming'}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold text-[#333]">Relationships</h3>
                <div className="space-y-2">
                  {selectedNodeAttributes.length === 0 ? (
                    <p className="text-sm text-[#828282]">No relationships</p>
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
                          className="rounded-[12px] border border-[#e6e6e6] bg-[#fafafa] p-3"
                        >
                          <div className="text-sm font-medium text-[#333]">
                            {attr.attributeName || attr.attributeType}
                          </div>
                          <div className="mt-1 text-sm text-[#4f4f4f]">
                            Connected to: {otherNode?.title || otherNodeId}
                          </div>
                          <div className="mt-1 text-xs text-[#828282]">
                            Direction:{' '}
                            {attr.sourceNodeId === selectedNodeId ? 'Outgoing' : 'Incoming'}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}