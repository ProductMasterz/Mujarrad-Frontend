/**
 * Card display types matching Scratchup design
 */
export enum CardType {
  /** Rounded square (empty) - Context with no children */
  EMPTY_CONTEXT = 'empty_context',
  /** Rounded square with 3 circles - Context with children */
  FULFILLED_CONTEXT = 'fulfilled_context',
  /** Graph visualization - Context with whiteboard */
  GRAPH_CONTEXT = 'graph_context',
  /** Leaf node - Page/document node */
  NODE = 'node',
}

/**
 * Card data structure matching Scratchup
 */
export interface CardData {
  id: string;
  title: string;
  color: string;
  type: CardType;
  showInfo?: boolean;
  children?: CardData[];
}

/**
 * Default card colors
 */
export const DEFAULT_COLORS = {
  context: '#333333',
  node: '#248bf2',
  secondary: '#625e5e',
  highlight: '#d97979',
  info: '#e4f1ff',
} as const;
