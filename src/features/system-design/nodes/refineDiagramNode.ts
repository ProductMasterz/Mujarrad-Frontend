import type { Layer1GraphState } from '../types/graph.types';
import {
  DIAGRAM_REFINEMENT_SYSTEM_PROMPT,
  getDiagramRefinementPrompt,
} from '../prompts/diagramRefinementPrompt';
import {
  callAiProviderWithUsage,
  type AiTokenUsage,
} from '../tools/aiProviderTool';
import { extractAndRepairDrawioXml } from '../utils/drawioXml';

export interface RefineDiagramNodeResult {
  xml: string | null;
  summary: string;
  warnings: string[];
  usage: AiTokenUsage | null;
  error?: string;
}

export async function refineDiagramNode(
  state: Layer1GraphState,
  refinementInstruction: string,
): Promise<RefineDiagramNodeResult> {
  const instruction = refinementInstruction.trim();
  let usage: AiTokenUsage | null = null;

  if (!instruction) {
    return {
      xml: null,
      summary: '',
      warnings: [],
      usage,
      error: 'Refinement instruction is required.',
    };
  }

  if (!state.diagramGenerationContext) {
    return {
      xml: null,
      summary: '',
      warnings: [],
      usage,
      error:
        'Diagram refinement requires diagramGenerationContext from Task 4.',
    };
  }

  if (!state.drawioXml.trim()) {
    return {
      xml: null,
      summary: '',
      warnings: [],
      usage,
      error: 'No current Draw.io XML exists to refine.',
    };
  }

  try {
    const result = await callAiProviderWithUsage(
      [
        {
          role: 'system',
          content: DIAGRAM_REFINEMENT_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: getDiagramRefinementPrompt({
            state,
            currentXml: state.drawioXml,
            refinementInstruction: instruction,
          }),
        },
      ],
      {
        modelRole: 'diagram',
        temperature: 0,
        maxTokens: 1800,
        responseFormat: 'text',
      },
    );

    usage = result.usage;

    const { xml, warnings, valid } =
      extractAndRepairDrawioXml(result.content);

    if (!valid) {
      return {
        xml: null,
        summary: '',
        warnings,
        usage,
        error:
          'The AI did not return valid Draw.io XML. Please try a clearer refinement instruction.',
      };
    }

    return {
      xml,
      summary: `AI refinement applied: ${instruction}`,
      warnings,
      usage,
    };
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : 'Diagram refinement failed.';

    return {
      xml: null,
      summary: '',
      warnings: [],
      usage,
      error: message,
    };
  }
}
