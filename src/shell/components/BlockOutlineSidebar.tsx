'use client';

import { useState, useMemo } from 'react';
import clsx from 'clsx';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { UserMenu } from './UserMenu';
import { ShortcutsModal } from './ShortcutsModal';
import type { Block, BlockType } from '@/components/blocks/types';
import { BLOCK_TYPES } from '@/components/blocks/types';

// =============================================================================
// Types
// =============================================================================

interface OutlineItem {
  id: string;
  block: Block;
  level: number;
  children: OutlineItem[];
  displayText: string;
}

interface BlockOutlineSidebarProps {
  isOpen: boolean;
  blocks: Block[];
  selectedBlockId: string | null;
  onBlockClick: (blockId: string) => void;
  onLogout: () => void;
}

// =============================================================================
// Helpers
// =============================================================================

/**
 * Get the heading level for a block type (0 = not a heading)
 */
function getHeadingLevel(type: BlockType): number {
  switch (type) {
    case BLOCK_TYPES.HEADING_1:
      return 1;
    case BLOCK_TYPES.HEADING_2:
      return 2;
    case BLOCK_TYPES.HEADING_3:
      return 3;
    default:
      return 0;
  }
}

/**
 * Get display text for a block (truncated content)
 */
function getBlockDisplayText(block: Block, maxLength: number = 40): string {
  if (!block.content || block.content.trim() === '') {
    return getBlockTypePlaceholder(block.type);
  }

  // Get first line and truncate
  const firstLine = block.content.split('\n')[0].trim();
  if (firstLine.length <= maxLength) {
    return firstLine;
  }
  return firstLine.substring(0, maxLength - 3) + '...';
}

/**
 * Get placeholder text for empty blocks based on type
 */
function getBlockTypePlaceholder(type: BlockType): string {
  switch (type) {
    case BLOCK_TYPES.TEXT:
      return 'Empty paragraph';
    case BLOCK_TYPES.HEADING_1:
      return 'Heading 1';
    case BLOCK_TYPES.HEADING_2:
      return 'Heading 2';
    case BLOCK_TYPES.HEADING_3:
      return 'Heading 3';
    case BLOCK_TYPES.BULLET_LIST:
      return 'Bullet item';
    case BLOCK_TYPES.NUMBERED_LIST:
      return 'Numbered item';
    case BLOCK_TYPES.TODO:
      return 'Todo item';
    case BLOCK_TYPES.QUOTE:
      return 'Quote';
    case BLOCK_TYPES.CODE:
      return 'Code block';
    case BLOCK_TYPES.DIVIDER:
      return '—';
    case BLOCK_TYPES.IMAGE:
      return 'Image';
    case BLOCK_TYPES.MATH:
      return 'Math equation';
    case BLOCK_TYPES.MERMAID:
      return 'Diagram';
    case BLOCK_TYPES.CALLOUT:
      return 'Callout';
    default:
      return 'Block';
  }
}

/**
 * Get icon for block type
 */
function getBlockIcon(type: BlockType): string {
  switch (type) {
    case BLOCK_TYPES.TEXT:
      return 'T';
    case BLOCK_TYPES.HEADING_1:
      return 'H1';
    case BLOCK_TYPES.HEADING_2:
      return 'H2';
    case BLOCK_TYPES.HEADING_3:
      return 'H3';
    case BLOCK_TYPES.BULLET_LIST:
      return '•';
    case BLOCK_TYPES.NUMBERED_LIST:
      return '#';
    case BLOCK_TYPES.TODO:
      return '☐';
    case BLOCK_TYPES.QUOTE:
      return '"';
    case BLOCK_TYPES.CODE:
      return '</>';
    case BLOCK_TYPES.DIVIDER:
      return '—';
    case BLOCK_TYPES.IMAGE:
      return '🖼';
    case BLOCK_TYPES.MATH:
      return '∑';
    case BLOCK_TYPES.MERMAID:
      return '◇';
    case BLOCK_TYPES.CALLOUT:
      return '💡';
    default:
      return '¶';
  }
}

/**
 * Build hierarchical outline from flat blocks array
 * Hierarchy is based on heading levels:
 * - H1 creates a new top-level section
 * - H2 nests under the previous H1
 * - H3 nests under the previous H2
 * - Other blocks nest under the current heading context
 */
function buildOutlineHierarchy(blocks: Block[]): OutlineItem[] {
  const result: OutlineItem[] = [];
  const stack: { level: number; item: OutlineItem }[] = [];

  for (const block of blocks) {
    const headingLevel = getHeadingLevel(block.type);
    const item: OutlineItem = {
      id: block.id,
      block,
      level: headingLevel || 4, // Non-headings get level 4
      children: [],
      displayText: getBlockDisplayText(block),
    };

    if (headingLevel > 0) {
      // This is a heading - pop stack until we find a lower level
      while (stack.length > 0 && stack[stack.length - 1].level >= headingLevel) {
        stack.pop();
      }

      if (stack.length === 0) {
        // Top level
        result.push(item);
      } else {
        // Add as child of current context
        stack[stack.length - 1].item.children.push(item);
      }

      // Push to stack
      stack.push({ level: headingLevel, item });
    } else {
      // Non-heading block - add under current heading context
      if (stack.length === 0) {
        // No heading context, add to top level
        result.push(item);
      } else {
        // Add under current heading
        stack[stack.length - 1].item.children.push(item);
      }
    }
  }

  return result;
}

// =============================================================================
// Outline Item Component
// =============================================================================

function OutlineItemComponent({
  item,
  level = 0,
  selectedBlockId,
  onBlockClick,
}: {
  item: OutlineItem;
  level?: number;
  selectedBlockId: string | null;
  onBlockClick: (blockId: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const hasChildren = item.children.length > 0;
  const isSelected = item.id === selectedBlockId;
  const isHeading = getHeadingLevel(item.block.type) > 0;

  return (
    <div className="relative">
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <button
          onClick={() => {
            if (hasChildren) {
              setIsExpanded(!isExpanded);
            }
            onBlockClick(item.id);
          }}
          className={clsx(
            'flex w-full items-center gap-[8px] rounded-[4px] px-[4px] py-[4px] text-left transition-colors',
            isHeading
              ? "font-['Roboto:Medium',sans-serif] font-medium text-[#4f4f4f] dark:text-[#e5e7eb]"
              : "font-['Roboto:Regular',sans-serif] font-normal text-[#828282] dark:text-[#9ca3af]",
            isSelected && 'bg-[#e4f1ff] text-[#248bf2] dark:bg-[#1e3a5f] dark:text-[#93c5fd]',
            isHovered && !isSelected && 'bg-[#f5f5f5] dark:bg-[#1f2937]'
          )}
          style={{
            paddingLeft: `${level * 12 + 4}px`,
          }}
        >
          {/* Expand/collapse icon */}
          {hasChildren ? (
            <div className="w-[14px] shrink-0">
              {isExpanded ? (
                <ChevronDown className="size-[14px]" strokeWidth={1.5} />
              ) : (
                <ChevronRight className="size-[14px]" strokeWidth={1.5} />
              )}
            </div>
          ) : (
            <div className="w-[14px]" />
          )}

          {/* Block type icon */}
          <span
            className={clsx(
              'w-[20px] shrink-0 text-center text-[11px]',
              isSelected ? 'text-[#248bf2] dark:text-[#93c5fd]' : 'text-[#bdbdbd] dark:text-[#6b7280]'
            )}
          >
            {getBlockIcon(item.block.type)}
          </span>

          {/* Block content */}
          <span
            className="flex-1 truncate text-[13px] leading-[20px] tracking-[-0.24px]"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            {item.displayText}
          </span>
        </button>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="flex flex-col">
          {item.children.map((child) => (
            <OutlineItemComponent
              key={child.id}
              item={child}
              level={level + 1}
              selectedBlockId={selectedBlockId}
              onBlockClick={onBlockClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function BlockOutlineSidebar({
  isOpen,
  blocks,
  selectedBlockId,
  onBlockClick,
  onLogout,
}: BlockOutlineSidebarProps) {
  const [userMenuAnchor, setUserMenuAnchor] = useState<HTMLElement | null>(null);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  // Build hierarchical outline
  const outlineItems = useMemo(() => buildOutlineHierarchy(blocks), [blocks]);

  const handleUserClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleShortcutClick = () => {
    setShowShortcutsModal(true);
  };

  return (
    <div
      className={clsx(
        'fixed left-0 top-[76px] z-10 h-[calc(100vh-76px)] border-r border-[#f2f2f2] bg-white transition-all duration-300 ease-in-out dark:border-[#374151] dark:bg-[#0f172a]',
        isOpen ? 'w-[276px]' : 'w-0'
      )}
      style={{ overflow: isOpen ? 'visible' : 'hidden' }}
    >
      <div className="flex h-full w-[276px] flex-col">
        {/* Header */}
        <div className="border-b border-[#f2f2f2] px-[17px] pb-[12px] pt-[20px] dark:border-[#374151]">
          <h3
            className="font-['Roboto:Medium',sans-serif] text-[13px] font-medium uppercase tracking-[0.5px] text-[#828282] dark:text-[#9ca3af]"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            Page Outline
          </h3>
        </div>

        {/* Outline Items */}
        <div className="flex-1 overflow-y-auto px-[12px] pt-[12px]">
          {outlineItems.length === 0 ? (
            <p
              className="px-[4px] font-['Roboto:Regular',sans-serif] text-[13px] font-normal text-[#bdbdbd] dark:text-[#6b7280]"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              No blocks yet
            </p>
          ) : (
            <div className="flex flex-col gap-[2px]">
              {outlineItems.map((item) => (
                <OutlineItemComponent
                  key={item.id}
                  item={item}
                  selectedBlockId={selectedBlockId}
                  onBlockClick={onBlockClick}
                />
              ))}
            </div>
          )}
        </div>

        {/* Bottom Icons */}
        <div className="flex items-center gap-[90px] px-[17px] pb-[29px]">
          <div className="relative group">
            <button
              onClick={handleUserClick}
              className="text-[#828282] transition-colors hover:text-[#4f4f4f] dark:text-[#9ca3af] dark:hover:text-white"
            >
              <svg className="size-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 22H18V20C18 19.2044 17.6839 18.4413 17.1213 17.8787C16.5587 17.3161 15.7956 17 15 17H9C8.20435 17 7.44129 17.3161 6.87868 17.8787C6.31607 18.4413 6 19.2044 6 20V22H4V20C4 18.6739 4.52678 17.4021 5.46447 16.4645C6.40215 15.5268 7.67392 15 9 15H15C16.3261 15 17.5979 15.5268 18.5355 16.4645C19.4732 17.4021 20 18.6739 20 20V22ZM12 13C11.2121 13 10.4319 12.8448 9.7039 12.5433C8.97595 12.2417 8.31451 11.7998 7.75736 11.2426C7.20021 10.6855 6.75825 10.0241 6.45672 9.2961C6.15519 8.56815 6 7.78793 6 7C6 6.21207 6.15519 5.43185 6.45672 4.7039C6.75825 3.97595 7.20021 3.31451 7.75736 2.75736C8.31451 2.20021 8.97595 1.75825 9.7039 1.45672C10.4319 1.15519 11.2121 1 12 1C13.5913 1 15.1174 1.63214 16.2426 2.75736C17.3679 3.88258 18 5.4087 18 7C18 8.5913 17.3679 10.1174 16.2426 11.2426C15.1174 12.3679 13.5913 13 12 13ZM12 11C13.0609 11 14.0783 10.5786 14.8284 9.82843C15.5786 9.07828 16 8.06087 16 7C16 5.93913 15.5786 4.92172 14.8284 4.17157C14.0783 3.42143 13.0609 3 12 3C10.9391 3 9.92172 3.42143 9.17157 4.17157C8.42143 4.92172 8 5.93913 8 7C8 8.06087 8.42143 9.07828 9.17157 9.82843C9.92172 10.5786 10.9391 11 12 11Z" />
              </svg>
            </button>
            <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-[#333] px-[8px] py-[4px] font-['Roboto:Regular',sans-serif] text-[11px] text-white opacity-0 transition-opacity group-hover:opacity-100">
              Profile
            </div>
          </div>
          <div className="group relative">
            <button className="text-[#828282] transition-colors hover:text-[#4f4f4f] dark:text-[#9ca3af] dark:hover:text-white">
              <svg className="size-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 11.333L0 9L12 2L24 9V17.5H22V10.167L20 11.333V18.011L19.777 18.286C18.8404 19.4467 17.6557 20.3827 16.3099 21.0255C14.9641 21.6682 13.4914 22.0012 12 22C10.5086 22.0012 9.03588 21.6682 7.69007 21.0255C6.34426 20.3827 5.15955 19.4467 4.223 18.286L4 18.011V11.333ZM6 12.5V17.292C6.74991 18.1442 7.67304 18.8266 8.70772 19.2936C9.7424 19.7606 10.8648 20.0014 12 20C13.1352 20.0015 14.2576 19.7607 15.2923 19.2937C16.327 18.8267 17.2501 18.1443 18 17.292V12.5L12 16L6 12.5ZM3.97 9L12 13.685L20.03 9L12 4.315L3.97 9Z" />
              </svg>
            </button>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-[8px] py-[4px] bg-[#333] text-white text-[11px] rounded whitespace-nowrap font-['Roboto:Regular',sans-serif] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Learning
            </div>
          </div>
          <div className="relative group">
            <button
              onClick={handleShortcutClick}
              className="text-[#828282] transition-colors hover:text-[#4f4f4f] dark:text-[#9ca3af] dark:hover:text-white"
            >
              <svg className="size-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 3V10.267L19.294 6.634L20.294 8.366L14 11.999L20.294 15.634L19.294 17.366L12.999 13.732V21H10.999V13.732L4.705 17.366L3.705 15.634L9.998 12L3.705 8.366L4.705 6.634L11 10.267V3H13Z" />
              </svg>
            </button>
            <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-[#333] px-[8px] py-[4px] font-['Roboto:Regular',sans-serif] text-[11px] text-white opacity-0 transition-opacity group-hover:opacity-100">
              Shortcut
            </div>
          </div>
        </div>
      </div>

      {/* User Menu */}
      {userMenuAnchor && (
        <UserMenu
          onClose={() => setUserMenuAnchor(null)}
          anchorEl={userMenuAnchor}
          onLogout={onLogout}
        />
      )}

      {/* Shortcuts Modal */}
      <ShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />
    </div>
  );
}
