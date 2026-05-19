import type { BlockType } from './types';
import { BLOCK_TYPES } from './types';

export const BLOCK_META: Record<
  BlockType,
  {
    label: string;
    shortLabel: string;
    tone: string;
  }
> = {
  [BLOCK_TYPES.TEXT]: {
    label: 'Text',
    shortLabel: 'T',
    tone: 'text-zinc-500 dark:text-zinc-400',
  },
  [BLOCK_TYPES.HEADING_1]: {
    label: 'Heading 1',
    shortLabel: 'H1',
    tone: 'text-blue-600 dark:text-blue-400',
  },
  [BLOCK_TYPES.HEADING_2]: {
    label: 'Heading 2',
    shortLabel: 'H2',
    tone: 'text-sky-600 dark:text-sky-400',
  },
  [BLOCK_TYPES.HEADING_3]: {
    label: 'Heading 3',
    shortLabel: 'H3',
    tone: 'text-cyan-600 dark:text-cyan-400',
  },
  [BLOCK_TYPES.BULLET_LIST]: {
    label: 'Bullet List',
    shortLabel: '•',
    tone: 'text-emerald-600 dark:text-emerald-400',
  },
  [BLOCK_TYPES.NUMBERED_LIST]: {
    label: 'Numbered List',
    shortLabel: '1.',
    tone: 'text-emerald-600 dark:text-emerald-400',
  },
  [BLOCK_TYPES.TODO]: {
    label: 'To-do',
    shortLabel: '☑',
    tone: 'text-amber-600 dark:text-amber-400',
  },
  [BLOCK_TYPES.QUOTE]: {
    label: 'Quote',
    shortLabel: '❝',
    tone: 'text-violet-600 dark:text-violet-400',
  },
  [BLOCK_TYPES.DIVIDER]: {
    label: 'Divider',
    shortLabel: '—',
    tone: 'text-zinc-400 dark:text-zinc-500',
  },
  [BLOCK_TYPES.IMAGE]: {
    label: 'Image',
    shortLabel: 'Img',
    tone: 'text-pink-600 dark:text-pink-400',
  },
  [BLOCK_TYPES.CODE]: {
    label: 'Code',
    shortLabel: '</>',
    tone: 'text-orange-600 dark:text-orange-400',
  },
  [BLOCK_TYPES.MATH]: {
    label: 'Math',
    shortLabel: '∑',
    tone: 'text-fuchsia-600 dark:text-fuchsia-400',
  },
  [BLOCK_TYPES.MERMAID]: {
    label: 'Diagram',
    shortLabel: '◇',
    tone: 'text-teal-600 dark:text-teal-400',
  },
  [BLOCK_TYPES.CALLOUT]: {
    label: 'Callout',
    shortLabel: '!',
    tone: 'text-yellow-600 dark:text-yellow-400',
  },
};