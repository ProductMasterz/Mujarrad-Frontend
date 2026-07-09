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
