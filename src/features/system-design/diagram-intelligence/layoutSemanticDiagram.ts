import type {
  SemanticDiagramModel,
} from '../types/diagramIntelligence.types';

export interface PositionedSemanticNode {
  nodeId: string;

  x: number;

  y: number;

  width: number;

  height: number;

  order: number;
}

export interface PositionedSemanticGroup {
  groupId: string;

  x: number;

  y: number;

  width: number;

  height: number;

  order: number;
}

export interface PositionedSemanticLane {
  laneId: string;

  x: number;

  y: number;

  width: number;

  height: number;

  order: number;
}

export interface SemanticLayoutPlan {
  canvasWidth: number;

  canvasHeight: number;

  nodes: PositionedSemanticNode[];

  groups: PositionedSemanticGroup[];

  lanes: PositionedSemanticLane[];

  warnings: string[];
}

interface LayoutConfig {
  margin: number;

  nodeWidth: number;

  nodeHeight: number;

  horizontalGap: number;

  verticalGap: number;

  groupPadding: number;

  laneHeaderSize: number;
}

const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  margin: 80,

  nodeWidth: 180,

  nodeHeight: 80,

  horizontalGap: 100,

  verticalGap: 70,

  groupPadding: 50,

  laneHeaderSize: 50,
};

export function layoutSemanticDiagram(
  diagram: SemanticDiagramModel,
): SemanticLayoutPlan {
  const config =
    getLayoutConfig(diagram);

  if (shouldUseWideArchitectureLayout(diagram)) {
    return layoutWideArchitectureDiagram(
      diagram,
      config,
    );
  }

  if (
    diagram.layoutIntent.direction ===
    'swimlane'
  ) {
    return layoutSwimlaneDiagram(
      diagram,
      config,
    );
  }

  return layoutHierarchicalDiagram(
    diagram,
    config,
  );
}

function shouldUseWideArchitectureLayout(
  diagram: SemanticDiagramModel,
): boolean {
  const diagramType =
    diagram.diagramType;

  if (
    diagramType === 'uml_sequence' ||
    diagramType === 'uml_activity' ||
    diagramType === 'swimlane' ||
    diagram.layoutIntent.direction === 'swimlane'
  ) {
    return false;
  }

  const searchableText =
    [
      diagram.title,
      diagram.purpose,
      diagram.diagramType,
      ...diagram.nodes.map((node) => `${node.type} ${node.label} ${node.description ?? ''}`),
      ...diagram.groups.map((group) => `${group.type} ${group.label}`),
    ]
      .join(' ')
      .toLowerCase();

  const architectureTypes = new Set([
    'system_architecture',
    'software_architecture',
    'solution_architecture',
    'cloud_architecture',
    'integration_architecture',
    'data_flow',
    'data_pipeline',
    'ai_ml_pipeline',
    'rag_architecture',
    'agent_architecture',
    'c4_context',
    'c4_container',
    'c4_component',
    'uml_component',
  ]);

  if (architectureTypes.has(diagramType)) {
    return true;
  }

  return [
    'saas',
    'platform',
    'software',
    'service',
    'api',
    'matching',
    'scoring',
    'ranking',
    'recommendation',
    'company profile',
    'crm',
    'admin',
    'repository',
    'database',
    'integration',
    'authentication',
  ].some((keyword) => searchableText.includes(keyword));
}

function layoutWideArchitectureDiagram(
  diagram: SemanticDiagramModel,
  config: LayoutConfig,
): SemanticLayoutPlan {
  const warnings: string[] = [];

  const architectureConfig: LayoutConfig = {
    ...config,
    margin: Math.max(config.margin, 90),
    nodeWidth: Math.max(config.nodeWidth, 230),
    nodeHeight: Math.max(config.nodeHeight, 86),
    horizontalGap: Math.max(config.horizontalGap, 135),
    verticalGap: Math.max(config.verticalGap, 42),
    groupPadding: Math.max(config.groupPadding, 45),
  };

  const columns = [
    {
      id: 'actors',
      label: 'Actors / Channels',
      match: (node: SemanticDiagramModel['nodes'][number]) =>
        matchesAny(node, [
          'actor',
          'user',
          'portal',
          'web app',
          'dashboard',
          'admin console',
          'reviewer',
          'customer',
          'company user',
        ]),
    },
    {
      id: 'application',
      label: 'Application Services',
      match: (node: SemanticDiagramModel['nodes'][number]) =>
        matchesAny(node, [
          'application',
          'service',
          'api',
          'gateway',
          'auth',
          'authentication',
          'authorization',
          'rbac',
          'intake',
          'upload',
          'parser',
          'validator',
          'frontend',
          'backend',
        ]),
    },
    {
      id: 'processing',
      label: 'AI / Matching / Processing',
      match: (node: SemanticDiagramModel['nodes'][number]) =>
        matchesAny(node, [
          'ai',
          'ml',
          'matching',
          'scoring',
          'ranking',
          'explanation',
          'extraction',
          'retrieval',
          'search',
          'engine',
          'orchestrator',
          'workflow',
          'process',
          'decision',
        ]),
    },
    {
      id: 'data',
      label: 'Data Stores',
      match: (node: SemanticDiagramModel['nodes'][number]) =>
        matchesAny(node, [
          'database',
          'data_store',
          'repository',
          'storage',
          'file',
          'audit log',
          'log',
          'profile',
          'matching run',
          'company profile',
          'object store',
        ]),
    },
    {
      id: 'integrations',
      label: 'External Integrations',
      match: (node: SemanticDiagramModel['nodes'][number]) =>
        matchesAny(node, [
          'external',
          'integration',
          'crm',
          'email',
          'notification',
          'provider',
          'third party',
          'adapter',
          'webhook',
        ]),
    },
    {
      id: 'operations',
      label: 'Governance / Operations',
      match: (node: SemanticDiagramModel['nodes'][number]) =>
        matchesAny(node, [
          'monitoring',
          'observability',
          'error',
          'failure',
          'security',
          'audit',
          'compliance',
          'review',
          'governance',
          'admin',
          'risk',
        ]),
    },
  ];

  const columnBuckets =
    columns.map((column) => ({
      ...column,
      nodes: [] as SemanticDiagramModel['nodes'],
    }));

  diagram.nodes.forEach((node) => {
    const targetColumn =
      columnBuckets.find((column) => column.match(node)) ??
      columnBuckets[1];

    targetColumn.nodes.push(node);
  });

  // Keep empty columns out of the canvas, but preserve architecture ordering.
  const nonEmptyColumns =
    columnBuckets.filter((column) => column.nodes.length > 0);

  if (nonEmptyColumns.length < 3) {
    warnings.push(
      'Architecture layout had fewer than three populated columns. Consider enriching the diagram with services, data stores, and integrations.',
    );
  }

  const positionedNodes:
    PositionedSemanticNode[] = [];

  nonEmptyColumns.forEach((column, columnIndex) => {
    column.nodes.forEach((node, nodeIndex) => {
      positionedNodes.push({
        nodeId: node.id,
        x:
          architectureConfig.margin +
          columnIndex *
            (
              architectureConfig.nodeWidth +
              architectureConfig.horizontalGap
            ),
        y:
          architectureConfig.margin +
          70 +
          nodeIndex *
            (
              architectureConfig.nodeHeight +
              architectureConfig.verticalGap
            ),
        width:
          architectureConfig.nodeWidth,
        height:
          architectureConfig.nodeHeight,
        order:
          positionedNodes.length,
      });
    });
  });

  const syntheticGroups:
    PositionedSemanticGroup[] =
    nonEmptyColumns.map((column, columnIndex) => {
      const columnNodes =
        positionedNodes.filter((position) =>
          column.nodes.some((node) => node.id === position.nodeId),
        );

      const maxBottom =
        Math.max(
          ...columnNodes.map((node) => node.y + node.height),
          architectureConfig.margin + 220,
        );

      return {
        groupId: `architecture-column-${column.id}`,
        x:
          architectureConfig.margin +
          columnIndex *
            (
              architectureConfig.nodeWidth +
              architectureConfig.horizontalGap
            ) -
          28,
        y:
          architectureConfig.margin,
        width:
          architectureConfig.nodeWidth + 56,
        height:
          maxBottom - architectureConfig.margin + 42,
        order:
          columnIndex,
      };
    });

  const semanticGroups =
    positionGroupsAroundNodes(
      diagram,
      positionedNodes,
      architectureConfig,
    );

  const maxRight =
    Math.max(
      architectureConfig.margin,
      ...positionedNodes.map((node) => node.x + node.width),
      ...syntheticGroups.map((group) => group.x + group.width),
      ...semanticGroups.map((group) => group.x + group.width),
    );

  const maxBottom =
    Math.max(
      architectureConfig.margin,
      ...positionedNodes.map((node) => node.y + node.height),
      ...syntheticGroups.map((group) => group.y + group.height),
      ...semanticGroups.map((group) => group.y + group.height),
    );

  return {
    canvasWidth:
      maxRight + architectureConfig.margin,
    canvasHeight:
      maxBottom + architectureConfig.margin,
    nodes:
      positionedNodes,
    groups:
      [
        ...syntheticGroups,
        ...semanticGroups,
      ],
    lanes:
      [],
    warnings,
  };
}

function matchesAny(
  node: SemanticDiagramModel['nodes'][number],
  keywords: string[],
): boolean {
  const searchable =
    [
      node.type,
      node.label,
      node.description ?? '',
      node.groupId ?? '',
      node.laneId ?? '',
    ]
      .join(' ')
      .toLowerCase();

  return keywords.some((keyword) =>
    searchable.includes(keyword.toLowerCase()),
  );
}

function layoutHierarchicalDiagram(
  diagram: SemanticDiagramModel,
  config: LayoutConfig,
): SemanticLayoutPlan {
  const warnings: string[] = [];

  const levels =
    buildSemanticLevels(diagram);

  const positionedNodes:
    PositionedSemanticNode[] = [];

  const direction =
    diagram.layoutIntent.direction;

  const horizontal =
    direction === 'left_to_right';

  levels.forEach(
    (levelNodeIds, levelIndex) => {
      levelNodeIds.forEach(
        (nodeId, nodeIndex) => {
          const x = horizontal
            ? config.margin +
              levelIndex *
                (
                  config.nodeWidth +
                  config.horizontalGap
                )
            : config.margin +
              nodeIndex *
                (
                  config.nodeWidth +
                  config.horizontalGap
                );

          const y = horizontal
            ? config.margin +
              nodeIndex *
                (
                  config.nodeHeight +
                  config.verticalGap
                )
            : config.margin +
              levelIndex *
                (
                  config.nodeHeight +
                  config.verticalGap
                );

          positionedNodes.push({
            nodeId,

            x,

            y,

            width:
              config.nodeWidth,

            height:
              config.nodeHeight,

            order:
              positionedNodes.length,
          });
        },
      );
    },
  );

  const positionedGroups =
    positionGroupsAroundNodes(
      diagram,
      positionedNodes,
      config,
    );

  const maxRight =
    Math.max(
      config.margin,
      ...positionedNodes.map(
        (node) =>
          node.x + node.width,
      ),
      ...positionedGroups.map(
        (group) =>
          group.x + group.width,
      ),
    );

  const maxBottom =
    Math.max(
      config.margin,
      ...positionedNodes.map(
        (node) =>
          node.y + node.height,
      ),
      ...positionedGroups.map(
        (group) =>
          group.y + group.height,
      ),
    );

  if (
    diagram.layoutIntent.direction ===
      'radial' ||
    diagram.layoutIntent.direction ===
      'timeline'
  ) {
    warnings.push(
      `Layout direction "${diagram.layoutIntent.direction}" currently uses deterministic hierarchical fallback positioning.`,
    );
  }

  return {
    canvasWidth:
      maxRight + config.margin,

    canvasHeight:
      maxBottom + config.margin,

    nodes:
      positionedNodes,

    groups:
      positionedGroups,

    lanes: [],

    warnings,
  };
}

function layoutSwimlaneDiagram(
  diagram: SemanticDiagramModel,
  config: LayoutConfig,
): SemanticLayoutPlan {
  const warnings: string[] = [];

  const orderedLanes =
    [...diagram.lanes].sort(
      (left, right) =>
        left.order - right.order,
    );

  if (orderedLanes.length === 0) {
    warnings.push(
      'Semantic diagram requested swimlane layout but contains no lanes. Hierarchical fallback was used.',
    );

    return layoutHierarchicalDiagram(
      diagram,
      config,
    );
  }

  const laneWidth = 1100;

  const laneHeight = 220;

  const positionedLanes:
    PositionedSemanticLane[] = [];

  const positionedNodes:
    PositionedSemanticNode[] = [];

  orderedLanes.forEach(
    (lane, laneIndex) => {
      const laneX =
        config.margin;

      const laneY =
        config.margin +
        laneIndex * laneHeight;

      positionedLanes.push({
        laneId:
          lane.id,

        x:
          laneX,

        y:
          laneY,

        width:
          laneWidth,

        height:
          laneHeight,

        order:
          laneIndex,
      });

      const laneNodes =
        diagram.nodes.filter(
          (node) =>
            node.laneId === lane.id,
        );

      laneNodes.forEach(
        (node, nodeIndex) => {
          positionedNodes.push({
            nodeId:
              node.id,

            x:
              laneX +
              config.laneHeaderSize +
              40 +
              nodeIndex *
                (
                  config.nodeWidth +
                  config.horizontalGap
                ),

            y:
              laneY +
              (
                laneHeight -
                config.nodeHeight
              ) /
                2,

            width:
              config.nodeWidth,

            height:
              config.nodeHeight,

            order:
              positionedNodes.length,
          });
        },
      );
    },
  );

  const unassignedNodes =
    diagram.nodes.filter(
      (node) =>
        !node.laneId ||
        !orderedLanes.some(
          (lane) =>
            lane.id === node.laneId,
        ),
    );

  if (unassignedNodes.length > 0) {
    warnings.push(
      `${unassignedNodes.length} semantic node(s) were not assigned to a valid lane and were positioned below the swimlanes.`,
    );

    const fallbackY =
      config.margin +
      orderedLanes.length *
        laneHeight +
      config.verticalGap;

    unassignedNodes.forEach(
      (node, nodeIndex) => {
        positionedNodes.push({
          nodeId:
            node.id,

          x:
            config.margin +
            nodeIndex *
              (
                config.nodeWidth +
                config.horizontalGap
              ),

          y:
            fallbackY,

          width:
            config.nodeWidth,

          height:
            config.nodeHeight,

          order:
            positionedNodes.length,
        });
      },
    );
  }

  const positionedGroups =
    positionGroupsAroundNodes(
      diagram,
      positionedNodes,
      config,
    );

  const maxBottom =
    Math.max(
      ...positionedNodes.map(
        (node) =>
          node.y + node.height,
      ),
      ...positionedLanes.map(
        (lane) =>
          lane.y + lane.height,
      ),
      config.margin,
    );

  return {
    canvasWidth:
      laneWidth +
      config.margin * 2,

    canvasHeight:
      maxBottom +
      config.margin,

    nodes:
      positionedNodes,

    groups:
      positionedGroups,

    lanes:
      positionedLanes,

    warnings,
  };
}

function buildSemanticLevels(
  diagram: SemanticDiagramModel,
): string[][] {
  const nodeIds =
    diagram.nodes.map(
      (node) => node.id,
    );

  const incomingCount =
    new Map<string, number>();

  const outgoing =
    new Map<
      string,
      string[]
    >();

  for (const nodeId of nodeIds) {
    incomingCount.set(
      nodeId,
      0,
    );

    outgoing.set(
      nodeId,
      [],
    );
  }

  for (const edge of diagram.edges) {
    if (
      !incomingCount.has(
        edge.sourceId,
      ) ||
      !incomingCount.has(
        edge.targetId,
      )
    ) {
      continue;
    }

    outgoing
      .get(edge.sourceId)
      ?.push(edge.targetId);

    incomingCount.set(
      edge.targetId,
      (
        incomingCount.get(
          edge.targetId,
        ) ?? 0
      ) + 1,
    );
  }

  const levelByNode =
    new Map<string, number>();

  const queue =
    nodeIds.filter(
      (nodeId) =>
        (
          incomingCount.get(
            nodeId,
          ) ?? 0
        ) === 0,
    );

  if (queue.length === 0) {
    return chunkNodes(
      nodeIds,
      5,
    );
  }

  for (const nodeId of queue) {
    levelByNode.set(
      nodeId,
      0,
    );
  }

  const remainingIncoming =
    new Map(incomingCount);

  while (queue.length > 0) {
    const current =
      queue.shift();

    if (!current) {
      continue;
    }

    const currentLevel =
      levelByNode.get(
        current,
      ) ?? 0;

    for (
      const target of
      outgoing.get(current) ?? []
    ) {
      levelByNode.set(
        target,
        Math.max(
          levelByNode.get(
            target,
          ) ?? 0,
          currentLevel + 1,
        ),
      );

      const nextIncoming =
        (
          remainingIncoming.get(
            target,
          ) ?? 0
        ) - 1;

      remainingIncoming.set(
        target,
        nextIncoming,
      );

      if (nextIncoming === 0) {
        queue.push(target);
      }
    }
  }

  for (const nodeId of nodeIds) {
    if (!levelByNode.has(nodeId)) {
      levelByNode.set(
        nodeId,
        0,
      );
    }
  }

  const levels =
    new Map<
      number,
      string[]
    >();

  for (
    const [
      nodeId,
      level,
    ] of levelByNode
  ) {
    const current =
      levels.get(level) ?? [];

    current.push(nodeId);

    levels.set(
      level,
      current,
    );
  }

  return [...levels.entries()]
    .sort(
      ([left], [right]) =>
        left - right,
    )
    .map(
      ([, ids]) => ids,
    );
}

function positionGroupsAroundNodes(
  diagram: SemanticDiagramModel,
  positionedNodes:
    PositionedSemanticNode[],
  config: LayoutConfig,
): PositionedSemanticGroup[] {
  const nodePositionById =
    new Map(
      positionedNodes.map(
        (node) => [
          node.nodeId,
          node,
        ],
      ),
    );

  return diagram.groups
    .map(
      (
        group,
        groupIndex,
      ):
        | PositionedSemanticGroup
        | null => {
        const memberPositions =
          diagram.nodes
            .filter(
              (node) =>
                node.groupId ===
                group.id,
            )
            .map(
              (node) =>
                nodePositionById.get(
                  node.id,
                ),
            )
            .filter(
              (
                node,
              ): node is
                PositionedSemanticNode =>
                Boolean(node),
            );

        if (
          memberPositions.length === 0
        ) {
          return null;
        }

        const minX =
          Math.min(
            ...memberPositions.map(
              (node) => node.x,
            ),
          );

        const minY =
          Math.min(
            ...memberPositions.map(
              (node) => node.y,
            ),
          );

        const maxRight =
          Math.max(
            ...memberPositions.map(
              (node) =>
                node.x +
                node.width,
            ),
          );

        const maxBottom =
          Math.max(
            ...memberPositions.map(
              (node) =>
                node.y +
                node.height,
            ),
          );

        return {
          groupId:
            group.id,

          x:
            minX -
            config.groupPadding,

          y:
            minY -
            config.groupPadding,

          width:
            maxRight -
            minX +
            config.groupPadding * 2,

          height:
            maxBottom -
            minY +
            config.groupPadding * 2,

          order:
            groupIndex,
        };
      },
    )
    .filter(
      (
        group,
      ): group is
        PositionedSemanticGroup =>
        Boolean(group),
    );
}

function getLayoutConfig(
  diagram: SemanticDiagramModel,
): LayoutConfig {
  const density =
    diagram.layoutIntent.density;

  if (density === 'compact') {
    return {
      ...DEFAULT_LAYOUT_CONFIG,

      horizontalGap: 60,

      verticalGap: 45,

      groupPadding: 35,
    };
  }

  if (density === 'spacious') {
    return {
      ...DEFAULT_LAYOUT_CONFIG,

      horizontalGap: 150,

      verticalGap: 110,

      groupPadding: 70,
    };
  }

  return DEFAULT_LAYOUT_CONFIG;
}

function chunkNodes(
  nodeIds: string[],
  size: number,
): string[][] {
  const result: string[][] = [];

  for (
    let index = 0;
    index < nodeIds.length;
    index += size
  ) {
    result.push(
      nodeIds.slice(
        index,
        index + size,
      ),
    );
  }

  return result;
}
