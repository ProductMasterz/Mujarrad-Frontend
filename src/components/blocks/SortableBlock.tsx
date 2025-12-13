'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Trash2, MoreHorizontal, FileText } from 'lucide-react';
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
  onConvertToPage?: () => void;
  readOnly?: boolean;
}

/**
 * SortableBlock - Wrapper that adds drag-and-drop and block controls
 *
 * Wraps any block component with:
 * - Drag handle for reordering
 * - Plus button for type selector
 * - Delete button on hover
 */
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
  onConvertToPage,
  readOnly = false,
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group relative flex items-start gap-1 py-1
        ${isDragging ? 'opacity-50 z-50' : ''}
        ${isActive ? 'bg-gray-50 dark:bg-gray-800/50 -mx-2 px-2 rounded' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Block controls (left side) */}
      <div
        className={`
          flex items-center gap-0.5 flex-shrink-0 pt-1
          transition-opacity duration-150
          ${isHovered && !readOnly ? 'opacity-100' : 'opacity-0'}
        `}
      >
        {/* Plus button */}
        <button
          type="button"
          onClick={onPlusClick}
          className="
            p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700
            text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
            transition-colors
          "
          title="Add block or change type"
        >
          <Plus className="w-4 h-4" />
        </button>

        {/* Drag handle */}
        <button
          type="button"
          className="
            p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700
            text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
            cursor-grab active:cursor-grabbing
            transition-colors
          "
          title="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Block content */}
      <div className="flex-1 min-w-0">
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

      {/* Block actions menu (right side) */}
      <div
        className={`
          flex-shrink-0 pt-1
          transition-opacity duration-150
          ${isHovered && !readOnly ? 'opacity-100' : 'opacity-0'}
        `}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="
                p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700
                text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                transition-colors
              "
              title="Block options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onConvertToPage && (
              <DropdownMenuItem onClick={onConvertToPage}>
                <FileText className="w-4 h-4 mr-2" />
                Convert to Page
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={onDelete}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Drag overlay indicator */}
      {isDragging && (
        <div className="absolute inset-0 border-2 border-blue-500 border-dashed rounded pointer-events-none" />
      )}
    </div>
  );
}

export default SortableBlock;
