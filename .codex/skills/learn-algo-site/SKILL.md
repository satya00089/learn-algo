---
name: learn-algo-site
description: Shared Learn-Algo app-shell, SEO, theme, PWA, structured data, OG image, and supporting site work. Use when editing `src/app`, shared components, metadata, theme, PWA, or OG generation scripts.
---

# Learn-Algo Site

## Overview

Use this skill for the home page, shared layouts, metadata, structured data, theme and PWA behavior, content pages, and supporting scripts in Learn-Algo.

## Workflow

1. Identify whether the change is app shell, route content, SEO/metadata, theme, or script work.
2. Keep shared layout, structured data, and metadata consistent across pages.
3. Preserve responsive behavior and theme-aware visuals when touching the shell or homepage.
4. Treat AI and Minimax route changes as part of this skill unless the request is specifically about a lower-level engine change.

## Repo Conventions

- Root app files live in `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `src/app/robots.ts`, and `src/app/sitemap.ts`.
- Shared UI and metadata helpers live in `src/components/*StructuredData.tsx`, `src/components/home`, `src/components/PWAInstallPrompt.tsx`, `src/components/PWARegister.tsx`, and `src/core/theme`.
- Supporting site pages live in `src/app/contact`, `src/app/privacy`, `src/app/terms`, and the `src/app/ai` route tree.
- Open Graph image generation lives in `scripts/create-new-og-images.ts` and `scripts/generate-og-images.ts`.
- Keep structured-data changes aligned with route metadata instead of duplicating schema in page components.

## Validation

- Run `npm run lint` and `npm run type-check` after shell or metadata changes.
- Run `npm run generate:og` when the OG generation pipeline changes.
- Manually verify the affected page in desktop and mobile layouts when shell styling changes.

## Reference

See [references/site-workflow.md](references/site-workflow.md) for the site map and shared conventions.
