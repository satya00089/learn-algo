---
name: learn-algo-ml
description: ML playground, engine, hook, worker, test, metadata, and visualization work for Learn-Algo. Use when editing `src/app/ml`, `src/modules/ml`, ML route metadata, tests, or workers.
---

# Learn-Algo ML

## Overview

Use this skill for probability, statistics, PCA, t-SNE, clustering, regression, scaling, anomaly detection, ensemble methods, and other ML playground work in Learn-Algo.

## Workflow

1. Identify the route, playground, and supporting ML module together.
2. Update the data model, algorithm logic, hooks, workers, and visualizer in one change when behavior shifts.
3. Keep theory content, metadata, and structured data aligned with the route.
4. Prefer deterministic datasets and small fixtures when adding examples or tests.

## Repo Conventions

- Route pages live in `src/app/ml/<slug>/page.tsx`.
- Shared ML metadata lives in `src/app/ml/metadata-config.ts`.
- Most logic lives in `src/modules/ml/algorithms`, `src/modules/ml/engines`, `src/modules/ml/hooks`, `src/modules/ml/playground`, `src/modules/ml/types`, `src/modules/ml/visualizers`, `src/modules/ml/workers`, and `src/modules/ml/tests`.
- Reuse `src/components/TheoryModal.tsx` for concept explanations rather than creating separate teaching pages.
- Keep long-running or data-heavy computation out of the render path when a worker already exists.

## Validation

- Run `npm run lint` and `npm run type-check` after ML surface changes.
- Run the targeted ML test files or the affected route manually when algorithm behavior changes.

## Reference

See [references/ml-workflow.md](references/ml-workflow.md) for the route and module map.
