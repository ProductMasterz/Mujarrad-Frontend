'use client';

import { BLOCK_META } from './blockMeta';
import { BlockShell } from './BlockShell';
import type { Block, BlockType, BlockProps, CalloutType } from './types';
import { BLOCK_TYPES } from './types';
import {
  TextBlock,
  HeadingBlock,
  ListBlock,
  TodoBlock,
  QuoteBlock,
  DividerBlock,
  CodeBlock,
  MathBlock,
  MermaidBlock,
  CalloutBlock,
} from './blocks';

interface BlockRendererProps {
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
  readOnly?: boolean;
}

export function BlockRenderer({
  block,
  isActive,
  listNumber = 1,
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
  readOnly = false,
}: BlockRendererProps) {
  const commonProps: BlockProps = {
    block,
    isActive,
    onContentChange,
    onTypeChange,
    onDelete,
    onEnter,
    onBackspace,
    onFocus,
    onMoveUp,
    onMoveDown,
    readOnly,
  };

  const meta = BLOCK_META[block.type];

  const wrap = (children: React.ReactNode) => (
    <BlockShell
      badge={meta.shortLabel}
      label={meta.label}
      toneClassName={meta.tone}
    >
      {children}
    </BlockShell>
  );

  switch (block.type) {
    case BLOCK_TYPES.TEXT:
      return wrap(<TextBlock {...commonProps} />);

    case BLOCK_TYPES.HEADING_1:
    case BLOCK_TYPES.HEADING_2:
    case BLOCK_TYPES.HEADING_3:
      return wrap(<HeadingBlock {...commonProps} />);

    case BLOCK_TYPES.BULLET_LIST:
    case BLOCK_TYPES.NUMBERED_LIST:
      return wrap(<ListBlock {...commonProps} listNumber={listNumber} />);

    case BLOCK_TYPES.TODO:
      return wrap(<TodoBlock {...commonProps} onCheckedChange={onCheckedChange} />);

    case BLOCK_TYPES.QUOTE:
      return wrap(<QuoteBlock {...commonProps} />);

    case BLOCK_TYPES.DIVIDER:
      return wrap(
        <DividerBlock
          block={block}
          isActive={isActive}
          onDelete={onDelete}
          onEnter={onEnter}
          onBackspace={onBackspace}
          onFocus={onFocus}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          readOnly={readOnly}
        />
      );

    case BLOCK_TYPES.CODE:
      return wrap(<CodeBlock {...commonProps} onLanguageChange={onLanguageChange} />);

    case BLOCK_TYPES.MATH:
      return wrap(<MathBlock {...commonProps} />);

    case BLOCK_TYPES.MERMAID:
      return wrap(<MermaidBlock {...commonProps} />);

    case BLOCK_TYPES.CALLOUT:
      return wrap(
        <CalloutBlock {...commonProps} onCalloutTypeChange={onCalloutTypeChange} />
      );

    case BLOCK_TYPES.IMAGE:
      return wrap(
        <div
          className="
            rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/80 p-5 text-center
            dark:border-zinc-700 dark:bg-zinc-900/60
          "
        >
          <div className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
            Image block
          </div>
          <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Upload or embed an image here
          </div>

          {block.imageUrl && (
            <img
              src={block.imageUrl}
              alt={block.caption || 'Image'}
              className="mt-4 max-h-[420px] max-w-full rounded-xl border border-zinc-200 object-contain dark:border-zinc-800"
            />
          )}

          {block.caption && (
            <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
              {block.caption}
            </div>
          )}
        </div>
      );

    default:
      return wrap(<TextBlock {...commonProps} />);
  }
}

export default BlockRenderer;