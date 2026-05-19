export enum CardType {
  EMPTY_CONTEXT = "empty_context",        // Rounded square (empty)
  FULFILLED_CONTEXT = "fulfilled_context", // Rounded square with 3 circles in a grid
  GRAPH_CONTEXT = "graph_context",        // Rounded square with graph shape (connected nodes)
  NODE = "node"                           // Simple circle (leaf node with markdown only)
}

export type Card = {
  id: string;
  title: string;
  color: string;
  type: CardType;
  showInfo?: boolean;
  children?: Card[];
};

export const projectsData: Card[] = [
  {
    id: "void",
    title: "Void",
    color: "#333",
    type: CardType.FULFILLED_CONTEXT, // Has children
    children: [
      {
        id: "void-blank-context",
        title: "Void Blank Context",
        color: "#625e5e",
        type: CardType.EMPTY_CONTEXT, // No children
        children: [],
      },
      {
        id: "untitled",
        title: "Untitled",
        color: "#625e5e",
        type: CardType.EMPTY_CONTEXT, // No children
        children: [],
      },
      {
        id: "context-without-spa",
        title: "Context without spa...",
        color: "#625e5e",
        type: CardType.EMPTY_CONTEXT, // No children
        children: [],
      },
    ],
  },
  {
    id: "scratch-up",
    title: "Scratch Up",
    color: "#d97979",
    type: CardType.FULFILLED_CONTEXT, // Has children
    children: [
      {
        id: "scratch-up-blank",
        title: "Scratch Up Blank",
        color: "#625e5e",
        type: CardType.EMPTY_CONTEXT, // No children
        showInfo: true,
        children: [],
      },
      {
        id: "okrs",
        title: "OKRs",
        color: "#e4f1ff",
        type: CardType.EMPTY_CONTEXT, // No children
        children: [],
      },
      {
        id: "user-story-map",
        title: "User Story Map",
        color: "#e4f1ff",
        type: CardType.FULFILLED_CONTEXT, // Has children
        children: [
          {
            id: "journeys",
            title: "Journeys",
            color: "#e4f1ff",
            type: CardType.GRAPH_CONTEXT, // Has graph of nodes inside
            children: [
              {
                id: "scratchup-verse-navigation",
                title: "Scratchup-Verse Navigation",
                color: "#1289ff",
                type: CardType.NODE,
                children: [],
              },
              {
                id: "application-modes",
                title: "Application Modes",
                color: "#1289ff",
                type: CardType.NODE,
                children: [],
              },
              {
                id: "node",
                title: "Node",
                color: "#1289ff",
                type: CardType.NODE,
                children: [],
              },
              {
                id: "nodinformation-attribution",
                title: "NodInformation Attribution",
                color: "#1289ff",
                type: CardType.NODE,
                children: [],
              },
            ],
          },
          {
            id: "steps",
            title: "Steps",
            color: "#e4f1ff",
            type: CardType.EMPTY_CONTEXT, // No children
            children: [],
          },
          {
            id: "stories",
            title: "Stories",
            color: "#e4f1ff",
            type: CardType.EMPTY_CONTEXT, // No children
            children: [],
          },
        ],
      },
    ],
  },
];

// Helper function to find a card by path
export function findCardByPath(path: string[]): { card: Card | null; parentPath: string[] } {
  if (path.length === 0) {
    return { card: null, parentPath: [] };
  }

  let current: Card[] = projectsData;
  let found: Card | null = null;
  const parentPath: string[] = [];

  for (let i = 0; i < path.length; i++) {
    const segment = path[i];
    const card = current.find((c) => c.id === segment);

    if (!card) {
      return { card: null, parentPath };
    }

    if (i === path.length - 1) {
      found = card;
    } else {
      parentPath.push(card.title);
      current = card.children || [];
    }
  }

  return { card: found, parentPath };
}

// Helper function to get current cards to display
export function getCurrentCards(path: string[]): Card[] {
  if (path.length === 0) {
    return projectsData;
  }

  const { card } = findCardByPath(path);
  return card?.children || [];
}

// Helper function to build breadcrumb
export function buildBreadcrumb(path: string[]): Array<{ id: string; title: string }> {
  const breadcrumb: Array<{ id: string; title: string }> = [];
  let current: Card[] = projectsData;

  for (const segment of path) {
    const card = current.find((c) => c.id === segment);
    if (card) {
      breadcrumb.push({ id: card.id, title: card.title });
      current = card.children || [];
    }
  }

  return breadcrumb;
}
