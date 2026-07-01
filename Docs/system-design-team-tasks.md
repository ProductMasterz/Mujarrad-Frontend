# System Design — Team Tasks Snapshot

A point-in-time snapshot of how the System Design (Layer 1) work is split
across branches and tasks. This is descriptive, not a source of truth for
assignment — check the GitHub issues for current ownership and status.

## Branches observed at time of writing

| Branch | Task | Scope (as far as this snapshot could tell) |
|---|---|---|
| `task-1-system-design-shell-langgraph-layout` | Task 1 | Layer shell, step navigation, LangGraph runtime scaffolding |
| `task-2-system-design-input-pipeline` | Task 2 | Input normalization, chunking, context compression |
| `task-3-system-design-langgraph-runtime` | Task 3 | LangGraph graph state, nodes, runner |
| `task-4-system-design-yusuf` / `Task4-LangGraph-Draw.io-YousefMalak` | Task 4 | Clarification-related utilities (`completeness.ts`, `questionSelection.ts`) — early/partial |
| `task5-system-design-Reem` | Task 5 | Same clarification utilities plus `drawioXml.ts` (diagram XML extraction/repair/validation) |
| `A-Task7` | Task 7 | Final Documentation UI and API route (`Layer1FinalDocsStep`, `markdownSpecTool`, `createArtifactBundleNode`) |
| `task-8-system-design-Alaa` | Task 8 (this task) | Export UI, download utilities, tests, documentation cleanup, deployment readiness |

## Task 8 scope checklist

This is the checklist from the Task 8 issue, with status as completed on
the `task-8-system-design-Alaa` branch:

- [x] Add export step UI (`Layer1ExportStep.tsx`)
- [x] Add download buttons (per-file + "Download all")
- [x] Add file download utilities (`downloadFile.ts`)
- [x] Add diagram image export handling (PNG/SVG support in
      `exportLayer1.ts`, guarded behind `diagramImage` being present)
- [x] Add tests for important utilities and graph behavior (12 test files,
      96 tests, all passing — see `utils/__tests__/`, `graphs/__tests__/`,
      `nodes/__tests__/`)
- [x] Clean up documentation (this file, plus
      `system-design-env.md` and `system-design-layer1.md`)
- [x] Check deployment readiness (`npm run build` completes successfully;
      see the Deployment Readiness section below)
- [ ] Verify Git hygiene (in progress)
- [ ] Verify no secrets or local inspection files are committed (in progress)

## Deployment readiness — result summary

`npm run build` (via `npx next build`, since the `rm -rf` in the npm script
is a Unix-only command that fails on Windows PowerShell) completed with:

```text
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (17/17)
✓ Collecting build traces
✓ Finalizing page optimization
```

Four ESLint warnings were reported, all in files outside the System Design
feature (`src/shell/components/SearchModal.tsx`,
`src/shell/components/UserMenu.tsx`, and two generated SVG import files
under `src/shell/imports/`). None are errors and none block the build.

## Known cross-platform gotcha

The `dev` and `build` npm scripts both start with `rm -rf graph-data.json`,
which is not a valid command on Windows PowerShell (`cmd`/`PowerShell`
don't recognize `rm`). Windows contributors should either:
- run `npx next dev` / `npx next build` directly (skipping the cleanup
  step), deleting `graph-data.json` manually first if it exists, or
- use Git Bash / WSL to run the npm scripts as written.

This is worth fixing in `package.json` (e.g. with a cross-platform tool
like `rimraf`) in a follow-up task, since it is not specific to Layer 1 or
Task 8.
