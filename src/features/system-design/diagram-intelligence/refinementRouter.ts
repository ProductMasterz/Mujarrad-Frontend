import type {
  DiagramOperation,
  DiagramPipelineDepth,
} from '../types/diagramIntelligence.types';

export interface DiagramPipelineRoute {
  depth: DiagramPipelineDepth;

  likelyOperation: DiagramOperation;

  reason: string;
}

const expertPatterns = [
  /\b(redesign|rebuild|reconstruct)\b.*\b(entire|whole|complete)\b/i,
  /\b(entire|whole|complete)\b.*\b(redesign|rebuild|reconstruct)\b/i,
  /\bconvert\b.*\b(diagram|architecture)\b/i,
  /\bturn\b.*\b(diagram|architecture)\b.*\binto\b/i,
  /\bproduction[- ]ready\b/i,
  /\bmulti[- ]region\b/i,
  /\bglobally scalable\b/i,
  /\benterprise[- ]grade\b/i,
  /\bchange\b.*\barchitecture\b.*\bto\b/i,
  /\brefactor\b.*\barchitecture\b/i,
  /\bmicroservices?\b/i,
  /\bevent[- ]driven\b/i,
  /\bactivity diagram\b/i,
  /\bsequence diagram\b/i,
  /\bdeployment diagram\b/i,
  /\bcomponent diagram\b/i,
  /\bstate machine\b/i,
  /\bc4\b/i,
  /\bfor executives?\b/i,
  /\bfor backend engineers?\b/i,
  /\bfor devops\b/i,
  /\bfor security\b/i,
];

const advancedPatterns = [
  /\bimprove\b/i,
  /\boptimi[sz]e\b/i,
  /\bclean(er)?\b/i,
  /\bsimplif(y|ication)\b/i,
  /\bexpand\b/i,
  /\bsecurity\b/i,
  /\bresilien(ce|t)\b/i,
  /\bscalab(le|ility)\b/i,
  /\bobservability\b/i,
  /\bfailure paths?\b/i,
  /\bretr(y|ies)\b/i,
  /\bdead[- ]letter\b/i,
  /\bcaching\b/i,
  /\bload balanc/i,
  /\bapi gateway\b/i,
  /\bmessage broker\b/i,
  /\bqueue\b/i,
  /\bdata flow\b/i,
  /\bgroup\b/i,
  /\brestructure\b/i,
  /\breorgani[sz]e\b/i,
  /\bseparate\b/i,
];

const fastPatterns = [
  /\brename\b/i,
  /\bchange (the )?label\b/i,
  /\bmove\b/i,
  /\bdelete\b/i,
  /\bremove\b/i,
  /\bconnect\b/i,
  /\bdisconnect\b/i,
  /\bchange (the )?color\b/i,
  /\bchange (the )?style\b/i,
];

export function routeDiagramRefinement(
  instruction: string,
): DiagramPipelineRoute {
  const normalized = instruction.trim();

  if (
    expertPatterns.some((pattern) =>
      pattern.test(normalized),
    )
  ) {
    return {
      depth: 'expert_reconstruction',
      likelyOperation:
        inferOperation(normalized, true),
      reason:
        'The request appears to require whole-system reasoning, architecture transformation, diagram-type conversion, or audience-specific reconstruction.',
    };
  }

  if (
    advancedPatterns.some((pattern) =>
      pattern.test(normalized),
    )
  ) {
    return {
      depth: 'advanced_modification',
      likelyOperation:
        inferOperation(normalized, false),
      reason:
        'The request appears to require structural, architectural, semantic, or visual reasoning beyond a local edit.',
    };
  }

  if (
    fastPatterns.some((pattern) =>
      pattern.test(normalized),
    )
  ) {
    return {
      depth: 'fast_edit',
      likelyOperation:
        inferFastOperation(normalized),
      reason:
        'The request appears to be a localized diagram edit.',
    };
  }

  return {
    depth: 'advanced_modification',
    likelyOperation:
      'semantic_enrichment',
    reason:
      'The request is ambiguous, so the safer default is the advanced reasoning path rather than assuming a local edit.',
  };
}

function inferFastOperation(
  instruction: string,
): DiagramOperation {
  if (
    /\brename\b|\bchange (the )?label\b/i.test(
      instruction,
    )
  ) {
    return 'rename';
  }

  if (/\bmove\b/i.test(instruction)) {
    return 'move';
  }

  if (/\bdisconnect\b/i.test(instruction)) {
    return 'disconnect';
  }

  if (/\bconnect\b/i.test(instruction)) {
    return 'connect';
  }

  if (
    /\bdelete\b|\bremove\b/i.test(
      instruction,
    )
  ) {
    return 'remove_element';
  }

  if (
    /\bcolor\b|\bstyle\b/i.test(
      instruction,
    )
  ) {
    return 'style_change';
  }

  return 'semantic_enrichment';
}

function inferOperation(
  instruction: string,
  expert: boolean,
): DiagramOperation {
  if (
    /\bactivity diagram\b|\bsequence diagram\b|\bdeployment diagram\b|\bcomponent diagram\b|\bstate machine\b|\bc4\b/i.test(
      instruction,
    )
  ) {
    return 'diagram_type_conversion';
  }

  if (
    /\bfor executives?\b|\bfor backend engineers?\b|\bfor devops\b|\bfor security\b/i.test(
      instruction,
    )
  ) {
    return 'audience_transformation';
  }

  if (
    /\bmicroservices?\b|\bevent[- ]driven\b|\barchitecture\b/i.test(
      instruction,
    )
  ) {
    return expert
      ? 'architecture_transformation'
      : 'architecture_improvement';
  }

  if (
    /\bsimplif(y|ication)\b/i.test(
      instruction,
    )
  ) {
    return 'simplification';
  }

  if (
    /\bexpand\b|\badd detail\b/i.test(
      instruction,
    )
  ) {
    return 'expansion';
  }

  if (
    /\bredesign\b|\brebuild\b|\breconstruct\b/i.test(
      instruction,
    )
  ) {
    return 'full_reconstruction';
  }

  return expert
    ? 'full_reconstruction'
    : 'architecture_improvement';
}
