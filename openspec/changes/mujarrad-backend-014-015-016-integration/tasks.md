# Tasks — Mujarrad Backend 014+015+016 Integration

All tasks COMPLETED.

## Phase 1: Backend Integration (014+015)
- [x] Remove TEMPLATE from NodeType enum and all references
- [x] Remove ASSUMPTION from all references
- [x] Handle paginated node listing (extractPage in getNodes)
- [x] Add context-scoped creation methods (createNodeInContext, getNodesInContext)
- [x] Add node migration method (migrateNode replaces moveNode)
- [x] Add organization service methods (CRUD + members)
- [x] Add void service methods (CRUD + assign)
- [x] Add locking service methods (node, attribute, space lock/unlock)
- [x] Add virtual context service methods (CRUD + members + cross-space attrs)
- [x] Add context type service methods (CRUD with X-Space-Mode header)
- [x] Update MujarradAttribute type (isLocked, virtualContextId)
- [x] Update Node type (lockLevel non-optional, isBuiltin non-optional)
- [x] Update Space type (organizationId, isLocked)

## Phase 2: UI Features
- [x] Organization switcher (OrgSwitcher + CreateOrgDialog + organizationStore)
- [x] Lock management (LockToggle, SpaceLockToggle renamed to Schema Lock, LockedBanner)
- [x] The Blank (BlankNodesPanel collapsible, BlankBadge, AssignToContextDialog)
- [x] The Void (QuickNoteButton, VoidInbox page, AssignVoidDialog)
- [x] Node migration dialog (MigrateNodeDialog)
- [x] Virtual context panel (VCPanel, CreateVCDialog)
- [x] Context list (ContextList)
- [x] Schema management (SchemaViewer, ContextTypeList, CreateContextTypeDialog)

## Phase 3: Navigation Restructure
- [x] Space page shows only contexts (ProjectCard) + Blank card
- [x] New context detail page (/spaces/[slug]/context/[contextSlug])
- [x] Sidebar: Org → Spaces → Contexts → Blank → Void
- [x] Universal "New" button (navbar + pages)
- [x] Context right-click "Open as Page"
- [x] Remove "All Nodes" flat view
- [x] Remove node type filters from space view

## Phase 4: Batch 016 Pagination Fix
- [x] Add extractPage<T> utility to client.ts
- [x] Fix space.service.ts (getSpaces)
- [x] Fix attribute.service.ts (getNodeAttributes, getSpaceAttributes)
- [x] Fix organization.service.ts (listOrganizations, listMembers)
- [x] Fix virtual-context.service.ts (4 methods)
- [x] Fix api-key.service.ts (listKeys)
- [x] Fix context-type.service.ts (listContextTypes)
- [x] Fix version.service.ts (getNodeVersions + nodeId number→string)
- [x] Fix whiteboard.service.ts (getWhiteboardNodes, getWhiteboardContext .find())
- [x] Refactor node.service.ts inline extraction to use extractPage
- [x] Refactor void.service.ts inline extraction to use extractPage
- [x] Fix blank paths (/blank → /blank/nodes, /blank/assign)
- [x] Add new Node fields (effectiveLockLevel, lockInherited, lockSource, parentNodeId)
- [x] Add child node methods (createChildNode, getChildNodes, reorderChildren)
- [x] Add useChildNodes hooks
- [x] Update block editor to use createChildNode
