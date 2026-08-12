# ML Workflow

## Scope

Use this skill for the ML routes and supporting module code in Learn-Algo:

- `src/app/ml/<slug>/page.tsx`
- `src/app/ml/metadata-config.ts`
- `src/modules/ml/algorithms`
- `src/modules/ml/engines`
- `src/modules/ml/hooks`
- `src/modules/ml/playground`
- `src/modules/ml/types`
- `src/modules/ml/visualizers`
- `src/modules/ml/workers`
- `src/modules/ml/tests`
- `src/components/TheoryModal.tsx`

## Common Changes

1. Add or adjust an ML playground route.
2. Update the algorithm, hook, or worker that produces model output.
3. Keep the visualizer, theory text, and page metadata synchronized.
4. Add or update deterministic tests when the numerical behavior changes.

## Working Rules

- Prefer small, reproducible datasets for demos and tests.
- Keep heavy computation out of the render path when a worker or engine already exists.
- Reuse the existing theory modal for concept explanations.
- Keep labels and route metadata consistent with the algorithm being taught.

## Checks

- Run `npm run lint`.
- Run `npm run type-check`.
- Run the targeted ML tests or manually verify the affected playground when model behavior changes.
