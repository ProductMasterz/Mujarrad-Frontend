# Graph Visualization

Add AI/agent indicators to graph nodes, fix filtering gaps, and resolve renderer inconsistencies.

## MODIFIED Requirements

### Requirement: AI-Created Badge on Graph Nodes

`CustomNode.tsx` MUST show an AI-created indicator (sparkle icon + "AI" label) matching NodeCard's badge, using the centralized `isAiCreatedNode()` utility.

#### Scenario: Agent-created node shows AI badge in graph
Given a node with `nodeDetails.createdFrom: 'agent'`
When it is rendered in the graph view
Then it shows a blue "AI" badge with sparkle icon
And the badge matches the style used in NodeCard

#### Scenario: Manual node shows no AI badge in graph
Given a node with `nodeDetails.createdFrom: 'manual'`
When it is rendered in the graph view
Then no AI badge is shown

### Requirement: AI Filter in GraphControls

`GraphControls.tsx` MUST include a filter toggle to show/hide AI-created nodes, under the System section.

#### Scenario: User hides AI-created nodes
Given the graph shows 10 nodes, 4 created by agents
When the user toggles "AI Created" filter OFF
Then only 6 manual nodes remain visible

#### Scenario: AI filter is ON by default
Given the user opens the graph for the first time
Then both AI-created and manual nodes are visible

### Requirement: Pass Node Metadata to GraphNode.data

`useGraph.ts` and `graph-utils.ts` MUST pass `createdFrom`, `semanticTypeSource`, `isLocked`, and `isBuiltin` into `GraphNode.data` so CustomNode can render them.

#### Scenario: GraphNode carries creation metadata
Given a node with `createdFrom: 'agent'` and `isLocked: true`
When it is transformed into a GraphNode
Then `graphNode.data.createdFrom === 'agent'`
And `graphNode.data.isLocked === true`

### Requirement: Fix Fragile Block Detection

`graph-utils.ts` MUST remove the `title.startsWith("Block ")` fallback for block detection. Only `nodeDetails.blockType` should be used.

#### Scenario: Node titled "Block Party" is not hidden
Given a regular node with title "Block Party" and no blockType in nodeDetails
When the graph filters nodes
Then "Block Party" is visible (not falsely classified as a block)

#### Scenario: Actual block is hidden
Given a block node with `nodeDetails.blockType: 'text'`
When the graph filters nodes with showBlocks: false
Then the block is hidden

### Requirement: Unify Graph Renderers

If `GraphCanvas.tsx` is actively used, it MUST apply `buildGraphData` filtering with viewMode from `graphStore`. If unused, deprecate and remove it.

#### Scenario: GraphCanvas respects view filters
Given the user hides "Context" nodes in graph controls
When GraphCanvas renders
Then context nodes are not visible
And behavior matches GraphVisualization

## ADDED Requirements

### Requirement: GraphNode Type Extension

`GraphNode` in `src/types/graph.ts` MUST include: `createdFrom?: string`, `semanticTypeSource?: string`, `isLocked?: boolean`, `isBuiltin?: boolean` in its data type.

#### Scenario: TypeScript recognizes graph node metadata
Given a component accesses `graphNode.data.createdFrom`
When TypeScript compiles
Then no type error occurs
