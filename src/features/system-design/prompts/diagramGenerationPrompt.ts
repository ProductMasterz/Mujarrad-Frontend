import type { Layer1DiagramGenerationContext } from '../types/layer1.types';

/**
 * System prompt for Task 5 diagram generation.
 *
 * The model must output ONLY Draw.io XML (mxGraphModel). The XML is later
 * extracted, sanitized, and validated before being loaded into the embed.
 */
export const DIAGRAM_GENERATION_SYSTEM_PROMPT = `You are an expert system architect. You convert a clarified system design understanding into a clean, editable Draw.io diagram.

Rules:
- Return ONLY raw Draw.io XML. No markdown fences, no explanation, no surrounding text.
- Use the mxGraphModel format with a <root> element containing mxCell elements.
- The first two cells must be exactly: <mxCell id="0"/><mxCell id="1" parent="0"/>
- Give every other cell a unique numeric id starting from 2.
- Every shape cell needs vertex="1" and an <mxGeometry .../> with x, y, width, height.
- Every connector cell needs edge="1", a source, a target, and an <mxGeometry relative="1" as="geometry"/>.
- Close every mxCell with exactly </mxCell>. NEVER write </mxCell/> or add a stray slash to a closing tag.
- Only self-closing tags (ending in "/>") are <mxGeometry .../> and <mxPoint .../>. Closing tags must end in ">" only.
- Use plain text labels only. Do NOT use the characters & < > " ' inside value attributes.
- Lay out nodes so they do not overlap. Space them at least 160px apart.
- Use appropriate styles: rounded=1 for services/processes, shape=cylinder3 for databases/storage, ellipse for actors/users, rhombus for decisions.
- Connect nodes with labeled edges that show the direction of flow.
- Keep it focused: 5 to 15 nodes that capture the core architecture, main workflow, and key entities.

Output format (follow exactly):
<mxGraphModel><root><mxCell id="0"/><mxCell id="1" parent="0"/>[your cells here]</root></mxGraphModel>`;

/**
 * Build the user prompt from the Task 4 handoff context.
 *
 * IMPORTANT: This uses the cumulative Layer 1 understanding from the
 * diagramGenerationContext (processed input + structured understanding + Q&A +
 * completeness). It must NOT rely on raw user input alone.
 */
export function getDiagramGenerationPrompt(
  context: Layer1DiagramGenerationContext,
): string {
  return `Generate the first editable Draw.io diagram for the following clarified system design.

Use this full Layer 1 context as the single source of truth. Do not invent requirements that contradict it, and do not rely on the raw input alone.

${context.cumulativeUnderstandingText}

Structured Understanding (authoritative):
${JSON.stringify(context.understanding, null, 2)}

Diagram requirements:
1. Visualize the core architecture: main actors/users, services/processes, data stores, and key integrations.
2. Show the primary workflow as a connected, directional flow.
3. Represent the most important entities.
4. Prefer clarity over completeness — capture the essential structure, not every detail.

Return ONLY the Draw.io mxGraphModel XML.`;
}
