# Tasks: Add Space Creation Dialog

## 1. Create Schema and Types
- [ ] 1.1 Create Zod schema for space creation form (`src/schemas/space.schema.ts`)
- [ ] 1.2 Define form field types matching backend `CreateSpaceRequest` DTO

## 2. Create Dialog Component
- [ ] 2.1 Create `CreateSpaceDialog.tsx` component in `src/components/spaces/`
- [ ] 2.2 Implement form with react-hook-form and Zod validation
- [ ] 2.3 Add fields: name (required), description (optional), icon/emoji selector
- [ ] 2.4 Add loading state during submission
- [ ] 2.5 Add error handling and display

## 3. Integrate with Spaces Page
- [ ] 3.1 Add "Create Space" button to `app/spaces/page.tsx`
- [ ] 3.2 Wire up dialog open/close state
- [ ] 3.3 Connect to `useCreateSpace` mutation hook
- [ ] 3.4 Add success callback to navigate to new space or refresh list

## 4. Polish and Test
- [ ] 4.1 Add keyboard shortcut (Cmd/Ctrl+N) for quick access
- [ ] 4.2 Add form reset on successful creation
- [ ] 4.3 Write component tests for dialog behavior
- [ ] 4.4 Write integration test for space creation flow
