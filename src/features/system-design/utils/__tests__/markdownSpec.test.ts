import { describe, expect, it } from '@jest/globals';

import { FINAL_DOCUMENTATION_SECTIONS } from '../../tools/markdownSpecTool';
import { validateFinalDocumentationMarkdown } from '../markdownSpec';

function buildMarkdownWithSections(sections: readonly string[]): string {
  return sections.map((section) => `# ${section}\n\nContent for ${section}.`).join('\n\n');
}

describe('validateFinalDocumentationMarkdown', () => {
  it('is valid when every required section heading is present', () => {
    const markdown = buildMarkdownWithSections(FINAL_DOCUMENTATION_SECTIONS);
    const result = validateFinalDocumentationMarkdown(markdown);

    expect(result.valid).toBe(true);
    expect(result.missingSections).toEqual([]);
  });

  it('reports missing sections when headings are absent', () => {
    const [, ...sectionsWithoutFirst] = FINAL_DOCUMENTATION_SECTIONS;
    const markdown = buildMarkdownWithSections(sectionsWithoutFirst);
    const result = validateFinalDocumentationMarkdown(markdown);

    expect(result.valid).toBe(false);
    expect(result.missingSections).toEqual([FINAL_DOCUMENTATION_SECTIONS[0]]);
  });

  it('is invalid for empty markdown and lists all sections as missing', () => {
    const result = validateFinalDocumentationMarkdown('');

    expect(result.valid).toBe(false);
    expect(result.missingSections).toEqual([...FINAL_DOCUMENTATION_SECTIONS]);
  });

  it('matches headings as exact "# Section" lines, not partial text', () => {
    // "Goals" is a required section; this text mentions the word but never
    // as a top-level heading, so it should still be reported missing.
    const markdown = 'Some text that talks about our Goals informally.';
    const result = validateFinalDocumentationMarkdown(markdown);

    expect(result.missingSections).toContain('Goals');
  });
});
