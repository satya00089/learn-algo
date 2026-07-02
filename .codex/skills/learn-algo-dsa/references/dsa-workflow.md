# DSA Workflow

## Scope

Use this skill for the DSA routes and supporting module code in Learn-Algo:

- `src/app/dsa/<slug>/page.tsx`
- `src/app/dsa/metadata-config.ts`
- `src/modules/dsa/playground`
- `src/modules/dsa/engines`
- `src/modules/dsa/hooks`
- `src/modules/dsa/types`
- `src/modules/dsa/visualizers`
- `src/components/TheoryModal.tsx`
- `src/components/RelatedAlgorithms.tsx`

## Common Changes

1. Add or adjust a playground route.
2. Update the engine or hook that drives the step-by-step behavior.
3. Tune visual feedback, theory text, or metadata together.
4. Keep route names, labels, and structured data aligned.

## Working Rules

- Prefer embedding educational context in the active playground page.
- Reuse the existing shared theory and algorithm discovery components.
- Keep any example state deterministic when the behavior depends on a seed or preset array.
- Verify the affected route after changing comparison logic, history playback, or step timing.

## Checks

- Run `npm run lint`.
- Run `npm run type-check`.
- Open the affected DSA page and confirm the theory modal, controls, and visualization stay in sync.
