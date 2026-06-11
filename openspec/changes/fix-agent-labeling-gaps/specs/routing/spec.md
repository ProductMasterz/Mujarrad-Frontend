# Routing

Fix hardcoded navigation paths and expand `getNodeRoute()` to support the full entity hierarchy.

## MODIFIED Requirements

### Requirement: Eliminate Hardcoded Router Paths

All `router.push()` calls that construct node/context URLs MUST use `getNodeRoute()` from `@/lib/routing`. No file may contain hardcoded `/spaces/${slug}/node/${id}` strings for navigation.

**Files to fix:**
- `src/components/search/CommandPalette.tsx` (~line 43)
- `src/components/nodes/CreateNodeDialog.tsx` (~line 89)
- `src/components/nodes/NodeCard.tsx` (~lines 42, 49)
- `src/shell/components/SpaceShell.tsx` (~line 190)

#### Scenario: CommandPalette navigates via getNodeRoute
Given a user selects a node from the command palette
When navigation is triggered
Then `getNodeRoute(spaceSlug, node)` is called instead of a hardcoded template string
And context nodes navigate to `/spaces/{slug}/context/{contextSlug}`

#### Scenario: Context node navigates correctly
Given a node with `nodeType: 'CONTEXT'` and `slug: 'my-context'`
When any component navigates to it using getNodeRoute
Then the URL is `/spaces/{spaceSlug}/context/my-context`
And NOT `/spaces/{spaceSlug}/node/{nodeId}`

## ADDED Requirements

### Requirement: Nested Context Path Support

`getNodeRoute()` MUST support an optional nested context path: `/spaces/:slug/context/:ctxSlug/node/:nodeId` when a `contextSlug` is provided, as an alternative to the `?fromContext=` query parameter.

#### Scenario: Node opened from context uses context path
Given a node viewed within context "project-alpha"
When getNodeRoute is called with `{ fromContext: 'project-alpha' }`
Then the URL includes the context in the path or query parameter
And breadcrumbs can reconstruct the navigation path
