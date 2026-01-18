## ADDED Requirements

### Requirement: Optimistic Create Operations
The system SHALL immediately reflect new entities in the UI before API confirmation.

#### Scenario: User creates a space optimistically
- **WHEN** user submits the create space form
- **THEN** the new space appears in the list immediately with a temporary ID
- **AND** shows a subtle "syncing" indicator
- **WHEN** the API confirms creation
- **THEN** the temporary ID is replaced with the real ID
- **AND** the syncing indicator is removed

#### Scenario: Create operation fails with rollback
- **WHEN** user creates an entity optimistically
- **AND** the API returns an error
- **THEN** the optimistically added entity is removed from the UI
- **AND** an error message is displayed to the user
- **AND** the form data is preserved for retry

### Requirement: Optimistic Update Operations
The system SHALL immediately reflect entity updates in the UI before API confirmation.

#### Scenario: User updates a node optimistically
- **WHEN** user saves changes to a node
- **THEN** the changes appear immediately in all views (hierarchy, graph, detail)
- **WHEN** the API confirms the update
- **THEN** the syncing state is cleared

#### Scenario: Update operation fails with rollback
- **WHEN** user updates an entity optimistically
- **AND** the API returns an error
- **THEN** the entity reverts to its previous state
- **AND** an error message is displayed to the user

### Requirement: Optimistic Delete Operations
The system SHALL immediately remove entities from the UI before API confirmation.

#### Scenario: User deletes a space optimistically
- **WHEN** user confirms deletion of a space
- **THEN** the space is immediately removed from the list
- **WHEN** the API confirms deletion
- **THEN** related caches are invalidated

#### Scenario: Delete operation fails with rollback
- **WHEN** user deletes an entity optimistically
- **AND** the API returns an error
- **THEN** the entity reappears in the UI
- **AND** an error message is displayed to the user
