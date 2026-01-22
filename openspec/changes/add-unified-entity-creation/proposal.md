# Change: Add Unified Entity Creation with Scope-Aware Defaults

## Why
Users cannot create spaces through the UI. When clicking the Add button at the spaces level, the NewNodeModal only shows "Node" and "Context" options - no "Space" option exists. Additionally, the creation flow lacks scope-awareness: clicking "create space" should default to space type, while clicking "create node" should default to node type. The sidebar add button also doesn't support quick space creation.

## What Changes
- **NewNodeModal Enhancement**: Add "Space" as a third entity type option alongside Node and Context
- **Scope-Aware Type Defaults**: Pre-select the entity type based on what triggered the modal (create_space defaults to Space, create_node defaults to Node, etc.)
- **Sidebar Quick Creation**: Add button in sidebar creates an "Untitled" space directly (no modal) and navigates to it
- **Rename Modal**: New modal for renaming spaces/nodes without entity type selector (just name input)
- **Context Menu Integration**: Add "Rename" option to space/node context menus that opens the rename modal

## Impact
- Affected specs: entity-creation (new capability)
- Affected code:
  - `src/shell/components/NewNodeModal.tsx` - Add space type, accept default type prop
  - `src/shell/components/Sidebar.tsx` - Implement quick space creation
  - `src/shell/components/RenameModal.tsx` - New component for rename-only flows
  - `src/shell/components/ContextMenu.tsx` - Add rename action
  - `app/spaces/page.tsx` - Pass default type to modal based on action
  - `src/services/api/space.service.ts` - Already has createSpace (no changes needed)
  - `src/stores/navigationStore.ts` - Already has scope-aware actions (no changes needed)
