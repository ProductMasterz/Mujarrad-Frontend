# Multi-Parent Nodes

Fix the single-parent assumption in hierarchy utilities, wire up unused parent count infrastructure, and update UI components to handle nodes with multiple parents.

## MODIFIED Requirements

### Requirement: Fix Parent Overwrite Bug in hierarchy-utils

`buildHierarchyTree()` in `src/lib/hierarchy-utils.ts` MUST store ALL parent IDs per child, not overwrite with the last one. The `parentMap` MUST change from `Map<string, string>` to `Map<string, string[]>`.

#### Scenario: Node with two parents retains both
Given node "C" has `contains` edges from both parent "A" and parent "B"
When `buildHierarchyTree()` processes the attributes
Then `parentMap.get("C")` returns `["A", "B"]`
And NOT just `"B"` (the last one processed)

#### Scenario: findAncestors walks all parent chains
Given node "C" has parents "A" and "B", and "A" has parent "Root"
When `findAncestors("C")` is called
Then it returns `["A", "B", "Root"]` (all ancestors across all parent chains)

### Requirement: TreeNode Type Update

`TreeNode` in `src/types/hierarchy.ts` MUST change `parentId: string | null` to `parentIds: string[]`.

#### Scenario: TreeNode represents multi-parent
Given a TreeNode for a node with parents "A" and "B"
When the tree is built
Then `treeNode.parentIds` is `["A", "B"]`

### Requirement: Wire useParentCounts into NodeGrid

`useParentCounts` MUST be exported from `src/hooks/api/index.ts` and used by NodeGrid to show a parent count badge on nodes with 2+ parents.

#### Scenario: Multi-parent node shows badge
Given node "C" has 3 parents
When it appears in the NodeGrid
Then a badge "3 parents" (or similar) is visible on the card

#### Scenario: Single-parent node shows no badge
Given node "D" has exactly 1 parent
When it appears in the NodeGrid
Then no parent count badge is shown

### Requirement: DeleteNodeModal Multi-Parent Handling

`DeleteNodeModal` MUST accept `parentIds: string[]` instead of `parentId?: string`. When orphan-deleting a multi-parent node, children MUST be re-parented to ALL parents of the deleted node.

#### Scenario: Orphan delete with multiple parents
Given node "B" has parents "A1" and "A2", and child "C"
When "B" is deleted with "orphan children" option
Then child "C" gets `contains` edges from both "A1" and "A2"

### Requirement: Breadcrumb Multi-Parent Indicator

`Breadcrumb` component MUST show the navigation path used to reach the node. When the node has multiple parents, a visual indicator (e.g., "+2 other paths") should be displayed.

#### Scenario: Breadcrumb shows current path with indicator
Given node "C" has parents "A" and "B"
And the user navigated via "A" > "C"
Then the breadcrumb shows "A > C" with a "+1 other path" indicator

### Requirement: Sidebar Multi-Parent Display

The sidebar hierarchy MUST show multi-parent nodes under their primary (oldest) parent, with a visual indicator for duplicates. The node should not be duplicated across all parent branches.

#### Scenario: Multi-parent node appears once in sidebar
Given node "C" has parents "A" and "B" (A is older)
When the sidebar renders the hierarchy
Then "C" appears under "A" with a multi-parent indicator
And "C" does NOT appear duplicated under "B"
