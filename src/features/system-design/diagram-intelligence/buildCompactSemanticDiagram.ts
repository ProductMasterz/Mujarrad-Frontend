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
import {
  buildSlimDiagramContext,
} from '../utils/systemDesignAiContext';

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
        .max(6)
        .default([]),

    n:
      z.array(
        compactNodeSchema,
      )
        .min(2)
        .max(34),

    e:
      z.array(
        compactEdgeSchema,
      )
        .max(56)
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

- target 12 to 18 nodes
- maximum 20 nodes
- maximum 28 edges
- maximum 4 groups`
      : `LIMITS

- target 18 to 28 nodes for software architecture diagrams
- target 12 to 20 nodes for activity, sequence, data-flow, or refinement diagrams
- maximum 32 nodes
- maximum 50 edges
- maximum 6 groups`;

  const diagramTypeGuidance =
    input.targetDiagramType === 'uml_activity'
      ? `ACTIVITY DIAGRAM REQUIREMENTS

Include:
- start node
- user/system actions
- decisions with yes/no or success/failure branches
- main success path
- important failure or validation path
- end node`
      : input.targetDiagramType === 'uml_sequence'
        ? `SEQUENCE DIAGRAM REQUIREMENTS

Include:
- actors or clients
- frontend/API participants
- backend/domain services
- data stores
- external systems
- ordered request/response interactions`
        : input.targetDiagramType === 'data_flow'
          ? `DATA FLOW REQUIREMENTS

Include:
- data sources
- ingestion or input boundary
- transformation/processing stages
- storage
- retrieval/query paths
- outputs and consumers
- audit or trace data when relevant`
          : input.targetDiagramType === 'agent_architecture'
            ? `AGENT ARCHITECTURE REQUIREMENTS

Include:
- user/request source
- orchestrator
- specialist agents/tools
- memory/context store
- retrieval or backend APIs
- validation/guardrail stage
- final response/output`
            : input.targetDiagramType === 'rag_architecture'
              ? `RAG ARCHITECTURE REQUIREMENTS

Include:
- user query
- query understanding
- retriever
- vector/index store
- document/source store
- reranking or filtering if relevant
- generation/model step
- answer with citations/output`
              : `SOFTWARE ARCHITECTURE REQUIREMENTS

Include relevant layers:
- user or external actor layer
- frontend / client entry layer
- API / gateway layer
- application services layer
- domain or AI/business logic layer
- data/storage layer
- external integration layer
- security/auth boundary when relevant
- audit/logging/observability when relevant
- error/failure path when relevant`;

  return `You are a principal software architect creating the semantic content of one professional system diagram.

The compact diagram brief below is the only source of truth.

Do not re-analyze conversation history.
Do not generate Draw.io XML.
Do not generate Mermaid.
Do not generate coordinates.
Do not generate styling.
Do not generate prose outside JSON.

COMPACT_DIAGRAM_BRIEF
${compactJson(buildSlimDiagramContext(input.understanding))}

TARGET_DIAGRAM_TYPE
${input.targetDiagramType}

REFINEMENT_INSTRUCTION
${input.refinementInstruction?.trim() || 'none — create the initial diagram'}

CURRENT_DIAGRAM_SUMMARY
${input.currentDiagramSummary?.trim() || 'none'}

OBJECTIVE

Create a detailed, professional, architecture-significant diagram specification from the compact brief only.

The output must be useful for a technical review, not a toy diagram.

${diagramTypeGuidance}

PROFESSIONAL VISUAL STYLE RULES

The diagram must look like a serious software/system architecture diagram.

Allowed visual language:
- rectangular blocks for services, modules, components, screens, APIs, and processing steps
- database/storage symbols for repositories, logs, files, and persistent stores
- actor/user nodes for people and external parties, represented as professional labeled blocks, not stick figures
- external system blocks for third-party systems and integrations
- decision diamonds only for real branching logic
- arrows showing direction of control flow, data flow, dependency, or message flow
- labeled connections that explain the interaction
- bounded containers/groups for layers, subsystems, domains, or swimlanes

Forbidden visual language:
- cartoon drawings
- childish illustrations
- playful icons
- emojis
- mascots
- clipart
- decorative pictures
- 3D scenes
- random shapes
- colorful poster/infographic style
- vague bubbles with generic labels
- unlabeled spaghetti arrows
- one big generic platform box
- decorative clouds unless they represent a real external boundary
- drawings of people, stick figures, laptops, buildings, rockets, robots, magic, or abstract art

Diagram quality requirements:
- Every node must represent a real system actor, responsibility, service, data store, integration, decision, or workflow step.
- Every edge must have a clear direction and a meaningful label.
- Group nodes by professional boundaries such as User Layer, Application Layer, AI/Processing Layer, Data Layer, Integration Layer, Governance/Operations.
- Prefer readable left-to-right or top-to-bottom flow.
- Make the main path obvious.
- Show secondary paths such as validation, audit logging, notification, and error handling without clutter.
- Use concise technical labels.
- Keep labels professional and domain-specific.


- Do not collapse the system into one generic "platform" box.
- Do not create vague nodes like "System", "Process", "Data", or "Service" unless they are specific and qualified.
- Prefer specific business/technical responsibilities from the understanding.
- Show the main end-to-end flow from user input to final output.
- Include important supporting flows such as authentication, audit logging, matching/scoring, storage, retrieval, and integrations when supported.
- Include data stores as database nodes, not generic services.
- Include external systems separately from internal services.
- Include decision nodes only for real branching logic.
- Include security/auth when the system has users, roles, private data, company data, files, or admin operations.
- Include validation and failure handling when the system accepts user input, files, external records, or scoring decisions.
- Use groups as architectural layers, bounded subsystems, or swimlanes.
- Use edge labels that explain the interaction, not generic labels like "uses".
- Preserve the user's domain language.
- Do not invent specific vendors, frameworks, or cloud products.
- Do not produce visual concepts that look like a poster, cartoon, story map, mind map, or marketing graphic.
- The result must be suitable for a technical design review with engineers and architects.

SPARSE INPUT REFERENCE ARCHITECTURE MODE

If the brief is sparse or vague, still produce a professional WIDE reference architecture for the stated domain.

Use common generic architecture components without naming vendors or frameworks.

For a company matching, recommendation, scoring, search, AI, marketplace, SaaS, or workflow system, include relevant generic components such as:

- User Portal
- Admin Console
- Authentication
- Requirement Intake
- File Upload / Records Intake when input files or records are mentioned
- Requirement Extraction
- Profile Repository
- Search / Retrieval Service
- Matching / Scoring Engine
- Ranking Service
- Explanation Service
- Decision Trace / Audit Log
- Notification Service
- External Integration Adapter when integrations are mentioned
- Operational Monitoring

These are allowed as architecture assumptions when the user provided a vague system idea.

Do not invent specific products, vendors, frameworks, cloud names, databases, or paid services.

${limits}

OUTPUT FORMAT

Return exactly one JSON object:

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

Use only concise semantic types such as:

actor
frontend
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
observability

RULES

1. Node ids must be short stable kebab-case ids.
2. Every edge source and target must reference an existing node id.
3. Every node group id must reference an existing group id.
4. Node labels: maximum 7 words.
5. Edge labels: maximum 5 words.
6. Prefer 4 to 6 meaningful subsystem groups for software architecture.
7. Every group should contain at least 2 nodes when possible.
8. Prefer a complete flow over isolated boxes.
9. Avoid duplicate concepts.
10. Avoid dummy, decorative, placeholder, and unsupported concepts.
11. No markdown.
12. No code fences.
13. No commentary.
14. Return JSON only.

Before returning, verify:
- the diagram is professional and technical
- all nodes are blocks/components/actor blocks/stores/decisions
- no actor is represented as a stick figure
- SaaS/software systems are not represented as skinny vertical sequence/activity diagrams unless explicitly requested
- all edges have meaningful direction and labels
- no childish, decorative, cartoon, icon, emoji, clipart, or infographic-style elements are implied
- the diagram is comprehensive enough for architecture review
15. Close every string, array, and object.

Return the richest accurate compact diagram specification possible.`;
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
