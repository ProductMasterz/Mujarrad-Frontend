# Design: Unified Entity Creation

## Context
The application has three entity types: Space, Node, and Context. Currently, the NewNodeModal only supports Node and Context creation. Users at the spaces list level cannot create new spaces through the UI. The recently implemented scope-aware navigation (navigationStore) defines what actions are available at each level, but the modal doesn't respect these contexts.

## Goals
- Enable space creation through the existing modal pattern
- Make creation flow scope-aware (default to appropriate type based on context)
- Provide quick creation from sidebar without modal interruption
- Support renaming via a dedicated, simpler modal

## Non-Goals
- Changing the backend API (already supports all operations)
- Redesigning the modal layout fundamentally
- Adding inline editing (user prefers modal approach)

## Decisions

### 1. Extend NewNodeModal vs Create Separate SpaceModal
**Decision**: Extend NewNodeModal to support all three types

**Rationale**:
- Maintains consistent UX for all entity creation
- Reduces code duplication
- The modal already has the pattern for type switching
- User confirmed preference for unified approach in type selection

**Trade-off**: Modal becomes slightly more complex, but gains flexibility

### 2. Default Type Selection Strategy
**Decision**: Accept a `defaultType` prop that pre-selects the type when modal opens

```typescript
type NewNodeModalProps = {
  // ... existing props
  defaultType?: 'space' | 'node' | 'context';
};
```

**Flow**:
- Header Add button at spaces level → `defaultType="space"`
- Header Add button at space/node level → `defaultType="node"`
- Creating context → `defaultType="context"`

### 3. Sidebar Quick Creation
**Decision**: Sidebar add button creates space immediately (no modal)

**Flow**:
1. User hovers over space item, sees add button
2. Click creates "Untitled" space via API
3. Immediately navigates to `/spaces/{new-space-slug}`
4. User can rename via context menu → RenameModal

**Rationale**: Matches user's stated preference for quick creation without modal interruption from sidebar

### 4. RenameModal Design
**Decision**: Create a minimal modal focused only on renaming

```typescript
type RenameModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  onRename: (newName: string) => Promise<void>;
  entityLabel: string; // "Space" | "Node" | "Context"
};
```

**Features**:
- Single text input pre-populated with current name
- No type selector (per user requirement)
- Submit on Enter, cancel on Escape
- Loading state during API call

## Component Relationships

```
Header Add Button
       │
       ├── spaces level → NewNodeModal(defaultType="space")
       └── space/node level → NewNodeModal(defaultType="node")

Sidebar Add Button (hover)
       │
       └── spaces level → Direct API call → Navigate to new space

Context Menu → Rename
       │
       └── RenameModal (no type selector)
```

## Migration Plan
1. Add space type to NewNodeModal (backward compatible)
2. Add defaultType prop (optional, defaults to "node")
3. Update page components to pass defaultType
4. Create RenameModal
5. Wire up context menu

No breaking changes; all additions are backward compatible.

## Open Questions
- None remaining after user clarification
