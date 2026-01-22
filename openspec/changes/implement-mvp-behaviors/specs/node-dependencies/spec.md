# Spec: Node Dependencies

**Capability:** Node Dependency Management
**Change ID:** `implement-mvp-behaviors`

---

## ADDED Requirements

### Requirement: Node Delete with Dependency Check

The system SHALL check for node dependencies (children and references) before deletion and MUST provide user options for handling them.

#### Scenario: Delete node with no dependencies
```gherkin
Given I am viewing a node with no children
And the node has no incoming references
When I click "Delete" from the context menu
Then the system shows a confirmation dialog "Delete this node?"
And I click "Delete"
Then the node is deleted
And the node is removed from the sidebar tree
And the node card is removed from the main content
```

#### Scenario: Delete node with children
```gherkin
Given I am viewing a node with 3 child nodes
When I click "Delete" from the context menu
Then the system shows a warning dialog
And the dialog displays "This node has 3 children"
And the dialog shows options: "Delete All", "Delete Only This", "Cancel"
```

#### Scenario: Delete All cascade
```gherkin
Given I see the delete warning dialog for a node with children
When I click "Delete All"
Then the system deletes the node
And the system deletes all descendant nodes
And all deleted nodes are removed from the sidebar tree
And a toast shows "Deleted node and 3 children"
```

#### Scenario: Delete Only This orphans children
```gherkin
Given I see the delete warning dialog for a node with children
When I click "Delete Only This"
Then the system deletes only the selected node
And child nodes are moved to the parent context (or space root if no parent)
And the sidebar tree updates to show children in new location
And a toast shows "Deleted node. 3 children moved to [parent name]"
```

#### Scenario: Delete node with incoming references
```gherkin
Given I am viewing a node that is referenced by 2 other nodes
When I click "Delete" from the context menu
Then the system shows a warning dialog
And the dialog displays "This node is referenced by 2 other nodes"
And the dialog shows option to "Delete anyway"
When I click "Delete anyway"
Then the node is deleted
And the referencing nodes show a "broken link" indicator
```

---

## UI/UX Requirements

### Requirement: Dependency Warning Modal Design

#### Scenario: Modal content structure
```gherkin
Given a node has dependencies
When the delete warning modal appears
Then the modal title is "Delete Node?"
And the modal shows:
  - Node title being deleted
  - Count of children (if any)
  - Count of references (if any)
  - List of affected items (collapsible, max 5 shown)
And the modal has action buttons:
  - "Delete All" (destructive, red)
  - "Delete Only This" (secondary)
  - "Cancel" (ghost)
```

---

## API Integration

### Requirement: Fetch dependencies before delete

#### Scenario: API calls for dependency check
```gherkin
Given a user initiates delete for node "abc-123"
When the system checks dependencies
Then the system calls GET /api/spaces/{slug}/nodes/abc-123/descendants
And the system calls GET /api/nodes/abc-123/attributes (to find incoming references)
And the results determine which modal variant to show
```

---

## Related Capabilities

- Whiteboard Sync: Deleting linked node should update whiteboard element
- Super Position: Deleting node removes from all containing contexts
