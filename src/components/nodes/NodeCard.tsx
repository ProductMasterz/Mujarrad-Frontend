'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TrashIcon } from '@heroicons/react/24/outline';
import { Node, NodeType } from '@/types/backend-dtos';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { truncate, formatRelativeTime } from '@/lib/utils';
import { useDeleteNode } from '@/hooks/api';

interface NodeCardProps {
  node: Node;
  spaceSlug: string;
  onDeleted?: () => void;
}

const nodeTypeColors: Record<NodeType, string> = {
  [NodeType.REGULAR]: 'bg-blue-100 text-blue-800',
  [NodeType.CONTEXT]: 'bg-purple-100 text-purple-800',
  [NodeType.ATTRIBUTE]: 'bg-yellow-100 text-yellow-800',
};

export function NodeCard({ node, spaceSlug, onDeleted }: NodeCardProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { mutate: deleteNode, isPending: isDeleting } = useDeleteNode();

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/spaces/${spaceSlug}/node/${node.id}`);
  };

  const handleClick = (e: React.MouseEvent) => {
    // Single click can also navigate, or we can disable it
    // For now, keeping single-click navigation as well
    if (e.detail === 1) {
      router.push(`/spaces/${spaceSlug}/node/${node.id}`);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    setDeleteError(null);
    deleteNode(
      { spaceSlug, nodeId: node.id },
      {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          onDeleted?.();
        },
        onError: (err) => {
          setDeleteError(err.message || 'Failed to delete node');
        },
      }
    );
  };

  return (
    <>
      <Card
        className="hover:shadow-md transition-shadow cursor-pointer group relative"
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg pr-8">{node.title}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={nodeTypeColors[node.nodeType]}>{node.nodeType}</Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleDeleteClick}
                title="Delete node"
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription>
            {truncate(node.content, 100) || 'No content'}
          </CardDescription>
          <div className="text-xs text-muted-foreground pt-2">
            Updated {formatRelativeTime(node.updatedAt)}
          </div>
        </CardHeader>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Delete Node</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{node.title}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}