import { FINAL_DOCUMENTATION_SECTIONS } from '../tools/markdownSpecTool';

export interface MarkdownValidationResult {
  valid: boolean;
  missingSections: string[];
}

export function validateFinalDocumentationMarkdown(
  markdown: string,
): MarkdownValidationResult {
  const missingSections = FINAL_DOCUMENTATION_SECTIONS.filter(
    (section) => !markdown.includes(`# ${section}`),
  );

  return {
    valid: missingSections.length === 0,
    missingSections,
  };
}