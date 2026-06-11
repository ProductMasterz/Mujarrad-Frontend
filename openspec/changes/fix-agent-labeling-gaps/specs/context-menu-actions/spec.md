# Context Menu Actions

Add semantic type management and attribute visibility to the node context menu.

## ADDED Requirements

### Requirement: Set Semantic Type Action

The node context menu (`ContextMenu.tsx`) MUST include a "Set Semantic Type" submenu with common types (Person, Place, Action, Topic, Event) plus a custom text input option.

#### Scenario: User assigns semantic type from context menu
Given a node with no semantic type ("Unclassified")
When the user right-clicks and selects "Set Semantic Type" > "Person"
Then `useUpdateNode` is called with `buildNodeDetailsWithSemanticType(details, 'person', 'manual')`
And the node card updates to show "Person" label with the person icon

#### Scenario: User sets custom semantic type
Given a node with no semantic type
When the user right-clicks, selects "Set Semantic Type" > enters "Supplier"
Then the node's semantic type is set to "supplier" (normalized)
And the entity type store registers the new type

### Requirement: View Attributes Action

The context menu MUST include a "View Attributes" action that navigates to the node with the attributes/relationships panel visible.

#### Scenario: User views node attributes from context menu
Given a node "Alice" with 3 outgoing relationships
When the user right-clicks and selects "View Attributes"
Then the node page opens with the attributes panel expanded

### Requirement: Clean Up Dead Preferences

`appPreferences.showChatNodesInGraph` MUST either be wired into graph filtering logic (replacing or complementing the graphStore filter) or removed from the store.

#### Scenario: Preference controls graph behavior
Given `showChatNodesInGraph` is set to false in app preferences
When the graph renders
Then chat nodes are hidden by default
And GraphControls reflects this preference as the initial state

#### Scenario: OR — Dead preference is removed
Given the decision is to use graphStore exclusively for graph filters
When `appPreferences.showChatNodesInGraph` is removed
Then no code references this field
And graph filtering continues to work via graphStore only
