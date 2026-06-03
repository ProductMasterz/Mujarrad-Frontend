## 1. Schema Section Component
- [x] 1.1 Create `ContextSchemaSection` component that renders `attributeSchema` fields as visual items
- [x] 1.2 Create `SchemaFieldItem` component displaying field name, type badge, required flag, description, default
- [x] 1.3 Add empty state for contexts without a ContextType (no `context_type_id`)

## 2. Context Page Integration
- [x] 2.1 Integrate `ContextSchemaSection` into the context page layout alongside existing content
- [x] 2.2 Conditionally render schema section only when `space.projectType === 'BACKEND'`
- [x] 2.3 Fetch `ContextType` data for the current context via slug matching (hook/query)

## 3. Schema Locking via Space Mode
- [x] 3.1 Read space `mode` (PRODUCTION/CONFIGURATION) and reflect lock state on schema section
- [x] 3.2 Render locked indicators on schema field items when space mode is PRODUCTION
- [x] 3.3 Disable schema editing when space mode is PRODUCTION
- [x] 3.4 Add space mode toggle (PRODUCTION/CONFIGURATION) in space settings for BACKEND spaces (already exists: SpaceModeToggle)
- [x] 3.5 Call `PATCH /api/spaces/{id}` with mode field on toggle (already exists: SpaceModeToggle)
- [x] 3.6 Hide space mode toggle for CONSUMER spaces (already exists: SpaceModeToggle)

## 4. Multi-Parent Containment (Superposition)
- [x] 4.1 Update attribute creation to support multiple CONTAINS from different sources to the same target
- [x] 4.2 Handle 409 response when duplicate CONTAINS is attempted (show "already a child" message)
- [x] 4.3 Update context view to display nodes that appear in multiple parents
- [x] 4.4 Added `getIncomingAttributes(nodeId)` to attribute service using `GET /api/nodes/{id}/incoming-attributes`
- [x] 4.5 Added multi-parent badge via `useParentCounts` hook — shows "N contexts" on nodes with >1 parent

## 5. Context-to-Context Containment
- [x] 5.1 Allow CONTAINS attribute creation between two CONTEXT nodes
- [x] 5.2 Display child contexts within parent context's view alongside child nodes (visually distinct)
- [x] 5.3 Ensure flat space context list shows each context exactly once (deduplicated — already handled by existing query)

## 6. Bidirectional Context Containment
- [x] 6.1 Allow mutual CONTAINS attributes (A→B and B→A simultaneously — no frontend restriction)
- [x] 6.2 Cycle-safe rendering: context page navigates to child contexts via router (page-per-context), no inline recursive expansion — cycles are inherently safe
- [x] 6.3 No infinite recursion: each context page is an independent route that fetches its own children

## 7. Containment Rules Enforcement
- [x] 7.1 Validate containment rules in frontend: context can only be child of context, not of regular node
- [x] 7.2 Show appropriate error when user attempts invalid containment
- [x] 7.3 Filter "Make a Child Of" picker options based on source entity type

## 8. Replace Move To with Make a Child Of
- [x] 8.1 Remove "Move To" from node right-click context menu
- [x] 8.2 Add "Make a Child Of" to node right-click menu with context/node picker
- [x] 8.3 Add "Make a Child Of" to context right-click menu with context-only picker
- [x] 8.4 Create CONTAINS attribute on parent selection (additive, preserves existing parents)

## 9. Remove from Context
- [x] 9.1 Add "Remove from [Context Name]" to node right-click menu when viewed within a context
- [x] 9.2 Call `DELETE /api/spaces/{slug}/contexts/{ctx}/nodes/{nodeId}` on action
- [x] 9.3 Update UI to remove node from context view after successful deletion
- [x] 9.4 Hide "Remove from Context" when node is not viewed within a context
