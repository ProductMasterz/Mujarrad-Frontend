/**
 * Shared, dependency-free markdown helpers used by both the server-side docs
 * loader and the client-side renderer. Keeping slug generation in ONE place
 * guarantees the table-of-contents anchors match the ids emitted for headings.
 */

export interface TocItem {
  id: string;
  title: string;
  level: number;
}

/** GitHub-style heading slug. Must stay in sync between TOC and rendered ids. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[`*_~]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Extract h2/h3 headings (skipping fenced code) into a table of contents. */
export function extractToc(markdown: string): TocItem[] {
  const toc: TocItem[] = [];
  let inFence = false;

  for (const line of markdown.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const match = /^(#{2,3})\s+(.*)$/.exec(line);
    if (match) {
      const level = match[1].length;
      const title = match[2].replace(/[`*]/g, '').trim();
      toc.push({ id: slugify(title), title, level });
    }
  }
  return toc;
}

/** Flatten markdown to plain lowercase text for client-side search. */
export function stripMarkdownForSearch(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/[#>*|_~\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}
