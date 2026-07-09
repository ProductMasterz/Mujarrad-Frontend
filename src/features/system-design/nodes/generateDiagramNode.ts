import type {
  Layer1GraphState,
} from '../types/graph.types';

import type {
  DiagramType,
} from '../types/diagramIntelligence.types';

import type {
  SystemUnderstanding,
} from '../types/layer1.types';

import {
  buildCompactSemanticDiagram,
} from '../diagram-intelligence/buildCompactSemanticDiagram';

import {
  compileSemanticDiagramToDrawio,
} from '../diagram-intelligence/compileSemanticDiagramToDrawio';

import {
  extractAndRepairDrawioXml,
} from '../utils/drawioXml';

export interface GenerateDiagramNodeResult {
  xml:
    string | null;

  summary:
    string;

  warnings:
    string[];

  error?:
    string;
}

function buildDiagramSummary(
  state: Layer1GraphState,
): string {
  const summary =
    state.understanding.summary
      ?.trim();

  const goal =
    state.understanding.goal
      ?.trim();

  if (summary) {
    return summary;
  }

  if (goal) {
    return `Professional initial system diagram for: ${goal}`;
  }

  return 'Professional initial system diagram generated from the cumulative Layer 1 understanding.';
}

function normalizedSearchText(
  understanding:
    SystemUnderstanding,
): string {
  return [
    understanding.summary,
    understanding.goal,

    ...understanding.primaryUsers,

    ...understanding.secondaryUsers,

    ...understanding.roles,

    ...understanding.workflows.map(
      (workflow) =>
        [
          workflow.title,
          ...workflow.steps,
        ].join(' '),
    ),

    ...understanding.integrations.map(
      (integration) =>
        JSON.stringify(
          integration,
        ),
    ),
  ]
    .join(' ')
    .toLowerCase();
}

function selectInitialDiagramType(
  understanding:
    SystemUnderstanding,
): DiagramType {
  const searchText =
    normalizedSearchText(
      understanding,
    );

  if (
    /\brag\b|retrieval augmented|vector database|embedding/.test(
      searchText,
    )
  ) {
    return 'rag_architecture';
  }

  if (
    /\bagent\b|multi-agent|agentic|orchestrator agent/.test(
      searchText,
    )
  ) {
    return 'agent_architecture';
  }

  if (
    /\bmachine learning\b|\bmodel training\b|\binference\b|\bprediction\b/.test(
      searchText,
    )
  ) {
    return 'ai_ml_pipeline';
  }

  if (
    /\bevent-driven\b|message broker|\bqueue\b|\bstream\b|pubsub|publish subscribe/.test(
      searchText,
    )
  ) {
    return 'event_driven_topology';
  }

  if (
    understanding.integrations.length >=
    4
  ) {
    return 'integration_architecture';
  }

  if (
    understanding.roles.length >=
      3 &&
    understanding.workflows.length >=
      3
  ) {
    return 'swimlane';
  }

  return 'software_architecture';
}

/**
 * Task 5 — Professional initial diagram generation.
 *
 * LangGraph remains the orchestrator.
 *
 * The AI returns only a tiny compact semantic
 * diagram specification.
 *
 * TypeScript deterministically converts that
 * specification into SemanticDiagramModel,
 * performs layout, compiles Draw.io XML,
 * repairs it, and validates it.
 */
export async function generateDiagramNode(
  state:
    Layer1GraphState,
): Promise<GenerateDiagramNodeResult> {
  if (
    !state.diagramGenerationContext
  ) {
    return {
      xml:
        null,

      summary:
        '',

      warnings:
        [],

      error:
        'Diagram generation requires a prepared diagramGenerationContext. Complete or skip clarification first.',
    };
  }

  try {
    const targetDiagramType =
      selectInitialDiagramType(
        state.understanding,
      );

    const compactResult =
      await buildCompactSemanticDiagram({
        understanding:
          state.understanding,

        targetDiagramType,

        audience:
          'mixed_technical',
      });

    if (
      compactResult.error ||
      !compactResult.semanticDiagram
    ) {
      return {
        xml:
          null,

        summary:
          '',

        warnings:
          compactResult.warnings,

        error:
          compactResult.error
            ? `Compact diagram generation failed: ${compactResult.error}`
            : 'Compact diagram generation failed.',
      };
    }

    const compiled =
      compileSemanticDiagramToDrawio(
        compactResult.semanticDiagram,
      );

    const repaired =
      extractAndRepairDrawioXml(
        compiled.xml,
      );

    const warnings = [
      ...compactResult.warnings,
      ...compiled.warnings,
      ...repaired.warnings,
    ];

    if (
      !repaired.valid
    ) {
      return {
        xml:
          null,

        summary:
          '',

        warnings,

        error:
          'The compact semantic diagram compiled to invalid Draw.io XML.',
      };
    }

    return {
      xml:
        repaired.xml,

      summary:
        buildDiagramSummary(
          state,
        ),

      warnings,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Diagram generation failed.';

    return {
      xml:
        null,

      summary:
        '',

      warnings:
        [],

      error:
        message,
    };
  }
}
