'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DeleteNodeModal } from './DeleteNodeModal';

interface DeleteNodeDialogProps {
  spaceSlug: string;
  nodeId: string;
  nodeName: string;
  parentId?: string | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
  showTrigger?: boolean;
}

/**
 * DeleteNodeDialog - Wrapper component for backwards compatibility
 *
 * Uses the new DeleteNodeModal which includes dependency checking
 * and cascade/orphan delete options.
 */
export function DeleteNodeDialog({
  spaceSlug,
  nodeId,
  nodeName,
  parentId,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
  onSuccess,
  showTrigger = true,
}: DeleteNodeDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  // Use external state if provided, otherwise use internal state
  const isControlled = externalOpen !== undefined;
  const open = isControlled ? externalOpen : internalOpen;
  const setOpen = (value: boolean) => {
    if (externalOnOpenChange) {
      externalOnOpenChange(value);
    }
    if (!isControlled) {
      setInternalOpen(value);
    }
  };

  // If using trigger button, wrap in Dialog for trigger functionality
  if (showTrigger) {
    return (
      <>
        <Dialog open={false} onOpenChange={() => setOpen(true)}>
          <DialogTrigger asChild>
            <Button variant="destructive">Delete Node</Button>
          </DialogTrigger>
          <DialogContent className="hidden" />
        </Dialog>
        <DeleteNodeModal
          spaceSlug={spaceSlug}
          nodeId={nodeId}
          nodeName={nodeName}
          parentId={parentId}
          open={open}
          onOpenChange={setOpen}
          onSuccess={onSuccess}
        />
      </>
    );
  }

  // Controlled mode - just render the modal
  return (
    <DeleteNodeModal
      spaceSlug={spaceSlug}
      nodeId={nodeId}
      nodeName={nodeName}
      parentId={parentId}
      open={open}
      onOpenChange={setOpen}
      onSuccess={onSuccess}
    />
  );
}
