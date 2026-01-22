# Spec: Duplicate Detection

**Capability:** Node Duplicate Detection
**Change ID:** `implement-mvp-behaviors`

---

## ADDED Requirements

### Requirement: Detect duplicate node titles in same context

The system SHALL detect when a user attempts to create a node with a title that already exists in the same context and MUST provide options to merge, rename, or create anyway.

#### Scenario: Create node with unique title
```gherkin
Given I am in context "Project Alpha"
And no node with title "Requirements" exists in this context
When I create a new node with title "Requirements"
Then the node is created successfully
And no duplicate warning is shown
```

#### Scenario: Create node with duplicate title in same context
```gherkin
Given I am in context "Project Alpha"
And a node with title "Requirements" already exists in this context
When I type "Requirements" as the new node title
And I click "Create"
Then the system shows a duplicate warning modal
And the modal displays "A node with this name already exists in this context"
And the modal shows the existing node's path
And the modal provides options: "Merge", "Create Anyway", "Rename"
```

#### Scenario: Merge duplicate nodes
```gherkin
Given I see the duplicate warning modal
And the existing node has content "Existing content"
And I am creating a node with content "New content"
When I click "Merge"
Then the system navigates to the existing node
And the existing node's content is appended with "New content"
And a toast shows "Merged with existing node"
```

#### Scenario: Create anyway with duplicate title
```gherkin
Given I see the duplicate warning modal
When I click "Create Anyway"
Then a new node is created with the same title
And both nodes exist in the same context
And a toast shows "Node created"
```

#### Scenario: Rename to avoid duplicate
```gherkin
Given I see the duplicate warning modal
When I click "Rename"
Then the modal transforms to show a title input field
And the field is pre-filled with "Requirements (2)"
When I edit the title to "Requirements - Phase 1"
And I click "Create"
Then the node is created with title "Requirements - Phase 1"
```

#### Scenario: Duplicate allowed in different context
```gherkin
Given a node with title "Requirements" exists in context "Project Alpha"
And I am creating a node in context "Project Beta"
When I create a node with title "Requirements"
Then the node is created successfully
And no duplicate warning is shown
```

---

## UI/UX Requirements

### Requirement: Duplicate Warning Modal Design

#### Scenario: Modal content
```gherkin
Given a duplicate is detected
When the modal appears
Then the modal title is "Node Already Exists"
And the modal shows:
  - Warning icon
  - Message about existing node
  - Preview of existing node (title, path, created date)
  - Action buttons: Merge, Create Anyway, Rename
```

---

## Merge Behavior

### Requirement: Content merge strategy

#### Scenario: Merge content from both nodes
```gherkin
Given existing node has blocks: [H1: "Overview", P: "Original text"]
And new node has blocks: [P: "Additional text"]
When merge is performed
Then the existing node has blocks: [H1: "Overview", P: "Original text", HR: divider, P: "Additional text"]
And a "Merged content" heading/divider separates old from new
```

#### Scenario: Merge attributes from both nodes
```gherkin
Given existing node has attributes: [tag: "urgent"]
And new node has attributes: [tag: "important", status: "draft"]
When merge is performed
Then the existing node has attributes: [tag: "urgent", tag: "important", status: "draft"]
```

---

## Check Timing

### Requirement: When to check for duplicates

#### Scenario: Check happens on form submit, not on typing
```gherkin
Given I am typing in the node title field
Then no duplicate check runs while typing
When I click "Create" or press Enter
Then the duplicate check runs before API call
```

---

## Related Capabilities

- Node CRUD: Core create flow affected
- Templates: Template application should also check for duplicates
