import { describe, it, expect } from '@jest/globals';
import { parseWikiLinks, resolveWikiLinkTarget } from '@/lib/wikilink-parser';
import type { Node } from '@/types/entities';
import type { WikiLink } from '@/types/wikilink';

describe('Wiki-link Parser Unit Tests', () => {
  describe('T016: parseWikiLinks extracts [[Target]] patterns', () => {
    it('should extract single wiki-link', () => {
      const markdown = 'See [[Target Page]] for more info.';
      const links = parseWikiLinks(markdown);

      expect(links).toHaveLength(1);
      expect(links[0]).toMatchObject({
        raw: '[[Target Page]]',
        displayText: 'Target Page',
        targetTitle: 'Target Page',
        startIndex: 4,
        endIndex: 19,
      });
    });

    it('should extract multiple wiki-links', () => {
      const markdown = 'Check [[Page A]] and [[Page B]] for details.';
      const links = parseWikiLinks(markdown);

      expect(links).toHaveLength(2);
      expect(links[0].targetTitle).toBe('Page A');
      expect(links[1].targetTitle).toBe('Page B');
    });

    it('should extract wiki-links across multiple lines', () => {
      const markdown = `First paragraph with [[Link 1]].

Second paragraph with [[Link 2]].`;
      const links = parseWikiLinks(markdown);

      expect(links).toHaveLength(2);
      expect(links[0].targetTitle).toBe('Link 1');
      expect(links[1].targetTitle).toBe('Link 2');
    });

    it('should handle wiki-links at start and end of string', () => {
      const markdown = '[[Start Link]] middle text [[End Link]]';
      const links = parseWikiLinks(markdown);

      expect(links).toHaveLength(2);
      expect(links[0].targetTitle).toBe('Start Link');
      expect(links[1].targetTitle).toBe('End Link');
    });

    it('should extract wiki-links with spaces and special characters', () => {
      const markdown = 'See [[My Special Page: Notes]] here.';
      const links = parseWikiLinks(markdown);

      expect(links).toHaveLength(1);
      expect(links[0].targetTitle).toBe('My Special Page: Notes');
    });

    it('should return empty array when no wiki-links found', () => {
      const markdown = 'Just plain text without any links.';
      const links = parseWikiLinks(markdown);

      expect(links).toHaveLength(0);
      expect(Array.isArray(links)).toBe(true);
    });

    it('should return empty array for empty string', () => {
      const markdown = '';
      const links = parseWikiLinks(markdown);

      expect(links).toHaveLength(0);
    });
  });

  describe('T017: parseWikiLinks handles [[Display|Target]] aliases', () => {
    it('should extract aliased wiki-link', () => {
      const markdown = 'Read [[this article|Einstein Theory]].';
      const links = parseWikiLinks(markdown);

      expect(links).toHaveLength(1);
      expect(links[0]).toMatchObject({
        raw: '[[this article|Einstein Theory]]',
        displayText: 'this article',
        targetTitle: 'Einstein Theory',
      });
    });

    it('should handle multiple aliased links', () => {
      const markdown = 'See [[intro|Introduction]] and [[conclusion|Summary]].';
      const links = parseWikiLinks(markdown);

      expect(links).toHaveLength(2);
      expect(links[0].displayText).toBe('intro');
      expect(links[0].targetTitle).toBe('Introduction');
      expect(links[1].displayText).toBe('conclusion');
      expect(links[1].targetTitle).toBe('Summary');
    });

    it('should handle alias with spaces', () => {
      const markdown = 'Check [[see this page|Target Page Name]].';
      const links = parseWikiLinks(markdown);

      expect(links).toHaveLength(1);
      expect(links[0].displayText).toBe('see this page');
      expect(links[0].targetTitle).toBe('Target Page Name');
    });

    it('should handle mix of aliased and non-aliased links', () => {
      const markdown = 'See [[Page A]] and [[alias|Page B]].';
      const links = parseWikiLinks(markdown);

      expect(links).toHaveLength(2);
      expect(links[0].displayText).toBe('Page A');
      expect(links[0].targetTitle).toBe('Page A');
      expect(links[1].displayText).toBe('alias');
      expect(links[1].targetTitle).toBe('Page B');
    });

    it('should handle alias with special characters', () => {
      const markdown = 'Read [[see: this|Page: Notes]].';
      const links = parseWikiLinks(markdown);

      expect(links).toHaveLength(1);
      expect(links[0].displayText).toBe('see: this');
      expect(links[0].targetTitle).toBe('Page: Notes');
    });
  });

  describe('T018: parseWikiLinks edge cases (empty, escaped, multiple)', () => {
    it('should handle escaped brackets', () => {
      const markdown = 'This is \\[\\[not a link\\]\\] but this [[is a link]].';
      const links = parseWikiLinks(markdown);

      expect(links).toHaveLength(1);
      expect(links[0].targetTitle).toBe('is a link');
    });

    it('should handle nested brackets', () => {
      const markdown = 'Test [[Page [with brackets]]] here.';
      const links = parseWikiLinks(markdown);

      // Should match up to first closing ]]
      expect(links).toHaveLength(1);
      expect(links[0].targetTitle).toBe('Page [with brackets');
    });

    it('should handle malformed wiki-links (single bracket)', () => {
      const markdown = 'This has [single bracket] not [[double]].';
      const links = parseWikiLinks(markdown);

      expect(links).toHaveLength(1);
      expect(links[0].targetTitle).toBe('double');
    });

    it('should handle empty wiki-link', () => {
      const markdown = 'Empty link: [[]] and valid [[Page]].';
      const links = parseWikiLinks(markdown);

      // Empty link should still be extracted (even if invalid)
      expect(links.length).toBeGreaterThanOrEqual(1);
      // At minimum, should extract the valid one
      const validLinks = links.filter(l => l.targetTitle.length > 0);
      expect(validLinks).toHaveLength(1);
      expect(validLinks[0].targetTitle).toBe('Page');
    });

    it('should handle wiki-link with only pipe', () => {
      const markdown = 'Invalid: [[|]] and valid [[Display|Target]].';
      const links = parseWikiLinks(markdown);

      // Should extract both, even if first is invalid
      const validLinks = links.filter(l => l.targetTitle.length > 0);
      expect(validLinks.length).toBeGreaterThanOrEqual(1);
      expect(validLinks[validLinks.length - 1].targetTitle).toBe('Target');
    });

    it('should handle consecutive wiki-links', () => {
      const markdown = '[[Link 1]][[Link 2]][[Link 3]]';
      const links = parseWikiLinks(markdown);

      expect(links).toHaveLength(3);
      expect(links[0].targetTitle).toBe('Link 1');
      expect(links[1].targetTitle).toBe('Link 2');
      expect(links[2].targetTitle).toBe('Link 3');
    });

    it('should handle wiki-links in code blocks (should still extract)', () => {
      const markdown = '`Code: [[Link 1]]` and text [[Link 2]].';
      const links = parseWikiLinks(markdown);

      // Regex will extract both (code context awareness is for rendering)
      expect(links).toHaveLength(2);
      expect(links[0].targetTitle).toBe('Link 1');
      expect(links[1].targetTitle).toBe('Link 2');
    });

    it('should preserve position information correctly', () => {
      const markdown = '0123456789[[Page]]0123456789';
      const links = parseWikiLinks(markdown);

      expect(links).toHaveLength(1);
      expect(links[0].startIndex).toBe(10);
      expect(links[0].endIndex).toBe(18); // 10 + '[[Page]]'.length
      expect(markdown.substring(links[0].startIndex, links[0].endIndex)).toBe('[[Page]]');
    });

    it('should handle very long wiki-links', () => {
      const longTitle = 'This is a very long page title with many words and characters';
      const markdown = `See [[${longTitle}]] for details.`;
      const links = parseWikiLinks(markdown);

      expect(links).toHaveLength(1);
      expect(links[0].targetTitle).toBe(longTitle);
    });

    it('should handle unicode characters in wiki-links', () => {
      const markdown = 'See [[日本語ページ]] and [[Café Notes]].';
      const links = parseWikiLinks(markdown);

      expect(links).toHaveLength(2);
      expect(links[0].targetTitle).toBe('日本語ページ');
      expect(links[1].targetTitle).toBe('Café Notes');
    });
  });

  describe('T023: resolveWikiLinkTarget matches title case-insensitively', () => {
    const mockNodes: Node[] = [
      {
        id: 'node-1',
        workspaceId: 'ws-1',
        title: 'My Page',
        slug: 'my-page',
        nodeType: 'REGULAR',
        markdownContent: '',
        nodeDetails: {},
        createdBy: 'user-1',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        version: 1,
      },
      {
        id: 'node-2',
        workspaceId: 'ws-1',
        title: 'Another Page',
        slug: 'another-page',
        nodeType: 'REGULAR',
        markdownContent: '',
        nodeDetails: {},
        createdBy: 'user-1',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        version: 1,
      },
      {
        id: 'node-3',
        workspaceId: 'ws-1',
        title: 'UPPERCASE TITLE',
        slug: 'uppercase-title',
        nodeType: 'REGULAR',
        markdownContent: '',
        nodeDetails: {},
        createdBy: 'user-1',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        version: 1,
      },
    ];

    it('should match title case-insensitively (lowercase input)', () => {
      const result = resolveWikiLinkTarget('my page', mockNodes);

      expect(result).not.toBeNull();
      expect(result?.id).toBe('node-1');
      expect(result?.title).toBe('My Page');
    });

    it('should match title case-insensitively (uppercase input)', () => {
      const result = resolveWikiLinkTarget('MY PAGE', mockNodes);

      expect(result).not.toBeNull();
      expect(result?.id).toBe('node-1');
    });

    it('should match title case-insensitively (mixed case input)', () => {
      const result = resolveWikiLinkTarget('mY pAgE', mockNodes);

      expect(result).not.toBeNull();
      expect(result?.id).toBe('node-1');
    });

    it('should match uppercase title with lowercase input', () => {
      const result = resolveWikiLinkTarget('uppercase title', mockNodes);

      expect(result).not.toBeNull();
      expect(result?.id).toBe('node-3');
      expect(result?.title).toBe('UPPERCASE TITLE');
    });

    it('should return null for non-existent title', () => {
      const result = resolveWikiLinkTarget('Nonexistent Page', mockNodes);

      expect(result).toBeNull();
    });

    it('should handle empty nodes array', () => {
      const result = resolveWikiLinkTarget('Any Page', []);

      expect(result).toBeNull();
    });

    it('should trim whitespace from input', () => {
      const result = resolveWikiLinkTarget('  My Page  ', mockNodes);

      expect(result).not.toBeNull();
      expect(result?.id).toBe('node-1');
    });

    it('should match exact title when multiple similar titles exist', () => {
      const nodesWithSimilar: Node[] = [
        ...mockNodes,
        {
          id: 'node-4',
          workspaceId: 'ws-1',
          title: 'My Page 2',
          slug: 'my-page-2',
          nodeType: 'REGULAR',
          markdownContent: '',
          nodeDetails: {},
          createdBy: 'user-1',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
          version: 1,
        },
      ];

      const result = resolveWikiLinkTarget('my page', nodesWithSimilar);

      expect(result).not.toBeNull();
      expect(result?.id).toBe('node-1');
      expect(result?.title).toBe('My Page');
    });
  });
});
