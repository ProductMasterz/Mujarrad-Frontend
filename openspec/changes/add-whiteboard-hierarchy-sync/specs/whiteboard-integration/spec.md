## ADDED Requirements

### Requirement: Frame-to-Node Mapping
The system SHALL maintain a bidirectional mapping between Excalidraw frames and hierarchy nodes.

#### Scenario: Creating a frame creates a node
- **WHEN** user creates a new frame on the whiteboard
- **THEN** a corresponding node is created in the hierarchy
- **AND** the frame stores the node ID in its customData
- **AND** the node appears in the sidebar hierarchy under the whiteboard's parent

#### Scenario: Creating a node creates a frame
- **WHEN** user creates a new node via hierarchy "Add Child" action while whiteboard is active
- **THEN** a corresponding frame is created on the whiteboard
- **AND** the frame is positioned in an available space
- **AND** the frame title matches the node name

### Requirement: Bidirectional Name Sync
The system SHALL synchronize names between linked frames and nodes.

#### Scenario: Renaming a frame updates the node
- **WHEN** user renames a frame on the whiteboard
- **THEN** the linked node's title is updated
- **AND** the hierarchy sidebar reflects the new name

#### Scenario: Renaming a node updates the frame
- **WHEN** user renames a node in the hierarchy
- **THEN** the linked frame's title text is updated
- **AND** the whiteboard reflects the new name

### Requirement: Deletion Handling
The system SHALL handle deletion of linked elements with appropriate behavior.

#### Scenario: Deleting a frame prompts about node
- **WHEN** user deletes a linked frame from the whiteboard
- **THEN** a confirmation dialog asks whether to also delete the linked node
- **AND** if confirmed, both frame and node are deleted
- **AND** if declined, only the frame is deleted and the node is unlinked

#### Scenario: Deleting a node removes the frame
- **WHEN** user deletes a node that has a linked frame
- **THEN** the linked frame is removed from the whiteboard
- **AND** no confirmation is needed (node is source of truth)

### Requirement: Sync Status Indication
The system SHALL provide visual feedback about sync status.

#### Scenario: Sync in progress
- **WHEN** changes are being synced to the backend
- **THEN** a sync indicator shows "Syncing..." in the whiteboard toolbar

#### Scenario: Sync complete
- **WHEN** all changes have been synced successfully
- **THEN** the sync indicator shows a checkmark or "Saved"

#### Scenario: Sync error
- **WHEN** sync fails due to network or server error
- **THEN** the sync indicator shows an error state
- **AND** provides a "Retry" option
