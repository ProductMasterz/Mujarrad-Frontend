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

export default function SpaceGraphPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

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

  const isLoading = spaceLoading || nodesLoading || attributesLoading;
  console.log('GRAPH NODES', nodes);
  console.log('GRAPH ATTRIBUTES', attributes);
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

        <div className="flex-1">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-[#248bf2] border-t-transparent rounded-full" />
            </div>
          ) : (
            <GraphVisualization
              nodes={nodes}
              attributes={attributes}
              onNodeClick={(nodeId) => router.push(`/spaces/${slug}/node/${nodeId}`)}
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}