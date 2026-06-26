import { buildFinalDocumentationPrompt } from '../prompts/finalDocumentationPrompt';
import { validateFinalDocumentationMarkdown } from '../utils/markdownSpec';

interface GenerateFinalDocsInput {
  markdownSpec: string;
  understandingSummary: string;
  diagramSummary?: string;
}

interface GenerateFinalDocsResult {
  markdown: string;
  valid: boolean;
  missingSections: string[];
}

function buildMarkdown(
  markdownSpec: string,
  understandingSummary: string,
  diagramSummary?: string,
) {
  return `
${markdownSpec}

## System Understanding

${understandingSummary}

## Diagram Explanation

${diagramSummary ?? 'Diagram explanation unavailable.'}
`.trim();
}

export async function generateFinalDocsNode(
  input: GenerateFinalDocsInput,
): Promise<GenerateFinalDocsResult> {
  buildFinalDocumentationPrompt({
    markdownSpec: input.markdownSpec,
    understandingSummary: input.understandingSummary,
    diagramSummary: input.diagramSummary,
  });

  const markdown = buildMarkdown(
    input.markdownSpec,
    input.understandingSummary,
    input.diagramSummary,
  );

  const validation =
    validateFinalDocumentationMarkdown(markdown);

  return {
    markdown,
    valid: validation.valid,
    missingSections: validation.missingSections,
  };
}