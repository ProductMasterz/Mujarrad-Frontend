'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Plus,
  Trash2,
  MoreHorizontal,
  FileText,
  RefreshCw,
  Check,
} from 'lucide-react';
import { useState } from 'react';
import type { Block, BlockType, CalloutType } from './types';
import { BlockRenderer } from './BlockRenderer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SortableBlockProps {
  block: Block;
  isActive: boolean;
  listNumber?: number;
  onContentChange: (content: string) => void;
  onTypeChange: (type: BlockType) => void;
  onCheckedChange?: (checked: boolean) => void;
  onLanguageChange?: (language: string) => void;
  onCalloutTypeChange?: (calloutType: CalloutType) => void;
  onDelete: () => void;
  onEnter: () => void;
  onBackspace: () => void;
  onFocus: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onPlusClick: () => void;
  onTransformClick?: () => void;
  onConvertToPage?: () => void;
  menuOpen?: boolean;
  readOnly?: boolean;
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

export function SortableBlock({
  block,
  isActive,
  listNumber,
  onContentChange,
  onTypeChange,
  onCheckedChange,
  onLanguageChange,
  onCalloutTypeChange,
  onDelete,
  onEnter,
  onBackspace,
  onFocus,
  onMoveUp,
  onMoveDown,
  onPlusClick,
  onTransformClick,
  onConvertToPage,
  menuOpen = false,
  readOnly = false,
  selectionMode = false,
  isSelected = false,
  onToggleSelect,
}: SortableBlockProps) {
  const [isHovered, setIsHovered] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const showControls = (isHovered || isActive || menuOpen || selectionMode) && !readOnly;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group relative flex items-start gap-2 rounded-2xl px-2 py-1.5 transition-all
        ${isDragging ? 'z-50 opacity-50' : ''}
        ${
          isSelected
            ? 'bg-blue-50 ring-1 ring-blue-200 dark:bg-blue-950/30 dark:ring-blue-900'
            : isActive
            ? 'bg-zinc-50 ring-1 ring-zinc-200 dark:bg-zinc-900/60 dark:ring-zinc-800'
            : 'hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40'
        }
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {selectionMode && (
        <button
          type="button"
          onClick={onToggleSelect}
          className={`
            mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors
            ${
              isSelected
                ? 'border-blue-600 bg-blue-600 text-white dark:border-blue-500 dark:bg-blue-500'
                : 'border-zinc-300 bg-white text-transparent hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:hover:border-zinc-600'
            }
          `}
          title="Select block"
        >
          <Check className="h-3.5 w-3.5" />
        </button>
      )}

      <div
        className={`
          flex shrink-0 items-center gap-1 pt-1 transition-opacity duration-150
          ${showControls ? 'opacity-100' : 'opacity-0'}
        `}
      >
        <button
          type="button"
          onClick={onPlusClick}
          className="
            flex h-7 w-7 items-center justify-center rounded-lg
            border border-transparent text-zinc-400 transition-colors
            hover:border-zinc-200 hover:bg-white hover:text-zinc-700
            dark:text-zinc-500 dark:hover:border-zinc-800 dark:hover:bg-zinc-950 dark:hover:text-zinc-200
          "
          title="Insert new block below"
        >
          <Plus className="h-4 w-4" />
        </button>

        {onTransformClick && (
          <button
            type="button"
            onClick={onTransformClick}
            className="
              flex h-7 w-7 items-center justify-center rounded-lg
              border border-transparent text-zinc-400 transition-colors
              hover:border-zinc-200 hover:bg-white hover:text-zinc-700
              dark:text-zinc-500 dark:hover:border-zinc-800 dark:hover:bg-zinc-950 dark:hover:text-zinc-200
            "
            title="Change block type"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        )}

        <button
          type="button"
          className="
            flex h-7 w-7 items-center justify-center rounded-lg
            border border-transparent text-zinc-400 transition-colors
            hover:border-zinc-200 hover:bg-white hover:text-zinc-700
            active:cursor-grabbing dark:text-zinc-500 dark:hover:border-zinc-800 dark:hover:bg-zinc-950 dark:hover:text-zinc-200
          "
          title="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 cursor-grab" />
        </button>
      </div>

      <div className="min-w-0 flex-1">
        <BlockRenderer
          block={block}
          isActive={isActive}
          listNumber={listNumber}
          onContentChange={onContentChange}
          onTypeChange={onTypeChange}
          onCheckedChange={onCheckedChange}
          onLanguageChange={onLanguageChange}
          onCalloutTypeChange={onCalloutTypeChange}
          onDelete={onDelete}
          onEnter={onEnter}
          onBackspace={onBackspace}
          onFocus={onFocus}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          readOnly={readOnly}
        />
      </div>

      <div
        className={`
          shrink-0 pt-1 transition-opacity duration-150
          ${showControls ? 'opacity-100' : 'opacity-0'}
        `}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="
                flex h-7 w-7 items-center justify-center rounded-lg
                border border-transparent text-zinc-400 transition-colors
                hover:border-zinc-200 hover:bg-white hover:text-zinc-700
                dark:text-zinc-500 dark:hover:border-zinc-800 dark:hover:bg-zinc-950 dark:hover:text-zinc-200
              "
              title="Block options"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
          >
            {onConvertToPage && (
              <DropdownMenuItem onClick={onConvertToPage}>
                <FileText className="mr-2 h-4 w-4" />
                Convert to Page
              </DropdownMenuItem>
            )}

            <DropdownMenuItem
              onClick={onDelete}
              className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isDragging && (
        <div className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-dashed border-blue-500" />
      )}
    </div>
  );
}

export default SortableBlock;