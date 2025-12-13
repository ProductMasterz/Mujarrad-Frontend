'use client';

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

/**
 * BlockRenderer - Renders the appropriate block component based on type
 *
 * This component acts as a factory, selecting the correct block component
 * for each block type and passing through the necessary props.
 */
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
  // Common props for all block types
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

  switch (block.type) {
    case BLOCK_TYPES.TEXT:
      return <TextBlock {...commonProps} />;

    case BLOCK_TYPES.HEADING_1:
    case BLOCK_TYPES.HEADING_2:
    case BLOCK_TYPES.HEADING_3:
      return <HeadingBlock {...commonProps} />;

    case BLOCK_TYPES.BULLET_LIST:
    case BLOCK_TYPES.NUMBERED_LIST:
      return <ListBlock {...commonProps} listNumber={listNumber} />;

    case BLOCK_TYPES.TODO:
      return <TodoBlock {...commonProps} onCheckedChange={onCheckedChange} />;

    case BLOCK_TYPES.QUOTE:
      return <QuoteBlock {...commonProps} />;

    case BLOCK_TYPES.DIVIDER:
      return (
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
      return <CodeBlock {...commonProps} onLanguageChange={onLanguageChange} />;

    case BLOCK_TYPES.MATH:
      return <MathBlock {...commonProps} />;

    case BLOCK_TYPES.MERMAID:
      return <MermaidBlock {...commonProps} />;

    case BLOCK_TYPES.CALLOUT:
      return <CalloutBlock {...commonProps} onCalloutTypeChange={onCalloutTypeChange} />;

    case BLOCK_TYPES.IMAGE:
      return (
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded text-center">
          <div className="text-gray-500">Image Block (coming soon)</div>
          {block.imageUrl && (
            <img src={block.imageUrl} alt={block.caption || 'Image'} className="max-w-full mt-2" />
          )}
        </div>
      );

    default:
      // Fallback to text block for unknown types
      return <TextBlock {...commonProps} />;
  }
}

export default BlockRenderer;
