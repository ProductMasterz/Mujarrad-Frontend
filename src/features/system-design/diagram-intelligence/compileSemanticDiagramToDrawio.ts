import type {
  SemanticDiagramModel,
} from '../types/diagramIntelligence.types';

import {
  layoutSemanticDiagram,
  type SemanticLayoutPlan,
} from './layoutSemanticDiagram';

import {
  getDrawioEdgeStyle,
  getDrawioGroupStyle,
  getDrawioLaneStyle,
  getDrawioNodeStyle,
} from './drawioStyleRegistry';

export interface CompileSemanticDiagramResult {
  xml: string;

  layout:
    SemanticLayoutPlan;

  warnings:
    string[];
}

export function compileSemanticDiagramToDrawio(
  diagram: SemanticDiagramModel,
): CompileSemanticDiagramResult {
  const layout =
    layoutSemanticDiagram(
      diagram,
    );

  const warnings = [
    ...layout.warnings,
  ];

  const nodePositionById =
    new Map(
      layout.nodes.map(
        (node) => [
          node.nodeId,
          node,
        ],
      ),
    );

  const groupPositionById =
    new Map(
      layout.groups.map(
        (group) => [
          group.groupId,
          group,
        ],
      ),
    );

  const lanePositionById =
    new Map(
      layout.lanes.map(
        (lane) => [
          lane.laneId,
          lane,
        ],
      ),
    );

  const cells: string[] = [
    '<mxCell id="0"/>',
    '<mxCell id="1" parent="0"/>',
  ];

  for (
    const group of diagram.groups
  ) {
    const position =
      groupPositionById.get(
        group.id,
      );

    if (!position) {
      warnings.push(
        `Group "${group.id}" was not rendered because it has no positioned members.`,
      );

      continue;
    }

    const parentGroupPosition =
      group.parentId
        ? groupPositionById.get(
            group.parentId,
          )
        : undefined;

    if (
      group.parentId &&
      !parentGroupPosition
    ) {
      warnings.push(
        `Group "${group.id}" references parent group "${group.parentId}" that was not positioned. The group was rendered at the root level.`,
      );
    }

    const parentId =
      group.parentId &&
      parentGroupPosition
        ? semanticCellId(
            'group',
            group.parentId,
          )
        : '1';

    const relativeX =
      parentGroupPosition
        ? position.x -
          parentGroupPosition.x
        : position.x;

    const relativeY =
      parentGroupPosition
        ? position.y -
          parentGroupPosition.y
        : position.y;

    cells.push(
      createVertexCell({
        id:
          semanticCellId(
            'group',
            group.id,
          ),

        value:
          group.label,

        style:
          getDrawioGroupStyle(),

        parentId,

        x:
          relativeX,

        y:
          relativeY,

        width:
          position.width,

        height:
          position.height,
      }),
    );
  }

  for (
    const lane of diagram.lanes
  ) {
    const position =
      lanePositionById.get(
        lane.id,
      );

    if (!position) {
      continue;
    }

    cells.push(
      createVertexCell({
        id:
          semanticCellId(
            'lane',
            lane.id,
          ),

        value:
          lane.label,

        style:
          getDrawioLaneStyle(),

        parentId:
          '1',

        x:
          position.x,

        y:
          position.y,

        width:
          position.width,

        height:
          position.height,
      }),
    );
  }

  for (
    const node of diagram.nodes
  ) {
    const position =
      nodePositionById.get(
        node.id,
      );

    if (!position) {
      warnings.push(
        `Node "${node.id}" was not rendered because no layout position was found.`,
      );

      continue;
    }

    const parentGeometry =
      resolveNodeParentGeometry(
        node.groupId,
        node.laneId,
        groupPositionById,
        lanePositionById,
      );

    cells.push(
      createVertexCell({
        id:
          semanticCellId(
            'node',
            node.id,
          ),

        value:
          node.label,

        style:
          getDrawioNodeStyle({
            diagram,
            node,
          }),

        parentId:
          parentGeometry.parentId,

        x:
          position.x -
          parentGeometry.offsetX,

        y:
          position.y -
          parentGeometry.offsetY,

        width:
          position.width,

        height:
          position.height,
      }),
    );
  }

  const renderedNodeIds =
    new Set(
      layout.nodes.map(
        (node) => node.nodeId,
      ),
    );

  for (
    const edge of diagram.edges
  ) {
    if (
      !renderedNodeIds.has(
        edge.sourceId,
      ) ||
      !renderedNodeIds.has(
        edge.targetId,
      )
    ) {
      warnings.push(
        `Edge "${edge.id}" was skipped because its source or target was not rendered.`,
      );

      continue;
    }

    cells.push(
      createEdgeCell({
        id:
          semanticCellId(
            'edge',
            edge.id,
          ),

        value:
          edge.label ?? '',

        style:
          getDrawioEdgeStyle(
            edge.type,
            diagram.layoutIntent
              .edgeRouting,
          ),

        sourceId:
          semanticCellId(
            'node',
            edge.sourceId,
          ),

        targetId:
          semanticCellId(
            'node',
            edge.targetId,
          ),
      }),
    );
  }

  const xml = [
    '<mxGraphModel>',
    '<root>',
    ...cells,
    '</root>',
    '</mxGraphModel>',
  ].join('');

  return {
    xml,

    layout,

    warnings,
  };
}

function resolveNodeParentGeometry(
  groupId:
    string | undefined,

  laneId:
    string | undefined,

  groupPositionById:
    Map<
      string,
      {
        x: number;
        y: number;
      }
    >,

  lanePositionById:
    Map<
      string,
      {
        x: number;
        y: number;
      }
    >,
): {
  parentId: string;

  offsetX: number;

  offsetY: number;
} {
  if (laneId) {
    const lanePosition =
      lanePositionById.get(
        laneId,
      );

    if (lanePosition) {
      return {
        parentId:
          semanticCellId(
            'lane',
            laneId,
          ),

        offsetX:
          lanePosition.x,

        offsetY:
          lanePosition.y,
      };
    }
  }

  if (groupId) {
    const groupPosition =
      groupPositionById.get(
        groupId,
      );

    if (groupPosition) {
      return {
        parentId:
          semanticCellId(
            'group',
            groupId,
          ),

        offsetX:
          groupPosition.x,

        offsetY:
          groupPosition.y,
      };
    }
  }

  return {
    parentId: '1',

    offsetX: 0,

    offsetY: 0,
  };
}

function createVertexCell(
  input: {
    id: string;

    value: string;

    style: string;

    parentId: string;

    x: number;

    y: number;

    width: number;

    height: number;
  },
): string {
  return [
    `<mxCell id="${escapeXmlAttribute(input.id)}"`,
    ` value="${escapeXmlAttribute(input.value)}"`,
    ` style="${escapeXmlAttribute(input.style)}"`,
    ' vertex="1"',
    ` parent="${escapeXmlAttribute(input.parentId)}">`,
    `<mxGeometry x="${input.x}" y="${input.y}" width="${input.width}" height="${input.height}" as="geometry"/>`,
    '</mxCell>',
  ].join('');
}

function createEdgeCell(
  input: {
    id: string;

    value: string;

    style: string;

    sourceId: string;

    targetId: string;
  },
): string {
  return [
    `<mxCell id="${escapeXmlAttribute(input.id)}"`,
    ` value="${escapeXmlAttribute(input.value)}"`,
    ` style="${escapeXmlAttribute(input.style)}"`,
    ' edge="1"',
    ' parent="1"',
    ` source="${escapeXmlAttribute(input.sourceId)}"`,
    ` target="${escapeXmlAttribute(input.targetId)}">`,
    '<mxGeometry relative="1" as="geometry"/>',
    '</mxCell>',
  ].join('');
}

function semanticCellId(
  kind:
    | 'node'
    | 'edge'
    | 'group'
    | 'lane',

  semanticId: string,
): string {
  return [
    'mujarrad',
    kind,
    sanitizeId(
      semanticId,
    ),
  ].join('-');
}

function sanitizeId(
  value: string,
): string {
  return value
    .trim()
    .toLowerCase()
    .replace(
      /[^a-z0-9_-]+/g,
      '-',
    )
    .replace(
      /^-+|-+$/g,
      '',
    );
}

function escapeXmlAttribute(
  value: string,
): string {
  return value
    .replace(
      /&/g,
      '&amp;',
    )
    .replace(
      /"/g,
      '&quot;',
    )
    .replace(
      /</g,
      '&lt;',
    )
    .replace(
      />/g,
      '&gt;',
    )
    .replace(
      /'/g,
      '&apos;',
    );
}
