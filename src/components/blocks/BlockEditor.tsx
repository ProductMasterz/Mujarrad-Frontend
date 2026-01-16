'use client';

import { useState, useCallback, useRef, useEffect, KeyboardEvent, forwardRef, useImperativeHandle } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import type { Block, BlockType } from './types';
import { BLOCK_TYPES, isContinuousBlockType } from './types';
import { SortableBlock } from './SortableBlock';
import { SlashCommandMenu } from './SlashCommandMenu';
import { useBlockEditor } from './hooks/useBlockEditor';

interface BlockEditorProps {
  pageId: string;
  spaceSlug: string;
  spaceId: string;
  readOnly?: boolean;
  onSaveStatusChange?: (isSaving: boolean) => void;
  onBlocksChange?: (blocks: Block[]) => void;
  onFocusChange?: (blockId: string | null) => void;
}

export interface BlockEditorRef {
  saveNow: () => Promise<void>;
  scrollToBlock: (blockId: string) => void;
  getBlocks: () => Block[];
  getFocusedBlockId: () => string | null;
}

interface SlashMenuState {
  isOpen: boolean;
  blockId: string | null;
  query: string;
  position: { top: number; left: number };
}

/**
 * BlockEditor - Main block-based content editor component
 *
 * Features:
 * - Block-based editing with multiple block types
 * - Drag and drop reordering
 * - Slash command menu for block type insertion
 * - Keyboard shortcuts for navigation and editing
 * - Auto-save with status indicator
 */
export const BlockEditor = forwardRef<BlockEditorRef, BlockEditorProps>(function BlockEditor({
  pageId,
  spaceSlug,
  spaceId,
  readOnly = false,
  onSaveStatusChange,
  onBlocksChange,
  onFocusChange,
}, ref) {
  const {
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
  } = useBlockEditor({
    pageId,
    spaceSlug,
    spaceId,
    onSaveStatusChange,
  });

  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
  const [slashMenu, setSlashMenu] = useState<SlashMenuState>({
    isOpen: false,
    blockId: null,
    query: '',
    position: { top: 0, left: 0 },
  });

  const editorRef = useRef<HTMLDivElement>(null);
  const blockRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Scroll to a specific block
  const scrollToBlock = useCallback((blockId: string) => {
    const blockElement = blockRefs.current.get(blockId);
    if (blockElement) {
      blockElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setFocusedBlockId(blockId);
    }
  }, []);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    saveNow,
    scrollToBlock,
    getBlocks: () => blocks,
    getFocusedBlockId: () => focusedBlockId,
  }), [saveNow, scrollToBlock, blocks, focusedBlockId]);

  // Notify parent when blocks change
  useEffect(() => {
    if (onBlocksChange) {
      onBlocksChange(blocks);
    }
  }, [blocks, onBlocksChange]);

  // Notify parent when focus changes
  useEffect(() => {
    if (onFocusChange) {
      onFocusChange(focusedBlockId);
    }
  }, [focusedBlockId, onFocusChange]);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = blocks.findIndex((b) => b.id === active.id);
        const newIndex = blocks.findIndex((b) => b.id === over.id);
        const reordered = arrayMove(blocks, oldIndex, newIndex);
        reorderBlocks(reordered);
      }
    },
    [blocks, reorderBlocks]
  );

  // Handle Enter key - create new block
  const handleEnter = useCallback(
    async (blockId: string) => {
      const currentBlock = blocks.find((b) => b.id === blockId);
      if (!currentBlock) return;

      // If empty continuous block, convert to text
      if (currentBlock.content === '' && isContinuousBlockType(currentBlock.type)) {
        await updateBlockType(blockId, BLOCK_TYPES.TEXT);
        return;
      }

      // Create new block
      const newType = getNextBlockType(currentBlock);
      const newBlock = await createBlock(newType, '', blockId);
      if (newBlock) {
        setFocusedBlockId(newBlock.id);
      }
    },
    [blocks, createBlock, getNextBlockType, updateBlockType]
  );

  // Handle Backspace on empty block
  const handleBackspace = useCallback(
    async (blockId: string) => {
      const currentBlock = blocks.find((b) => b.id === blockId);
      if (!currentBlock || currentBlock.content !== '') return;

      // Don't delete if it's the only block
      if (blocks.length === 1) {
        // Convert to text type if not already
        if (currentBlock.type !== BLOCK_TYPES.TEXT) {
          await updateBlockType(blockId, BLOCK_TYPES.TEXT);
        }
        return;
      }

      // Find previous block to focus
      const currentIndex = blocks.findIndex((b) => b.id === blockId);
      const prevBlock = blocks[currentIndex - 1] ?? blocks[currentIndex + 1];

      await deleteBlock(blockId);

      if (prevBlock) {
        setFocusedBlockId(prevBlock.id);
      }
    },
    [blocks, deleteBlock, updateBlockType]
  );

  // Handle content input - check for slash command
  const handleContentChange = useCallback(
    (blockId: string, content: string) => {
      // Check for slash command trigger
      if (content === '/') {
        const blockElement = blockRefs.current.get(blockId);
        if (blockElement) {
          const rect = blockElement.getBoundingClientRect();
          setSlashMenu({
            isOpen: true,
            blockId,
            query: '',
            position: {
              top: rect.bottom + window.scrollY,
              left: rect.left + window.scrollX,
            },
          });
        }
        return;
      }

      // Update slash menu query if open
      if (slashMenu.isOpen && slashMenu.blockId === blockId && content.startsWith('/')) {
        setSlashMenu((prev) => ({
          ...prev,
          query: content.slice(1),
        }));
        return;
      }

      // Close slash menu if content doesn't start with /
      if (slashMenu.isOpen && slashMenu.blockId === blockId && !content.startsWith('/')) {
        setSlashMenu((prev) => ({ ...prev, isOpen: false }));
      }

      updateBlockContent(blockId, content);
    },
    [slashMenu, updateBlockContent]
  );

  // Handle slash menu selection
  const handleSlashMenuSelect = useCallback(
    async (type: BlockType) => {
      if (!slashMenu.blockId) return;

      // Clear the slash command text and change block type
      updateBlockContent(slashMenu.blockId, '');
      await updateBlockType(slashMenu.blockId, type);

      setSlashMenu((prev) => ({ ...prev, isOpen: false }));
      setFocusedBlockId(slashMenu.blockId);
    },
    [slashMenu.blockId, updateBlockContent, updateBlockType]
  );

  // Handle plus button click
  const handlePlusClick = useCallback(
    (blockId: string) => {
      const blockElement = blockRefs.current.get(blockId);
      if (blockElement) {
        const rect = blockElement.getBoundingClientRect();
        setSlashMenu({
          isOpen: true,
          blockId,
          query: '',
          position: {
            top: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX,
          },
        });
      }
    },
    []
  );

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      // Cmd/Ctrl + S - Save now
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        saveNow();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveNow]);

  // Note: Initial block creation is handled by useBlockEditor hook
  // We don't create blocks here to avoid race conditions with data fetching

  // Calculate list numbers for numbered lists
  const getListNumber = useCallback(
    (block: Block, index: number): number => {
      if (block.type !== BLOCK_TYPES.NUMBERED_LIST) return 1;

      let count = 1;
      for (let i = index - 1; i >= 0; i--) {
        if (blocks[i].type === BLOCK_TYPES.NUMBERED_LIST) {
          count++;
        } else {
          break;
        }
      }
      return count;
    },
    [blocks]
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-6 bg-gray-200 rounded animate-pulse"
            style={{ width: `${60 + Math.random() * 30}%` }}
          />
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-8 text-red-500">
        <p>Error loading blocks: {error}</p>
      </div>
    );
  }

  return (
    <div ref={editorRef} className="relative min-h-[200px] py-4">
      {/* Save status indicator */}
      {isSaving && (
        <div className="absolute top-2 right-2 text-xs text-gray-500">
          Saving...
        </div>
      )}

      {/* Block list with DnD */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={blocks.map((b) => b.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-1">
            {blocks.map((block, index) => (
              <div
                key={block.id}
                ref={(el) => {
                  if (el) blockRefs.current.set(block.id, el);
                }}
              >
                <SortableBlock
                  block={block}
                  isActive={focusedBlockId === block.id}
                  listNumber={getListNumber(block, index)}
                  onContentChange={(content) => handleContentChange(block.id, content)}
                  onTypeChange={(type) => updateBlockType(block.id, type)}
                  onCheckedChange={(checked) => updateBlockChecked(block.id, checked)}
                  onLanguageChange={(language) => updateBlockLanguage(block.id, language)}
                  onCalloutTypeChange={(calloutType) => updateBlockCalloutType(block.id, calloutType)}
                  onDelete={() => handleBackspace(block.id)}
                  onEnter={() => handleEnter(block.id)}
                  onBackspace={() => handleBackspace(block.id)}
                  onFocus={() => setFocusedBlockId(block.id)}
                  onMoveUp={() => moveBlockUp(block.id)}
                  onMoveDown={() => moveBlockDown(block.id)}
                  onPlusClick={() => handlePlusClick(block.id)}
                  onConvertToPage={() => convertBlockToPage(block.id)}
                  readOnly={readOnly}
                />
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Empty state */}
      {blocks.length === 0 && !readOnly && (
        <div className="text-gray-500 text-center py-8">
          Start typing or press <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-700">/</kbd> for commands
        </div>
      )}

      {/* Slash command menu */}
      <SlashCommandMenu
        isOpen={slashMenu.isOpen}
        query={slashMenu.query}
        position={slashMenu.position}
        onSelect={handleSlashMenuSelect}
        onClose={() => setSlashMenu((prev) => ({ ...prev, isOpen: false }))}
        onQueryChange={(query) => setSlashMenu((prev) => ({ ...prev, query }))}
      />
    </div>
  );
});

export default BlockEditor;
