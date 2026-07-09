import type {
  CurrentDiagramAnalysis,
  DiagramContextSelection,
  DiagramRefinementIntent,
  DiagramTransformationPlan,
} from '../../types/diagramIntelligence.types';

import {
  getDiagramExpertGuidance,
} from '../../diagram-intelligence/diagramExpertGuidance';

export interface SemanticDiagramPromptInput {
  instruction: string;

  intent: DiagramRefinementIntent;

  currentDiagramAnalysis?: CurrentDiagramAnalysis;

  contextSelection?: DiagramContextSelection;

  transformationPlan: DiagramTransformationPlan;
}

export function buildSemanticDiagramMessages(
  input: SemanticDiagramPromptInput,
) {
  const expertGuidance =
    getDiagramExpertGuidance(
      input.transformationPlan
        .targetDiagramType,
    );

  return [
    {
      role: 'system' as const,

      content: `You are the Semantic Diagram Architect of the Mujarrad Diagram Intelligence Engine.

Create a professional semantic architecture model.

You are NOT generating Draw.io XML.
TypeScript will generate the layout and final mxGraphModel XML.

Your task is only to decide:

- which important nodes exist
- which important relationships exist
- which professional groups exist
- which architecture flow should be emphasized

COMPACT OUTPUT IS MANDATORY

The previous implementation failed because semantic JSON became too large.

Hard limits:

- 8 to 14 nodes for a normal professional diagram
- maximum 18 nodes only when genuinely necessary
- maximum 20 edges
- maximum 4 groups
- node labels: maximum 5 words
- edge labels: maximum 4 words
- no node descriptions
- no metadata
- no duplicated concepts
- no long prose
- no exhaustive documentation inside the diagram

PROFESSIONAL QUALITY

Do not create a simplistic diagram with one generic platform box.

Represent, when justified by context:

- important external actors
- system entry points
- core responsibilities or services
- major workflow stages
- important decision points
- important data stores
- important integrations
- meaningful subsystem grouping

Use groups to communicate system boundaries and architectural responsibility.

Prioritize the main end-to-end flow.

Do not invent unsupported technologies.

RELATIONSHIP INTEGRITY

Every edge sourceId and targetId must reference an existing node.

Every node groupId must reference an existing group.

Use stable concise ids such as:

- company-user
- requirements-ingestion
- candidate-retrieval
- matching-engine
- ranking-service
- company-profile-store

OUTPUT

Return exactly one complete JSON object.

Use this compact structure:

{
  "title": "short professional title",
  "diagramType": "one allowed diagram type",
  "nodes": [
    {
      "id": "stable-id",
      "type": "actor | service | process | database | decision | external_system | other",
      "label": "Short Label",
      "groupId": "optional-group-id",
      "importance": "primary | secondary | supporting"
    }
  ],
  "edges": [
    {
      "id": "stable-edge-id",
      "sourceId": "existing-node-id",
      "targetId": "existing-node-id",
      "type": "request | response | event | data_flow | dependency | control_flow | other",
      "label": "optional short label"
    }
  ],
  "groups": [
    {
      "id": "stable-group-id",
      "label": "Short Group Label",
      "type": "domain | layer | subsystem | cluster | region | other"
    }
  ],
  "layoutIntent": {
    "direction": "left_to_right | top_to_bottom | radial | timeline | swimlane",
    "hierarchyLevels": [],
    "groupOrder": []
  }
}

TypeScript will automatically add:

- version
- purpose
- audience
- edge direction
- empty lanes
- empty boundaries
- layout defaults
- preserved concepts
- omitted concepts
- assumptions

Do not output those fields unless they are essential.

Return JSON only.

No markdown.
No code fences.
No commentary.
No trailing text.

Before finishing, verify that every opened string, object, and array is closed.`,
    },

    {
      role: 'user' as const,

      content: JSON.stringify(
        {
          instruction:
            input.instruction,

          targetDiagramType:
            input.transformationPlan
              .targetDiagramType,

          audience:
            input.intent.audience,

          selectedSystemContext:
            input.contextSelection ??
            null,

          currentDiagramSummary:
            input.currentDiagramAnalysis
              ?.summary ??
            null,

          preserve:
            input.transformationPlan
              .preserve,

          add:
            input.transformationPlan
              .add,

          requiredElements:
            input.transformationPlan
              .requiredElements,

          requiredRelationships:
            input.transformationPlan
              .requiredRelationships,

          architectureDecisions:
            input.transformationPlan
              .architectureDecisions,

          layoutStrategy:
            input.transformationPlan
              .layoutStrategy,

          transformationSteps:
            input.transformationPlan
              .steps,

          expertGuidance,
        },
      ),
    },
  ];
}
