# Navigation Journey - Activity Diagrams

## 5.1 Breadcrumb Navigation

```mermaid
flowchart TD
    Start([Start]) --> LoadPage[Load any page]
    LoadPage --> DeterminePath[Determine current path]

    DeterminePath --> BuildBreadcrumb{Page type?}

    BuildBreadcrumb -->|Spaces| SpacesCrumb["Breadcrumb: Spaces"]
    BuildBreadcrumb -->|Space Detail| SpaceCrumb["Breadcrumb: Spaces / Space Name"]
    BuildBreadcrumb -->|Node Editor| NodeCrumb["Breadcrumb: Spaces / Space / Node"]
    BuildBreadcrumb -->|Whiteboard| WhiteboardCrumb["Breadcrumb: Spaces / Space / Whiteboard"]

    SpacesCrumb --> RenderCrumb[Render breadcrumb component]
    SpaceCrumb --> RenderCrumb
    NodeCrumb --> RenderCrumb
    WhiteboardCrumb --> RenderCrumb

    RenderCrumb --> UserClick{User clicks segment?}
    UserClick -->|Spaces| NavigateSpaces[Navigate to /spaces]
    UserClick -->|Space Name| NavigateSpace[Navigate to /spaces/{slug}]
    UserClick -->|Current| NoAction[No navigation - current page]

    NavigateSpaces --> End([End])
    NavigateSpace --> End
    NoAction --> End
```

## 5.2 Sidebar Tree Navigation

```mermaid
flowchart TD
    Start([Start]) --> LoadSidebar[Load sidebar with items]
    LoadSidebar --> RenderTree[Render items as tree]

    RenderTree --> UserInteraction{User interaction?}

    UserInteraction -->|Click item| CheckType{Item has children?}
    UserInteraction -->|Click expand arrow| ToggleExpand[Toggle expanded state]
    UserInteraction -->|Hover item| ShowAddButton[Show + button]

    CheckType -->|Yes| ToggleAndNavigate[Toggle expand + Navigate]
    CheckType -->|No| JustNavigate[Navigate only]

    ToggleExpand --> UpdateExpanded[Update isExpanded state]
    UpdateExpanded --> ReRender[Re-render tree]
    ReRender --> UserInteraction

    ToggleAndNavigate --> CallOnNavigate[Call onNavigate with path]
    JustNavigate --> CallOnNavigate

    CallOnNavigate --> BuildPath[Build full path array]
    BuildPath --> TriggerNavigation[Trigger router navigation]

    ShowAddButton --> WaitClick{User clicks +?}
    WaitClick -->|Yes| TriggerAdd["Call onAddChild or onQuickCreateSpace"]
    WaitClick -->|No, mouse leaves| HideButton[Hide + button]

    TriggerNavigation --> End([End])
    TriggerAdd --> End
    HideButton --> UserInteraction
```

## 5.3 Tab Management

```mermaid
flowchart TD
    Start([Start]) --> LoadTabs[Load TabsBar with tabs]
    LoadTabs --> RenderTabs[Render tab items]

    RenderTabs --> UserAction{User action?}

    UserAction -->|Click tab| SwitchTab[Set activeTabId]
    UserAction -->|Click close X| CheckTabCount{More than 1 tab?}
    UserAction -->|Click + New Tab| CreateNewTab[Create new tab object]

    SwitchTab --> UpdateActiveTab[Update active tab state]
    UpdateActiveTab --> HighlightTab[Highlight active tab]
    HighlightTab --> UserAction

    CheckTabCount -->|Yes| CloseTab[Remove tab from array]
    CheckTabCount -->|No| CannotClose[Keep tab - minimum 1 required]

    CloseTab --> WasActive{Was active tab?}
    WasActive -->|Yes| ActivateFirst[Activate first remaining tab]
    WasActive -->|No| KeepActive[Keep current active]

    ActivateFirst --> UserAction
    KeepActive --> UserAction
    CannotClose --> UserAction

    CreateNewTab --> GenerateId[Generate unique tab ID]
    GenerateId --> AddToArray[Add tab to tabs array]
    AddToArray --> ActivateNew[Set new tab as active]
    ActivateNew --> UserAction
```

## 5.4 Back Button Navigation

```mermaid
flowchart TD
    Start([Start]) --> CheckPage{Current page?}

    CheckPage -->|Spaces Dashboard| HideBack[Hide back button]
    CheckPage -->|Space Detail| ShowBack[Show back button]
    CheckPage -->|Node Editor| ShowBack
    CheckPage -->|Whiteboard| ShowBack

    HideBack --> End([End])

    ShowBack --> UserClick{User clicks back?}
    UserClick -->|No| WaitClick[Wait for click]
    WaitClick --> UserClick

    UserClick -->|Yes| DetermineTarget{Determine target}

    DetermineTarget -->|From Space Detail| GoSpaces[Navigate to /spaces]
    DetermineTarget -->|From Node Editor| GoSpace[Navigate to /spaces/{slug}]
    DetermineTarget -->|From Whiteboard| GoSpace

    GoSpaces --> UpdateBreadcrumb[Update breadcrumb]
    GoSpace --> UpdateBreadcrumb

    UpdateBreadcrumb --> UpdateSidebar[Update sidebar highlight]
    UpdateSidebar --> End
```

## 5.5 Home Button Navigation

```mermaid
flowchart TD
    Start([Start]) --> ShowHomeIcon[Display home icon in header]
    ShowHomeIcon --> UserClick{User clicks home?}

    UserClick -->|No| WaitClick[Wait for interaction]
    WaitClick --> UserClick

    UserClick -->|Yes| CheckCurrentPage{Already on /spaces?}

    CheckCurrentPage -->|Yes| NoAction[No navigation needed]
    CheckCurrentPage -->|No| NavigateHome[Navigate to /spaces]

    NavigateHome --> SetScope[Set scope to 'spaces']
    SetScope --> UpdateUI[Update breadcrumb and sidebar]

    UpdateUI --> End([End])
    NoAction --> End
```

## 5.6 Sidebar Toggle

```mermaid
flowchart TD
    Start([Start]) --> CheckState{Sidebar state?}

    CheckState -->|Open| ShowSidebar[Sidebar visible at 276px]
    CheckState -->|Closed| HideSidebar[Sidebar hidden at 0px]

    ShowSidebar --> UserClick{User clicks menu toggle?}
    HideSidebar --> UserClick

    UserClick -->|No| WaitClick[Wait for interaction]
    WaitClick --> UserClick

    UserClick -->|Yes| ToggleState[Toggle sidebarOpen state]
    ToggleState --> AnimateTransition[CSS transition 300ms]

    AnimateTransition --> UpdateContent{New state?}
    UpdateContent -->|Now Open| ExpandContent["Content margin-left 276px"]
    UpdateContent -->|Now Closed| FullContent["Content margin-left 0"]

    ExpandContent --> ShowSidebar
    FullContent --> HideSidebar
```

## 5.7 Context Menu Navigation

```mermaid
flowchart TD
    Start([Start]) --> RightClick[Right-click on card]
    RightClick --> ShowContextMenu[Display context menu at cursor]

    ShowContextMenu --> SelectOption{User selects option?}

    SelectOption -->|Open in New Tab| NewTabAction[window.open in _blank]
    SelectOption -->|Open as Node| NavigateAction[router.push to detail page]
    SelectOption -->|Click outside| CloseMenu[Close context menu]
    SelectOption -->|Press Escape| CloseMenu

    NewTabAction --> CloseAfter[Close menu after action]
    NavigateAction --> CloseAfter

    CloseAfter --> End([End])
    CloseMenu --> End
```

## Navigation State Machine

```mermaid
stateDiagram-v2
    [*] --> SpacesDashboard

    SpacesDashboard --> SpaceDetail: Click space card
    SpaceDetail --> SpacesDashboard: Click back or home
    SpaceDetail --> NodeEditor: Click node card
    SpaceDetail --> Whiteboard: Click whiteboard option

    NodeEditor --> SpaceDetail: Click back
    NodeEditor --> SpacesDashboard: Click home

    Whiteboard --> SpaceDetail: Click back
    Whiteboard --> SpacesDashboard: Click home

    SpacesDashboard --> SearchResults: Open search
    SpaceDetail --> SearchResults: Open search
    NodeEditor --> SearchResults: Open search

    SearchResults --> SpacesDashboard: Navigate to space
    SearchResults --> NodeEditor: Navigate to node
```

## URL Routing Diagram

```mermaid
flowchart LR
    subgraph Authentication
        Login["/login"]
        Register["/register"]
    end

    subgraph Application
        Spaces["/spaces"]
        SpaceDetail["/spaces/[slug]"]
        NodeEditor["/spaces/[slug]/node/[id]"]
        Whiteboard["/spaces/[slug]/whiteboard"]
    end

    Login -->|Success| Spaces
    Register -->|Success| Spaces

    Spaces -->|Click card| SpaceDetail
    SpaceDetail -->|Click card| NodeEditor
    SpaceDetail -->|Whiteboard menu| Whiteboard

    NodeEditor -->|Back| SpaceDetail
    Whiteboard -->|Back| SpaceDetail
    SpaceDetail -->|Back| Spaces
```
