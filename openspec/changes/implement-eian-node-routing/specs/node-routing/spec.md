# Spec: Node Routing

**Capability:** Node Routing
**Change ID:** `implement-eian-node-routing`

---

## ADDED Requirements

### Requirement: Canonical Node Route Function

The system SHALL provide a single function `getNodeRoute(spaceSlug, node, options?)` in `src/lib/routing.ts` that is the authoritative source for producing any navigation URL targeting a node. Every component that produces a link or calls `router.push` for a node MUST call this function. Hardcoded inline route strings for node navigation are prohibited.

#### Scenario: CONTEXT node with slug routes to layer view
- **WHEN** `getNodeRoute` is called with a node where `node.nodeType === 'CONTEXT'` and `node.slug` is a non-empty string
- **THEN** the returned URL SHALL be `/spaces/${spaceSlug}/context/${node.slug}`
- **AND** the URL SHALL NOT contain `/node/`

#### Scenario: REGULAR node routes to content view
- **WHEN** `getNodeRoute` is called with a node where `node.nodeType === 'REGULAR'`
- **THEN** the returned URL SHALL be `/spaces/${spaceSlug}/node/${node.id}`
- **AND** the URL SHALL NOT contain `/context/`

#### Scenario: fromContext option appends query parameter
- **WHEN** `getNodeRoute` is called with `options.fromContext` set to a context slug string
- **AND** the node is a REGULAR node
- **THEN** the returned URL SHALL include `?fromContext=${encodeURIComponent(contextSlug)}`

#### Scenario: CONTEXT node without slug falls back to content view
- **WHEN** `getNodeRoute` is called with a node where `node.nodeType === 'CONTEXT'` and `node.slug` is null or undefined
- **THEN** the returned URL SHALL fall back to `/spaces/${spaceSlug}/node/${node.id}`

#### Scenario: fromContext is not appended when navigating to a context layer
- **WHEN** `getNodeRoute` is called with a CONTEXT node that has a valid slug
- **AND** `options.fromContext` is provided
- **THEN** the returned URL SHALL be the layer view URL without any query parameter
- **AND** the `fromContext` option SHALL be silently ignored for CONTEXT node routing

---

### Requirement: URL Route Map

The system SHALL maintain a canonical set of URL patterns. Each URL pattern maps to exactly one view type and one data contract. No view SHALL be accessible by more than one stable URL pattern.

#### Scenario: Space root URL displays the context grid
- **WHEN** a user navigates to `/spaces/[slug]`
- **THEN** the space layer (Layer 0) view SHALL render
- **AND** the page SHALL fetch `GET /api/spaces/slug/{slug}` and `GET /api/spaces/{slug}/nodes`

#### Scenario: Context layer URL displays child contexts and nodes
- **WHEN** a user navigates to `/spaces/[slug]/context/[contextSlug]`
- **THEN** the context layer view SHALL render
- **AND** the page SHALL fetch `GET /api/spaces/{slug}/contexts/{contextSlug}/nodes` and `GET /api/spaces/{slug}/contexts/{contextSlug}/children`

#### Scenario: Node content URL without origin displays with space back target
- **WHEN** a user navigates to `/spaces/[slug]/node/[id]` with no `?fromContext` parameter
- **THEN** the node content (block editor) view SHALL render
- **AND** the Back button SHALL navigate to `/spaces/${slug}`

#### Scenario: Node content URL with fromContext displays with context back target
- **WHEN** a user navigates to `/spaces/[slug]/node/[id]?fromContext=[contextSlug]`
- **THEN** the node content (block editor) view SHALL render
- **AND** the Back button SHALL navigate to `/spaces/${slug}/context/${contextSlug}`

---

### Requirement: CONTEXT Node Dual View

A node with `nodeType === 'CONTEXT'` SHALL have two distinct views: the Layer View (primary) and the Content View (secondary). Navigation to a CONTEXT node from any listing or card SHALL always target the Layer View. The Content View SHALL be reachable only via an explicit "View Context Content" affordance on the Layer View page.

#### Scenario: Clicking a context card navigates to the layer view
- **WHEN** a user clicks a node card where `nodeType === 'CONTEXT'`
- **AND** the node has a non-null `slug`
- **THEN** the browser SHALL navigate to `/spaces/${spaceSlug}/context/${node.slug}`
- **AND** the block-editor view at `/spaces/${spaceSlug}/node/${node.id}` SHALL NOT be shown

#### Scenario: View Context Content button navigates to the content view
- **WHEN** a user is on the context layer page at `/spaces/[slug]/context/[contextSlug]`
- **AND** the page has resolved the underlying context node's UUID
- **THEN** a "View Context Content" button SHALL be visible in the page header area
- **AND** clicking it SHALL navigate to `/spaces/${slug}/node/${contextNode.id}?fromContext=${contextSlug}`

#### Scenario: Context content view back button returns to layer view
- **WHEN** a user is on the node content view opened via "View Context Content"
- **AND** the URL contains `?fromContext=[contextSlug]`
- **THEN** the Back button SHALL navigate to `/spaces/${slug}/context/${contextSlug}`
- **AND** the user SHALL NOT be taken to the space root

#### Scenario: canRenderAsPage is true for CONTEXT nodes
- **WHEN** the `canRenderAsPage` utility is evaluated for a node with `nodeType === 'CONTEXT'`
- **THEN** the result SHALL be `true`
- **AND** the block editor page SHALL render the node's content without a 404 or blank state

---

### Requirement: Block Node Exclusion at Data Layer

REGULAR nodes that have a non-null `parentNodeId` (block-level nodes) SHALL be excluded from space and context listing views. This filter SHALL be applied at the data transformation layer — in a hook selector or mapping function — before any list component renders.

#### Scenario: Block children do not appear in the space node grid
- **WHEN** the space root page renders its node grid
- **THEN** nodes where `node.parentNodeId != null && node.nodeType === 'REGULAR'` SHALL NOT appear as top-level cards

#### Scenario: Block children do not appear in context node listings
- **WHEN** the context layer page renders its node list
- **THEN** nodes where `node.parentNodeId != null && node.nodeType === 'REGULAR'` SHALL NOT appear in the list
- **AND** REGULAR nodes with a null `parentNodeId` SHALL appear normally

---

### Requirement: Query Key Factory Discipline

All calls to `queryClient.invalidateQueries` and `queryClient.setQueryData` SHALL use the established key factory functions (`nodeKeys.*`, `contextNodeKeys.*`, `spaceKeys.*`, `blankKeys.*`, `voidKeys.*`). Inline string array literals are prohibited as query keys for any entity that has a factory.

#### Scenario: Context node cache is invalidated using the factory
- **WHEN** a mutation that modifies context node membership succeeds
- **THEN** `queryClient.invalidateQueries` SHALL be called with `{ queryKey: contextNodeKeys.nodes(spaceSlug, contextSlug) }`
- **AND** NOT with an inline array such as `['context-nodes', spaceSlug, contextSlug]`

#### Scenario: Retry button invalidation uses the factory
- **WHEN** the user clicks the retry button on the context layer page error state
- **THEN** the invalidation call SHALL use `contextNodeKeys.nodes(spaceSlug, contextSlug)` from the factory
- **AND** the query SHALL re-fetch correctly

---

### Requirement: Correct Service Endpoints

All service methods SHALL call the backend endpoints documented in the API contract. A service method that calls an incorrect path is a blocking defect.

#### Scenario: deleteAttribute calls the correct endpoint
- **WHEN** `attributeService.deleteAttribute(attributeId)` is called
- **THEN** the HTTP request SHALL be `DELETE /api/attributes/${attributeId}`
- **AND** NOT `DELETE /api/nodes/${nodeId}/attributes/${attributeId}`

#### Scenario: reorderChildren sends the correct body field
- **WHEN** `nodeService.reorderChildren(spaceSlug, parentNodeId, orderedIds)` is called
- **THEN** the HTTP request body SHALL contain `{ orderedChildIds: [...] }`
- **AND** NOT `{ nodeIds: [...] }`
