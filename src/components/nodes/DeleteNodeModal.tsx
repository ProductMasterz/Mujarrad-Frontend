'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNodeDependencies, useNodeDescendants, useDeleteNode } from '@/hooks/api';
import { attributeService } from '@/services/api/attribute.service';
import { useQueryClient } from '@tanstack/react-query';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { isApiError } from '@/lib/errors';
import { AlertTriangle, Trash2, FolderMinus, X } from 'lucide-react';
import type { Node } from '@/types/backend-dtos';

export type DeleteMode = 'simple' | 'cascade' | 'orphan';

interface DeleteNodeModalProps {
  spaceSlug: string;
  nodeId: string;
  nodeName: string;
  parentId?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteNodeModal({
  spaceSlug,
  nodeId,
  nodeName,
  parentId,
  open,
  onOpenChange,
  onSuccess,
}: DeleteNodeModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [deleteMode, setDeleteMode] = useState<DeleteMode>('simple');
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch dependencies when modal opens
  const {
    data: dependencies,
    isLoading: isDependenciesLoading,
    refetch: refetchDependencies,
  } = useNodeDependencies(spaceSlug, nodeId, open);

  // Fetch all descendants for cascade delete info
  const { data: descendants, isLoading: isDescendantsLoading } = useNodeDescendants(
    spaceSlug,
    nodeId,
    open && dependencies?.hasChildren
  );

  const { mutateAsync: deleteNodeMutation } = useDeleteNode();

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open) {
      setError(null);
      setDeleteMode('simple');
      refetchDependencies();
    }
  }, [open, refetchDependencies]);

  const isLoading = isDependenciesLoading || isDescendantsLoading;
  const hasDependencies = dependencies?.hasDependencies ?? false;
  const childCount = dependencies?.childCount ?? 0;
  const referenceCount = dependencies?.referenceCount ?? 0;
  const descendantCount = descendants?.length ?? childCount;

  // Handle simple delete (no dependencies)
  const handleSimpleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      await deleteNodeMutation({ spaceSlug, nodeId });
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/spaces/${spaceSlug}`);
      }
    } catch (err) {
      if (isApiError(err)) {
        setError(err.getUserMessage());
      } else {
        setError('Failed to delete node');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle cascade delete (delete all descendants)
  const handleCascadeDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      // Delete descendants first (bottom-up to avoid orphan issues)
      if (descendants && descendants.length > 0) {
        // Sort by depth (deepest first) - we can approximate by counting children
        const sortedDescendants = [...descendants].reverse();
        for (const descendant of sortedDescendants) {
          await deleteNodeMutation({
            spaceSlug,
            nodeId: descendant.id,
            force: true,
          });
        }
      }

      // Then delete the node itself
      await deleteNodeMutation({ spaceSlug, nodeId, force: true });

      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/spaces/${spaceSlug}`);
      }
    } catch (err) {
      if (isApiError(err)) {
        setError(err.getUserMessage());
      } else {
        setError('Failed to delete node and descendants');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle orphan delete (delete only this node, children become orphans)
  const handleOrphanDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      // First, remove all 'contains' relationships from this node to its children
      if (dependencies?.children && dependencies.children.length > 0) {
        const nodeAttributes = await attributeService.getNodeAttributes(nodeId, {
          attributeType: 'contains',
        });

        // Delete each 'contains' attribute
        for (const attr of nodeAttributes) {
          await attributeService.deleteAttribute(nodeId, attr.id);
        }

        // If this node has a parent, move children to that parent
        // Otherwise, children become root-level nodes
        if (parentId) {
          for (const child of dependencies.children) {
            await attributeService.createAttribute(parentId, {
              sourceNodeId: parentId,
              targetNodeId: child.id,
              attributeType: 'contains',
              attributeTypeMode: 'SCHEMALESS' as any,
              attributeName: 'contains',
              attributeValue: { order: Date.now() },
            });
          }
        }
      }

      // Then delete the node
      await deleteNodeMutation({ spaceSlug, nodeId, force: true });

      // Invalidate queries to refresh hierarchy
      queryClient.invalidateQueries({ queryKey: ['nodes'] });

      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/spaces/${spaceSlug}`);
      }
    } catch (err) {
      if (isApiError(err)) {
        setError(err.getUserMessage());
      } else {
        setError('Failed to delete node');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDelete = () => {
    if (deleteMode === 'cascade') {
      handleCascadeDelete();
    } else if (deleteMode === 'orphan') {
      handleOrphanDelete();
    } else {
      handleSimpleDelete();
    }
  };

  // Render simple delete dialog (no dependencies)
  if (!hasDependencies && !isLoading) {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Node</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{nodeName}</strong>? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  // Render dependency warning dialog
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Delete Node with Dependencies
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                <strong>{nodeName}</strong> has dependencies that will be affected:
              </p>

              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Spinner className="h-6 w-6" />
                </div>
              ) : (
                <div className="space-y-2">
                  {childCount > 0 && (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{descendantCount}</Badge>
                      <span className="text-sm">
                        {descendantCount === 1
                          ? 'child node'
                          : descendantCount === childCount
                          ? 'child nodes'
                          : `nodes (${childCount} direct, ${descendantCount - childCount} nested)`}
                      </span>
                    </div>
                  )}

                  {referenceCount > 0 && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{referenceCount}</Badge>
                      <span className="text-sm">
                        incoming {referenceCount === 1 ? 'reference' : 'references'}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <p className="text-sm text-muted-foreground">
                Choose how to handle the dependencies:
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <p className="text-sm text-destructive px-1">{error}</p>
        )}

        <div className="space-y-2">
          {childCount > 0 && (
            <>
              <Button
                variant={deleteMode === 'cascade' ? 'default' : 'outline'}
                className="w-full justify-start gap-2"
                onClick={() => setDeleteMode('cascade')}
                disabled={isDeleting || isLoading}
              >
                <Trash2 className="h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">Delete All</div>
                  <div className="text-xs text-muted-foreground">
                    Remove this node and all {descendantCount} descendants
                  </div>
                </div>
              </Button>

              <Button
                variant={deleteMode === 'orphan' ? 'default' : 'outline'}
                className="w-full justify-start gap-2"
                onClick={() => setDeleteMode('orphan')}
                disabled={isDeleting || isLoading}
              >
                <FolderMinus className="h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">Delete Only This</div>
                  <div className="text-xs text-muted-foreground">
                    Move {childCount} {childCount === 1 ? 'child' : 'children'} to{' '}
                    {parentId ? 'parent' : 'space root'}
                  </div>
                </div>
              </Button>
            </>
          )}

          {childCount === 0 && referenceCount > 0 && (
            <p className="text-sm text-muted-foreground">
              Deleting this node will break {referenceCount}{' '}
              {referenceCount === 1 ? 'reference' : 'references'} from other nodes.
            </p>
          )}
        </div>

        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel disabled={isDeleting}>
            <X className="h-4 w-4 mr-1" />
            Cancel
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting || isLoading || (childCount > 0 && deleteMode === 'simple')}
          >
            {isDeleting ? (
              <>
                <Spinner className="h-4 w-4 mr-2" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                {deleteMode === 'cascade'
                  ? `Delete All (${descendantCount + 1})`
                  : deleteMode === 'orphan'
                  ? 'Delete Only This'
                  : 'Delete'}
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
