# System Design — Layer 1 Implementation Status

This document describes what Layer 1 actually does today, step by step, as
implemented in `src/features/system-design/`. It is a snapshot, not a
spec — update it whenever a step's implementation status changes.

## Pipeline overview

Layer 1 takes a free-text system description and produces an approved
artifact bundle: a Markdown specification, a Draw.io diagram, and
(optionally) a rendered diagram image. The bundle can then be exported.

```text
Input → Clarification → Specification → Diagram → Review → Export
```

`Final Documentation` sits alongside `Review` in the UI as the step that
generates the Markdown spec shown for approval before export.

## Step-by-step status

| Step | UI component | Status | Notes |
|---|---|---|---|
| **Input** | `Layer1InputPanel` | ✅ Implemented | Accepts typed text (voice/transcription input also wired). Normalizes and chunks large input via `inputNormalization.ts` / `textChunking.ts`. |
| **Clarification** | placeholder in `Layer1Shell` | 🚧 Not implemented | `questionSelection.ts` exists as an early/partial utility (`selectNextQuestion`), but there is no clarification UI or LangGraph node wired up yet. |
| **Specification** | placeholder in `Layer1Shell` | 🚧 Not implemented | No dedicated UI or generation logic yet. |
| **Diagram** | placeholder in `Layer1Shell` | 🚧 Not implemented | `drawioXml.ts` (XML extraction/repair/validation) exists and is unit-tested, but there is no diagram-generation UI or LangGraph node producing real diagrams yet. |
| **Review / Final Documentation** | `Layer1FinalDocsStep` | ⚠️ Partially implemented | Can call the generation route and shows a `## System Understanding` / `## Diagram Explanation` template, but the sections are empty because Clarification/Specification/Diagram don't yet produce the data they depend on. |
| **Export** | `Layer1ExportStep` | ✅ Implemented (Task 8) | Builds downloadable files from an approved `Layer1ArtifactBundle` (`exportLayer1.ts`, `downloadFile.ts`) and calls `POST /api/system-builder/layer1/export`. Requires an approved bundle with both `markdownSpec` and `drawioXml` populated — shows a guidance message otherwise. |

## Supporting utilities and their status

| File | Status |
|---|---|
| `utils/inputNormalization.ts` | ✅ Implemented, tested |
| `utils/textChunking.ts` | ✅ Implemented, tested |
| `utils/contextCompression.ts` | ✅ Implemented, tested |
| `utils/markdownSpec.ts` | ✅ Implemented, tested (validates required Final Documentation sections) |
| `utils/completeness.ts` | 🚧 Minimal/early implementation, tested |
| `utils/questionSelection.ts` | 🚧 Minimal/early implementation, tested |
| `utils/drawioXml.ts` | ✅ Implemented, tested (extraction, repair, validation) — not yet wired into a real diagram-generation flow |
| `utils/exportLayer1.ts` | ✅ Implemented, tested (Task 8) |
| `utils/downloadFile.ts` | ✅ Implemented, tested (Task 8) |
| `graphs/layer1GraphState.ts` | ✅ Implemented, tested (step ordering, availability, completion) |
| `nodes/processInputNode.ts` | ✅ Implemented, tested |
| `nodes/createArtifactBundleNode.ts` | ✅ Implemented, tested |

## Why some steps show a "will be implemented in Task N" message

`Layer1Shell.tsx` renders a generic placeholder card for any step that
doesn't have a dedicated component yet, using a `stepMessages` lookup table
that names which task owns that step. This is intentional scaffolding, not
a bug — it lets the step navigation and progress UI work end-to-end while
individual steps are built out incrementally by different tasks.

## What this means for testing the Export step manually

Because Clarification, Specification, and Diagram are not implemented yet,
walking through the UI from Input to Export will not produce a real
approved artifact bundle — Final Documentation will generate with empty
section bodies, and Export will correctly refuse to show download buttons
(by design — see `isLayer1BundleExportable` in `exportLayer1.ts`).

To verify the Export step's behavior today, rely on:
1. The automated tests in `utils/__tests__/exportLayer1.test.ts` and
   `utils/__tests__/downloadFile.test.ts`, which exercise the export logic
   directly against a manually constructed `Layer1ArtifactBundle`.
2. Manually setting `approvedLayer1Artifacts` in the Layer 1 store (e.g. via
   browser dev tools or a temporary test hook) if a full manual UI check is
   needed before Clarification/Specification/Diagram are implemented.
