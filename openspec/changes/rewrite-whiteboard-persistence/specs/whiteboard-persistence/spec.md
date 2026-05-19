## ADDED Requirements

### Requirement: Context-Only Persistence
The system SHALL persist all whiteboard data exclusively in a single CONTEXT node's content field as a JSON blob containing elements, app state, and files.

#### Scenario: Saving whiteboard state
- **GIVEN** a whiteboard with elements on the canvas
- **WHEN** the user stops interacting for 3 seconds (debounce)
- **THEN** the system sends a single PUT request to update the context node
- **AND** the request body contains `{ content: JSON.stringify({ elements, app_state, files }) }`
- **AND** no per-shape REGULAR nodes are created or updated

#### Scenario: First save on a new whiteboard
- **GIVEN** a space with no existing whiteboard context node
- **WHEN** the first auto-save triggers
- **THEN** the system creates a CONTEXT node with `nodeDetails.whiteboard_context.context_type = "whiteboard"`
- **AND** stores the full element data in the content field
- **AND** caches the context node ID for subsequent saves

#### Scenario: Context node ID is cached after load
- **GIVEN** a whiteboard has been loaded
- **WHEN** subsequent saves occur
- **THEN** the system uses the cached context node ID
- **AND** does NOT re-fetch the context node list on each save

### Requirement: Atomic Save Operation
The system SHALL perform each auto-save as a single atomic API call with no partial failure states.

#### Scenario: Save succeeds
- **GIVEN** a whiteboard with pending changes
- **WHEN** the save PUT request succeeds
- **THEN** the sync status shows "Saved"
- **AND** no cleanup or rollback logic is needed

#### Scenario: Save fails
- **GIVEN** a whiteboard with pending changes
- **WHEN** the save PUT request fails (network error or server error)
- **THEN** the sync status shows an error state with retry option
- **AND** no orphaned nodes are created on the backend
- **AND** the user's canvas state is preserved unchanged

#### Scenario: Context node deleted externally
- **GIVEN** a cached context node ID that no longer exists on the backend
- **WHEN** the save PUT returns 404
- **THEN** the system creates a new context node
- **AND** saves the current state to the new node
- **AND** updates the cached context node ID

### Requirement: Flat Element Storage Format
The system SHALL store elements as a flat array of ExcalidrawElement objects in the context content, with linked node IDs stored in each element's `customData.nodeId` field.

#### Scenario: Saving elements with linked nodes
- **GIVEN** elements where some have `customData.nodeId` set (linked to hierarchy nodes)
- **WHEN** the whiteboard is saved
- **THEN** elements are stored as-is in their Excalidraw-native format
- **AND** the `customData.nodeId` field is preserved for linked elements

#### Scenario: Loading old format (backward compatibility)
- **GIVEN** a context node with content in the old format (`[{ node_id, excalidraw_element }]`)
- **WHEN** the whiteboard is loaded
- **THEN** the system extracts elements from the old format
- **AND** maps `node_id` values into each element's `customData.nodeId`
- **AND** passes the flat element array to Excalidraw

#### Scenario: Loading new format
- **GIVEN** a context node with content in the new flat format (`{ elements: ExcalidrawElement[] }`)
- **WHEN** the whiteboard is loaded
- **THEN** the system passes the elements directly to Excalidraw without transformation

### Requirement: Whiteboard Loading
The system SHALL load whiteboard state from the backend on page mount and initialize Excalidraw with the persisted state.

#### Scenario: Loading existing whiteboard
- **GIVEN** a space with an existing whiteboard context node
- **WHEN** the whiteboard page is mounted
- **THEN** the system fetches CONTEXT nodes for the space
- **AND** finds the node with `whiteboard_context.context_type = "whiteboard"`
- **AND** fetches the full node content
- **AND** parses the JSON to extract elements, appState, and files
- **AND** initializes Excalidraw with the loaded data

#### Scenario: Loading empty whiteboard
- **GIVEN** a space with no whiteboard context node
- **WHEN** the whiteboard page is mounted
- **THEN** Excalidraw is initialized with empty state
- **AND** a context node is created on first save

### Requirement: Lazy Node Creation for Space List Promotion
The system SHALL create backend REGULAR nodes for shapes only when the user explicitly promotes them to the space list, not during auto-save.

#### Scenario: Promoting a shape to space list
- **GIVEN** a shape on the whiteboard without an existing linked node
- **WHEN** the user right-clicks and selects "Show in Space List"
- **THEN** the system creates a REGULAR node with the shape's title and content
- **AND** sets `nodeDetails.showInSpaceList = true` on the created node
- **AND** stores the node ID in the element's `customData.nodeId`
- **AND** triggers a save to persist the updated customData

#### Scenario: Promoting an already-linked shape
- **GIVEN** a shape that already has `customData.nodeId` (previously linked)
- **WHEN** the user right-clicks and selects "Show in Space List"
- **THEN** the system updates the existing node's `showInSpaceList` to true
- **AND** does NOT create a duplicate node

### Requirement: Debounced Auto-Save
The system SHALL debounce canvas changes with a 3-second window before triggering a save.

#### Scenario: Continuous drawing
- **GIVEN** the user is continuously drawing on the canvas
- **WHEN** changes fire in rapid succession
- **THEN** the debounce timer resets on each change
- **AND** only one save occurs after 3 seconds of inactivity

#### Scenario: Concurrent save prevention
- **GIVEN** a save is currently in progress
- **WHEN** the debounce timer fires again
- **THEN** the new save is deferred until the current one completes
- **AND** the deferred save uses the latest canvas state (not stale data)

#### Scenario: Unmount during pending save
- **GIVEN** a debounced save is pending
- **WHEN** the user navigates away from the whiteboard
- **THEN** the pending save is cancelled
- **AND** no stale data is written to the backend

## MODIFIED Requirements

### Requirement: Sync Status Indication
The system SHALL provide visual feedback about sync status.

#### Scenario: Sync in progress
- **WHEN** the save PUT request is in flight
- **THEN** a sync indicator shows "Saving..." in the whiteboard toolbar

#### Scenario: Sync complete
- **WHEN** the save PUT request succeeds
- **THEN** the sync indicator shows a checkmark or "Saved"

#### Scenario: Sync error with retry
- **WHEN** the save PUT request fails
- **THEN** the sync indicator shows an error state
- **AND** provides a "Retry" option that triggers an immediate save
