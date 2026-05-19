## ADDED Requirements

### Requirement: API Key List View
The system SHALL display a list of the user's API keys showing name, public key (masked), creation date, last used date, expiration status, and active/revoked state.

#### Scenario: User views API keys list
- **WHEN** user navigates to Settings > API Keys
- **THEN** the system fetches keys from `GET /api/api-keys` and displays them in a table
- **AND** each row shows: name, masked public key (first 8 chars + "..."), created date, last used date, expiration, status badge

#### Scenario: User has no API keys
- **WHEN** user navigates to Settings > API Keys with no existing keys
- **THEN** the system displays an empty state with a prompt to create their first key

#### Scenario: User filters active keys only
- **WHEN** user toggles "Show active only" filter
- **THEN** the system fetches keys with `activeOnly=true` and displays only active keys

### Requirement: Create API Key
The system SHALL allow users to create a new API key by providing a name, optional description, optional space scope, and optional expiration date.

#### Scenario: User creates a new API key
- **WHEN** user clicks "Create API Key" and fills in the name field
- **AND** optionally sets description, space scope, and expiration
- **AND** submits the form
- **THEN** the system calls `POST /api/api-keys` with the provided data
- **AND** displays the generated secret key in a modal (shown only once)

#### Scenario: User copies secret key after creation
- **WHEN** the secret key modal is displayed after key creation
- **THEN** the user can click "Copy" to copy the secret to clipboard
- **AND** the system shows a confirmation that the key was copied
- **AND** the modal warns that the secret cannot be retrieved again

#### Scenario: User confirms they saved the secret
- **WHEN** user has seen the secret key
- **THEN** the user MUST click "I've saved my key" to dismiss the modal
- **AND** after dismissal the secret is removed from component state

#### Scenario: Create key validation fails
- **WHEN** user submits the create form without a name
- **THEN** the system shows a validation error on the name field

### Requirement: Rotate API Key Secret
The system SHALL allow users to rotate an API key's secret by providing the current secret, generating a new secret while keeping the same public key.

#### Scenario: User rotates a key's secret
- **WHEN** user clicks "Rotate" on an existing active key
- **THEN** a dialog requests the current secret key for verification
- **AND** on submission, calls `POST /api/api-keys/{keyId}/rotate`
- **AND** displays the new secret key (shown only once, same UX as creation)

#### Scenario: Rotation fails with wrong current secret
- **WHEN** user provides an incorrect current secret
- **THEN** the system displays an error message from the API response

### Requirement: Revoke API Key
The system SHALL allow users to permanently revoke (delete) an API key with a confirmation step.

#### Scenario: User revokes an API key
- **WHEN** user clicks "Revoke" on an existing key
- **THEN** a confirmation dialog warns that this action is permanent
- **AND** on confirmation, calls `DELETE /api/api-keys/{keyId}`
- **AND** removes the key from the list (optimistic update)

#### Scenario: User cancels revocation
- **WHEN** user clicks "Revoke" but then cancels the confirmation dialog
- **THEN** no API call is made and the key remains unchanged

### Requirement: Settings Page Navigation
The system SHALL provide a Settings page accessible from the user menu, with API Keys as a section.

#### Scenario: User navigates to Settings
- **WHEN** user clicks "Settings" in the UserMenu dropdown
- **THEN** the system navigates to `/settings`
- **AND** displays the Settings page with "API Keys" section visible

#### Scenario: User returns to app from Settings
- **WHEN** user is on the Settings page
- **THEN** the sidebar and header remain visible for navigation back to spaces
