---
name: learn-algo-dsa
description: DSA playground, engine, hook, metadata, and visualization work for Learn-Algo. Use when editing `src/app/dsa`, `src/modules/dsa`, `src/components/TheoryModal.tsx`, or DSA route metadata and structured data.
---

# Learn-Algo DSA

## Overview

Use this skill for sorting, searching, trees, stacks, queues, strings, recursion, bit manipulation, and related DSA playground work in Learn-Algo.

## Workflow

1. Identify the route, playground, and supporting module together.
2. Update the engine, hook, visualizer, and page shell in the same change when behavior shifts.
3. Keep theory content, metadata, and structured data aligned with the route.
4. Prefer the existing playground patterns instead of inventing new navigation or learning surfaces.

## Repo Conventions

- Route pages live in `src/app/dsa/<slug>/page.tsx`.
- Shared DSA metadata lives in `src/app/dsa/metadata-config.ts`.
- Most gameplay logic lives in `src/modules/dsa/playground`, `src/modules/dsa/engines`, `src/modules/dsa/hooks`, `src/modules/dsa/types`, and `src/modules/dsa/visualizers`.
- Reuse `src/components/TheoryModal.tsx` and `src/components/RelatedAlgorithms.tsx` for learning and discovery UI.
- Keep educational guidance inside the algorithm page flow rather than creating separate learning pages.

## Validation

- Run `npm run lint` and `npm run type-check` after DSA surface changes.
- Manually verify the affected route and its theory modal when the algorithm behavior or copy changes.

## Reference

See [references/dsa-workflow.md](references/dsa-workflow.md) for the route and module map.
