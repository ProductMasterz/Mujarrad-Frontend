# System Design — Environment Variables

This document lists the environment variables that the System Design feature
(Layer 1) actually reads at runtime, where they are used, and how to set
them up locally. It reflects the code as implemented, not the aspirational
plan in `system-design-detailed-plan.md`.

## Where local values go

```text
.env.local          # your real values, never committed (see .gitignore)
.env.example         # committed template with empty/placeholder values
```

Never commit real API keys or secrets in `.env.example` or anywhere else in
the repository.

## Variables used by System Design

| Variable | Required | Exposed to browser? | Used in |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes (existing Mujarrad backend) | Yes | `next.config.js` rewrites (`/api/*` proxy target) |
| `NEXT_PUBLIC_AGENT_SERVICE_URL` | Existing frontend variable | Yes | Shared frontend config, not System Design–specific |
| `OPENROUTER_API_KEY` | Yes, for diagram generation | **No** (server-only) | `app/api/system-builder/generate-diagram/route.ts` |
| `SYSTEM_BUILDER_MODEL` | No — has a default | **No** (server-only) | `app/api/system-builder/generate-diagram/route.ts`. Defaults to `google/gemini-2.0-flash-001` if unset. |
| `OPENAI_API_KEY` | Only if the legacy transcription route is used | **No** (server-only) | `app/api/system-builder/transcribe/route.ts` |
| `SYSTEM_BUILDER_TRANSCRIPTION_MODEL` | No — has a default | **No** (server-only) | `app/api/system-builder/transcribe/route.ts`. Defaults to `whisper-1` if unset. |
| `NEXT_PUBLIC_SYSTEM_BUILDER_MODE` | No | Yes | Feature flag, currently `api` |
| `NEXT_PUBLIC_ENABLE_LAYER_2` | No | Yes | Feature flag, keep `false` until Layer 2 ships |
| `NEXT_PUBLIC_ENABLE_LAYER_3` | No | Yes | Feature flag, keep `false` until Layer 3 ships |

## Server-side vs. `NEXT_PUBLIC_` rule

Any variable read by an `app/api/**/route.ts` file that holds a provider
key (OpenRouter, OpenAI, etc.) must **never** be prefixed with
`NEXT_PUBLIC_`. A `NEXT_PUBLIC_` prefix bundles the value into client-side
JavaScript, which would leak the key to anyone viewing the page source.

Correct:
```text
OPENROUTER_API_KEY
OPENAI_API_KEY
```

Wrong:
```text
NEXT_PUBLIC_OPENROUTER_API_KEY
NEXT_PUBLIC_OPENAI_API_KEY
```

## Known gap in `.env.example`

As of this writing, `.env.example` documents `OPENAI_API_KEY` (transcription)
but does **not** include `OPENROUTER_API_KEY`, even though
`app/api/system-builder/generate-diagram/route.ts` reads it directly. Anyone
setting up the diagram-generation step locally needs to add
`OPENROUTER_API_KEY=` to their own `.env.local` manually until
`.env.example` is updated to include it.

## Quick local setup

1. Copy the template:
   ```bash
   cp .env.example .env.local
   ```
2. Fill in the real values for `NEXT_PUBLIC_API_URL`,
   `NEXT_PUBLIC_AGENT_SERVICE_URL`, and `OPENROUTER_API_KEY` (ask a
   teammate or check the deployment dashboard for the shared values).
3. Add `OPENROUTER_API_KEY=` manually — see the gap noted above.
4. Restart the dev server after any change to `.env.local`; Next.js only
   reads environment variables at server startup, not on hot reload.
