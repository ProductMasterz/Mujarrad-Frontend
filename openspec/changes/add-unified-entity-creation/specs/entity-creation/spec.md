# Capability: Entity Creation

## ADDED Requirements

### Requirement: Space Creation via Modal
The system SHALL allow users to create new spaces through the NewNodeModal when at the spaces navigation level.

#### Scenario: Create space from header add button
- **WHEN** user is on the spaces list page
- **AND** user clicks the Add button in the header
- **AND** selects "Space" from the type dropdown (pre-selected by default)
- **AND** enters a space name
- **THEN** a new space SHALL be created via the API
- **AND** user SHALL be navigated to the new space

#### Scenario: Space type pre-selected at spaces level
- **WHEN** user opens NewNodeModal from the spaces list level
- **THEN** the type dropdown SHALL default to "Space"
- **AND** "Space" option SHALL be visible in the type dropdown

### Requirement: Scope-Aware Type Defaults
The system SHALL pre-select the appropriate entity type in the creation modal based on the action that triggered it.

#### Scenario: Default to space when creating space
- **WHEN** `onCreateSpace` action triggers the modal
- **THEN** the type dropdown SHALL default to "Space"

#### Scenario: Default to node when creating node
- **WHEN** `onCreateNode` action triggers the modal
- **THEN** the type dropdown SHALL default to "Node"

#### Scenario: Default to context when creating context
- **WHEN** `onCreateContext` action triggers the modal
- **THEN** the type dropdown SHALL default to "Context"

### Requirement: Sidebar Quick Space Creation
The system SHALL allow users to create spaces directly from the sidebar without opening a modal.

#### Scenario: Quick create space from sidebar
- **WHEN** user is viewing the spaces list
- **AND** user hovers over a space item in the sidebar
- **AND** user clicks the add button that appears
- **THEN** a new space named "Untitled" SHALL be created immediately
- **AND** user SHALL be navigated to the new space's page

#### Scenario: Quick create does not show modal
- **WHEN** user triggers quick create from sidebar
- **THEN** no modal dialog SHALL appear
- **AND** the space SHALL be created with a default name

### Requirement: Rename Modal
The system SHALL provide a dedicated modal for renaming entities that does not include type selection.

#### Scenario: Rename space via context menu
- **WHEN** user right-clicks on a space card
- **AND** user selects "Rename" from the context menu
- **THEN** a rename modal SHALL appear
- **AND** the modal SHALL show only a name input field
- **AND** the input SHALL be pre-populated with the current name
- **AND** no type selector SHALL be present

#### Scenario: Submit rename
- **WHEN** user enters a new name in the rename modal
- **AND** user presses Enter or clicks the submit button
- **THEN** the entity SHALL be renamed via the API
- **AND** the UI SHALL reflect the updated name

#### Scenario: Cancel rename
- **WHEN** user presses Escape in the rename modal
- **OR** user clicks outside the modal
- **THEN** the modal SHALL close
- **AND** no changes SHALL be made

### Requirement: Entity Type Options
The NewNodeModal type dropdown SHALL include all three entity types.

#### Scenario: All types available in dropdown
- **WHEN** user opens the type dropdown in NewNodeModal
- **THEN** the following options SHALL be visible:
  - Space
  - Node
  - Context

#### Scenario: Type visibility based on scope
- **WHEN** user is at spaces level
- **THEN** all three types (Space, Node, Context) SHALL be available
- **WHEN** user is at space or node level
- **THEN** Node and Context types SHALL be available
- **AND** Space type SHALL NOT be available
