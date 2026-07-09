import type {
  CurrentDiagramAnalysis,
  DiagramContextSelection,
  DiagramRefinementIntent,
} from '../../types/diagramIntelligence.types';

import {
  getDiagramExpertGuidance,
} from '../../diagram-intelligence/diagramExpertGuidance';

export interface TransformationPlanPromptInput {
  instruction: string;

  intent: DiagramRefinementIntent;

  currentDiagramAnalysis?: CurrentDiagramAnalysis;

  contextSelection?: DiagramContextSelection;
}

export function buildTransformationPlanMessages(
  input: TransformationPlanPromptInput,
) {
  const targetType =
    input.intent.targetDiagramType === 'auto'
      ? input.currentDiagramAnalysis
          ?.detectedDiagramType ?? 'generic'
      : input.intent.targetDiagramType;

  const expertGuidance =
    getDiagramExpertGuidance(
      targetType,
    );

  return [
    {
      role: 'system' as const,

      content: `You are the Expert Transformation Planner of the Mujarrad Diagram Intelligence Engine.

Your job is to design the best semantic transformation strategy before any diagram modification occurs.

You are NOT generating Draw.io XML.
You are NOT performing the final modification.
You are NOT allowed to invent arbitrary complexity.

You receive:

- the user's actual request
- interpreted refinement intent
- analysis of the existing diagram
- focused system context
- expert guidance for the target diagram representation

Your responsibilities:

1. Decide what must be preserved.
2. Decide what must be transformed.
3. Decide what must be added.
4. Decide what must be removed.
5. Decide how relationships must change.
6. Decide whether architecture changes are justified.
7. Decide the correct representation strategy.
8. Decide the required visual-layout strategy.
9. Define validation criteria for later stages.
10. Identify risks and assumptions.

Professional planning principles:

- Preserve confirmed business meaning unless explicitly allowed otherwise.
- Do not add fashionable technology without system justification.
- Do not remove important semantics merely to simplify the picture.
- Distinguish architecture transformation from representation transformation.
- A diagram-type conversion may require semantic reconstruction, not shape replacement.
- A production-readiness request requires architectural reasoning, not decoration.
- Audience changes may require different abstraction, not different facts.
- Missing concepts identified by analysis are observations, not automatic additions.
- When uncertainty exists, record assumptions explicitly.
- Avoid unnecessary changes.
- Prefer coherent architecture over maximum component count.
- Plan for readability as part of correctness.

Output efficiency:

- Keep every array concise and focused.
- Use short transformation-step reasons.
- Do not repeat the same decision across preserve, add, steps, and architectureDecisions.
- Prefer a small number of executable high-value steps over verbose prose.
- Do not omit required architectural meaning merely to reduce output size.

Return exactly one complete JSON object.
Before finishing, ensure every opened string, object, and array is properly closed.

Required structure:

{
  "sourceDiagramType": "one allowed diagram type",
  "targetDiagramType": "one allowed diagram type",
  "strategy": "concise overall transformation strategy",
  "preserve": [],
  "remove": [],
  "add": [],
  "steps": [
    {
      "id": "step-1",
      "action": "preserve | add | remove | transform | reconnect | regroup | relayout | annotate",
      "target": "specific semantic target",
      "reason": "why this action is necessary",
      "priority": "critical | high | medium | low"
    }
  ],
  "requiredElements": [],
  "requiredRelationships": [],
  "architectureDecisions": [],
  "layoutStrategy": "clear visual composition strategy",
  "validationCriteria": [],
  "risks": [],
  "assumptions": []
}

Rules:

- sourceDiagramType and targetDiagramType must use exactly one allowed diagram-type value.
- Never combine diagram types into invented values such as "system_context_and_container".
- When a request spans multiple viewpoints, choose the single best primary representation.
- steps must be executable and ordered.
- preserve/remove/add must be semantically meaningful.
- architectureDecisions must include only decisions justified by the request and known context.
- validationCriteria must later allow another layer to judge success.
- do not output XML.
- do not output markdown.
- do not include explanation outside the JSON object.`,
    },

    {
      role: 'user' as const,

      content: JSON.stringify(
        {
          userInstruction:
            input.instruction,

          refinementIntent:
            input.intent,

          currentDiagramAnalysis:
            input.currentDiagramAnalysis ??
            null,

          selectedSystemContext:
            input.contextSelection ??
            null,

          targetDiagramType:
            targetType,

          targetDiagramExpertGuidance:
            expertGuidance,
        },
        null,
        2,
      ),
    },
  ];
}
