import type { Layer1GraphState } from '../types/graph.types';
import {
  DIAGRAM_GENERATION_SYSTEM_PROMPT,
  getDiagramGenerationPrompt,
} from '../prompts/diagramGenerationPrompt';
import { callAiProvider } from '../tools/aiProviderTool';
import { extractAndRepairDrawioXml } from '../utils/drawioXml';

export interface GenerateDiagramNodeResult {
  xml: string | null;
  summary: string;
  warnings: string[];
  error?: string;
}

function buildDiagramSummary(state: Layer1GraphState): string {
  const understanding = state.understanding;
  const summary = understanding.summary?.trim();
  const goal = understanding.goal?.trim();

  if (summary) {
    return summary;
  }

  if (goal) {
    return `Initial system diagram for: ${goal}`;
  }

  return 'Initial system diagram generated from the Layer 1 clarification.';
}

/**
 * Task 5 — Draw.io diagram generation node.
 *
 * Generates the first editable diagram strictly from the Task 4
 * diagramGenerationContext. The AI output is extracted, sanitized, repaired,
 * and validated before it is returned. Invalid XML is rejected (returned as an
 * error) so it is never loaded into the embed.
 */
export async function generateDiagramNode(
  state: Layer1GraphState,
): Promise<GenerateDiagramNodeResult> {
  const context = state.diagramGenerationContext;

  if (!context) {
    return {
      xml: null,
      summary: '',
      warnings: [],
      error:
        'Diagram generation requires a prepared diagramGenerationContext. Complete or skip clarification first.',
    };
  }

  try {
    const raw = await callAiProvider(
      [
        { role: 'system', content: DIAGRAM_GENERATION_SYSTEM_PROMPT },
        { role: 'user', content: getDiagramGenerationPrompt(context) },
      ],
      {
        temperature: 0,
        maxTokens: 1800,
        modelRole: 'diagram',
        responseFormat: 'text',
      },
    );

    const { xml, warnings, valid } = extractAndRepairDrawioXml(raw);

    if (!valid) {
      return {
        xml: null,
        summary: '',
        warnings,
        error:
          'The AI did not return valid Draw.io XML. Please try generating the diagram again.',
      };
    }

    return {
      xml,
      summary: buildDiagramSummary(state),
      warnings,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Diagram generation failed.';

    return {
      xml: null,
      summary: '',
      warnings: [],
      error: message,
    };
  }
}
