import {
  semanticDiagramModelSchema,
} from '../schemas/diagramIntelligence.schema';

import type {
  CurrentDiagramAnalysis,
  DiagramContextSelection,
  DiagramRefinementIntent,
  DiagramTransformationPlan,
  SemanticDiagramModel,
} from '../types/diagramIntelligence.types';

import {
  callAiProviderWithUsage,
  type AiTokenUsage,
} from '../tools/aiProviderTool';

import {
  buildSemanticDiagramMessages,
} from '../prompts/diagram-intelligence/semanticDiagramPrompt';

export interface BuildSemanticDiagramInput {
  instruction: string;

  intent: DiagramRefinementIntent;

  currentDiagramAnalysis?:
    CurrentDiagramAnalysis;

  contextSelection?:
    DiagramContextSelection;

  transformationPlan:
    DiagramTransformationPlan;
}

export interface BuildSemanticDiagramResult {
  semanticDiagram:
    SemanticDiagramModel | null;

  usage:
    AiTokenUsage | null;

  warnings:
    string[];

  error?: string;
}

type UnknownRecord =
  Record<string, unknown>;

function isRecord(
  value: unknown,
): value is UnknownRecord {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  );
}

function asRecordArray(
  value: unknown,
): UnknownRecord[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    isRecord,
  );
}

function asString(
  value: unknown,
  fallback = '',
): string {
  return typeof value === 'string'
    ? value
    : fallback;
}

function asStringArray(
  value: unknown,
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (
      item,
    ): item is string =>
      typeof item === 'string',
  );
}

function normalizeCompactSemanticDiagram(
  parsed: unknown,
  input: BuildSemanticDiagramInput,
): unknown {
  const source =
    isRecord(parsed)
      ? parsed
      : {};

  const groups =
    asRecordArray(
      source.groups,
    ).map(
      (group) => ({
        id:
          asString(
            group.id,
          ),

        label:
          asString(
            group.label,
          ),

        type:
          asString(
            group.type,
            'subsystem',
          ),

        ...(asString(
          group.parentId,
        )
          ? {
              parentId:
                asString(
                  group.parentId,
                ),
            }
          : {}),
      }),
    );

  const groupIds =
    groups
      .map(
        (group) =>
          group.id,
      )
      .filter(Boolean);

  const nodes =
    asRecordArray(
      source.nodes,
    ).map(
      (node) => {
        const groupId =
          asString(
            node.groupId,
          );

        return {
          id:
            asString(
              node.id,
            ),

          type:
            asString(
              node.type,
              'component',
            ),

          label:
            asString(
              node.label,
            ),

          importance:
            asString(
              node.importance,
              'secondary',
            ),

          ...(groupId &&
          groupIds.includes(
            groupId,
          )
            ? {
                groupId,
              }
            : {}),
        };
      },
    );

  const edges =
    asRecordArray(
      source.edges,
    ).map(
      (edge) => {
        const label =
          asString(
            edge.label,
          );

        return {
          id:
            asString(
              edge.id,
            ),

          sourceId:
            asString(
              edge.sourceId,
            ),

          targetId:
            asString(
              edge.targetId,
            ),

          type:
            asString(
              edge.type,
              'dependency',
            ),

          direction:
            asString(
              edge.direction,
              'forward',
            ),

          ...(label
            ? {
                label,
              }
            : {}),
        };
      },
    );

  const rawLayout =
    isRecord(
      source.layoutIntent,
    )
      ? source.layoutIntent
      : {};

  return {
    version:
      '1.0',

    diagramType:
      asString(
        source.diagramType,
        input.transformationPlan
          .targetDiagramType,
      ),

    title:
      asString(
        source.title,
        'System Architecture',
      ),

    purpose:
      asString(
        source.purpose,
        input.instruction,
      ),

    audience:
      asString(
        source.audience,
        input.intent.audience,
      ),

    nodes,

    edges,

    groups,

    lanes:
      [],

    boundaries:
      [],

    layoutIntent: {
      direction:
        asString(
          rawLayout.direction,
          'left_to_right',
        ),

      hierarchyLevels:
        asStringArray(
          rawLayout.hierarchyLevels,
        ),

      groupOrder:
        asStringArray(
          rawLayout.groupOrder,
        ).length
          ? asStringArray(
              rawLayout.groupOrder,
            )
          : groupIds,

      minimizeCrossings:
        typeof rawLayout.minimizeCrossings ===
        'boolean'
          ? rawLayout.minimizeCrossings
          : true,

      emphasizePrimaryFlow:
        typeof rawLayout.emphasizePrimaryFlow ===
        'boolean'
          ? rawLayout.emphasizePrimaryFlow
          : true,

      density:
        asString(
          rawLayout.density,
          'balanced',
        ),

      edgeRouting:
        asString(
          rawLayout.edgeRouting,
          'orthogonal',
        ),

      notes:
        asStringArray(
          rawLayout.notes,
        ),
    },

    preservedConcepts:
      asStringArray(
        source.preservedConcepts,
      ),

    omittedConcepts:
      asStringArray(
        source.omittedConcepts,
      ),

    assumptions:
      asStringArray(
        source.assumptions,
      ),
  };
}

function parseAndValidateSemanticDiagram(
  rawContent: string,
  input: BuildSemanticDiagramInput,
): SemanticDiagramModel {
  const parsed =
    parseJsonObject(
      rawContent,
    );

  const normalized =
    normalizeCompactSemanticDiagram(
      parsed,
      input,
    );

  return semanticDiagramModelSchema.parse(
    normalized,
  );
}

export async function buildSemanticDiagram(
  input: BuildSemanticDiagramInput,
): Promise<BuildSemanticDiagramResult> {
  const requestSemanticDiagram = async (
    retry = false,
  ) =>
    callAiProviderWithUsage(
      retry
        ? [
            ...buildSemanticDiagramMessages(
              input,
            ),

            {
              role:
                'user' as const,

              content: `RETRY REQUIREMENT

The previous response was incomplete or invalid.

Return a SMALLER complete JSON object.

Hard retry limits:

- maximum 12 nodes
- maximum 16 edges
- maximum 3 groups
- no descriptions
- no metadata
- no long text
- short labels only
- omit optional fields
- exactly one JSON object
- close every string, object, and array

Do not include markdown or commentary.`,
            },
          ]
        : buildSemanticDiagramMessages(
            input,
          ),
      {
        modelRole:
          'diagram',

        temperature:
          retry
            ? 0.05
            : 0.15,

        responseFormat:
          'json_object',
      },
    );

  try {
    let result =
      await requestSemanticDiagram();

    let semanticDiagram:
      SemanticDiagramModel;

    try {
      semanticDiagram =
        parseAndValidateSemanticDiagram(
          result.content,
          input,
        );
    } catch {
      result =
        await requestSemanticDiagram(
          true,
        );

      semanticDiagram =
        parseAndValidateSemanticDiagram(
          result.content,
          input,
        );
    }

    const integrityWarnings =
      validateSemanticIntegrity(
        semanticDiagram,
      );

    return {
      semanticDiagram,

      usage:
        result.usage,

      warnings:
        integrityWarnings,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unknown semantic-diagram synthesis error.';

    return {
      semanticDiagram:
        null,

      usage:
        null,

      warnings: [
        `Semantic diagram synthesis was unavailable. ${message}`,
      ],

      error:
        message,
    };
  }
}

function validateSemanticIntegrity(
  diagram: SemanticDiagramModel,
): string[] {
  const warnings:
    string[] = [];

  const nodeIds =
    new Set(
      diagram.nodes.map(
        (node) =>
          node.id,
      ),
    );

  const groupIds =
    new Set(
      diagram.groups.map(
        (group) =>
          group.id,
      ),
    );

  const laneIds =
    new Set(
      diagram.lanes.map(
        (lane) =>
          lane.id,
      ),
    );

  for (
    const edge of
    diagram.edges
  ) {
    if (
      !nodeIds.has(
        edge.sourceId,
      )
    ) {
      warnings.push(
        `Semantic edge "${edge.id}" references missing source node "${edge.sourceId}".`,
      );
    }

    if (
      !nodeIds.has(
        edge.targetId,
      )
    ) {
      warnings.push(
        `Semantic edge "${edge.id}" references missing target node "${edge.targetId}".`,
      );
    }
  }

  for (
    const node of
    diagram.nodes
  ) {
    if (
      node.groupId &&
      !groupIds.has(
        node.groupId,
      )
    ) {
      warnings.push(
        `Semantic node "${node.id}" references missing group "${node.groupId}".`,
      );
    }

    if (
      node.laneId &&
      !laneIds.has(
        node.laneId,
      )
    ) {
      warnings.push(
        `Semantic node "${node.id}" references missing lane "${node.laneId}".`,
      );
    }
  }

  const allowedBoundaryMembers =
    new Set([
      ...nodeIds,
      ...groupIds,
    ]);

  for (
    const boundary of
    diagram.boundaries
  ) {
    for (
      const memberId of
      boundary.memberIds
    ) {
      if (
        !allowedBoundaryMembers.has(
          memberId,
        )
      ) {
        warnings.push(
          `Semantic boundary "${boundary.id}" references missing member "${memberId}".`,
        );
      }
    }
  }

  return warnings;
}

function parseJsonObject(
  rawContent: string,
): unknown {
  const trimmed =
    rawContent.trim();

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
