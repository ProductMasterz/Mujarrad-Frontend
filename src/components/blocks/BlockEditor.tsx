'use client';

import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
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
  trigger: 'slash' | 'plus' | 'transform' | 'batch' | null;
}

export const BlockEditor = forwardRef<BlockEditorRef, BlockEditorProps>(function BlockEditor(
  {
    pageId,
    spaceSlug,
    spaceId,
    readOnly = false,
    onSaveStatusChange,
    onBlocksChange,
    onFocusChange,
  },
  ref
) {
  const {
    blocks,
    isLoading,
    isSaving,
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
  const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const [slashMenu, setSlashMenu] = useState<SlashMenuState>({
    isOpen: false,
    blockId: null,
    query: '',
    position: { top: 0, left: 0 },
    trigger: null,
  });

  const editorRef = useRef<HTMLDivElement>(null);
  const blockRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const getSlashMenuPosition = useCallback((blockId: string) => {
    const blockElement = blockRefs.current.get(blockId);
    const viewportPadding = 12;
    const estimatedMenuWidth =
      window.innerWidth >= 768 ? 820 : Math.min(820, window.innerWidth - 24);
    const estimatedMenuHeight = 520;

    if (!blockElement) {
      return {
        top: viewportPadding,
        left: viewportPadding,
      };
    }

    const rect = blockElement.getBoundingClientRect();

    let top = rect.bottom + 8;
    let left = rect.left;

    if (left + estimatedMenuWidth > window.innerWidth - viewportPadding) {
      left = window.innerWidth - estimatedMenuWidth - viewportPadding;
    }

    if (left < viewportPadding) {
      left = viewportPadding;
    }

    if (top + estimatedMenuHeight > window.innerHeight - viewportPadding) {
      top = Math.max(viewportPadding, rect.top - estimatedMenuHeight - 8);
    }

    return { top, left };
  }, []);

  const closeSlashMenu = useCallback(() => {
    setSlashMenu({
      isOpen: false,
      blockId: null,
      query: '',
      position: { top: 0, left: 0 },
      trigger: null,
    });
  }, []);

  const handleTransformClick = useCallback(
    (blockId: string) => {
      setSlashMenu({
        isOpen: true,
        blockId,
        query: '',
        position: getSlashMenuPosition(blockId),
        trigger: 'transform',
      });
    },
    [getSlashMenuPosition]
  );

  const handleBatchMenuOpen = useCallback(() => {
    const anchorId = selectedBlockIds[0];
    setSlashMenu({
      isOpen: true,
      blockId: anchorId ?? null,
      query: '',
      position: anchorId ? getSlashMenuPosition(anchorId) : { top: 80, left: 24 },
      trigger: 'batch',
    });
  }, [selectedBlockIds, getSlashMenuPosition]);

  const scrollToBlock = useCallback((blockId: string) => {
    const blockElement = blockRefs.current.get(blockId);
    if (blockElement) {
      blockElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setFocusedBlockId(blockId);
    }
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      saveNow,
      scrollToBlock,
      getBlocks: () => blocks,
      getFocusedBlockId: () => focusedBlockId,
    }),
    [saveNow, scrollToBlock, blocks, focusedBlockId]
  );

  useEffect(() => {
    onBlocksChange?.(blocks);
  }, [blocks, onBlocksChange]);

  useEffect(() => {
    onFocusChange?.(focusedBlockId);
  }, [focusedBlockId, onFocusChange]);

  useEffect(() => {
    setSelectedBlockIds((prev) => prev.filter((id) => blocks.some((b) => b.id === id)));
  }, [blocks]);

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

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = arrayMove(blocks, oldIndex, newIndex);
      reorderBlocks(reordered);
    },
    [blocks, reorderBlocks]
  );

  const handleEnter = useCallback(
    async (blockId: string) => {
      const currentBlock = blocks.find((b) => b.id === blockId);
      if (!currentBlock) return;

      if (currentBlock.content === '' && isContinuousBlockType(currentBlock.type)) {
        await updateBlockType(blockId, BLOCK_TYPES.TEXT);
        return;
      }

      const newType = getNextBlockType(currentBlock);
      const newBlock = await createBlock(newType, '', blockId);

      if (newBlock) {
        setFocusedBlockId(newBlock.id);
      }
    },
    [blocks, createBlock, getNextBlockType, updateBlockType]
  );

  const handleBackspace = useCallback(
    async (blockId: string) => {
      const currentBlock = blocks.find((b) => b.id === blockId);
      if (!currentBlock || currentBlock.content !== '') return;

      if (blocks.length === 1) {
        if (currentBlock.type !== BLOCK_TYPES.TEXT) {
          await updateBlockType(blockId, BLOCK_TYPES.TEXT);
        }
        return;
      }

      const currentIndex = blocks.findIndex((b) => b.id === blockId);
      const prevBlock = blocks[currentIndex - 1] ?? blocks[currentIndex + 1];

      await deleteBlock(blockId);

      if (prevBlock) {
        setFocusedBlockId(prevBlock.id);
      }
    },
    [blocks, deleteBlock, updateBlockType]
  );

  const handleToggleSelect = useCallback((blockId: string) => {
    setSelectedBlockIds((prev) =>
      prev.includes(blockId)
        ? prev.filter((id) => id !== blockId)
        : [...prev, blockId]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedBlockIds(blocks.map((b) => b.id));
    setIsSelectionMode(true);
  }, [blocks]);

  const handleClearSelection = useCallback(() => {
    setSelectedBlockIds([]);
    setIsSelectionMode(false);
  }, []);

  const handleBatchTransform = useCallback(
    async (type: BlockType) => {
      for (const blockId of selectedBlockIds) {
        await updateBlockType(blockId, type);
        if (type === BLOCK_TYPES.DIVIDER) {
          await updateBlockContent(blockId, '');
        }
      }
      handleClearSelection();
    },
    [selectedBlockIds, updateBlockType, updateBlockContent, handleClearSelection]
  );

  const handleSlashMenuSelect = useCallback(
    async (type: BlockType) => {
      if (slashMenu.trigger === 'batch') {
        await handleBatchTransform(type);
        closeSlashMenu();
        return;
      }

      if (!slashMenu.blockId) return;

      const blockIdToFocus = slashMenu.blockId;
      const currentBlock = blocks.find((b) => b.id === blockIdToFocus);
      if (!currentBlock) return;

      if (slashMenu.trigger === 'transform') {
        await updateBlockType(blockIdToFocus, type);
        if (type === BLOCK_TYPES.DIVIDER) {
          await updateBlockContent(blockIdToFocus, '');
        }
      } else {
        await updateBlockType(blockIdToFocus, type);

        if (currentBlock.content.trim() === '/' || slashMenu.trigger === 'plus') {
          if (type === BLOCK_TYPES.DIVIDER) {
            await updateBlockContent(blockIdToFocus, '');
          }
        }
      }

      closeSlashMenu();
      setFocusedBlockId(blockIdToFocus);

      setTimeout(() => {
        const blockElement = blockRefs.current.get(blockIdToFocus);
        if (!blockElement) return;

        const editableElement = blockElement.querySelector(
          '[contenteditable="true"], textarea'
        ) as HTMLElement | null;

        if (!editableElement) return;

        editableElement.focus();

        if (editableElement.getAttribute('contenteditable') === 'true') {
          const range = document.createRange();
          const selection = window.getSelection();
          range.selectNodeContents(editableElement);
          range.collapse(false);
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
      }, 50);
    },
    [
      slashMenu.trigger,
      slashMenu.blockId,
      blocks,
      updateBlockContent,
      updateBlockType,
      handleBatchTransform,
      closeSlashMenu,
    ]
  );

  const handleContentChange = useCallback(
    (blockId: string, content: string) => {
      if (content === '/') {
        setSlashMenu({
          isOpen: true,
          blockId,
          query: '',
          position: getSlashMenuPosition(blockId),
          trigger: 'slash',
        });
        return;
      }

      if (
        slashMenu.isOpen &&
        slashMenu.blockId === blockId &&
        slashMenu.trigger === 'slash' &&
        content.startsWith('/')
      ) {
        setSlashMenu((prev) => ({
          ...prev,
          query: content.slice(1),
          position: getSlashMenuPosition(blockId),
        }));
        return;
      }

      if (
        slashMenu.isOpen &&
        slashMenu.blockId === blockId &&
        slashMenu.trigger === 'slash' &&
        !content.startsWith('/')
      ) {
        closeSlashMenu();
      }

      updateBlockContent(blockId, content);
    },
    [slashMenu, updateBlockContent, getSlashMenuPosition, closeSlashMenu]
  );

  const handlePlusClick = useCallback(
    async (blockId: string) => {
      const newBlock = await createBlock(BLOCK_TYPES.TEXT, '', blockId);
      if (!newBlock) return;

      setFocusedBlockId(newBlock.id);

      setTimeout(() => {
        setSlashMenu({
          isOpen: true,
          blockId: newBlock.id,
          query: '',
          position: getSlashMenuPosition(newBlock.id),
          trigger: 'plus',
        });
      }, 50);
    },
    [createBlock, getSlashMenuPosition]
  );

  const handleEditorDoubleClick = useCallback(
    async (e: React.MouseEvent<HTMLDivElement>) => {
      if (readOnly) return;

      const target = e.target as HTMLElement;
      const isOnBlock = target.closest('[data-block-id]') !== null;
      const isOnBlockContent = target.closest('[contenteditable], textarea') !== null;

      if (isOnBlock || isOnBlockContent) return;

      const lastBlock = blocks[blocks.length - 1];
      const newBlock = await createBlock(BLOCK_TYPES.TEXT, '', lastBlock?.id);

      if (newBlock) {
        setTimeout(() => {
          const blockElement = blockRefs.current.get(newBlock.id);
          if (!blockElement) return;

          const editableElement = blockElement.querySelector(
            '[contenteditable="true"], textarea'
          ) as HTMLElement | null;

          editableElement?.focus();
          setFocusedBlockId(newBlock.id);
        }, 50);
      }
    },
    [readOnly, blocks, createBlock]
  );

  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        void saveNow();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveNow]);

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

  if (isLoading) {
    return (
      <div className="space-y-4 p-8">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-6 animate-pulse rounded bg-gray-200 dark:bg-zinc-800"
            style={{ width: `${60 + Math.random() * 30}%` }}
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-red-500 dark:text-red-400">
        <p>Error loading blocks: {error}</p>
      </div>
    );
  }

  return (
    <div
      ref={editorRef}
      className="relative min-h-[200px] cursor-text overflow-visible py-4"
      onDoubleClick={handleEditorDoubleClick}
    >
      {isSaving && (
        <div className="absolute right-2 top-2 text-xs text-gray-500 dark:text-zinc-400">
          Saving...
        </div>
      )}

      {!readOnly && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setIsSelectionMode((prev) => {
                const next = !prev;
                if (!next) {
                  setSelectedBlockIds([]);
                }
                return next;
              });
            }}
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
          >
            {isSelectionMode ? 'Exit selection' : 'Select blocks'}
          </button>

          {isSelectionMode && (
            <>
              <button
                type="button"
                onClick={handleSelectAll}
                className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
              >
                Select all
              </button>

              <button
                type="button"
                onClick={handleClearSelection}
                className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
              >
                Clear selection
              </button>
            </>
          )}
        </div>
      )}

      {selectedBlockIds.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-sm text-zinc-600 dark:text-zinc-300">
            {selectedBlockIds.length} selected
          </div>

          <button
            type="button"
            onClick={handleBatchMenuOpen}
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
          >
            Change type
          </button>

          <button
            type="button"
            onClick={handleClearSelection}
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
          >
            Clear
          </button>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={blocks.map((b) => b.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-1.5">
            {blocks.map((block, index) => (
              <div
                key={block.id}
                data-block-id={block.id}
                ref={(el) => {
                  if (el) {
                    blockRefs.current.set(block.id, el);
                  } else {
                    blockRefs.current.delete(block.id);
                  }
                }}
              >
                <SortableBlock
                  block={block}
                  isActive={focusedBlockId === block.id}
                  isSelected={selectedBlockIds.includes(block.id)}
                  selectionMode={isSelectionMode}
                  onToggleSelect={() => handleToggleSelect(block.id)}
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
                  onTransformClick={() => handleTransformClick(block.id)}
                  onConvertToPage={() => convertBlockToPage(block.id)}
                  menuOpen={slashMenu.isOpen && slashMenu.blockId === block.id}
                  readOnly={readOnly}
                />
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {blocks.length === 0 && !readOnly && (
        <div className="rounded-2xl border border-dashed border-zinc-300 px-6 py-10 text-center text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          <div className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
            Start writing
          </div>
          <div className="text-sm">
            Type normally or press{' '}
            <kbd className="rounded-md border border-zinc-300 bg-zinc-100 px-2 py-1 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
              /
            </kbd>{' '}
            to open the block menu
          </div>
        </div>
      )}

      <SlashCommandMenu
        isOpen={slashMenu.isOpen}
        query={slashMenu.query}
        position={slashMenu.position}
        onSelect={handleSlashMenuSelect}
        onClose={closeSlashMenu}
        onQueryChange={(query) => setSlashMenu((prev) => ({ ...prev, query }))}
      />
    </div>
  );
});

export default BlockEditor;