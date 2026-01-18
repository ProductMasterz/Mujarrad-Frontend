## ADDED Requirements

### Requirement: Space Creation UI
The system SHALL provide a dialog interface for users to create new spaces.

#### Scenario: User opens create space dialog
- **WHEN** user clicks "Create Space" button on spaces list page
- **THEN** a modal dialog opens with a form for space creation

#### Scenario: User creates space with valid data
- **WHEN** user enters a valid space name (1-100 characters)
- **AND** optionally enters a description
- **AND** clicks "Create" button
- **THEN** the system creates the space via API
- **AND** shows success feedback
- **AND** refreshes the spaces list

#### Scenario: User attempts to create space with empty name
- **WHEN** user leaves the name field empty
- **AND** clicks "Create" button
- **THEN** the system shows a validation error "Name is required"
- **AND** does not submit the form

#### Scenario: User cancels space creation
- **WHEN** user clicks "Cancel" button or presses Escape
- **THEN** the dialog closes
- **AND** no space is created

#### Scenario: API error during space creation
- **WHEN** the API returns an error during space creation
- **THEN** the dialog remains open
- **AND** displays the error message to the user
- **AND** allows the user to retry
