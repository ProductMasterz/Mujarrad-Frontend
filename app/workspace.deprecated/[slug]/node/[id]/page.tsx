'use client';

import { useRouter } from 'next/navigation';
import { useNode, useSpaceNodes } from '@/hooks/api';
import { NodeDetailView } from '@/components/nodes/NodeDetailView';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface NodeDetailPageProps {
  params: {
    slug: string;
    id: string;
  };
}

/**
 * Node detail page
 * Shows individual node with full content and metadata
 */
export default function NodeDetailPage({ params }: NodeDetailPageProps) {
  const { slug, id } = params;
  const router = useRouter();

  // Fetch node data
  const { data: node, isLoading, error } = useNode(slug, id);

  // Fetch all space nodes for wiki-link resolution
  const { data: availableNodes = [] } = useSpaceNodes(slug);

  // Handle wiki-link click - navigate to target node (T071)
  const handleWikiLinkClick = (targetTitle: string) => {
    const targetNode = availableNodes.find(
      (n) => n.title.toLowerCase() === targetTitle.toLowerCase()
    );

    if (targetNode) {
      router.push(`/space/${slug}/node/${targetNode.id}`);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    router.push(`/space/${slug}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading node...</p>
        </div>
      </div>
    );
  }

  if (error || !node) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Node Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The node you&apos;re looking for doesn&apos;t exist or has been deleted.
          </p>
          <Button onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Space
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Top Navigation Bar */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-3">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Space
        </Button>
      </div>

      {/* Node Detail View */}
      <div className="flex-1 overflow-hidden">
        <NodeDetailView
          node={node}
          spaceSlug={slug}
          availableNodes={availableNodes}
          onWikiLinkClick={handleWikiLinkClick}
        />
      </div>
    </div>
  );
}
