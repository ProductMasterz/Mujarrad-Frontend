# Spec: Navigation

**Capability:** Navigation
**Change ID:** `implement-eian-node-routing`

---

## ADDED Requirements

### Requirement: URL-Based Navigation Context

The origin context of any navigation event from a context layer to a node SHALL be encoded in the URL query parameter `?fromContext=[contextSlug]`. No Zustand store, no localStorage, and no router state object SHALL be used to carry back-navigation intent across page transitions. The `useSearchParams()` hook SHALL be the sole read path for this value on the node detail page.

This design ensures back-navigation survives hard refresh and direct URL entry.

#### Scenario: Navigation from context layer encodes the origin
- **WHEN** a user clicks a regular node card from within a context layer view at `/spaces/[slug]/context/[contextSlug]`
- **THEN** the browser SHALL navigate to `/spaces/[slug]/node/[id]?fromContext=[contextSlug]`
- **AND** the `contextSlug` value in the URL SHALL exactly match the context slug from the originating layer page

#### Scenario: fromContext survives browser reload
- **WHEN** a user is on `/spaces/[slug]/node/[id]?fromContext=[contextSlug]`
- **AND** the user performs a hard browser refresh
- **THEN** the page SHALL still read `fromContext` from `useSearchParams()`
- **AND** the Back button SHALL still navigate to the context layer view

#### Scenario: Direct URL entry with fromContext is respected
- **WHEN** a user pastes `/spaces/[slug]/node/[id]?fromContext=[contextSlug]` directly into the browser address bar
- **THEN** the page SHALL render with the context crumb in the breadcrumb
- **AND** the Back button SHALL navigate to the context layer view

---

### Requirement: Context-Aware Back Navigation

The Back button on the node detail page SHALL navigate the user to the context that referred them when `?fromContext` is present in the URL, and to the space root when it is absent.

#### Scenario: Back button goes to context when fromContext is set
- **WHEN** a user is viewing a node at `/spaces/[slug]/node/[id]?fromContext=[contextSlug]`
- **AND** the user clicks the Back button
- **THEN** the browser SHALL navigate to `/spaces/[slug]/context/[contextSlug]`

#### Scenario: Back button goes to space root when fromContext is absent
- **WHEN** a user is viewing a node at `/spaces/[slug]/node/[id]` with no query parameters
- **AND** the user clicks the Back button
- **THEN** the browser SHALL navigate to `/spaces/[slug]`

---

### Requirement: Context-Aware Breadcrumb

The breadcrumb on the node detail page SHALL reflect the navigation path. When `?fromContext` is present, the context name SHALL appear as a separate, clickable crumb between the space crumb and the node title crumb. When `?fromContext` is absent, no context crumb SHALL appear.

#### Scenario: Breadcrumb with fromContext shows four levels
- **WHEN** a user is viewing a node at `/spaces/[slug]/node/[id]?fromContext=[contextSlug]`
- **THEN** the breadcrumb SHALL display: Spaces > Space Name > Context Name > Node Title
- **AND** "Context Name" SHALL be a clickable link to `/spaces/[slug]/context/[contextSlug]`
- **AND** "Node Title" SHALL be the terminal, non-clickable crumb

#### Scenario: Breadcrumb without fromContext shows three levels
- **WHEN** a user is viewing a node at `/spaces/[slug]/node/[id]` with no query parameters
- **THEN** the breadcrumb SHALL display: Spaces > Space Name > Node Title
- **AND** no context crumb SHALL appear

#### Scenario: Context crumb is derived from the URL slug
- **WHEN** the breadcrumb context crumb is rendered
- **AND** no separate API call is made to fetch the context name
- **THEN** the crumb title SHALL be derived by converting the `contextSlug` from kebab-case to title-case (e.g. `my-context-slug` → `My Context Slug`)
- **AND** clicking the crumb SHALL navigate to the correct context layer URL

---

### Requirement: NavigationScope Includes Context

The `NavigationScope` type in `src/stores/navigationStore.ts` SHALL include `'context'` as a valid value. The context layer view page SHALL set the navigation scope to `'context'` on mount so that the `SpaceShell` header "+" button's `resolvedAvailableTypes` reflects the context scope accurately.

#### Scenario: NavigationScope accepts the context value without TypeScript error
- **WHEN** `NavigationScope` is declared
- **THEN** the union type SHALL include `'context'` alongside existing scope values
- **AND** a TypeScript call of `navigateTo('context')` or equivalent SHALL not produce a type error

#### Scenario: Header plus button shows correct types inside a context view
- **WHEN** a user is on a context layer page and the scope is set to `'context'`
- **THEN** `resolvedAvailableTypes` in `NewNodeModal` SHALL include `'node'` and `'context'`
- **AND** SHALL NOT include `'space'`

---

### Requirement: Type-Aware Context Menu Labels

Context menu actions that navigate to a node SHALL use labels and destinations that reflect the node's actual type. A CONTEXT node SHALL show "Open Context" as the action label, and the action SHALL navigate to the layer view. A REGULAR node SHALL show "Open Node" and navigate to the content view.

#### Scenario: Context menu shows Open Context for a CONTEXT node
- **WHEN** a user right-clicks on a node card where `nodeType === 'CONTEXT'`
- **THEN** the context menu primary open action SHALL be labelled "Open Context"
- **AND** triggering the action SHALL navigate to `/spaces/[slug]/context/[node.slug]`

#### Scenario: Context menu shows Open Node for a REGULAR node
- **WHEN** a user right-clicks on a node card where `nodeType === 'REGULAR'`
- **THEN** the context menu primary open action SHALL be labelled "Open Node"
- **AND** triggering the action SHALL navigate to `/spaces/[slug]/node/[node.id]`

#### Scenario: Open in new tab navigates to the correct view
- **WHEN** a user selects "Open in new tab" from the context menu
- **THEN** the URL opened SHALL be the same URL that `getNodeRoute` would produce for that node
- **AND** a CONTEXT node SHALL open its layer view in the new tab
- **AND** a REGULAR node SHALL open its content view in the new tab
