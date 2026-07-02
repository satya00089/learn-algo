# Site Workflow

## Scope

Use this skill for shared Learn-Algo site work:

- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/globals.css`
- `src/app/robots.ts`
- `src/app/sitemap.ts`
- `src/components/*StructuredData.tsx`
- `src/components/home`
- `src/components/PWAInstallPrompt.tsx`
- `src/components/PWARegister.tsx`
- `src/core/theme`
- `src/app/contact`
- `src/app/privacy`
- `src/app/terms`
- `src/app/ai`
- `src/modules/ai`
- `scripts/create-new-og-images.ts`
- `scripts/generate-og-images.ts`

## Common Changes

1. Update the app shell, homepage, or shared navigation.
2. Change SEO, metadata, structured data, robots, or sitemap behavior.
3. Adjust theme, dark-mode, or PWA interactions.
4. Update OG image generation or supporting site scripts.

## Working Rules

- Preserve responsive behavior on desktop and mobile.
- Keep metadata and structured data aligned with the final route content.
- Treat the AI and Minimax route tree as part of the shared site surface unless the request is specifically about an engine or algorithm internals.
- Reuse existing shared components before adding new site-shell variants.

## Checks

- Run `npm run lint`.
- Run `npm run type-check`.
- Run `npm run generate:og` when OG generation changes.
- Manually verify the affected page in the browser when layout, theme, or metadata changes.
