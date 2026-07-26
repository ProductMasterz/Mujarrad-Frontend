import type {
  SemanticDiagramEdge,
  SemanticDiagramModel,
  SemanticDiagramNode,
} from '../types/diagramIntelligence.types';

export interface CompileSemanticDiagramToMermaidResult {
  source: string;
  warnings: string[];
}

export function compileSemanticDiagramToMermaid(
  diagram: SemanticDiagramModel,
): CompileSemanticDiagramToMermaidResult {
  const warnings: string[] = [];

  const lines: string[] = [
    'flowchart LR',
    '',
    `%% ${sanitizeComment(diagram.title)}`,
  ];

  const renderedNodeIds =
    new Set(
      diagram.nodes.map(
        (node) => node.id,
      ),
    );

  const groupedNodeIds =
    new Set<string>();

  for (const group of diagram.groups) {
    const groupNodes =
      diagram.nodes.filter(
        (node) =>
          node.groupId === group.id,
      );

    if (groupNodes.length === 0) {
      continue;
    }

    lines.push('');
    lines.push(
      `subgraph ${mermaidId(`group-${group.id}`)}["${escapeLabel(group.label)}"]`,
    );
    lines.push('  direction TB');

    for (const node of groupNodes) {
      lines.push(
        `  ${compileNode(node)}`,
      );

      groupedNodeIds.add(node.id);
    }

    lines.push('end');
  }

  const ungroupedNodes =
    diagram.nodes.filter(
      (node) =>
        !groupedNodeIds.has(node.id),
    );

  if (ungroupedNodes.length > 0) {
    lines.push('');

    for (const node of ungroupedNodes) {
      lines.push(
        compileNode(node),
      );
    }
  }

  lines.push('');

  for (const edge of diagram.edges) {
    if (
      !renderedNodeIds.has(edge.sourceId) ||
      !renderedNodeIds.has(edge.targetId)
    ) {
      warnings.push(
        `Edge "${edge.id}" was skipped because its source or target node does not exist.`,
      );

      continue;
    }

    lines.push(
      compileEdge(edge),
    );
  }

  lines.push('');
  lines.push(
    'classDef actor fill:#eff6ff,stroke:#2563eb,color:#1e3a8a,stroke-width:2px;',
  );
  lines.push(
    'classDef service fill:#f8fafc,stroke:#475569,color:#0f172a,stroke-width:1.5px;',
  );
  lines.push(
    'classDef data fill:#f0fdf4,stroke:#16a34a,color:#14532d,stroke-width:1.5px;',
  );
  lines.push(
    'classDef external fill:#fff7ed,stroke:#ea580c,color:#7c2d12,stroke-width:1.5px,stroke-dasharray:5 3;',
  );
  lines.push(
    'classDef decision fill:#fefce8,stroke:#ca8a04,color:#713f12,stroke-width:1.5px;',
  );
  lines.push(
    'classDef security fill:#fdf2f8,stroke:#db2777,color:#831843,stroke-width:1.5px;',
  );

  return {
    source:
      lines.join('\n').trim() +
      '\n',

    warnings,
  };
}

function compileNode(
  node: SemanticDiagramNode,
): string {
  const id =
    mermaidId(node.id);

  const label =
    escapeLabel(node.label);

  const searchable =
    `${node.type} ${node.label}`
      .toLowerCase();

  if (
    includesAny(searchable, [
      'database',
      'repository',
      'storage',
      'data store',
      'vector store',
      'cache',
    ])
  ) {
    return `${id}[("${label}")]:::data`;
  }

  if (
    includesAny(searchable, [
      'decision',
      'condition',
      'approval',
      'validation',
      'check',
    ])
  ) {
    return `${id}{"${label}"}:::decision`;
  }

  if (
    includesAny(searchable, [
      'actor',
      'user',
      'customer',
      'admin',
      'reviewer',
      'operator',
    ])
  ) {
    return `${id}["${label}"]:::actor`;
  }

  if (
    includesAny(searchable, [
      'external',
      'third party',
      'integration',
      'provider',
      'crm',
      'email',
      'notification',
      'webhook',
    ])
  ) {
    return `${id}[["${label}"]]:::external`;
  }

  if (
    includesAny(searchable, [
      'security',
      'authentication',
      'authorization',
      'rbac',
      'audit',
      'compliance',
    ])
  ) {
    return `${id}["${label}"]:::security`;
  }

  return `${id}["${label}"]:::service`;
}

function compileEdge(
  edge: SemanticDiagramEdge,
): string {
  const source =
    mermaidId(edge.sourceId);

  const target =
    mermaidId(edge.targetId);

  const label =
    edge.label?.trim()
      ? `|${sanitizeEdgeLabel(edge.label)}|`
      : '';

  if (
    edge.direction === 'bidirectional'
  ) {
    return `${source} <-->${label} ${target}`;
  }

  if (
    edge.direction === 'backward'
  ) {
    return `${target} -->${label} ${source}`;
  }

  return `${source} -->${label} ${target}`;
}

function sanitizeEdgeLabel(
  value: string,
): string {
  return value
    .replace(/\|/g, '/')
    .replace(/"/g, '&quot;')
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function mermaidId(
  value: string,
): string {
  let sanitized =
    value
      .replace(/[^a-zA-Z0-9_]/g, '_')
      .replace(/^([0-9])/, 'n_$1');

  if (!sanitized) {
    sanitized = 'node';
  }

  const reservedWords =
    new Set([
      'end',
      'subgraph',
      'flowchart',
      'graph',
      'class',
      'classDef',
      'style',
      'linkStyle',
      'click',
      'direction',
      'default',
    ]);

  if (
    reservedWords.has(
      sanitized.toLowerCase(),
    )
  ) {
    sanitized =
      `node_${sanitized}`;
  }

  return sanitized;
}

function escapeLabel(
  value: string,
): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/\r?\n/g, ' ')
    .trim();
}

function sanitizeComment(
  value: string,
): string {
  return value
    .replace(/\r?\n/g, ' ')
    .replace(/%%/g, '')
    .trim();
}

function includesAny(
  value: string,
  keywords: string[],
): boolean {
  return keywords.some(
    (keyword) =>
      value.includes(keyword),
  );
}
