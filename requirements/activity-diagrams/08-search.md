# Search Journey - Activity Diagrams

## 8.1 Open Search Modal

```mermaid
flowchart TD
    Start([Start]) --> TriggerSearch{Search trigger?}

    TriggerSearch -->|Click search icon| ClickIcon[Click search icon in header]
    TriggerSearch -->|Keyboard shortcut| PressShortcut["Press Cmd or Ctrl + K"]

    ClickIcon --> OpenModal[Set search modal open]
    PressShortcut --> OpenModal

    OpenModal --> RenderModal[Render SearchModal component]
    RenderModal --> FocusInput[Auto-focus search input]

    FocusInput --> InitState[Initialize search state]
    InitState --> ShowPlaceholder["Show search placeholder text"]

    ShowPlaceholder --> Ready[Modal ready for input]
    Ready --> End([End])
```

## 8.2 Enter Search Query

```mermaid
flowchart TD
    Start([Start]) --> FocusInput[Focus on search input]
    FocusInput --> TypeQuery[User types search query]

    TypeQuery --> UpdateInput[Update input value]
    UpdateInput --> CheckLength{Query length >= 2?}

    CheckLength -->|No| WaitMore[Wait for more characters]
    CheckLength -->|Yes| StartDebounce[Start debounce timer 300ms]

    WaitMore --> TypeQuery

    StartDebounce --> WaitDebounce{Timer complete?}
    WaitDebounce -->|User still typing| ResetDebounce[Reset timer]
    WaitDebounce -->|Timer complete| ExecuteSearch[Execute search]

    ResetDebounce --> StartDebounce

    ExecuteSearch --> GetFilters[Get current filter settings]
    GetFilters --> BuildQuery[Build search query params]

    BuildQuery --> CallAPI[GET /search?q={query}&type={filter}]
    CallAPI --> ShowLoading[Show loading indicator]

    ShowLoading --> CheckResponse{API Response?}
    CheckResponse -->|Success| ProcessResults[Process search results]
    CheckResponse -->|Error| ShowError[Show error message]
    CheckResponse -->|Empty| ShowNoResults["Show No results found"]

    ProcessResults --> RenderResults[Render results list]
    RenderResults --> End([End])
    ShowError --> End
    ShowNoResults --> End
```

## 8.3 Filter Search by Type

```mermaid
flowchart TD
    Start([Start]) --> ClickFilter[Click filter dropdown]
    ClickFilter --> ShowOptions[Show filter options]

    ShowOptions --> SelectFilter{Select filter?}

    SelectFilter -->|All| SetAllFilter[Set filter to 'all']
    SelectFilter -->|Space| SetSpaceFilter[Set filter to 'space']
    SelectFilter -->|Context| SetContextFilter[Set filter to 'context']
    SelectFilter -->|Node| SetNodeFilter[Set filter to 'node']

    SetAllFilter --> UpdateFilterState[Update filter state]
    SetSpaceFilter --> UpdateFilterState
    SetContextFilter --> UpdateFilterState
    SetNodeFilter --> UpdateFilterState

    UpdateFilterState --> CloseDropdown[Close filter dropdown]
    CloseDropdown --> CheckQuery{Query exists?}

    CheckQuery -->|Yes| ReExecuteSearch[Re-execute search with new filter]
    CheckQuery -->|No| WaitForQuery[Wait for query input]

    ReExecuteSearch --> ShowLoading[Show loading]
    ShowLoading --> UpdateResults[Update results list]

    UpdateResults --> End([End])
    WaitForQuery --> End
```

## 8.4 Toggle Title-Only Search

```mermaid
flowchart TD
    Start([Start]) --> ClickToggle[Click 'Title only' toggle]
    ClickToggle --> CurrentState{Current state?}

    CurrentState -->|Off| TurnOn[Enable title-only search]
    CurrentState -->|On| TurnOff[Disable title-only search]

    TurnOn --> UpdateToggleUI[Update toggle UI to ON]
    TurnOff --> UpdateToggleUI[Update toggle UI to OFF]

    UpdateToggleUI --> CheckQuery{Query exists?}

    CheckQuery -->|Yes| ReExecuteSearch[Re-execute search]
    CheckQuery -->|No| WaitForQuery[Wait for query]

    ReExecuteSearch --> FilterResults{Title only enabled?}
    FilterResults -->|Yes| SearchTitlesOnly[Search only in titles]
    FilterResults -->|No| SearchAllContent[Search titles + content]

    SearchTitlesOnly --> UpdateResults[Update results]
    SearchAllContent --> UpdateResults

    UpdateResults --> End([End])
    WaitForQuery --> End
```

## 8.5 View Search Results

```mermaid
flowchart TD
    Start([Start]) --> ReceiveResults[Receive search results from API]
    ReceiveResults --> CheckResults{Results exist?}

    CheckResults -->|No| ShowEmptyState["Show No results found message"]
    CheckResults -->|Yes| ProcessResults[Process results array]

    ProcessResults --> ForEachResult[For each result]
    ForEachResult --> ExtractData[Extract result data]

    ExtractData --> DetermineType{Result type?}
    DetermineType -->|Space| ShowSpaceIcon[Show space icon]
    DetermineType -->|Node| ShowNodeIcon[Show node icon]
    DetermineType -->|Context| ShowContextIcon[Show context icon]

    ShowSpaceIcon --> FormatResult[Format result item]
    ShowNodeIcon --> FormatResult
    ShowContextIcon --> FormatResult

    FormatResult --> ShowTitle[Display result title]
    ShowTitle --> ShowPath[Display breadcrumb path]
    ShowPath --> ShowSnippet[Display content snippet if available]

    ShowSnippet --> MoreResults{More results?}
    MoreResults -->|Yes| ForEachResult
    MoreResults -->|No| RenderList[Render complete results list]

    RenderList --> HighlightFirst[Highlight first result]
    HighlightFirst --> End([End])
    ShowEmptyState --> End
```

## 8.6 Keyboard Navigation in Results

```mermaid
flowchart TD
    Start([Start]) --> ResultsDisplayed[Results list displayed]
    ResultsDisplayed --> KeyPress{Key pressed?}

    KeyPress -->|Arrow Down| MoveDown[Move highlight down]
    KeyPress -->|Arrow Up| MoveUp[Move highlight up]
    KeyPress -->|Enter| SelectResult[Select highlighted result]
    KeyPress -->|Escape| CloseModal[Close search modal]
    KeyPress -->|Other key| TypeCharacter[Add to search query]

    MoveDown --> CheckBounds{At last item?}
    CheckBounds -->|Yes| StayLast[Keep highlight on last]
    CheckBounds -->|No| HighlightNext[Highlight next item]

    MoveUp --> CheckTop{At first item?}
    CheckTop -->|Yes| StayFirst[Keep highlight on first]
    CheckTop -->|No| HighlightPrevious[Highlight previous item]

    HighlightNext --> ScrollIntoView[Scroll item into view]
    HighlightPrevious --> ScrollIntoView
    StayLast --> KeyPress
    StayFirst --> KeyPress

    ScrollIntoView --> KeyPress

    SelectResult --> NavigateToResult[Navigate to result page]
    CloseModal --> End([End])
    TypeCharacter --> UpdateSearch[Update search query]
    UpdateSearch --> KeyPress

    NavigateToResult --> End
```

## 8.7 Navigate to Search Result

```mermaid
flowchart TD
    Start([Start]) --> SelectResult{Selection method?}

    SelectResult -->|Click result| ClickAction[Mouse click on result]
    SelectResult -->|Press Enter| EnterAction[Enter on highlighted result]

    ClickAction --> GetResultData[Get result data]
    EnterAction --> GetResultData

    GetResultData --> DetermineType{Result type?}

    DetermineType -->|Space| BuildSpaceURL[Build /spaces/{slug} URL]
    DetermineType -->|Node| BuildNodeURL[Build /spaces/{slug}/node/{id} URL]
    DetermineType -->|Context| BuildContextURL[Build /spaces/{slug}/node/{id} URL]

    BuildSpaceURL --> CloseModal[Close search modal]
    BuildNodeURL --> CloseModal
    BuildContextURL --> CloseModal

    CloseModal --> Navigate[router.push to URL]
    Navigate --> LoadPage[Load target page]

    LoadPage --> UpdateBreadcrumb[Update breadcrumb navigation]
    UpdateBreadcrumb --> HighlightSidebar[Highlight item in sidebar]

    HighlightSidebar --> End([End])
```

## 8.8 Close Search Modal

```mermaid
flowchart TD
    Start([Start]) --> CloseAction{Close trigger?}

    CloseAction -->|Press Escape| EscapeKey[Escape key pressed]
    CloseAction -->|Click backdrop| ClickOutside[Click outside modal]
    CloseAction -->|Click X| ClickClose[Click close button]
    CloseAction -->|Navigate to result| NavigationClose[Result selected]

    EscapeKey --> ClearState[Clear search state]
    ClickOutside --> ClearState
    ClickClose --> ClearState
    NavigationClose --> ClearState

    ClearState --> SetModalClosed[Set showSearchModal=false]
    SetModalClosed --> ResetQuery[Reset query to empty]

    ResetQuery --> ResetFilter[Reset filter to 'all']
    ResetFilter --> ResetResults[Clear results array]

    ResetResults --> UnmountModal[Unmount SearchModal component]
    UnmountModal --> ReturnFocus[Return focus to previous element]

    ReturnFocus --> End([End])
```

## Search State Machine

```mermaid
stateDiagram-v2
    [*] --> Closed: Initial state

    Closed --> Open: Open modal
    Open --> Closed: Close modal

    Open --> Typing: User types
    Typing --> Open: Query cleared
    Typing --> Searching: Debounce complete

    Searching --> HasResults: Results found
    Searching --> NoResults: No results
    Searching --> SearchError: API error

    HasResults --> Typing: Query modified
    HasResults --> Navigating: Select result
    NoResults --> Typing: Query modified
    SearchError --> Typing: Query modified

    Navigating --> Closed: Navigation complete

    HasResults --> Filtering: Change filter
    Filtering --> Searching: Re-search
```

## Search Query Flow

```mermaid
flowchart LR
    subgraph Input
        Query[Search Query]
        Filter[Type Filter]
        TitleOnly[Title Only Toggle]
    end

    subgraph Processing
        Debounce[Debounce 300ms]
        BuildParams[Build Query Params]
        APICall[API Request]
    end

    subgraph Output
        Results[Results List]
        Empty[Empty State]
        Error[Error State]
    end

    Query --> Debounce
    Debounce --> BuildParams
    Filter --> BuildParams
    TitleOnly --> BuildParams
    BuildParams --> APICall

    APICall -->|Success + Results| Results
    APICall -->|Success + Empty| Empty
    APICall -->|Failure| Error
```
