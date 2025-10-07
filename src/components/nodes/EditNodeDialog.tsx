'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateNodeSchema, type UpdateNodeFormData } from '@/schemas';
import { useUpdateNode, useNode } from '@/hooks/api';
import { NodeType } from '@/types/backend-dtos';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { isApiError } from '@/lib/errors';

interface EditNodeDialogProps {
  workspaceSlug: string;
  nodeId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditNodeDialog({ workspaceSlug, nodeId, open, onOpenChange }: EditNodeDialogProps) {
  const { data: node } = useNode(workspaceSlug, nodeId);
  const { mutate: updateNode, isPending: isLoading } = useUpdateNode(workspaceSlug, nodeId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    reset,
  } = useForm<UpdateNodeFormData>({
    resolver: zodResolver(updateNodeSchema),
  });

  useEffect(() => {
    if (node) {
      setValue('title', node.title);
      setValue('nodeType', node.nodeType);
      setValue('markdownContent', node.markdownContent);
      setValue('version', node.version);
    }
  }, [node, setValue]);

  const onSubmit = (data: UpdateNodeFormData) => {
    updateNode(data, {
      onSuccess: () => {
        onOpenChange(false);
      },
      onError: (error) => {
        if (isApiError(error)) {
          if (error.statusCode === 409) {
            setError('root', {
              message: 'Version conflict. The node was modified by someone else. Please refresh and try again.'
            });
          } else {
            setError('root', { message: error.getUserMessage() });
          }
        }
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Node</DialogTitle>
          <DialogDescription>Update node information</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register('title')} />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nodeType">Type</Label>
              <Select
                defaultValue={node?.nodeType}
                onValueChange={(value) => setValue('nodeType', value as NodeType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NodeType.REGULAR}>Regular</SelectItem>
                  <SelectItem value={NodeType.CONTEXT}>Context</SelectItem>
                  <SelectItem value={NodeType.ASSUMPTION}>Assumption</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="markdownContent">Content (Markdown)</Label>
              <Textarea
                id="markdownContent"
                rows={12}
                {...register('markdownContent')}
                className="font-mono text-sm"
              />
              {errors.markdownContent && (
                <p className="text-sm text-destructive">{errors.markdownContent.message}</p>
              )}
            </div>

            {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
