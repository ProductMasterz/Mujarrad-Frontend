import {
  analyzeRefinementIntent,
} from '../diagram-intelligence/analyzeRefinementIntent';

import {
  buildCompactSemanticDiagram,
} from '../diagram-intelligence/buildCompactSemanticDiagram';

import {
  compileSemanticDiagramToMermaid,
} from '../diagram-intelligence/compileSemanticDiagramToMermaid';

import type {
  Layer1GraphState,
} from '../types/graph.types';

import type {
  CurrentDiagramAnalysis,
  DiagramContextSelection,
  DiagramRefinementIntent,
  DiagramTransformationPlan,
  SemanticDiagramModel,
  DiagramType,
} from '../types/diagramIntelligence.types';

import type {
  Task6AiOperation,
} from '../types/layer1.types';


import type {
  AiTokenUsage,
} from '../tools/aiProviderTool';



export interface Task6NodeUsageRecord {
  operation: Task6AiOperation;

  usage: AiTokenUsage;
}

function resolveRefinementTargetDiagramType(
  instruction: string,
  intent: DiagramRefinementIntent,
): DiagramType {
  const normalized =
    instruction.toLowerCase();

  if (/\bactivity diagram\b/.test(normalized)) {
    return 'uml_activity';
  }

  if (/\bsequence diagram\b/.test(normalized)) {
    return 'uml_sequence';
  }

  if (/\bdeployment diagram\b/.test(normalized)) {
    return 'uml_deployment';
  }

  if (/\bcomponent diagram\b/.test(normalized)) {
    return 'uml_component';
  }

  if (/\bstate machine\b/.test(normalized)) {
    return 'uml_state_machine';
  }

  if (/\bc4 context\b/.test(normalized)) {
    return 'c4_context';
  }

  if (/\bc4 container\b/.test(normalized)) {
    return 'c4_container';
  }

  if (/\bc4 component\b/.test(normalized)) {
    return 'c4_component';
  }

  if (/\bdata flow\b/.test(normalized)) {
    return 'data_flow';
  }

  if (/\bevent[- ]driven\b/.test(normalized)) {
    return 'event_driven_topology';
  }

  if (/\brag\b|retrieval augmented/.test(normalized)) {
    return 'rag_architecture';
  }

  if (/\bagent\b|agentic|multi-agent/.test(normalized)) {
    return 'agent_architecture';
  }

  if (
    intent.targetDiagramType !==
    'auto'
  ) {
    return intent.targetDiagramType;
  }

  return 'software_architecture';
}

export interface RefineDiagramNodeResult {
  xml: string | null;

  
  mermaidSource: string;

summary: string;

  warnings: string[];

  usageRecords: Task6NodeUsageRecord[];

  intent?: DiagramRefinementIntent;

  currentDiagramAnalysis?: CurrentDiagramAnalysis;

  contextSelection?: DiagramContextSelection;

  transformationPlan?: DiagramTransformationPlan;

  semanticDiagram?: SemanticDiagramModel;

  error?: string;
}

export async function refineDiagramNode(
  state: Layer1GraphState,
  refinementInstruction: string,
): Promise<RefineDiagramNodeResult> {
  const instruction =
    refinementInstruction.trim();

  const usageRecords:
    Task6NodeUsageRecord[] = [];

  const warnings: string[] = [];

  if (!instruction) {
    return {
        xml:
          null,

        mermaidSource:
          '',

      summary: '',

      warnings,

      usageRecords,

      error:
        'Refinement instruction is required.',
    };
  }

  if (!state.diagramGenerationContext) {
    return {
        xml:
          null,

        mermaidSource:
          '',

      summary: '',

      warnings,

      usageRecords,

      error:
        'Diagram refinement requires diagramGenerationContext from Task 4.',
    };
  }

  if (!state.mermaidSource.trim()) {
    return {
      xml: null,
      mermaidSource: '',
      summary: '',
      warnings,
      usageRecords,
      error:
        'No current Mermaid diagram exists to refine.',
    };
  }

  try {
    const intentResult =
      await analyzeRefinementIntent(
        instruction,
      );

    warnings.push(
      ...intentResult.warnings,
    );

    if (intentResult.usage) {
      usageRecords.push({
        operation:
          'refinement_intent_analysis',

        usage:
          intentResult.usage,
      });
    }

    const targetDiagramType =
      resolveRefinementTargetDiagramType(
        instruction,
        intentResult.intent,
      );

    const compactResult =
      await buildCompactSemanticDiagram({
        understanding:
          state.understanding,

        targetDiagramType,

        audience:
          intentResult.intent.audience,

        refinementInstruction:
          instruction,

        currentDiagramSummary:
          state.diagramSummary,
      });

    warnings.push(
      ...compactResult.warnings,
    );

    if (compactResult.usage) {
      usageRecords.push({
        operation:
          'semantic_diagram_synthesis',

        usage:
          compactResult.usage,
      });
    }

    if (
      compactResult.error ||
      !compactResult.semanticDiagram
    ) {
      return {
        xml: null,
        mermaidSource: '',
        summary: '',
        warnings,
        usageRecords,
        intent:
          intentResult.intent,
        error:
          compactResult.error
            ? `Compact diagram reconstruction failed: ${compactResult.error}`
            : 'Compact diagram reconstruction did not produce a valid semantic target.',
      };
    }

    const semanticDiagram =
      compactResult.semanticDiagram;

    const compiledMermaid =
      compileSemanticDiagramToMermaid(
        semanticDiagram,
      );

    warnings.push(
      ...compiledMermaid.warnings,
    );

    if (!compiledMermaid.source.trim()) {
      return {
        xml: null,
        mermaidSource: '',
        summary: '',
        warnings,
        usageRecords,
        intent:
          intentResult.intent,
        semanticDiagram,
        error:
          'Task 6 refinement did not compile to valid Mermaid source.',
      };
    }

    return {
      // Compatibility field retained until legacy
      // Draw.io state types are removed.
      xml: '',

      mermaidSource:
        compiledMermaid.source,

      summary:
        `Mermaid ${intentResult.intent.pipelineDepth.replaceAll('_', ' ')} refinement applied: ${instruction}`,

      warnings,
      usageRecords,
      intent:
        intentResult.intent,
      semanticDiagram,
    };
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : 'Diagram refinement failed.';

    return {
        xml:
          null,

        mermaidSource:
          '',

      summary: '',

      warnings,

      usageRecords,

      error: message,
    };
  }
}
