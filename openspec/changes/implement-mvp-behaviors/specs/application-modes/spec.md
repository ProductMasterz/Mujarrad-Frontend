# Spec: Application Modes

**Capability:** Application Mode System
**Change ID:** `implement-mvp-behaviors`

---

## ADDED Requirements

### Requirement: Application Mode State Management

The system SHALL maintain client-side application mode state that controls UI behavior, available operations, and data visibility.

#### Scenario: Default mode on load
```gherkin
Given I navigate to a space
When the page loads
Then the application mode is "Full View" by default
And all nodes in the space are visible
And edit controls are visible (if I have edit permission)
```

#### Scenario: Mode persists during session
```gherkin
Given I switch to "Scoped View" mode
When I navigate to a different space
And I return to the original space
Then the mode remains "Scoped View"
```

#### Scenario: Mode resets on logout
```gherkin
Given I am in "Scoped View" mode
When I logout and login again
Then the mode is "Full View" (default)
```

---

## Mode Definitions

### Requirement: Scoped View Mode

#### Scenario: Filter by current context
```gherkin
Given I am viewing context "Sprint 1"
And "Sprint 1" contains nodes: ["Task A", "Task B"]
And space also has nodes: ["Task C", "Task D"] outside this context
When I switch to "Scoped View" mode
Then only "Task A" and "Task B" are visible
And "Task C" and "Task D" are hidden
And the sidebar shows only "Sprint 1" tree branch expanded
And a filter badge shows "Viewing: Sprint 1"
```

#### Scenario: Clear scope filter
```gherkin
Given I am in "Scoped View" mode filtered to "Sprint 1"
When I click "Clear Filter" or click on space root
Then the scope expands to show all nodes
And the mode remains "Scoped View" (but unfiltered)
```

### Requirement: Full View Mode

#### Scenario: Show all accessible nodes
```gherkin
Given I am viewing a space with 50 nodes
When I am in "Full View" mode
Then all 50 nodes are visible (paginated if needed)
And the sidebar shows the complete tree
And no filter badge is shown
```

### Requirement: Edit Mode

#### Scenario: Edit mode enables CRUD controls
```gherkin
Given I have "Editor" permission on the space
When I switch to "Edit Mode"
Then I see "Add Node" button in header
And I see edit icons on node cards
And I see delete option in context menus
And the sidebar shows drag handles for reordering
```

#### Scenario: Edit mode with insufficient permission
```gherkin
Given I have "Viewer" permission on the space
When I try to switch to "Edit Mode"
Then a toast shows "You don't have edit permission"
And the mode remains unchanged
```

#### Scenario: Non-edit modes hide CRUD controls
```gherkin
Given I am in "Scoped View" or "Full View" mode (not Edit)
Then I do not see "Add Node" button
And I do not see edit icons
And context menus only show "View" options
```

---

## Mode Selector UI

### Requirement: Mode selector in header

#### Scenario: Mode selector dropdown
```gherkin
Given I am viewing any page
Then I see a mode selector dropdown in the header
And the dropdown shows current mode with icon
When I click the dropdown
Then I see options: "Scoped View", "Full View", "Edit Mode"
And each option has an icon and description
```

#### Scenario: Keyboard shortcuts for modes
```gherkin
Given I am on any page
When I press Cmd+1 (or Ctrl+1 on Windows)
Then the mode switches to "Scoped View"
When I press Cmd+2
Then the mode switches to "Full View"
When I press Cmd+E
Then the mode switches to "Edit Mode" (if permitted)
```

---

## Mode Interactions

### Requirement: Mode affects other features

#### Scenario: Search respects mode
```gherkin
Given I am in "Scoped View" mode filtered to context "Sprint 1"
When I open search (Cmd+K)
Then search results are limited to nodes within "Sprint 1"
And a note shows "Searching in: Sprint 1"
```

#### Scenario: Mode indicator in empty states
```gherkin
Given I am in "Scoped View" mode
And the filtered view shows no nodes
Then the empty state says "No nodes in this view"
And suggests "Try switching to Full View to see all nodes"
```

---

## State Schema

### Requirement: Zustand store schema

#### Scenario: State structure
```typescript
interface AppModeState {
  currentMode: 'scoped' | 'full' | 'edit';
  scopeContext: string | null;  // contextId when scoped
  setMode: (mode: 'scoped' | 'full' | 'edit') => void;
  setScopeContext: (contextId: string | null) => void;
  clearScope: () => void;
}
```

---

## Related Capabilities

- Search: Scoped mode affects search scope
- Node CRUD: Edit mode controls visibility of actions
- Permissions: Edit mode requires sufficient permission
