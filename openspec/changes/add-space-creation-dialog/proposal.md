# Change: Add Space Creation Dialog

## Why
Users cannot create new spaces through the UI. The primary workflow of creating a knowledge space is completely blocked, forcing users to rely on direct API calls or backend seeding. This is the #1 blocking issue for user adoption.

## What Changes
- Add `CreateSpaceDialog` component with form fields for space creation
- Add "Create Space" button to the spaces list page
- Integrate with existing `useCreateSpace` mutation hook
- Add form validation using Zod schema
- Add loading and error states

## Impact
- Affected specs: space-management
- Affected code:
  - `src/components/spaces/` (new component)
  - `app/spaces/page.tsx` (add trigger button)
  - `src/hooks/api/useSpaces.ts` (already exists)
