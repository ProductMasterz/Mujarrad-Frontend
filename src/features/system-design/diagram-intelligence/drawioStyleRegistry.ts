import type {
  SemanticDiagramModel,
  SemanticDiagramNode,
} from '../types/diagramIntelligence.types';

export interface DrawioStyleContext {
  diagram:
    SemanticDiagramModel;

  node:
    SemanticDiagramNode;
}

const BASE_NODE_STYLE = [
  'rounded=1',
  'whiteSpace=wrap',
  'html=1',
  'align=center',
  'verticalAlign=middle',
  'spacing=8',
  'fontSize=13',
  'strokeWidth=1.5',
].join(';');

const TYPE_STYLES: Record<
  string,
  string
> = {
  actor:
    'rounded=1;fillColor=#eff6ff;strokeColor=#2563eb;fontColor=#1e3a8a;fontStyle=1',

  user:
    'rounded=1;fillColor=#eff6ff;strokeColor=#2563eb;fontColor=#1e3a8a;fontStyle=1',

  service:
    'rounded=1',

  application:
    'rounded=1',

  api:
    'rounded=1',

  gateway:
    'shape=hexagon;perimeter=hexagonPerimeter2',

  database:
    'shape=cylinder3;boundedLbl=1;backgroundOutline=1',

  data_store:
    'shape=cylinder3;boundedLbl=1;backgroundOutline=1',

  queue:
    'shape=mxgraph.aws4.queue',

  broker:
    'shape=mxgraph.aws4.eventbridge',

  event_broker:
    'shape=mxgraph.aws4.eventbridge',

  process:
    'rounded=1',

  action:
    'rounded=1',

  decision:
    'rhombus',

  start:
    'ellipse;aspect=fixed',

  end:
    'ellipse;aspect=fixed;strokeWidth=3',

  external_system:
    'rounded=1;dashed=1',

  component:
    'shape=component',

  node:
    'shape=cube;size=12',

  artifact:
    'shape=document',

  class:
    'swimlane;fontStyle=1;childLayout=stackLayout;horizontal=1',

  entity:
    'shape=table',

  state:
    'rounded=1',

  security_control:
    'shape=mxgraph.basic.shield',

  cloud:
    'rounded=1;dashed=1;fillColor=#f8fafc;strokeColor=#64748b',
};

export function getDrawioNodeStyle(
  context: DrawioStyleContext,
): string {
  const normalizedType =
    normalizeSemanticType(
      context.node.type,
    );

  const typeStyle =
    TYPE_STYLES[normalizedType] ??
    'rounded=1';

  const importanceStyle =
    getImportanceStyle(
      context.node.importance,
    );

  return [
    BASE_NODE_STYLE,
    typeStyle,
    importanceStyle,
  ]
    .filter(Boolean)
    .join(';');
}

export function getDrawioGroupStyle(): string {
  return [
    'rounded=1',
    'whiteSpace=wrap',
    'html=1',
    'verticalAlign=top',
    'align=left',
    'spacingTop=8',
    'spacingLeft=10',
    'fontStyle=1',
    'fontSize=14',
    'dashed=1',
    'strokeWidth=1.5',
    'container=1',
    'collapsible=0',
  ].join(';');
}

export function getDrawioLaneStyle(): string {
  return [
    'swimlane',
    'horizontal=0',
    'startSize=50',
    'html=1',
    'rounded=0',
    'collapsible=0',
    'fontStyle=1',
    'fontSize=14',
  ].join(';');
}

export function getDrawioEdgeStyle(
  edgeType: string,
  routing:
    SemanticDiagramModel[
      'layoutIntent'
    ]['edgeRouting'],
): string {
  const routingStyle =
    routing === 'curved'
      ? 'curved=1'
      : routing === 'direct'
        ? 'edgeStyle=none'
        : 'edgeStyle=orthogonalEdgeStyle;orthogonalLoop=1;jettySize=auto';

  const normalizedType =
    normalizeSemanticType(
      edgeType,
    );

  const semanticStyle =
    normalizedType === 'event'
      ? 'dashed=1'
      : normalizedType === 'response'
        ? 'dashed=1'
        : normalizedType === 'dependency'
          ? 'dashed=1'
          : '';

  return [
    routingStyle,
    semanticStyle,
    'html=1',
    'rounded=0',
    'endArrow=block',
    'endFill=1',
    'strokeWidth=1.5',
    'labelBackgroundColor=default',
    'fontSize=11',
  ]
    .filter(Boolean)
    .join(';');
}

function getImportanceStyle(
  importance:
    SemanticDiagramNode['importance'],
): string {
  if (importance === 'primary') {
    return 'fontStyle=1;strokeWidth=2';
  }

  if (importance === 'supporting') {
    return 'dashed=1';
  }

  return '';
}

function normalizeSemanticType(
  value: string,
): string {
  return value
    .trim()
    .toLowerCase()
    .replace(
      /[\s-]+/g,
      '_',
    );
}
