# Spec: Node Creation

**Capability:** Node Creation
**Change ID:** `implement-eian-node-routing`

---

## MODIFIED Requirements

### Requirement: Context-Scoped Node Creation

The `NewNodeModal` component SHALL accept an optional `contextSlug` prop. When `contextSlug` is present, the creation mutation SHALL call the context-scoped backend endpoint rather than the flat space endpoint. When `contextSlug` is absent, existing flat-creation behavior is preserved unchanged.

The prop signature is:
```typescript
contextSlug?: string
```

The mutation branching logic SHALL be:
1. If `contextSlug` is present and `entityType === 'context'`: call `nodeService.createNestedContext(spaceSlug, contextSlug, data)`.
2. If `contextSlug` is present and `entityType !== 'context'`: call `nodeService.createNodeInContext(spaceSlug, contextSlug, data)`.
3. If `contextSlug` is absent: call `nodeService.createNode(spaceSlug, data)` (existing deprecated path, preserved for backward compatibility).

On mutation success, the following caches SHALL be invalidated:
- `contextNodeKeys.nodes(spaceSlug, contextSlug)` — when `contextSlug` is present
- `blankKeys.count(spaceSlug)` — always, to keep the Blank count accurate
- Existing invalidations (`nodeKeys.lists()`, etc.) are preserved alongside the new ones.

#### Scenario: Create regular node inside a context
- **WHEN** a user opens `NewNodeModal` from within a context layer view (contextSlug is passed as a prop)
- **AND** selects node type "Node"
- **AND** enters a title and submits
- **THEN** the mutation SHALL call `POST /api/spaces/{spaceSlug}/contexts/{contextSlug}/nodes`
- **AND** the new node SHALL appear in the context layer's node list after cache invalidation
- **AND** the new node SHALL NOT appear in the Blank panel

#### Scenario: Create node at space root (no contextSlug)
- **WHEN** a user opens `NewNodeModal` from the space root page (no contextSlug prop)
- **AND** selects node type "Node"
- **AND** enters a title and submits
- **THEN** the mutation SHALL call `POST /api/spaces/{spaceSlug}/nodes`
- **AND** existing behavior is preserved (node lands in Blank, space node list updated)

#### Scenario: Create and open navigates to the correct view
- **WHEN** a user creates a node using the "Create and open" action in `NewNodeModal`
- **THEN** the navigation target SHALL be determined by `getNodeRoute(spaceSlug, createdNode, { fromContext: contextSlug })`
- **AND** a REGULAR node SHALL navigate to `/spaces/${spaceSlug}/node/${node.id}?fromContext=${contextSlug}` when contextSlug is present
- **AND** a CONTEXT node SHALL navigate to `/spaces/${spaceSlug}/context/${node.slug}` regardless of contextSlug

#### Scenario: Duplicate node open navigates to the correct view
- **WHEN** `NewNodeModal` detects a duplicate and the user chooses "Merge" (navigates to the existing node)
- **THEN** the navigation target SHALL also be determined by `getNodeRoute`
- **AND** the existing node's type SHALL govern the destination URL

---

### Requirement: Nested Context Creation

The system SHALL allow users to create a nested context (a CONTEXT node that is a child of an existing context) from within the context layer view. `NewNodeModal` MUST route such requests to `nodeService.createNestedContext(spaceSlug, contextSlug, data)`.

#### Scenario: Context type option visible in context layer modal
- **WHEN** a user opens `NewNodeModal` from within a context layer view
- **AND** the `newNodeModalAvailableTypes` prop includes `'context'`
- **THEN** the type selector SHALL show "Context" as an available option

#### Scenario: Create nested context calls the correct endpoint
- **WHEN** a user selects type "Context" in `NewNodeModal` opened from a context layer view
- **AND** the `contextSlug` prop is present
- **AND** the user submits the form
- **THEN** the mutation SHALL call `POST /api/spaces/{spaceSlug}/contexts/{contextSlug}/contexts`
- **AND** the new context SHALL appear in the child-contexts grid on the context layer page after cache invalidation

#### Scenario: Nested context creation is blocked at space root
- **WHEN** a user opens `NewNodeModal` from the space root page (contextSlug absent)
- **AND** selects type "Context"
- **THEN** the mutation SHALL call `POST /api/spaces/{spaceSlug}/nodes` with `nodeType: 'CONTEXT'`
- **AND** the nested-context endpoint SHALL NOT be called

---

### Requirement: SpaceShell contextSlug Forwarding

The `SpaceShell` component SHALL forward the `contextSlug` it receives to `NewNodeModal`. A `contextSlug` received by `SpaceShell` but not forwarded to the modal is a defect.

#### Scenario: Context layer page creation reaches the correct endpoint
- **WHEN** a user clicks the "+" button on a context layer page rendered inside `SpaceShell`
- **AND** `SpaceShell` has received a non-null `contextSlug` prop
- **THEN** `NewNodeModal` SHALL receive the same `contextSlug` value
- **AND** the resulting mutation SHALL call the context-scoped creation endpoint

#### Scenario: Space root page creation is unaffected
- **WHEN** a user clicks the "+" button on the space root page rendered inside `SpaceShell`
- **AND** `SpaceShell` has received no `contextSlug` prop (or `undefined`)
- **THEN** `NewNodeModal` SHALL receive `contextSlug={undefined}`
- **AND** flat creation behavior is preserved
