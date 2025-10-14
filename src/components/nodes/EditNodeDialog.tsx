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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MarkdownPreview } from './MarkdownPreview';
import { isApiError } from '@/lib/errors';

interface EditNodeDialogProps {
  workspaceSlug: string;
  nodeId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditNodeDialog({ workspaceSlug, nodeId, open, onOpenChange }: EditNodeDialogProps) {
  const queryClient = useQueryClient();
  const { data: node } = useNode(workspaceSlug, nodeId.toString());
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
      setValue('version', node.version);
    }
  }, [node, setValue]);

  const onSubmit = async (data: UpdateNodeFormData) => {
    // First, update the node
    updateNode({ spaceSlug: workspaceSlug, nodeId: nodeId.toString(), data }, {
      onSuccess: async (updatedNode) => {
        // Process wiki-links after successful update
        if (data.content) {
          setIsProcessingWikiLinks(true);
          try {
            await wikiLinkService.processWikiLinks(
              data.content,
              updatedNode.id.toString(),
              workspaceSlug
            );

            // T067: Invalidate React Query cache to refresh UI
            queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceSlug, 'nodes'] });
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
          queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceSlug, 'nodes'] });
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
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Node</DialogTitle>
          <DialogDescription>Update node information</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
          <div className="space-y-4 pb-4">
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
                  <SelectContent>
                    <SelectItem value={NodeType.REGULAR}>Regular</SelectItem>
                    <SelectItem value={NodeType.CONTEXT}>Context</SelectItem>
                    <SelectItem value={NodeType.ASSUMPTION}>Assumption</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Split view: Editor | Preview */}
          <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
            <div className="space-y-2 flex flex-col">
              <Label htmlFor="content">Content (Markdown)</Label>
              <Textarea
                id="content"
                placeholder="# Content here...&#10;&#10;Edit your markdown content. The preview will update as you type."
                className="flex-1 resize-none font-mono text-sm"
                {...register('content')}
              />
              {errors.content && (
                <p className="text-sm text-destructive">{errors.content.message}</p>
              )}
            </div>

            <div className="space-y-2 flex flex-col">
              <Label>Preview</Label>
              <div className="flex-1 overflow-y-auto border rounded-md p-4 bg-muted/30">
                <MarkdownPreview content={content || ''} />
              </div>
            </div>
          </div>

          {errors.root && <p className="text-sm text-destructive pt-2">{errors.root.message}</p>}

          <DialogFooter className="pt-4">
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
