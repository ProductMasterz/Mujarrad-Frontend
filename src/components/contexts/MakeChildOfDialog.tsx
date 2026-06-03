'use client';

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSpaceNodes } from '@/hooks/api/useNodes';
import { useNotificationStore } from '@/stores/notificationStore';
import { attributeService } from '@/services/api/attribute.service';
import { NodeType, AttributeTypeMode, type Node } from '@/types/backend-dtos';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface MakeChildOfDialogProps {
  spaceSlug: string;
  node: Node;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function MakeChildOfDialog({
  spaceSlug,
  node,
  open,
  onOpenChange,
  onSuccess,
}: MakeChildOfDialogProps) {
  const [selectedParentId, setSelectedParentId] = useState('');
  const { data: allNodes = [] } = useSpaceNodes(spaceSlug);
  const addNotification = useNotificationStore((state) => state.addNotification);
  const queryClient = useQueryClient();

  const isContext = node.nodeType === NodeType.CONTEXT;

  const availableParents = useMemo(() => {
    const nodes = Array.isArray(allNodes) ? allNodes : [];
    return nodes.filter((n) => {
      if (n.id === node.id) return false;
      if (n.isBuiltin) return false;
      if (isContext) return n.nodeType === NodeType.CONTEXT;
      return n.nodeType === NodeType.CONTEXT || n.nodeType === NodeType.REGULAR;
    });
  }, [allNodes, node.id, isContext]);

  const createContainsMutation = useMutation({
    mutationFn: async (parentId: string) => {
      return attributeService.createAttribute(parentId, {
        sourceNodeId: parentId,
        targetNodeId: node.id,
        attributeType: 'contains',
        attributeTypeMode: AttributeTypeMode.SCHEMALESS,
        attributeName: 'contains',
        attributeValue: {},
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nodes'] });
      queryClient.invalidateQueries({ queryKey: ['context-nodes'] });
      queryClient.invalidateQueries({ queryKey: ['context-children'] });
    },
  });

  const handleConfirm = async () => {
    if (!selectedParentId) return;

    try {
      await createContainsMutation.mutateAsync(selectedParentId);
      const parent = availableParents.find((n) => n.id === selectedParentId);
      addNotification({
        type: 'success',
        source: 'node',
        title: `"${node.title}" added as child of "${parent?.title}"`,
      });
      setSelectedParentId('');
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      if (error?.response?.status === 409) {
        addNotification({
          type: 'error',
          source: 'node',
          title: 'Already a child of this parent',
        });
      } else {
        addNotification({
          type: 'error',
          source: 'node',
          title: 'Failed to create relationship',
        });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Make "{node.title}" a child of...
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <Select value={selectedParentId} onValueChange={setSelectedParentId}>
            <SelectTrigger>
              <SelectValue placeholder={isContext ? 'Select a context...' : 'Select a context or node...'} />
            </SelectTrigger>
            <SelectContent>
              {availableParents.map((n) => (
                <SelectItem key={n.id} value={n.id}>
                  <span className="flex items-center gap-2">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      n.nodeType === NodeType.CONTEXT
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                    }`}>
                      {n.nodeType === NodeType.CONTEXT ? 'CTX' : 'NODE'}
                    </span>
                    {n.title}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {isContext && (
            <p className="text-xs text-muted-foreground mt-2">
              Contexts can only be children of other contexts.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedParentId || createContainsMutation.isPending}
          >
            {createContainsMutation.isPending ? 'Adding...' : 'Add as Child'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
