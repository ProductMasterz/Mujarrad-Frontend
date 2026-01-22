# Context Menus & Quick Actions Journey - Activity Diagrams

## 9.1 Card Context Menu Flow

```mermaid
flowchart TD
    Start([Start]) --> RightClick["Right-click on space or node card"]
    RightClick --> PreventDefault[Prevent browser context menu]

    PreventDefault --> GetPosition[Get mouse position X, Y]
    GetPosition --> GetCardId[Get card ID from click target]

    GetCardId --> SetState[Set contextMenu state with x, y, cardId]
    SetState --> RenderMenu[Render ContextMenu component]

    RenderMenu --> PositionMenu[Position menu at cursor]
    PositionMenu --> ShowOptions[Display menu options]

    ShowOptions --> UserAction{User action?}

    UserAction -->|Click option| HandleAction[Handle selected action]
    UserAction -->|Click outside| CloseMenu[Close context menu]
    UserAction -->|Press Escape| CloseMenu

    HandleAction --> ExecuteAction{Which action?}

    ExecuteAction -->|Open New Tab| OpenNewTab[window.open URL in _blank]
    ExecuteAction -->|Open as Node| NavigateToNode[router.push to detail]
    ExecuteAction -->|Rename| OpenRenameModal[Open RenameModal]
    ExecuteAction -->|Duplicate| DuplicateItem[Clone item via API]
    ExecuteAction -->|Share| OpenShareModal[Open ShareModal]
    ExecuteAction -->|Delete| OpenDeleteDialog[Open delete confirmation]

    OpenNewTab --> CloseMenu
    NavigateToNode --> CloseMenu
    OpenRenameModal --> CloseMenu
    DuplicateItem --> CloseMenu
    OpenShareModal --> CloseMenu
    OpenDeleteDialog --> CloseMenu

    CloseMenu --> ClearState[Set contextMenu to null]
    ClearState --> End([End])
```

## 9.2 Add Menu Dropdown Flow

```mermaid
flowchart TD
    Start([Start]) --> ClickAddButton[Click + button in header]
    ClickAddButton --> CheckScope{Current navigation scope?}

    CheckScope -->|spaces| ShowSpacesMenu[Show: Create Space only]
    CheckScope -->|space| ShowSpaceMenu[Show: Create Node, Create Context]
    CheckScope -->|node| ShowNodeMenu[Show: Create Node, Create Context]
    CheckScope -->|whiteboard| ShowWhiteboardMenu[Show: Create Node, Create Context]

    ShowSpacesMenu --> RenderDropdown[Render AddMenuDropdown]
    ShowSpaceMenu --> RenderDropdown
    ShowNodeMenu --> RenderDropdown
    ShowWhiteboardMenu --> RenderDropdown

    RenderDropdown --> UserSelect{User selects option?}

    UserSelect -->|Create Space| TriggerCreateSpace[Call onCreateSpace]
    UserSelect -->|Create Node| TriggerCreateNode[Call onCreateNode]
    UserSelect -->|Create Context| TriggerCreateContext[Call onCreateContext]
    UserSelect -->|Click outside| CloseDropdown[Close dropdown]

    TriggerCreateSpace --> SetSpaceDefault[Set defaultType='space']
    TriggerCreateNode --> SetNodeDefault[Set defaultType='node']
    TriggerCreateContext --> SetContextDefault[Set defaultType='context']

    SetSpaceDefault --> OpenModal[Open NewNodeModal]
    SetNodeDefault --> OpenModal
    SetContextDefault --> OpenModal

    OpenModal --> CloseDropdown
    CloseDropdown --> End([End])
```

## 9.3 More Menu Dropdown Flow

```mermaid
flowchart TD
    Start([Start]) --> ClickMoreButton[Click ⋮ button in header]
    ClickMoreButton --> OpenDropdown[Open MoreMenuDropdown]

    OpenDropdown --> CheckScope{Current scope?}

    CheckScope -->|spaces| SpacesOptions[Share, Open New Tab]
    CheckScope -->|space| SpaceOptions[Share, Open New Tab, Whiteboard, Clear Space, Delete]
    CheckScope -->|node| NodeOptions[Share, Open New Tab, Lock, Delete]

    SpacesOptions --> RenderOptions[Render available options]
    SpaceOptions --> RenderOptions
    NodeOptions --> RenderOptions

    RenderOptions --> UserSelect{User selects?}

    UserSelect -->|Share| CallOnShare[Call onShare handler]
    UserSelect -->|Open in New Tab| CallOnNewTab[Call onOpenInNewTab]
    UserSelect -->|Whiteboard| CallOnWhiteboard[Call onWhiteboard]
    UserSelect -->|Lock| CallOnLock[Call onLock]
    UserSelect -->|Delete| CallOnDelete[Call onDelete]
    UserSelect -->|Clear Space| CallOnClearSpace[Call onClearSpace]
    UserSelect -->|Move To| CallOnMoveTo[Call onMoveTo]
    UserSelect -->|Click outside| CloseDropdown[Close dropdown]

    CallOnShare --> ExecuteHandler[Execute handler function]
    CallOnNewTab --> ExecuteHandler
    CallOnWhiteboard --> ExecuteHandler
    CallOnLock --> ExecuteHandler
    CallOnDelete --> ExecuteHandler
    CallOnClearSpace --> ExecuteHandler
    CallOnMoveTo --> ExecuteHandler

    ExecuteHandler --> CloseDropdown
    CloseDropdown --> End([End])
```

## 9.4 Help Dropdown Flow

```mermaid
flowchart TD
    Start([Start]) --> ClickHelpButton[Click ? help button]
    ClickHelpButton --> OpenDropdown[Open HelpDropdown]

    OpenDropdown --> ShowOptions[Show help options]
    ShowOptions --> UserSelect{User selects?}

    UserSelect -->|Send Feedback| OpenFeedback[Open FeedbackModal]
    UserSelect -->|Contact Us| OpenContact[Open contact page/modal]
    UserSelect -->|Help Center| OpenHelpCenter[Navigate to help center]
    UserSelect -->|About| OpenAbout[Show about information]
    UserSelect -->|Click outside| CloseDropdown[Close dropdown]

    OpenFeedback --> SetFeedbackOpen[Set showFeedbackModal=true]
    SetFeedbackOpen --> CloseDropdown

    OpenContact --> LaunchContact[Open contact method]
    LaunchContact --> CloseDropdown

    OpenHelpCenter --> NavigateHelp[Open help center URL]
    NavigateHelp --> CloseDropdown

    OpenAbout --> ShowAboutInfo[Display version/info]
    ShowAboutInfo --> CloseDropdown

    CloseDropdown --> End([End])
```

## 9.5 Notifications Dropdown Flow

```mermaid
flowchart TD
    Start([Start]) --> ClickBell[Click notification bell icon]
    ClickBell --> CheckBadge{Has unread notifications?}

    CheckBadge -->|Yes| ShowBadge[Display notification count badge]
    CheckBadge -->|No| NoBadge[No badge shown]

    ShowBadge --> OpenDropdown[Open NotificationsDropdown]
    NoBadge --> OpenDropdown

    OpenDropdown --> FetchNotifications[Fetch recent notifications]
    FetchNotifications --> CheckNotifications{Notifications exist?}

    CheckNotifications -->|Yes| RenderList[Render notification items]
    CheckNotifications -->|No| ShowEmpty["Show No notifications message"]

    RenderList --> ForEach[For each notification]
    ForEach --> ShowItem[Show notification item]
    ShowItem --> MarkRead[Mark as read on view]

    MarkRead --> MoreItems{More items?}
    MoreItems -->|Yes| ForEach
    MoreItems -->|No| WaitAction[Wait for user action]

    ShowEmpty --> WaitAction

    WaitAction --> UserAction{User action?}
    UserAction -->|Click notification| NavigateToItem[Navigate to related item]
    UserAction -->|Click outside| CloseDropdown[Close dropdown]
    UserAction -->|Mark all read| MarkAllRead[Mark all as read]

    NavigateToItem --> CloseDropdown
    MarkAllRead --> UpdateBadge[Update/remove badge]
    UpdateBadge --> WaitAction

    CloseDropdown --> End([End])
```

## 9.6 User Menu Flow

```mermaid
flowchart TD
    Start([Start]) --> ClickUserIcon[Click user profile icon in sidebar]
    ClickUserIcon --> OpenUserMenu[Open UserMenu component]

    OpenUserMenu --> ShowUserInfo[Display user name/email]
    ShowUserInfo --> ShowOptions[Show menu options]

    ShowOptions --> UserSelect{User selects?}

    UserSelect -->|Profile| NavigateProfile[Navigate to profile page]
    UserSelect -->|Settings| NavigateSettings[Navigate to settings]
    UserSelect -->|Logout| TriggerLogout[Call onLogout handler]
    UserSelect -->|Click outside| CloseMenu[Close user menu]

    NavigateProfile --> CloseMenu
    NavigateSettings --> CloseMenu

    TriggerLogout --> ClearAuth[Clear auth token]
    ClearAuth --> ClearStore[Clear auth store state]
    ClearStore --> RedirectLogin[Redirect to /login]
    RedirectLogin --> CloseMenu

    CloseMenu --> End([End])
```

## 9.7 Whiteboard Context Menu Flow

```mermaid
flowchart TD
    Start([Start]) --> RightClickElement[Right-click on whiteboard element]
    RightClickElement --> CheckElement{Element selected?}

    CheckElement -->|No element| ShowCanvasMenu[Show canvas context menu]
    CheckElement -->|Element selected| CheckLinked{Element linked to node?}

    ShowCanvasMenu --> CanvasOptions[Paste, Select All, etc.]
    CanvasOptions --> End([End])

    CheckLinked -->|Yes - Linked| ShowLinkedMenu[Show linked element menu]
    CheckLinked -->|No - Unlinked| ShowUnlinkedMenu[Show unlinked element menu]

    ShowLinkedMenu --> LinkedOptions{Select option?}
    LinkedOptions -->|View in Hierarchy| GetNodeId[Get linked node ID]
    LinkedOptions -->|Unlink from Node| UnlinkElement[Remove node link]

    GetNodeId --> NavigateToNode[Navigate to /spaces/{slug}/node/{id}]
    UnlinkElement --> UpdateElement[Update element state]
    UpdateElement --> SaveWhiteboard[Save whiteboard]

    ShowUnlinkedMenu --> UnlinkedOptions{Select option?}
    UnlinkedOptions -->|Show in Space List| PromoteToNode[Create node from element]
    UnlinkedOptions -->|Link to existing| ShowNodePicker[Show node picker dialog]

    PromoteToNode --> CreateNode[POST /nodes]
    CreateNode --> LinkElement[Link element to new node]
    LinkElement --> SaveWhiteboard

    ShowNodePicker --> SelectNode[User selects node]
    SelectNode --> LinkElement

    NavigateToNode --> End
    SaveWhiteboard --> End
```

## Context Menu State Machine

```mermaid
stateDiagram-v2
    [*] --> Hidden: Initial state

    Hidden --> Positioning: Right-click detected
    Positioning --> Visible: Position calculated

    Visible --> ActionSelected: Click option
    Visible --> Hidden: Click outside
    Visible --> Hidden: Press Escape

    ActionSelected --> Executing: Execute action
    Executing --> Hidden: Action complete
```

## Dropdown Positioning Logic

```mermaid
flowchart TD
    Start([Start]) --> GetClickPosition[Get click X, Y coordinates]
    GetClickPosition --> GetViewport[Get viewport dimensions]

    GetViewport --> CalculateSpace{Space available?}

    CalculateSpace -->|Right side| PositionRight[Open dropdown to right]
    CalculateSpace -->|Left side| PositionLeft[Open dropdown to left]

    PositionRight --> CheckBottom{Space below?}
    PositionLeft --> CheckBottom

    CheckBottom -->|Yes| OpenBelow[Position dropdown below trigger]
    CheckBottom -->|No| OpenAbove[Position dropdown above trigger]

    OpenBelow --> ApplyPosition[Apply CSS position]
    OpenAbove --> ApplyPosition

    ApplyPosition --> RenderDropdown[Render dropdown at position]
    RenderDropdown --> End([End])
```
