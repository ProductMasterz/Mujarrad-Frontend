'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateNode, useSpaceNodes, useCreateAttribute } from '@/hooks/api';
import { NodeType, AttributeKey, AttributeTypeMode } from '@/types/backend-dtos';
import { getNodeRoute } from '@/lib/routing';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { isApiError } from '@/lib/errors';

// Simplified schema - just title and type, no content
const createPageSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  nodeType: z.nativeEnum(NodeType),
});

type CreatePageFormData = z.infer<typeof createPageSchema>;

interface CreateNodeDialogProps {
  spaceSlug: string;
}

/**
 * CreateNodeDialog - Simplified page creation like Notion
 *
 * Just enter a title, select type and parent, then opens the page
 * for inline block editing. No markdown textarea.
 */
export function CreateNodeDialog({ spaceSlug }: CreateNodeDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);

  const { mutate: createNode, isPending } = useCreateNode();
  const { mutate: createAttribute } = useCreateAttribute();

  // Fetch all space nodes for parent selection
  const { data: nodes = [] } = useSpaceNodes(spaceSlug, { type: NodeType.CONTEXT });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    reset,
  } = useForm<CreatePageFormData>({
    resolver: zodResolver(createPageSchema),
    defaultValues: {
      nodeType: NodeType.REGULAR,
    },
  });

  const onSubmit = (data: CreatePageFormData) => {
    const nodeData = {
      title: data.title,
      nodeType: data.nodeType,
      content: '',
      nodeDetails: { editorMode: 'blocks', isPage: true },
    };

    const selectedParent = selectedParentId
      ? nodes.find(n => n.id === selectedParentId)
      : null;

    createNode({
      spaceSlug,
      data: nodeData,
      contextSlug: selectedParent?.slug,
    }, {
      onSuccess: (newNode) => {
        setOpen(false);
        reset();
        setSelectedParentId(null);
        router.push(getNodeRoute(spaceSlug, newNode));
      },
      onError: (error) => {
        if (isApiError(error)) {
          setError('root', { message: error.getUserMessage() });
        }
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>New Page</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Page</DialogTitle>
          <DialogDescription>
            Add a new page to your knowledge graph. You can start editing immediately after creation.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Untitled"
              autoFocus
              {...register('title')}
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          {/* Node Type */}
          <div className="space-y-2">
            <Label htmlFor="nodeType">Type</Label>
            <Select
              defaultValue={NodeType.REGULAR}
              onValueChange={(value) => setValue('nodeType', value as NodeType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" className="z-[100]">
                <SelectItem value={NodeType.REGULAR}>Regular Page</SelectItem>
                <SelectItem value={NodeType.CONTEXT}>Context (Folder)</SelectItem>
                <SelectItem value={NodeType.ATTRIBUTE}>Attribute</SelectItem>
              </SelectContent>
            </Select>
            {errors.nodeType && <p className="text-sm text-destructive">{errors.nodeType.message}</p>}
          </div>

          {/* Parent node selection */}
          <div className="space-y-2">
            <Label htmlFor="parentNode">Parent (Optional)</Label>
            <Select
              value={selectedParentId || 'none'}
              onValueChange={(value) => setSelectedParentId(value === 'none' ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="No parent (root level)" />
              </SelectTrigger>
              <SelectContent position="popper" className="z-[100] max-h-[200px] overflow-y-auto">
                <SelectItem value="none">No parent (root level)</SelectItem>
                {nodes.map((node) => (
                  <SelectItem key={node.id} value={node.id.toString()}>
                    {node.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Creating...' : 'Create Page'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
