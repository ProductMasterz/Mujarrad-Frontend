# Cache Invalidation

Fix 9 mutation hooks that fail to invalidate related caches, causing stale UI after creates, deletes, moves, and assignments.

## MODIFIED Requirements

### Requirement: useCreateNode Cache Invalidation

`useCreateNode` MUST invalidate `contextNodeKeys.nodes(spaceSlug, contextSlug)` when creating a node in a context, and `blankKeys.count(spaceSlug)` when creating a node that lands in The Blank.

#### Scenario: Node created in context appears immediately
Given a user creates a node inside context "project-alpha"
When the creation mutation succeeds
Then the context node list for "project-alpha" is invalidated
And the new node appears in the context grid without manual refresh

#### Scenario: Blank count updates after node creation
Given a user creates a node without assigning it to a context
When the creation succeeds and the node lands in The Blank
Then the blank count badge updates immediately

### Requirement: useDeleteNode Cache Invalidation

`useDeleteNode` MUST invalidate parent and context caches when a node is deleted.

#### Scenario: Deleted node disappears from parent's children
Given node "B" is a child of node "A" via a `contains` attribute
When node "B" is deleted
Then `childNodeKeys.children(spaceSlug, nodeA.id)` is invalidated
And node "A"'s children list no longer shows "B"

#### Scenario: Deleted node disappears from context
Given node "B" belongs to context "project-alpha"
When node "B" is deleted
Then `contextNodeKeys.nodes(spaceSlug, 'project-alpha')` is invalidated

### Requirement: useMigrateNode Cache Invalidation

`useMigrateNode` MUST invalidate both source and target space caches.

#### Scenario: Migrated node appears in target space
Given a node is migrated from space "A" to space "B"
When the migration succeeds
Then `nodeKeys.list('space-a')` is invalidated (node disappears from source)
And `nodeKeys.list('space-b')` is invalidated (node appears in target)

### Requirement: useRenameNode Context Slug Invalidation

When renaming a context node (which changes its slug), `useRenameNode` MUST invalidate caches keyed by the old slug.

#### Scenario: Renamed context remains accessible
Given context node "old-name" is renamed to "new-name"
When the rename succeeds
Then `contextNodeKeys.nodes(spaceSlug, 'old-name')` is invalidated
And navigation to "new-name" works immediately

### Requirement: useAssignFromBlank and useBulkAssignFromBlank

Both hooks MUST invalidate the target context cache after assigning blank nodes.

#### Scenario: Assigned node appears in target context
Given a blank node is assigned to context "project-alpha"
When the assignment succeeds
Then `contextNodeKeys.nodes(spaceSlug, 'project-alpha')` is invalidated
And the node appears in the context grid immediately

### Requirement: useAssignVoidToSpace

The hook MUST invalidate the target space's node list after assigning a void node to a space.

#### Scenario: Void node appears in target space
Given a void node is assigned to space "my-space"
When the assignment succeeds
Then `nodeKeys.lists()` is invalidated
And the node appears in the space's node grid

### Requirement: useRemoveFromContext

The hook MUST invalidate parent count caches when removing a node from a context.

#### Scenario: Parent count updates after removal
Given a node is removed from context "project-alpha"
When the removal succeeds
Then incoming attributes cache for the node is invalidated

### Requirement: useUpdateNode Semantic Type Change

When a node's `semanticType` or `entityType` changes, attribute and graph caches MUST be invalidated.

#### Scenario: Type change refreshes graph
Given a node's semantic type is changed from "person" to "topic"
When the update succeeds
Then `['nodeAttributes', nodeId]` and `['spaceAttributes', spaceId]` are invalidated
And the graph reflects the new type color and icon

### Requirement: Stale Data Timing

`useSearchNodes` staleTime MUST be reduced from 2 minutes to 30 seconds. Node mutations (update, delete, rename) MUST invalidate search query keys.

#### Scenario: Renamed node found by new name in search
Given a node "Old Title" is renamed to "New Title"
When the user searches for "New Title" within 30 seconds
Then the search results include the renamed node
