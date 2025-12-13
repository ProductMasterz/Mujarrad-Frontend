/**
 * Block Editor Type Definitions
 *
 * These types define the block-based content editing system.
 * Blocks are stored as Nodes in Mujarrad with containment via Attributes.
 */

// =============================================================================
// Block Types
// =============================================================================

export const BLOCK_TYPES = {
  TEXT: 'text',
  HEADING_1: 'heading_1',
  HEADING_2: 'heading_2',
  HEADING_3: 'heading_3',
  BULLET_LIST: 'bullet_list',
  NUMBERED_LIST: 'numbered_list',
  TODO: 'todo',
  QUOTE: 'quote',
  DIVIDER: 'divider',
  IMAGE: 'image',
  CODE: 'code',
  MATH: 'math',
  MERMAID: 'mermaid',
  CALLOUT: 'callout',
} as const;

export type BlockType = typeof BLOCK_TYPES[keyof typeof BLOCK_TYPES];

/**
 * Block types that continue when pressing Enter
 */
export const CONTINUOUS_BLOCK_TYPES: BlockType[] = [
  BLOCK_TYPES.BULLET_LIST,
  BLOCK_TYPES.NUMBERED_LIST,
  BLOCK_TYPES.TODO,
];

/**
 * Block types that support text content editing
 */
export const EDITABLE_BLOCK_TYPES: BlockType[] = [
  BLOCK_TYPES.TEXT,
  BLOCK_TYPES.HEADING_1,
  BLOCK_TYPES.HEADING_2,
  BLOCK_TYPES.HEADING_3,
  BLOCK_TYPES.BULLET_LIST,
  BLOCK_TYPES.NUMBERED_LIST,
  BLOCK_TYPES.TODO,
  BLOCK_TYPES.QUOTE,
  BLOCK_TYPES.CODE,
  BLOCK_TYPES.MATH,
  BLOCK_TYPES.MERMAID,
  BLOCK_TYPES.CALLOUT,
];

// =============================================================================
// Callout Types
// =============================================================================

export const CALLOUT_TYPES = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  SUCCESS: 'success',
} as const;

export type CalloutType = typeof CALLOUT_TYPES[keyof typeof CALLOUT_TYPES];

// =============================================================================
// Block Data Structures
// =============================================================================

/**
 * Block-specific details stored in Node.nodeDetails
 */
export interface BlockNodeDetails {
  blockType: BlockType;
  isPage?: boolean;
  editorMode?: 'blocks' | 'markdown';
  /** Whether this block appears in the space's node list (default: false for blocks) */
  showInSpaceList?: boolean;
  // Todo-specific
  checked?: boolean;
  // Code-specific
  language?: string;
  // Image-specific
  imageUrl?: string;
  caption?: string;
  // Callout-specific
  calloutType?: CalloutType;
}

/**
 * Metadata for block containment Attribute
 */
export interface BlockContainmentMetadata {
  order: number;
}

/**
 * Frontend representation of a Block
 */
export interface Block {
  id: string;
  type: BlockType;
  content: string;
  order: number;
  // Optional type-specific properties
  checked?: boolean;
  language?: string;
  imageUrl?: string;
  caption?: string;
  calloutType?: CalloutType;
}

/**
 * Block with pending changes (optimistic update)
 */
export interface PendingBlock extends Block {
  isPending?: boolean;
  pendingAction?: 'create' | 'update' | 'delete';
}

// =============================================================================
// API DTOs
// =============================================================================

/**
 * Create block request
 */
export interface CreateBlockDTO {
  title: string;
  content: string;
  nodeType: 'REGULAR';
  nodeDetails: BlockNodeDetails;
}

/**
 * Update block request
 */
export interface UpdateBlockDTO {
  content?: string;
  nodeDetails?: Partial<BlockNodeDetails>;
}

/**
 * Create containment attribute request
 */
export interface CreateBlockContainmentDTO {
  sourceNodeId: number;
  targetNodeId: number;
  attributeKey: 'contains';
  metadata: BlockContainmentMetadata;
}

// =============================================================================
// Slash Menu
// =============================================================================

export interface SlashMenuItem {
  type: BlockType;
  label: string;
  description: string;
  icon: string;
  keywords: string[];
}

export const SLASH_MENU_ITEMS: SlashMenuItem[] = [
  {
    type: BLOCK_TYPES.TEXT,
    label: 'Text',
    description: 'Plain text paragraph',
    icon: 'T',
    keywords: ['text', 'paragraph', 'plain'],
  },
  {
    type: BLOCK_TYPES.HEADING_1,
    label: 'Heading 1',
    description: 'Large heading',
    icon: 'H1',
    keywords: ['heading', 'h1', 'title', 'large'],
  },
  {
    type: BLOCK_TYPES.HEADING_2,
    label: 'Heading 2',
    description: 'Medium heading',
    icon: 'H2',
    keywords: ['heading', 'h2', 'subtitle', 'medium'],
  },
  {
    type: BLOCK_TYPES.HEADING_3,
    label: 'Heading 3',
    description: 'Small heading',
    icon: 'H3',
    keywords: ['heading', 'h3', 'small'],
  },
  {
    type: BLOCK_TYPES.BULLET_LIST,
    label: 'Bullet List',
    description: 'Unordered list item',
    icon: '•',
    keywords: ['bullet', 'list', 'unordered', 'ul'],
  },
  {
    type: BLOCK_TYPES.NUMBERED_LIST,
    label: 'Numbered List',
    description: 'Ordered list item',
    icon: '1.',
    keywords: ['numbered', 'list', 'ordered', 'ol'],
  },
  {
    type: BLOCK_TYPES.TODO,
    label: 'To-do',
    description: 'Checkbox item',
    icon: '☐',
    keywords: ['todo', 'checkbox', 'task', 'check'],
  },
  {
    type: BLOCK_TYPES.QUOTE,
    label: 'Quote',
    description: 'Block quote',
    icon: '"',
    keywords: ['quote', 'blockquote', 'citation'],
  },
  {
    type: BLOCK_TYPES.DIVIDER,
    label: 'Divider',
    description: 'Horizontal line',
    icon: '—',
    keywords: ['divider', 'line', 'hr', 'separator'],
  },
  {
    type: BLOCK_TYPES.CODE,
    label: 'Code',
    description: 'Code block with syntax highlighting',
    icon: '</>',
    keywords: ['code', 'programming', 'syntax'],
  },
  {
    type: BLOCK_TYPES.MATH,
    label: 'Math',
    description: 'LaTeX math equation',
    icon: '∑',
    keywords: ['math', 'latex', 'equation', 'formula'],
  },
  {
    type: BLOCK_TYPES.MERMAID,
    label: 'Diagram',
    description: 'Mermaid diagram',
    icon: '◇',
    keywords: ['diagram', 'mermaid', 'flowchart', 'chart'],
  },
  {
    type: BLOCK_TYPES.CALLOUT,
    label: 'Callout',
    description: 'Highlighted information box',
    icon: '💡',
    keywords: ['callout', 'info', 'warning', 'note', 'alert'],
  },
  {
    type: BLOCK_TYPES.IMAGE,
    label: 'Image',
    description: 'Upload or embed image',
    icon: '🖼',
    keywords: ['image', 'picture', 'photo', 'img'],
  },
];

// =============================================================================
// Editor State
// =============================================================================

export interface BlockEditorState {
  blocks: Block[];
  focusedBlockId: string | null;
  slashMenuOpen: boolean;
  slashMenuBlockId: string | null;
  slashMenuQuery: string;
  isDirty: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
}

// =============================================================================
// Component Props
// =============================================================================

export interface BlockEditorProps {
  pageId: string;
  spaceSlug: string;
  initialBlocks?: Block[];
  readOnly?: boolean;
  onBlocksChange?: (blocks: Block[]) => void;
}

export interface BlockProps {
  block: Block;
  isActive: boolean;
  onContentChange: (content: string) => void;
  onTypeChange: (type: BlockType) => void;
  onDelete: () => void;
  onEnter: () => void;
  onBackspace: () => void;
  onFocus: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  readOnly?: boolean;
}

export interface SlashMenuProps {
  isOpen: boolean;
  query: string;
  onSelect: (type: BlockType) => void;
  onClose: () => void;
  position: { top: number; left: number };
}

// =============================================================================
// Utilities
// =============================================================================

/**
 * Calculate order value for insertion between two blocks
 */
export function calculateOrderBetween(
  orderBefore: number | null,
  orderAfter: number | null
): number {
  if (orderBefore === null && orderAfter === null) {
    return 1000;
  }
  if (orderBefore === null) {
    return orderAfter! - 1000;
  }
  if (orderAfter === null) {
    return orderBefore + 1000;
  }
  return Math.floor((orderBefore + orderAfter) / 2);
}

/**
 * Generate initial order values for a list of blocks
 */
export function generateOrderValues(count: number, startFrom: number = 1000): number[] {
  return Array.from({ length: count }, (_, i) => startFrom + i * 1000);
}

/**
 * Check if a block type supports text editing
 */
export function isEditableBlockType(type: BlockType): boolean {
  return EDITABLE_BLOCK_TYPES.includes(type);
}

/**
 * Check if a block type should continue on Enter
 */
export function isContinuousBlockType(type: BlockType): boolean {
  return CONTINUOUS_BLOCK_TYPES.includes(type);
}

/**
 * Get default content for a block type
 */
export function getDefaultBlockContent(type: BlockType): string {
  switch (type) {
    case BLOCK_TYPES.DIVIDER:
      return '';
    case BLOCK_TYPES.CODE:
      return '// Your code here';
    case BLOCK_TYPES.MATH:
      return 'E = mc^2';
    case BLOCK_TYPES.MERMAID:
      return 'graph TD\n  A[Start] --> B[End]';
    default:
      return '';
  }
}
