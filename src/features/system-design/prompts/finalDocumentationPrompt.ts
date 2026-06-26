export function buildFinalDocumentationPrompt(input: {
  markdownSpec: string;
  understandingSummary: string;
  diagramSummary?: string;
}) {
  return `
Generate the final Layer 1 system documentation.

Requirements:
- Return markdown only.
- Follow the provided structure.
- Use approved understanding.
- Explain the approved diagram.
- Do not redesign the system.

Markdown Structure:

${input.markdownSpec}

System Understanding:

${input.understandingSummary}

Diagram Summary:

${input.diagramSummary ?? 'Not available'}
`;
}