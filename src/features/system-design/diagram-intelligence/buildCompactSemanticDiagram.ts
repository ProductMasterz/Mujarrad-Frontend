import { z } from 'zod';

import type {
  DiagramAudience,
  DiagramType,
  SemanticDiagramEdge,
  SemanticDiagramGroup,
  SemanticDiagramModel,
  SemanticDiagramNode,
} from '../types/diagramIntelligence.types';

import type {
  SystemUnderstanding,
} from '../types/layer1.types';

import {
  callAiProviderWithUsage,
  type AiTokenUsage,
} from '../tools/aiProviderTool';

import {
  compactJson,
} from '../utils/llmContextFormat';

const compactGroupSchema =
  z.tuple([
    z.string().min(1),
    z.string().min(1),
  ]);

const compactNodeSchema =
  z.union([
    z.tuple([
      z.string().min(1),
      z.string().min(1),
      z.string().min(1),
    ]),

    z.tuple([
      z.string().min(1),
      z.string().min(1),
      z.string().min(1),
      z.string().min(1),
    ]),
  ]);

const compactEdgeSchema =
  z.union([
    z.tuple([
      z.string().min(1),
      z.string().min(1),
    ]),

    z.tuple([
      z.string().min(1),
      z.string().min(1),
      z.string().min(1),
    ]),
  ]);

const compactDiagramSpecSchema =
  z.object({
    h:
      z.string()
        .min(1)
        .max(80),

    g:
      z.array(
        compactGroupSchema,
      )
        .max(4)
        .default([]),

    n:
      z.array(
        compactNodeSchema,
      )
        .min(2)
        .max(18),

    e:
      z.array(
        compactEdgeSchema,
      )
        .max(24)
        .default([]),
  });

type CompactDiagramSpec =
  z.infer<
    typeof compactDiagramSpecSchema
  >;

export interface BuildCompactSemanticDiagramInput {
  understanding:
    SystemUnderstanding;

  targetDiagramType:
    DiagramType;

  audience?:
    DiagramAudience;

  refinementInstruction?:
    string;

  currentDiagramSummary?:
    string;
}

export interface BuildCompactSemanticDiagramResult {
  semanticDiagram:
    SemanticDiagramModel | null;

  warnings:
    string[];

  usage:
    AiTokenUsage | null;

  error?:
    string;
}

function buildCompactPrompt(
  input: BuildCompactSemanticDiagramInput,
  retry = false,
): string {
  const limits =
    retry
      ? `RETRY LIMITS

- maximum 9 nodes
- maximum 12 edges
- maximum 3 groups`
      : `LIMITS

- normally 7 to 12 nodes
- maximum 16 nodes
- maximum 20 edges
- maximum 4 groups`;

  return `You are a senior system architect creating the semantic content of one professional system diagram.

The cumulative SystemUnderstanding below is the canonical source of truth.

Do not re-analyze any conversation history.

Do not generate Draw.io XML.

Do not generate coordinates.

Do not generate styling.

Do not generate descriptions or metadata.

CURRENT_UNDERSTANDING
${compactJson(input.understanding)}

TARGET_DIAGRAM_TYPE
${input.targetDiagramType}

REFINEMENT_INSTRUCTION
${input.refinementInstruction?.trim() || 'none — create the initial diagram'}

CURRENT_DIAGRAM_SUMMARY
${input.currentDiagramSummary?.trim() || 'none'}

OBJECTIVE

Represent the real system professionally and concisely.

When a REFINEMENT_INSTRUCTION exists:

- satisfy it as the primary transformation goal
- use TARGET_DIAGRAM_TYPE as the required representation
- rebuild the semantic structure when conversion is requested
- preserve supported business meaning
- remove dummy, decorative, placeholder, or unsupported concepts when requested
- do not preserve bad structure merely because it existed in the previous diagram

Include only architecture-significant concepts such as:

- important human or external actors
- system entry points
- core responsibilities or services
- major workflow stages
- important decisions
- important data stores
- important integrations

Do not collapse the system into one generic platform box.

Do not invent unsupported technologies.

${limits}

OUTPUT FORMAT

Return exactly one tiny JSON object:

{
  "h": "short diagram title",
  "g": [
    ["group-id", "Group Label"]
  ],
  "n": [
    ["node-id", "type", "Node Label"],
    ["node-id", "type", "Node Label", "group-id"]
  ],
  "e": [
    ["source-id", "target-id"],
    ["source-id", "target-id", "short label"]
  ]
}

NODE TYPES

Use concise semantic types such as:

actor
process
service
api
database
decision
external_system
queue
component
security
artifact

RULES

1. Node ids must be short stable kebab-case ids.
2. Every edge source and target must reference an existing node id.
3. Every node group id must reference an existing group id.
4. Node labels: maximum 5 words.
5. Edge labels: maximum 4 words.
6. Prefer meaningful subsystem groups.
7. Prioritize the main end-to-end flow.
8. Include important supporting data stores and integrations.
9. No duplicate concepts.
10. No markdown.
11. No code fences.
12. No commentary.
13. Return JSON only.
14. Close every string, array, and object.

Return the smallest complete professional diagram specification possible.`;
}

function parseJsonObject(
  raw: string,
): unknown {
  const trimmed =
    raw.trim();

  try {
    return JSON.parse(
      trimmed,
    );
  } catch {
    const unfenced =
      trimmed
        .replace(
          /^```json\s*/i,
          '',
        )
        .replace(
          /^```\s*/,
          '',
        )
        .replace(
          /```\s*$/,
          '',
        )
        .trim();

    return JSON.parse(
      unfenced,
    );
  }
}

function nodeImportance(
  type: string,
): SemanticDiagramNode['importance'] {
  const normalized =
    type.toLowerCase();

  if (
    normalized === 'service' ||
    normalized === 'process' ||
    normalized === 'decision' ||
    normalized === 'component'
  ) {
    return 'primary';
  }

  if (
    normalized === 'database' ||
    normalized === 'api' ||
    normalized === 'queue'
  ) {
    return 'secondary';
  }

  return 'supporting';
}

function edgeType(
  label?: string,
): string {
  const normalized =
    label
      ?.toLowerCase() ??
    '';

  if (
    /\bevent\b|publish|emit|notify/.test(
      normalized,
    )
  ) {
    return 'event';
  }

  if (
    /data|query|read|write|store|retrieve|load|save/.test(
      normalized,
    )
  ) {
    return 'data_flow';
  }

  return 'dependency';
}

function normalizeCompactSpec(
  spec: CompactDiagramSpec,
  input: BuildCompactSemanticDiagramInput,
): {
  semanticDiagram:
    SemanticDiagramModel;

  warnings:
    string[];
} {
  const warnings:
    string[] = [];

  const groupIds =
    new Set<string>();

  const groups:
    SemanticDiagramGroup[] = [];

  for (
    const [
      id,
      label,
    ] of spec.g
  ) {
    if (
      groupIds.has(id)
    ) {
      warnings.push(
        `Duplicate group "${id}" was skipped.`,
      );

      continue;
    }

    groupIds.add(id);

    groups.push({
      id,
      label,
      type:
        'subsystem',
    });
  }

  const nodeIds =
    new Set<string>();

  const nodes:
    SemanticDiagramNode[] = [];

  for (
    const tuple of
    spec.n
  ) {
    const [
      id,
      type,
      label,
      groupId,
    ] = tuple;

    if (
      nodeIds.has(id)
    ) {
      warnings.push(
        `Duplicate node "${id}" was skipped.`,
      );

      continue;
    }

    nodeIds.add(id);

    nodes.push({
      id,
      type,
      label,

      ...(groupId &&
      groupIds.has(
        groupId,
      )
        ? {
            groupId,
          }
        : {}),

      importance:
        nodeImportance(
          type,
        ),
    });
  }

  const edges:
    SemanticDiagramEdge[] = [];

  spec.e.forEach(
    (
      tuple,
      index,
    ) => {
      const [
        sourceId,
        targetId,
        label,
      ] = tuple;

      if (
        !nodeIds.has(
          sourceId,
        ) ||
        !nodeIds.has(
          targetId,
        )
      ) {
        warnings.push(
          `Edge ${index + 1} referenced a missing node and was skipped.`,
        );

        return;
      }

      edges.push({
        id:
          `edge-${index + 1}`,

        sourceId,

        targetId,

        type:
          edgeType(
            label,
          ),

        ...(label
          ? {
              label,
            }
          : {}),

        direction:
          'forward',
      });
    },
  );

  const purpose =
    input.understanding.goal
      ?.trim() ||
    input.understanding.summary
      ?.trim() ||
    spec.h;

  return {
    semanticDiagram: {
      version:
        '1.0',

      diagramType:
        input.targetDiagramType,

      title:
        spec.h,

      purpose,

      audience:
        input.audience ??
        'mixed_technical',

      nodes,

      edges,

      groups,

      lanes:
        [],

      boundaries:
        [],

      layoutIntent: {
        direction:
          input.targetDiagramType ===
          'swimlane'
            ? 'swimlane'
            : 'left_to_right',

        hierarchyLevels:
          [],

        groupOrder:
          groups.map(
            (group) =>
              group.id,
          ),

        minimizeCrossings:
          true,

        emphasizePrimaryFlow:
          true,

        density:
          'balanced',

        edgeRouting:
          'orthogonal',

        notes:
          [],
      },

      preservedConcepts:
        [],

      omittedConcepts:
        [],

      assumptions:
        [],
    },

    warnings,
  };
}

export async function buildCompactSemanticDiagram(
  input: BuildCompactSemanticDiagramInput,
): Promise<BuildCompactSemanticDiagramResult> {
  let usage:
    AiTokenUsage | null =
    null;

  const requestCompactSpec = async (
    retry = false,
  ) =>
    callAiProviderWithUsage(
      [
        {
          role:
            'user' as const,

          content:
            buildCompactPrompt(
              input,
              retry,
            ),
        },
      ],
      {
        modelRole:
          'diagram',

        responseFormat:
          'json_object',

        temperature:
          retry
            ? 0.05
            : 0.15,
      },
    );

  try {
    let result =
      await requestCompactSpec();

    usage =
      result.usage;

    let spec:
      CompactDiagramSpec;

    try {
      spec =
        compactDiagramSpecSchema.parse(
          parseJsonObject(
            result.content,
          ),
        );
    } catch {
      result =
        await requestCompactSpec(
          true,
        );

      usage =
        result.usage;

      spec =
        compactDiagramSpecSchema.parse(
          parseJsonObject(
            result.content,
          ),
        );
    }

    return {
      ...normalizeCompactSpec(
        spec,
        input,
      ),

      usage,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unknown compact diagram generation error.';

    return {
      semanticDiagram:
        null,

      warnings:
        [],

      usage,

      error:
        message,
    };
  }
}
