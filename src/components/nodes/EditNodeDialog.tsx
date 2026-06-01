'use client';

import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateNodeSchema, type UpdateNodeFormData } from '@/schemas';
import { useUpdateNode, useNode } from '@/hooks/api';
import { NodeType } from '@/types/backend-dtos';
import { wikiLinkService } from '@/services/api/wikilink.service';
import { useQueryClient } from '@tanstack/react-query';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { MarkdownEditor } from '@/components/markdown/MarkdownEditor'; // Temporarily disabled
import { isApiError } from '@/lib/errors';

interface EditNodeDialogProps {
  spaceSlug: string;
  nodeId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditNodeDialog({ spaceSlug, nodeId, open, onOpenChange }: EditNodeDialogProps) {
  const queryClient = useQueryClient();
  const { data: node } = useNode(spaceSlug, nodeId.toString());
  const { mutate: updateNode, isPending: isLoading } = useUpdateNode();
  const [isProcessingWikiLinks, setIsProcessingWikiLinks] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    reset,
    control,
  } = useForm<UpdateNodeFormData>({
    resolver: zodResolver(updateNodeSchema),
  });

  // Watch markdown content for live preview
  const content = useWatch({
    control,
    name: 'content',
    defaultValue: '',
  });

  useEffect(() => {
    if (node) {
      setValue('title', node.title);
      setValue('nodeType', node.nodeType);
      setValue('content', node.content);
      // Parse version number from currentVersionId (e.g., "v1" -> 1)
      const versionNum = parseInt(node.currentVersionId.replace(/^v/, ''), 10);
      setValue('version', isNaN(versionNum) ? 1 : versionNum);
    }
  }, [node, setValue]);

  const onSubmit = async (data: UpdateNodeFormData) => {
    // First, update the node
    updateNode({ spaceSlug: spaceSlug, nodeId: nodeId.toString(), data }, {
      onSuccess: async (updatedNode) => {
        // Process wiki-links after successful update
        if (data.content) {
          setIsProcessingWikiLinks(true);
          try {
            await wikiLinkService.processWikiLinks(
              data.content,
              updatedNode.id.toString(),
              spaceSlug
            );

            // T067: Invalidate React Query cache to refresh UI
            queryClient.invalidateQueries({ queryKey: ['spaces', spaceSlug, 'nodes'] });
            queryClient.invalidateQueries({ queryKey: ['nodes', updatedNode.id] });
            queryClient.invalidateQueries({ queryKey: ['nodes', updatedNode.id, 'attributes'] });

            onOpenChange(false);
          } catch (error) {
            if (isApiError(error)) {
              setError('root', { message: `Node saved but wiki-link processing failed: ${error.getUserMessage()}` });
            }
          } finally {
            setIsProcessingWikiLinks(false);
          }
        } else {
          // No content, just close
          queryClient.invalidateQueries({ queryKey: ['spaces', spaceSlug, 'nodes'] });
          queryClient.invalidateQueries({ queryKey: ['nodes', updatedNode.id] });
          onOpenChange(false);
        }
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
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col gap-0 p-0">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
          <DialogTitle>Edit Node</DialogTitle>
          <DialogDescription>Update node information</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 space-y-4 shrink-0">
            <div className="grid grid-cols-2 gap-4">
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
                  <SelectContent position="popper" className="z-[100]">
                    <SelectItem value={NodeType.REGULAR}>Regular</SelectItem>
                    <SelectItem value={NodeType.CONTEXT}>Context</SelectItem>
                    <SelectItem value={NodeType.ATTRIBUTE}>Attribute</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Simple textarea - MarkdownEditor temporarily disabled */}
          <div className="flex-1 min-h-0 flex flex-col px-6 py-4">
            <Label htmlFor="content" className="mb-2">Content (Markdown)</Label>
            <textarea
              id="content"
              value={content || ''}
              onChange={(e) => setValue('content', e.target.value)}
              placeholder="# Edit your content here...

Supports **bold**, *italic*, code blocks, tables, and more!"
              maxLength={50000}
              className="flex-1 min-h-0 w-full p-3 border border-gray-200 rounded-lg resize-none font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.content && (
              <p className="text-sm text-destructive mt-2">{errors.content.message}</p>
            )}
          </div>

          {errors.root && <p className="text-sm text-destructive px-6">{errors.root.message}</p>}

          <DialogFooter className="px-6 py-4 border-t shrink-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading || isProcessingWikiLinks}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || isProcessingWikiLinks}>
              {isLoading ? 'Saving...' : isProcessingWikiLinks ? 'Processing wiki-links...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
