import type { Layer1DiagramGenerationContext } from '../types/layer1.types';

/**
 * System prompt for Task 5 diagram generation.
 *
 * Compact prompt to avoid Groq on-demand token limits.
 */
export const DIAGRAM_GENERATION_SYSTEM_PROMPT = `You are an expert system architect. Generate clean editable Draw.io XML.

Return ONLY raw Draw.io mxGraphModel XML. No markdown. No explanation.

Strict Draw.io rules:
- Output exactly one <mxGraphModel><root>...</root></mxGraphModel>.
- First cells must be: <mxCell id="0"/><mxCell id="1" parent="0"/>
- Use unique numeric ids for all other mxCell elements.
- Each shape must have vertex="1" parent="1" and one <mxGeometry x="..." y="..." width="..." height="..." as="geometry"/>.
- Each edge must have edge="1" parent="1" source="..." target="..." and one <mxGeometry relative="1" as="geometry"/>.
- Do not nest mxCell inside mxCell.
- Do not put mxGeometry directly under root.
- Use 4 to 8 clear nodes maximum.
- Use plain labels. Avoid special XML characters.
- Prefer actors, services, data stores, and directional workflow edges.

Example:
<mxGraphModel><root><mxCell id="0"/><mxCell id="1" parent="0"/><mxCell id="2" value="User" style="ellipse;whiteSpace=wrap;html=1;" vertex="1" parent="1"><mxGeometry x="40" y="120" width="120" height="60" as="geometry"/></mxCell><mxCell id="3" value="Service" style="rounded=1;whiteSpace=wrap;html=1;" vertex="1" parent="1"><mxGeometry x="240" y="120" width="160" height="70" as="geometry"/></mxCell><mxCell id="4" value="uses" style="endArrow=block;html=1;rounded=0;" edge="1" parent="1" source="2" target="3"><mxGeometry relative="1" as="geometry"/></mxCell></root></mxGraphModel>`;

/**
 * Build a compact prompt from Layer 1 context.
 * This avoids hardcoded SystemUnderstanding fields and keeps Groq requests small.
 */
export function getDiagramGenerationPrompt(
  context: Layer1DiagramGenerationContext,
): string {
  const understanding = context.understanding as unknown as Record<string, unknown>;

  const compactUnderstanding = Object.fromEntries(
    Object.entries(understanding)
      .filter(([, value]) => value !== null && value !== undefined && value !== '')
      .slice(0, 12),
  );

  const shortContext =
    context.cumulativeUnderstandingText?.slice(0, 600) ||
    'No additional cumulative understanding text provided.';

  return `Generate an editable Draw.io architecture/workflow diagram from this compact Layer 1 understanding.

Use only this information. Prefer clarity over completeness.

Short Layer 1 context:
${shortContext}

Structured understanding:
${JSON.stringify(compactUnderstanding, null, 2).slice(0, 1200)}

Diagram must include:
- main users or actors if present
- core services or processes
- important entities or data stores
- main directional workflow
- important integrations if present

Return ONLY Draw.io mxGraphModel XML. Start with <mxGraphModel> and end with </mxGraphModel>. Do not truncate.`;
}
