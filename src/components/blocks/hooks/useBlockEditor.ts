'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { nodeService } from '@/services/api/node.service';
import { nodeKeys } from '@/hooks/api/useNodes';
import { attributeService } from '@/services/api/attribute.service';
import { wikiLinkService } from '@/services/api/wikilink.service';
import { NodeType, AttributeKey, AttributeTypeMode } from '@/types/backend-dtos';
import type { Node, Attribute } from '@/types/backend-dtos';
import type { Block, BlockType, BlockNodeDetails, CalloutType } from '../types';
import {
  BLOCK_TYPES,
  EDITABLE_BLOCK_TYPES,
  isContinuousBlockType,
  calculateOrderBetween,
} from '../types';
import type { TemplateBlockDefinition } from '@/components/templates/nodeTemplates';
import {
  createTemplateBlocks,
  deleteBlocks,
} from '@/components/templates/templateBlockService';

interface UseBlockEditorOptions {
  pageId: string;
  spaceSlug: string;
  spaceId: string;
  autoSaveDelay?: number; // Default reduced to 500ms for faster saving
  onSaveStatusChange?: (isSaving: boolean) => void;
}

interface BlockEditorState {
  blocks: Block[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}
type ApplyTemplateMode = 'replace' | 'append';
/**
 * useBlockEditor - Core hook for block editor data management
 *
 * Handles:
 * - Loading blocks from backend
 * - Creating, updating, deleting blocks
 * - Reordering blocks via drag-and-drop
 * - Auto-save with debounce
 * - Wikilink processing for graph integration
 */
const TEMPLATE_CONTENT_FIELD_TYPES: BlockType[] = [
  BLOCK_TYPES.TEXT,
  BLOCK_TYPES.BULLET_LIST,
  BLOCK_TYPES.NUMBERED_LIST,
  BLOCK_TYPES.TODO,
  BLOCK_TYPES.QUOTE,
  BLOCK_TYPES.CALLOUT,
];

function isTemplateContentField(type: BlockType): boolean {
  return TEMPLATE_CONTENT_FIELD_TYPES.includes(type);
}

function isSourceContentBlock(block: Block): boolean {
  if (block.type === BLOCK_TYPES.DIVIDER) return false;
  return Boolean(block.content?.trim());
}

function moveExistingContentIntoTemplateFields(
  existingBlocks: Block[],
  templateBlocks: TemplateBlockDefinition[]
): TemplateBlockDefinition[] {
  const oldContents = existingBlocks
    .filter(isSourceContentBlock)
    .map((block) => block.content.trim());

  if (oldContents.length === 0) {
    return templateBlocks;
  }

  let oldContentIndex = 0;

  const nextTemplateBlocks = templateBlocks.map((templateBlock) => {
    if (!isTemplateContentField(templateBlock.type)) {
      return templateBlock;
    }

    if (oldContentIndex >= oldContents.length) {
      return templateBlock;
    }

    const movedContent = oldContents[oldContentIndex];
    oldContentIndex += 1;

    return {
      ...templateBlock,
      content: movedContent,
    };
  });

  const remainingOldContents = oldContents.slice(oldContentIndex);

  if (remainingOldContents.length === 0) {
    return nextTemplateBlocks;
  }

  return [
    ...nextTemplateBlocks,
    ...remainingOldContents.map((content) => ({
      type: BLOCK_TYPES.TEXT,
      content,
    })),
  ];
}

function blockToTemplateBlock(block: Block): TemplateBlockDefinition {
  return {
    type: block.type,
    content: block.content,
    checked: block.checked,
    language: block.language,
    calloutType: block.calloutType,
  };
}

export function useBlockEditor({
  pageId,
  spaceSlug,
  spaceId,
  autoSaveDelay = 500, // Reduced from 1500ms for faster saving
  onSaveStatusChange,
}: UseBlockEditorOptions) {
  const queryClient = useQueryClient();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingBlock, setIsCreatingBlock] = useState(false);
  const [templateReplaceBackup, setTemplateReplaceBackup] = useState<
    TemplateBlockDefinition[] | null
  >(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingChangesRef = useRef<Map<string, Partial<Block>>>(new Map());
  const initialBlockAttemptedRef = useRef(false);
  const blocksRef = useRef<Block[]>([]);

  // Query key for this page's blocks
  const blocksQueryKey = useMemo(
    () => ['blocks', spaceSlug, pageId],
    [spaceSlug, pageId]
  );

  // Fetch blocks for the page
  // Use longer staleTime to prevent refetching while user is editing
  const { data: fetchedBlocks, isLoading } = useQuery({
    queryKey: blocksQueryKey,
    staleTime: 5 * 60 * 1000, // 5 minutes - blocks are user-edited, don't need frequent refetch
    refetchOnWindowFocus: false, // Don't refetch on tab switch while editing
    queryFn: async () => {
      // Get all nodes in the space
      const allNodes = await nodeService.getNodes(spaceSlug);

      // Get attributes for the page to find child blocks
      const pageAttributes = await attributeService.getNodeAttributes(pageId);

      // Filter to get only "contains" relationships from this page
      const containsAttributes = pageAttributes.filter(
        (attr) => attr.attributeName === AttributeKey.CONTAINS || attr.attributeType === AttributeKey.CONTAINS
      );

      // Create a map of nodeId -> order from attributes
      const orderMap = new Map<string, number>();
      containsAttributes.forEach((attr) => {
        const order = (attr.attributeValue as { order?: number })?.order ?? 0;
        orderMap.set(attr.targetNodeId.toString(), order);
      });

      // Filter nodes to get only blocks (children of this page with blockType)
      const blockNodes = allNodes.filter((node) => {
        // Handle nodeDetails being a string (JSON) or object
        let details: BlockNodeDetails | undefined;
        if (typeof node.nodeDetails === 'string') {
          try {
            details = JSON.parse(node.nodeDetails);
          } catch {
            details = undefined;
          }
        } else {
          details = node.nodeDetails as unknown as BlockNodeDetails | undefined;
        }

        const hasBlockType = details?.blockType;
        const isChild = orderMap.has(node.id.toString());
        return hasBlockType && isChild;
      });

      // Convert nodes to Block format and sort by order
      const blocks: Block[] = blockNodes
        .map((node) => nodeToBlock(node, orderMap.get(node.id.toString()) ?? 0))
        .sort((a, b) => a.order - b.order);

      return blocks;
    },
    enabled: !!pageId && !!spaceSlug,
  });

  // Sync local state with fetched data
  // IMPORTANT: Only sync when there are no pending changes to avoid overwriting user's typing
  useEffect(() => {
    if (fetchedBlocks !== undefined) {
      // Don't overwrite local state if user has pending changes (typing in progress)
      if (pendingChangesRef.current.size > 0) {
        // Only update blocksRef for new block detection, don't overwrite user's state
        return;
      }
      setBlocks(fetchedBlocks);
      blocksRef.current = fetchedBlocks;
    }
  }, [fetchedBlocks]);

  // Keep ref in sync with state changes
  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

  // Create block mutation
  const createBlockMutation = useMutation({
    mutationFn: async ({
      type,
      content,
      afterBlockId,
    }: {
      type: BlockType;
      content: string;
      afterBlockId?: string;
    }) => {
      // Use ref to get current blocks (avoids stale closure)
      const currentBlocks = blocksRef.current;

      // Calculate order
      let order: number;
      if (afterBlockId) {
        const afterIndex = currentBlocks.findIndex((b) => b.id === afterBlockId);
        const afterOrder = currentBlocks[afterIndex]?.order ?? 0;
        const beforeOrder = currentBlocks[afterIndex + 1]?.order ?? null;
        order = calculateOrderBetween(afterOrder, beforeOrder);
      } else {
        const lastOrder = currentBlocks[currentBlocks.length - 1]?.order ?? 0;
        order = lastOrder + 1000;
      }

      // Create block as a child of the page (atomic — auto-creates CONTAINS)
      const nodeDetails: BlockNodeDetails = {
        blockType: type,
        showInSpaceList: false,
      };
      const newNode = await nodeService.createChildNode(spaceSlug, pageId, {
        title: `Block ${Date.now()}`,
        nodeType: NodeType.REGULAR,
        content,
        nodeDetails: { ...nodeDetails, order } as unknown as Record<string, unknown>,
      });

      return { node: newNode, order };
    },
    onSuccess: ({ node, order }) => {
      const newBlock = nodeToBlock(node, order);
      setBlocks((prev) => {
        const updated = [...prev, newBlock].sort((a, b) => a.order - b.order);
        return updated;
      });
      queryClient.invalidateQueries({ queryKey: blocksQueryKey });
    },
    onError: (err) => {
      setError(`Failed to create block: ${err.message}`);
    },
  });

  // Update block mutation
  const updateBlockMutation = useMutation({
    mutationFn: async ({
      blockId,
      updates,
    }: {
      blockId: string;
      updates: Partial<Block>;
    }) => {
      const block = blocksRef.current.find((b) => b.id === blockId);
      if (!block) throw new Error('Block not found');

      const nodeDetailsUpdates: Partial<BlockNodeDetails> = {};
      if (updates.type) nodeDetailsUpdates.blockType = updates.type;
      if (updates.checked !== undefined) nodeDetailsUpdates.checked = updates.checked;
      if (updates.language) nodeDetailsUpdates.language = updates.language;
      if (updates.calloutType) nodeDetailsUpdates.calloutType = updates.calloutType;

      const updateData: { content?: string; nodeDetails?: Record<string, unknown> } = {};
      if (updates.content !== undefined) updateData.content = updates.content;
      if (Object.keys(nodeDetailsUpdates).length > 0) {
        // Preserve existing nodeDetails properties (blockType, showInSpaceList) and merge updates
        updateData.nodeDetails = {
          blockType: block.type,
          showInSpaceList: false,
          checked: block.checked,
          language: block.language,
          imageUrl: block.imageUrl,
          caption: block.caption,
          calloutType: block.calloutType,
          ...nodeDetailsUpdates,
        };
      }

      await nodeService.updateNode(spaceSlug, blockId, updateData);

      // Process wikilinks if content changed and block is editable
      if (updates.content && EDITABLE_BLOCK_TYPES.includes(block.type)) {
        try {
          await wikiLinkService.processWikiLinks(updates.content, blockId, spaceId);
        } catch (e) {
          console.warn('Failed to process wikilinks:', e);
        }
      }

      return { blockId, updates };
    },
    onSuccess: ({ blockId, updates }) => {
      setBlocks((prev) =>
        prev.map((b) => (b.id === blockId ? { ...b, ...updates } : b))
      );
    },
    onError: (err) => {
      setError(`Failed to update block: ${err.message}`);
    },
  });

  // Delete block mutation
  const deleteBlockMutation = useMutation({
    mutationFn: async (blockId: string) => {
      await nodeService.deleteNode(spaceSlug, blockId);
      return blockId;
    },
    onSuccess: (blockId) => {
      setBlocks((prev) => prev.filter((b) => b.id !== blockId));
      queryClient.invalidateQueries({ queryKey: blocksQueryKey });
    },
    onError: (err) => {
      setError(`Failed to delete block: ${err.message}`);
    },
  });

  // Debounced save for content changes
  const scheduleSave = useCallback(
    (blockId: string, updates: Partial<Block>) => {
      // Merge with pending changes
      const existing = pendingChangesRef.current.get(blockId) ?? {};
      pendingChangesRef.current.set(blockId, { ...existing, ...updates });

      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Schedule save
      saveTimeoutRef.current = setTimeout(async () => {
        setIsSaving(true);
        onSaveStatusChange?.(true);

        try {
          const changes = Array.from(pendingChangesRef.current.entries());
          await Promise.all(
            changes.map(([id, upd]) =>
              updateBlockMutation.mutateAsync({ blockId: id, updates: upd })
            )
          );
          pendingChangesRef.current.clear();
        } finally {
          setIsSaving(false);
          onSaveStatusChange?.(false);
        }
      }, autoSaveDelay);
    },
    [autoSaveDelay, onSaveStatusChange, updateBlockMutation]
  );

  // Immediate save (for Cmd+S)
  const saveNow = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    if (pendingChangesRef.current.size === 0) return;

    setIsSaving(true);
    onSaveStatusChange?.(true);

    try {
      const changes = Array.from(pendingChangesRef.current.entries());
      await Promise.all(
        changes.map(([id, upd]) =>
          updateBlockMutation.mutateAsync({ blockId: id, updates: upd })
        )
      );
      pendingChangesRef.current.clear();
    } finally {
      setIsSaving(false);
      onSaveStatusChange?.(false);
    }
  }, [onSaveStatusChange, updateBlockMutation]);

  // Public API
  const createBlock = useCallback(
    async (type: BlockType, content: string = '', afterBlockId?: string, isInitialBlock: boolean = false) => {
      // For initial block creation only: prevent infinite loops
      if (isInitialBlock) {
        if (initialBlockAttemptedRef.current || isCreatingBlock) {
          // Silently skip - already attempted or in progress
          return null;
        }
        initialBlockAttemptedRef.current = true;
      }

      setIsCreatingBlock(true);
      try {
        const result = await createBlockMutation.mutateAsync({
          type,
          content,
          afterBlockId,
        });
        return nodeToBlock(result.node, result.order);
      } finally {
        setIsCreatingBlock(false);
      }
    },
    [createBlockMutation, isCreatingBlock]
  );

  const updateBlockContent = useCallback(
    (blockId: string, content: string) => {
      // Update local state immediately
      setBlocks((prev) =>
        prev.map((b) => (b.id === blockId ? { ...b, content } : b))
      );
      // Schedule save
      scheduleSave(blockId, { content });
    },
    [scheduleSave]
  );

  const updateBlockType = useCallback(
    async (blockId: string, type: BlockType) => {
      setBlocks((prev) =>
        prev.map((b) => (b.id === blockId ? { ...b, type } : b))
      );
      await updateBlockMutation.mutateAsync({ blockId, updates: { type } });
    },
    [updateBlockMutation]
  );

  const updateBlockChecked = useCallback(
    async (blockId: string, checked: boolean) => {
      setBlocks((prev) =>
        prev.map((b) => (b.id === blockId ? { ...b, checked } : b))
      );
      await updateBlockMutation.mutateAsync({ blockId, updates: { checked } });
    },
    [updateBlockMutation]
  );

  const updateBlockLanguage = useCallback(
    async (blockId: string, language: string) => {
      setBlocks((prev) =>
        prev.map((b) => (b.id === blockId ? { ...b, language } : b))
      );
      await updateBlockMutation.mutateAsync({ blockId, updates: { language } });
    },
    [updateBlockMutation]
  );

  const updateBlockCalloutType = useCallback(
    async (blockId: string, calloutType: CalloutType) => {
      setBlocks((prev) =>
        prev.map((b) => (b.id === blockId ? { ...b, calloutType } : b))
      );
      await updateBlockMutation.mutateAsync({ blockId, updates: { calloutType } });
    },
    [updateBlockMutation]
  );

  const deleteBlock = useCallback(
    async (blockId: string) => {
      await deleteBlockMutation.mutateAsync(blockId);
    },
    [deleteBlockMutation]
  );

  const reorderBlocks = useCallback(
    (reorderedBlocks: Block[]) => {
      // Update local state
      setBlocks(reorderedBlocks);
      // TODO: Persist order changes to backend
      // This would require updating attribute metadata.order
      // For now, order is only persisted on block creation
    },
    []
  );

  const moveBlockUp = useCallback(
    (blockId: string) => {
      const index = blocks.findIndex((b) => b.id === blockId);
      if (index <= 0) return;

      const newBlocks = [...blocks];
      [newBlocks[index - 1], newBlocks[index]] = [
        newBlocks[index],
        newBlocks[index - 1],
      ];
      reorderBlocks(newBlocks);
    },
    [blocks, reorderBlocks]
  );

  const moveBlockDown = useCallback(
    (blockId: string) => {
      const index = blocks.findIndex((b) => b.id === blockId);
      if (index < 0 || index >= blocks.length - 1) return;

      const newBlocks = [...blocks];
      [newBlocks[index], newBlocks[index + 1]] = [
        newBlocks[index + 1],
        newBlocks[index],
      ];
      reorderBlocks(newBlocks);
    },
    [blocks, reorderBlocks]
  );

  // Convert block to standalone page (visible in space list)
  const convertBlockToPage = useCallback(
    async (blockId: string) => {
      const block = blocksRef.current.find((b) => b.id === blockId);
      if (!block) return;

      // Generate a title from content (first 50 chars or first line)
      let title = block.content?.trim() || 'Untitled Page';
      const firstLine = title.split('\n')[0];
      title = firstLine.length > 50 ? firstLine.substring(0, 47) + '...' : firstLine;
      if (!title) title = 'Untitled Page';

      // Update the node to be a page
      await nodeService.updateNode(spaceSlug, blockId, {
        title,
        nodeDetails: {
          blockType: block.type,
          isPage: true,
          showInSpaceList: true,
        },
      });

      // Invalidate queries to refresh the space list
      queryClient.invalidateQueries({ queryKey: nodeKeys.lists() });
    },
    [spaceSlug, queryClient]
  );
  const applyTemplateBlocks = useCallback(
    async (
      templateBlocks: TemplateBlockDefinition[],
      mode: ApplyTemplateMode = 'append'
    ) => {
      if (!templateBlocks.length) return;

      setIsSaving(true);
      onSaveStatusChange?.(true);

      try {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }

        if (pendingChangesRef.current.size > 0) {
          const changes = Array.from(pendingChangesRef.current.entries());

          await Promise.all(
            changes.map(([id, upd]) =>
              updateBlockMutation.mutateAsync({ blockId: id, updates: upd })
            )
          );

          pendingChangesRef.current.clear();
        }

        const currentBlocks = blocksRef.current;

        const blocksToCreate =
          mode === 'replace'
            ? moveExistingContentIntoTemplateFields(currentBlocks, templateBlocks)
            : templateBlocks;

        if (mode === 'replace' && currentBlocks.length > 0) {
          setTemplateReplaceBackup(currentBlocks.map(blockToTemplateBlock));

          await deleteBlocks({
            spaceSlug,
            blockIds: currentBlocks.map((block) => block.id),
          });

          setBlocks([]);
          blocksRef.current = [];
        }

        const baseBlocks = mode === 'replace' ? [] : blocksRef.current;
        const lastOrder = baseBlocks[baseBlocks.length - 1]?.order ?? 0;
        const startOrder = lastOrder + 1000;

        const createdBlocks = await createTemplateBlocks({
          spaceSlug,
          pageId,
          blocks: blocksToCreate,
          startOrder,
        });

        setBlocks((prev) => {
          const next =
            mode === 'replace'
              ? createdBlocks
              : [...prev, ...createdBlocks];

          return next.sort((a, b) => a.order - b.order);
        });

        blocksRef.current =
          mode === 'replace'
            ? createdBlocks
            : [...blocksRef.current, ...createdBlocks].sort(
                (a, b) => a.order - b.order
              );

        queryClient.invalidateQueries({ queryKey: blocksQueryKey });
      } finally {
        setIsSaving(false);
        onSaveStatusChange?.(false);
      }
    },
    [
      blocksQueryKey,
      onSaveStatusChange,
      pageId,
      queryClient,
      spaceSlug,
      updateBlockMutation,
    ]
  );
  
const revertTemplateReplace = useCallback(async () => {
  if (!templateReplaceBackup || templateReplaceBackup.length === 0) return;

  setIsSaving(true);
  onSaveStatusChange?.(true);

  try {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    if (pendingChangesRef.current.size > 0) {
      const changes = Array.from(pendingChangesRef.current.entries());

      await Promise.all(
        changes.map(([id, upd]) =>
          updateBlockMutation.mutateAsync({ blockId: id, updates: upd })
        )
      );

      pendingChangesRef.current.clear();
    }

    const currentBlocks = blocksRef.current;

    if (currentBlocks.length > 0) {
      await deleteBlocks({
        spaceSlug,
        blockIds: currentBlocks.map((block) => block.id),
      });
    }

    setBlocks([]);
    blocksRef.current = [];

    const restoredBlocks = await createTemplateBlocks({
      spaceSlug,
      pageId,
      blocks: templateReplaceBackup,
      startOrder: 1000,
    });

    setBlocks(restoredBlocks.sort((a, b) => a.order - b.order));
    blocksRef.current = restoredBlocks.sort((a, b) => a.order - b.order);

    setTemplateReplaceBackup(null);

    queryClient.invalidateQueries({ queryKey: blocksQueryKey });
  } finally {
    setIsSaving(false);
    onSaveStatusChange?.(false);
  }
}, [
  blocksQueryKey,
  onSaveStatusChange,
  pageId,
  queryClient,
  spaceSlug,
  templateReplaceBackup,
  updateBlockMutation,
]);

  // Get next block type for continuous types
  const getNextBlockType = useCallback(
    (currentBlock: Block): BlockType => {
      if (currentBlock.content === '' && isContinuousBlockType(currentBlock.type)) {
        return BLOCK_TYPES.TEXT;
      }
      if (isContinuousBlockType(currentBlock.type)) {
        return currentBlock.type;
      }
      return BLOCK_TYPES.TEXT;
    },
    []
  );

  // Create initial block if page is empty (after data is fetched)
  useEffect(() => {
    // Only proceed if:
    // 1. Data has been fetched (not loading)
    // 2. No blocks exist (from server)
    // 3. Haven't already attempted to create initial block
    if (
      !isLoading &&
      fetchedBlocks !== undefined &&
      fetchedBlocks.length === 0 &&
      !initialBlockAttemptedRef.current
    ) {
      initialBlockAttemptedRef.current = true;
      // Create initial block directly via mutation to avoid circular deps
      createBlockMutation.mutate({
        type: BLOCK_TYPES.TEXT,
        content: '',
        afterBlockId: undefined,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, fetchedBlocks]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    blocks,
    isLoading,
    isSaving,
    isCreatingBlock,
    error,
    createBlock,
    updateBlockContent,
    updateBlockType,
    updateBlockChecked,
    updateBlockLanguage,
    updateBlockCalloutType,
    deleteBlock,
    reorderBlocks,
    moveBlockUp,
    moveBlockDown,
    getNextBlockType,
    saveNow,
    convertBlockToPage,
    applyTemplateBlocks,
    canRevertTemplateReplace: Boolean(templateReplaceBackup),
    revertTemplateReplace,
  };
}

/**
 * Convert a Node to a Block
 */
function nodeToBlock(node: Node, order: number): Block {
  // Handle nodeDetails being a string (JSON) or object
  let details: BlockNodeDetails | undefined;
  if (typeof node.nodeDetails === 'string') {
    try {
      details = JSON.parse(node.nodeDetails);
    } catch {
      details = undefined;
    }
  } else {
    details = node.nodeDetails as unknown as BlockNodeDetails | undefined;
  }

  return {
    id: node.id,
    type: details?.blockType ?? BLOCK_TYPES.TEXT,
    content: node.content ?? '',
    order,
    checked: details?.checked,
    language: details?.language,
    imageUrl: details?.imageUrl,
    caption: details?.caption,
    calloutType: details?.calloutType,
  };
}

export default useBlockEditor;
