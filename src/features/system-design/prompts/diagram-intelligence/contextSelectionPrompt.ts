import type {
  CurrentDiagramAnalysis,
  DiagramRefinementIntent,
} from '../../types/diagramIntelligence.types';

import type {
  Layer1GraphState,
} from '../../types/graph.types';

export interface ContextSelectionPromptInput {
  instruction: string;

  intent: DiagramRefinementIntent;

  currentDiagramAnalysis?: CurrentDiagramAnalysis;

  state: Layer1GraphState;
}

export function buildContextSelectionMessages(
  input: ContextSelectionPromptInput,
) {
  const context =
    input.state.diagramGenerationContext;

  if (!context) {
    throw new Error(
      'Diagram context selection requires diagramGenerationContext.',
    );
  }

  return [
    {
      role: 'system' as const,

      content: `You are the System Context Selection layer of the Mujarrad Diagram Intelligence Engine.

Your job is to select and summarize only the system knowledge that is genuinely relevant to the requested diagram modification.

You are NOT modifying the diagram.
You are NOT designing architecture.
You are NOT generating Draw.io XML.
You are NOT deciding the final transformation.

Your purpose is to prevent later expert layers from being distracted by irrelevant information while ensuring that no important system knowledge is lost.

Study:

- the user's refinement request
- the interpreted refinement intent
- the current diagram analysis
- the available system understanding
- answered clarification questions
- unanswered clarification questions
- completeness information

Select the context needed to satisfy the request professionally.

Selection principles:

1. Preserve facts.
Do not invent system behavior, requirements, components, or constraints.

2. Select by semantic relevance.
Do not select fields merely because they contain text.

3. Consider architecture consequences.
A request about resilience may require workflows, integrations, errors, and data dependencies.

4. Consider representation consequences.
A sequence diagram needs actors, interaction order, alternatives, and errors.
An activity diagram needs actions, decisions, parallel paths, roles, and exceptions.
A deployment diagram needs components, integrations, infrastructure clues, security, and constraints.

5. Consider system-wide consequences.
An expert reconstruction may need broad context.

6. Preserve uncertainty.
Unanswered questions and assumptions can be important when they affect the requested change.

7. Never treat an assumption as a confirmed fact.

8. Do not recommend solutions.
That belongs to later architecture and planning layers.

Return exactly one JSON object.

Required structure:

{
  "selectedUnderstandingFields": [
    "names of SystemUnderstanding fields that matter"
  ],
  "relevantWorkflows": [],
  "relevantBusinessRules": [],
  "relevantDecisionLogic": [],
  "relevantIntegrations": [],
  "relevantSecurityRequirements": [],
  "relevantErrorCases": [],
  "relevantEdgeCases": [],
  "relevantEntities": [],
  "relevantAssumptions": [],
  "contextSummary": "concise factual summary of the system knowledge required for the requested diagram work"
}

Important:

- Copy or faithfully compress existing facts.
- Keep each array focused.
- Empty arrays are valid.
- Do not output markdown.
- Do not output explanation outside the JSON object.`,
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

          systemUnderstanding:
            context.understanding,

          answeredQuestions:
            context.answeredQuestions,

          unansweredQuestions:
            context.unansweredQuestions,

          completeness:
            context.completeness,
        },
        null,
        2,
      ),
    },
  ];
}
