/**
 * Server-only docs loader. Reads the markdown source of truth from `docs/` at
 * build time and produces the fully-structured data the interactive docs shell
 * renders. Editing the markdown files under `docs/guide` and `docs/uml` is now
 * the ONLY thing needed to change what `/docs` publishes.
 */

import fs from 'fs';
import path from 'path';
import { extractToc, stripMarkdownForSearch, TocItem } from './markdown-utils';

export interface SwaggerTag {
  tag: string;
  title: string;
}

export interface DocSection {
  slug: string;
  title: string;
  group: string;
  content: string;
  toc: TocItem[];
  swaggerTags: SwaggerTag[];
  searchText: string;
}

export interface DocGroup {
  id: string;
  title: string;
  icon: string;
  sections: { slug: string; title: string }[];
}

export interface DocsData {
  sections: DocSection[];
  groups: DocGroup[];
}

interface Entry {
  slug: string;
  title: string;
  file: string;
  swaggerTags?: SwaggerTag[];
}

interface GroupDef {
  id: string;
  title: string;
  icon: string; // lucide icon name, resolved on the client
  dir: string; // subdirectory under docs/
  entries: Entry[];
}

const MANIFEST: GroupDef[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: 'Rocket',
    dir: 'guide',
    entries: [{ slug: 'introduction', title: 'Introduction', file: 'introduction.md' }],
  },
  {
    id: 'core-concepts',
    title: 'Core Concepts',
    icon: 'Layers',
    dir: 'guide',
    entries: [
      { slug: 'organizations', title: 'Organizations', file: 'organizations.md', swaggerTags: [{ tag: 'organization', title: 'Organization' }] },
      { slug: 'spaces', title: 'Spaces', file: 'spaces.md', swaggerTags: [{ tag: 'space', title: 'Space' }] },
      { slug: 'contexts', title: 'Contexts', file: 'contexts.md', swaggerTags: [{ tag: 'context', title: 'Context' }] },
      { slug: 'nodes', title: 'Nodes', file: 'nodes.md', swaggerTags: [{ tag: 'node', title: 'Node' }] },
      { slug: 'blocks', title: 'Blocks', file: 'blocks.md', swaggerTags: [{ tag: 'node', title: 'Node (Blocks)' }] },
    ],
  },
  {
    id: 'special-areas',
    title: 'Special Areas',
    icon: 'Shield',
    dir: 'guide',
    entries: [
      { slug: 'the-void', title: 'The Void', file: 'the-void.md', swaggerTags: [{ tag: 'void', title: 'Void' }] },
      { slug: 'the-blank', title: 'The Blank', file: 'the-blank.md', swaggerTags: [{ tag: 'blank', title: 'Blank' }] },
    ],
  },
  {
    id: 'advanced',
    title: 'Advanced',
    icon: 'Lock',
    dir: 'guide',
    entries: [
      { slug: 'locking', title: 'Locking', file: 'locking.md', swaggerTags: [{ tag: 'node', title: 'Node (Locking)' }] },
      {
        slug: 'relationships',
        title: 'Relationships',
        file: 'relationships.md',
        swaggerTags: [
          { tag: 'attribute', title: 'Attribute' },
          { tag: 'virtual-context', title: 'Virtual Context' },
        ],
      },
      { slug: 'migration', title: 'Migration', file: 'migration.md', swaggerTags: [{ tag: 'node', title: 'Node (Migration)' }] },
    ],
  },
  {
    id: 'tutorials',
    title: 'Tutorials',
    icon: 'GraduationCap',
    dir: 'guide',
    entries: [{ slug: 'building-a-backend-app', title: 'Build a BACKEND App', file: 'building-a-backend-app.md' }],
  },
  {
    id: 'reference',
    title: 'Reference',
    icon: 'Code',
    dir: 'guide',
    entries: [
      { slug: 'pagination', title: 'Pagination', file: 'pagination.md' },
      { slug: 'release-notes', title: 'Release Notes', file: 'release-notes.md' },
    ],
  },
  {
    id: 'diagrams',
    title: 'Diagrams',
    icon: 'Share2',
    dir: 'uml',
    entries: [
      { slug: 'entity-relationship', title: 'Entity Relationship', file: '01-entity-relationship.md' },
      { slug: 'navigation-flow', title: 'Navigation Flow', file: '02-navigation-flow.md' },
      { slug: 'node-creation', title: 'Node Creation', file: '03-node-creation-sequence.md' },
      { slug: 'component-architecture', title: 'Component Architecture', file: '04-component-architecture.md' },
      { slug: 'view-state-machine', title: 'View State Machine', file: '05-view-state-machine.md' },
      { slug: 'cache-invalidation', title: 'Cache Invalidation', file: '06-cache-invalidation.md' },
    ],
  },
];

export function getDocsData(): DocsData {
  const root = process.cwd();
  const sections: DocSection[] = [];
  const groups: DocGroup[] = [];

  for (const group of MANIFEST) {
    const groupSections: { slug: string; title: string }[] = [];

    for (const entry of group.entries) {
      const fullPath = path.join(root, 'docs', group.dir, entry.file);
      let content: string;
      try {
        content = fs.readFileSync(fullPath, 'utf8');
      } catch {
        content = `# ${entry.title}\n\n_Documentation for this section is not available._`;
      }

      sections.push({
        slug: entry.slug,
        title: entry.title,
        group: group.id,
        content,
        toc: extractToc(content),
        swaggerTags: entry.swaggerTags ?? [],
        searchText: stripMarkdownForSearch(content),
      });
      groupSections.push({ slug: entry.slug, title: entry.title });
    }

    groups.push({ id: group.id, title: group.title, icon: group.icon, sections: groupSections });
  }

  return { sections, groups };
}
