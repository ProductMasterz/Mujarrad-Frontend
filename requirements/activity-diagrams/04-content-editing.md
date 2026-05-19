# Content Editing Journey - Activity Diagrams

## 4.1 Open Block Editor

```mermaid
flowchart TD
    Start([Start]) --> LoadNode[Load node detail page]
    LoadNode --> FetchContent[Fetch node content from API]

    FetchContent --> CheckContent{Content exists?}
    CheckContent -->|Yes| ParseBlocks[Parse content into blocks]
    CheckContent -->|No| CreateEmpty[Create empty block array]

    ParseBlocks --> InitEditor[Initialize BlockEditor component]
    CreateEmpty --> InitEditor

    InitEditor --> RenderBlocks[Render existing blocks]
    RenderBlocks --> SetupAutoSave[Setup auto-save mechanism]

    SetupAutoSave --> FocusFirst[Focus first block or title]
    FocusFirst --> Ready[Editor ready for input]

    Ready --> End([End])
```

## 4.2 Add Block via Slash Commands

```mermaid
flowchart TD
    Start([Start]) --> TypeSlash["User types / in empty block"]
    TypeSlash --> ShowCommandMenu[Display slash command menu]

    ShowCommandMenu --> ShowCategories[Show block type categories]
    ShowCategories --> UserAction{User action?}

    UserAction -->|Type to filter| FilterCommands[Filter matching commands]
    UserAction -->|Arrow keys| NavigateOptions[Navigate through options]
    UserAction -->|Click option| SelectBlock[Select block type]
    UserAction -->|Press Enter| SelectBlock
    UserAction -->|Press Escape| CloseMenu[Close menu, keep text]

    FilterCommands --> ShowFiltered[Show filtered results]
    ShowFiltered --> UserAction

    NavigateOptions --> HighlightOption[Highlight current option]
    HighlightOption --> UserAction

    SelectBlock --> GetBlockType[Get selected block type]
    GetBlockType --> InsertBlock[Insert new block of type]

    InsertBlock --> CloseMenu
    CloseMenu --> FocusNewBlock[Focus on new block]

    FocusNewBlock --> TriggerAutoSave[Trigger auto-save]
    TriggerAutoSave --> End([End])
```

## 4.3 Available Block Types

```mermaid
flowchart TD
    SlashMenu[Slash Command Menu]

    SlashMenu --> TextBlocks["Text and Structure"]
    TextBlocks --> Text[Text - Plain paragraph]
    TextBlocks --> H1[Heading 1 - Large title]
    TextBlocks --> H2[Heading 2 - Medium subtitle]
    TextBlocks --> H3[Heading 3 - Small heading]
    TextBlocks --> Divider[Divider - Horizontal line]

    SlashMenu --> ListBlocks[Lists]
    ListBlocks --> Bullet[Bullet List - Unordered]
    ListBlocks --> Numbered[Numbered List - Ordered]
    ListBlocks --> Todo[To-do List - Checkboxes]

    SlashMenu --> ContentBlocks[Rich Content]
    ContentBlocks --> Quote[Quote - Block quotation]
    ContentBlocks --> Code[Code - Syntax highlighted]
    ContentBlocks --> Callout[Callout - Highlighted box]
    ContentBlocks --> Image[Image - Upload/embed]

    SlashMenu --> AdvancedBlocks[Advanced]
    AdvancedBlocks --> Math[Math - LaTeX equations]
    AdvancedBlocks --> Mermaid[Mermaid - Diagrams]
```

## 4.4 Edit Block Content

```mermaid
flowchart TD
    Start([Start]) --> FocusBlock[Focus on a block]
    FocusBlock --> StartTyping[User starts typing]

    StartTyping --> UpdateLocal[Update local block state]
    UpdateLocal --> CheckDebounce{Debounce timer active?}

    CheckDebounce -->|Yes| ResetTimer[Reset debounce timer]
    CheckDebounce -->|No| StartTimer[Start debounce timer 1000ms]

    ResetTimer --> ContinueTyping[Continue typing]
    StartTimer --> ContinueTyping
    ContinueTyping --> StartTyping

    StartTimer --> WaitDebounce[Wait for debounce]
    WaitDebounce --> TimerComplete{Timer complete?}

    TimerComplete -->|User still typing| ResetTimer
    TimerComplete -->|User stopped| TriggerSave[Trigger auto-save]

    TriggerSave --> SerializeBlocks[Serialize all blocks to content]
    SerializeBlocks --> CallAPI[PUT /spaces/{slug}/nodes/{id}]

    CallAPI --> CheckResponse{API Response?}
    CheckResponse -->|Success| ShowSaved["Show Auto-saved status"]
    CheckResponse -->|Error| ShowError[Show save error]

    ShowSaved --> End([End])
    ShowError --> RetryLater[Queue retry]
    RetryLater --> End
```

## 4.5 Reorder Blocks via Drag & Drop

```mermaid
flowchart TD
    Start([Start]) --> HoverBlock[Hover over block]
    HoverBlock --> ShowDragHandle[Show drag handle on left]

    ShowDragHandle --> MouseDown[Mouse down on drag handle]
    MouseDown --> StartDrag[Start drag operation]

    StartDrag --> CreateGhost[Create drag ghost element]
    CreateGhost --> TrackMouse[Track mouse position]

    TrackMouse --> OverBlock{Over another block?}
    OverBlock -->|Yes| ShowDropIndicator[Show drop indicator line]
    OverBlock -->|No| HideIndicator[Hide drop indicator]

    ShowDropIndicator --> TrackMouse
    HideIndicator --> TrackMouse

    TrackMouse --> MouseUp{Mouse released?}
    MouseUp -->|No| TrackMouse
    MouseUp -->|Yes| CheckDrop{Valid drop target?}

    CheckDrop -->|Yes| ReorderBlocks[Reorder blocks array]
    CheckDrop -->|No| CancelDrag[Cancel drag, restore position]

    ReorderBlocks --> UpdateState[Update blocks state]
    UpdateState --> TriggerSave[Trigger auto-save]

    CancelDrag --> CleanupDrag[Remove ghost element]
    TriggerSave --> CleanupDrag

    CleanupDrag --> End([End])
```

## 4.6 Delete Block

```mermaid
flowchart TD
    Start([Start]) --> SelectBlock[Select/focus a block]
    SelectBlock --> DeleteAction{Delete trigger?}

    DeleteAction -->|Backspace on empty| CheckEmpty{Block empty?}
    DeleteAction -->|Click delete button| ConfirmDelete[Proceed with delete]
    DeleteAction -->|Keyboard shortcut| ConfirmDelete

    CheckEmpty -->|Yes| ConfirmDelete
    CheckEmpty -->|No| DeleteCharacter[Delete character instead]

    DeleteCharacter --> End([End])

    ConfirmDelete --> RemoveBlock[Remove block from array]
    RemoveBlock --> CheckRemaining{Blocks remaining?}

    CheckRemaining -->|Yes| FocusPrevious[Focus previous block]
    CheckRemaining -->|No| CreateEmptyBlock[Create empty text block]

    FocusPrevious --> TriggerSave[Trigger auto-save]
    CreateEmptyBlock --> FocusNew[Focus new empty block]
    FocusNew --> TriggerSave

    TriggerSave --> End
```

## 4.7 Code Block with Syntax Highlighting

```mermaid
flowchart TD
    Start([Start]) --> InsertCodeBlock[Insert code block via /code]
    InsertCodeBlock --> ShowLanguageSelect[Show language selector dropdown]

    ShowLanguageSelect --> SelectLanguage{User selects language?}
    SelectLanguage -->|Yes| SetLanguage[Set syntax highlighting language]
    SelectLanguage -->|Default| UseJavaScript[Default to JavaScript]

    SetLanguage --> RenderHighlighted[Render with syntax highlighting]
    UseJavaScript --> RenderHighlighted

    RenderHighlighted --> EnterCode[User enters code]
    EnterCode --> HighlightSyntax[Apply syntax highlighting in real-time]

    HighlightSyntax --> ContinueEditing{Continue editing?}
    ContinueEditing -->|Yes| EnterCode
    ContinueEditing -->|No| TriggerSave[Trigger auto-save]

    TriggerSave --> End([End])
```

## 4.8 Image Block Upload

```mermaid
flowchart TD
    Start([Start]) --> InsertImageBlock[Insert image block via /image]
    InsertImageBlock --> ShowUploadUI[Show image upload interface]

    ShowUploadUI --> UploadMethod{Upload method?}
    UploadMethod -->|Click to upload| OpenFilePicker[Open file picker]
    UploadMethod -->|Drag and drop| HandleDrop[Handle dropped file]
    UploadMethod -->|Paste URL| EnterURL[Enter image URL]

    OpenFilePicker --> SelectFile[User selects file]
    SelectFile --> ValidateFile{Valid image file?}

    HandleDrop --> ValidateFile
    EnterURL --> ValidateURL{Valid URL?}

    ValidateFile -->|Yes| UploadFile[Upload to server/storage]
    ValidateFile -->|No| ShowError[Show invalid file error]

    ValidateURL -->|Yes| SetImageSrc[Set image source URL]
    ValidateURL -->|No| ShowURLError[Show invalid URL error]

    UploadFile --> ShowProgress[Show upload progress]
    ShowProgress --> UploadComplete{Upload complete?}

    UploadComplete -->|Success| GetURL[Get uploaded image URL]
    UploadComplete -->|Error| ShowUploadError[Show upload error]

    GetURL --> SetImageSrc
    SetImageSrc --> RenderImage[Render image in block]

    RenderImage --> ShowCaption[Show caption input]
    ShowCaption --> TriggerSave[Trigger auto-save]

    TriggerSave --> End([End])
    ShowError --> ShowUploadUI
    ShowURLError --> ShowUploadUI
    ShowUploadError --> ShowUploadUI
```

## State Diagram - Block Editor

```mermaid
stateDiagram-v2
    [*] --> Idle: Editor initialized

    Idle --> Editing: User focuses block
    Editing --> Idle: User blurs

    Editing --> Saving: Debounce complete
    Saving --> Saved: API success
    Saving --> Error: API failure

    Saved --> Editing: User modifies
    Error --> Editing: User continues

    Editing --> Dragging: Start drag
    Dragging --> Editing: Drop complete

    Idle --> CommandMenu: Type slash
    CommandMenu --> Idle: Select or cancel
```
