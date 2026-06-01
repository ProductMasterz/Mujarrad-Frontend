'use client';

import { useState } from 'react';
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
import { useAssignFromBlank, useBulkAssignFromBlank } from '@/hooks/api/useBlankNodes';
import { useNotificationStore } from '@/stores/notificationStore';

interface AssignToContextDialogProps {
  spaceSlug: string;
  nodeIds: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssigned?: () => void;
}

export function AssignToContextDialog({
  spaceSlug,
  nodeIds,
  open,
  onOpenChange,
  onAssigned,
}: AssignToContextDialogProps) {
  const [selectedContext, setSelectedContext] = useState('');
  const { data: contexts = [] } = useSpaceNodes(spaceSlug, { type: 'CONTEXT' as any });
  const assignMutation = useAssignFromBlank();
  const bulkAssignMutation = useBulkAssignFromBlank();
  const addNotification = useNotificationStore((state) => state.addNotification);

  const handleAssign = async () => {
    if (!selectedContext) return;

    try {
      if (nodeIds.length === 1) {
        await assignMutation.mutateAsync({
          spaceSlug,
          nodeId: nodeIds[0],
          contextSlug: selectedContext,
        });
      } else {
        await bulkAssignMutation.mutateAsync({
          spaceSlug,
          nodeIds,
          contextSlug: selectedContext,
        });
      }

      addNotification({
        type: 'success',
        source: 'node',
        title: `${nodeIds.length} node${nodeIds.length > 1 ? 's' : ''} assigned to context`,
      });

      setSelectedContext('');
      onOpenChange(false);
      onAssigned?.();
    } catch {
      addNotification({
        type: 'error',
        source: 'node',
        title: 'Failed to assign nodes',
      });
    }
  };

  const isLoading = assignMutation.isPending || bulkAssignMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Assign {nodeIds.length > 1 ? `${nodeIds.length} nodes` : 'node'} to context
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <Select value={selectedContext} onValueChange={setSelectedContext}>
            <SelectTrigger>
              <SelectValue placeholder="Select a context..." />
            </SelectTrigger>
            <SelectContent>
              {(Array.isArray(contexts) ? contexts : []).map((ctx: any) => (
                <SelectItem key={ctx.id} value={ctx.slug}>
                  {ctx.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={!selectedContext || isLoading}>
            {isLoading ? 'Assigning...' : 'Assign'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
