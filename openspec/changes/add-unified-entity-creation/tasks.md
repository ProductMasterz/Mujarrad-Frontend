# Tasks: Add Unified Entity Creation

## 1. Enhance NewNodeModal with Space Type
- [ ] 1.1 Add "space" to the NodeType union type in NewNodeModal
- [ ] 1.2 Add Space option to the type dropdown with appropriate styling
- [ ] 1.3 Add `defaultType` prop to NewNodeModal to pre-select entity type
- [ ] 1.4 Implement space creation logic using `spaceService.createSpace()`
- [ ] 1.5 Handle navigation after space creation (navigate to new space)
- [ ] 1.6 Update modal title/labels contextually based on selected type

## 2. Connect Add Menu to NewNodeModal with Defaults
- [ ] 2.1 Update `app/spaces/page.tsx` to pass `defaultType="space"` when `onCreateSpace` is triggered
- [ ] 2.2 Update `app/spaces/[slug]/page.tsx` to pass `defaultType="node"` when `onCreateNode` is triggered
- [ ] 2.3 Update `app/spaces/[slug]/page.tsx` to pass `defaultType="context"` when `onCreateContext` is triggered
- [ ] 2.4 Ensure modal resets to correct default type when reopened

## 3. Implement Sidebar Quick Space Creation
- [ ] 3.1 Add `onQuickCreateSpace` prop to Sidebar component
- [ ] 3.2 Modify sidebar hover add button to call quick create when at spaces level
- [ ] 3.3 Implement quick create: call `spaceService.createSpace({ name: "Untitled" })`
- [ ] 3.4 Navigate to newly created space after quick creation
- [ ] 3.5 Invalidate spaces query to update sidebar list

## 4. Create RenameModal Component
- [ ] 4.1 Create `src/shell/components/RenameModal.tsx`
- [ ] 4.2 Implement simple modal with name input field only (no type selector)
- [ ] 4.3 Accept props: `isOpen`, `onClose`, `currentName`, `onRename`, `entityType` (for label)
- [ ] 4.4 Add keyboard support (Enter to submit, Escape to close)
- [ ] 4.5 Add loading and error states

## 5. Add Rename to Context Menu
- [ ] 5.1 Update `ContextMenu.tsx` to include "Rename" action
- [ ] 5.2 Wire up rename action in `app/spaces/page.tsx` to open RenameModal
- [ ] 5.3 Implement space rename using `spaceService.updateSpace()`
- [ ] 5.4 Invalidate queries after successful rename

## 6. Testing and Polish
- [ ] 6.1 Test space creation from header Add button at spaces level
- [ ] 6.2 Test node/context creation from header Add button at space level
- [ ] 6.3 Test quick space creation from sidebar
- [ ] 6.4 Test rename flow via context menu
- [ ] 6.5 Verify type defaults are correctly applied when modal opens
