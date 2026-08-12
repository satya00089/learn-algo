---
name: new-algo-page
description: Scaffold or review a DSA/ML/AI playground page (like /ml/gradient-descent) so it matches this repo's existing UX — layout, styling, controls, animation, shared components, accessibility, and SEO. Use whenever creating a new topic page or auditing an existing one for consistency.
---

# New Algorithm/Topic Page — UX & Structure Guide

This repo (learn-algo, Next.js + TS + Tailwind) has ~35 interactive algorithm/topic pages
under `dsa/`, `ml/`, and `ai/` that all share one consistent UX. This skill captures that
convention precisely, so a new page looks and behaves like it was built by the same hand
as `/ml/gradient-descent`, `/ml/linear-regression`, `/dsa/binary-search`, etc.

Treat **`LinearRegressionPlayground.tsx`** as the gold-standard reference implementation —
it's the most complete and most fully tour-instrumented page. When in doubt, open it
alongside the topic you're building.

## 1. File layout for a new topic

A page is a thin server-component shim; all real UI lives in `src/modules/<domain>/`.
For a new topic `<route>` in domain `<domain>` (`dsa` | `ml` | `ai`), create:

```
src/app/<domain>/<route>/page.tsx                       # shim only, ~12 lines
src/modules/<domain>/playground/<Topic>Playground.tsx   # all UI: layout/controls/canvas/handlers
src/modules/<domain>/engines/<Topic>Engine.ts            # pure algorithm state machine (.step/.run/.reset/.getState)
src/modules/<domain>/hooks/use<Topic>Playground.ts       # UI state (speed/params/debug) + useShareableQueryState
src/modules/<domain>/visualizers/<topic>Visualizer.ts    # OPTIONAL: extract draw() helpers if canvas logic is large
src/modules/<domain>/types/                              # shared TS types for the topic, if needed
src/modules/<domain>/playground/index.ts                 # barrel: add `export * from './<Topic>Playground'`
public/theory/<domain>/<route>.md                        # "How It Works" content (see §6)
```

`page.tsx` is always this exact shape — never put layout/markup here. This is the real,
verified `src/app/ml/gradient-descent/page.tsx` — copy it and substitute `GradientDescent` →
your `PascalCasePlaygroundName`, `gradient-descent` → your route, and `ml` → your domain:

```tsx
import { GradientDescentPlayground } from '@/modules/ml/playground'
import { AlgorithmStructuredData } from '@/components/AlgorithmStructuredData'
import { generateMLMetadata } from '../metadata-config'

export const metadata = generateMLMetadata('gradient-descent')

export default function GradientDescentPage() {
  return (
    <>
      <AlgorithmStructuredData type="ml" route="gradient-descent" />
      <GradientDescentPlayground />
    </>
  )
}
```

Also register the topic in `src/app/<domain>/metadata-config.ts` (see §6) and in
`src/modules/ml/config/algorithmRelations.ts` (ML) or the equivalent map in
`RelatedAlgorithms.tsx` (DSA) so it shows up in other pages' "Related Algorithms" lists.

## 2. Page anatomy (top to bottom)

Everything lives inside one **`h-screen overflow-hidden`** shell — playground pages do not
scroll; content fits the viewport and only inner panels scroll.

1. **Header row**: `Breadcrumbs` + `<h1>` on the left; `ShareButton`, a "How It Works" button
   (opens `TheoryModal`), and `ThemeToggle` on the right. `flex items-center justify-between mb-3`.
2. **One-line subtitle**: single descriptive sentence, `text-gray-600 dark:text-gray-300 mb-3 text-sm`.
3. **Main grid**: `grid lg:grid-cols-4 gap-3 overflow-hidden` (single column below `lg`):
   - **`lg:col-span-3`**: playback/parameter controls bar (`flex flex-wrap` row) directly above
     the canvas/3D visualization, which fills the remaining height.
   - **1 column**: stacked `ControlGroup` panels in a scrollable column — "Current State"/metrics,
     parameters, legend, "About `<Algorithm>`" prose blurb, and optionally a debug/history panel
     gated behind an `isDebugMode` toggle.
4. **Fixed "Related Algorithms" accordion**: `fixed bottom-0 right-4`, collapsed by default,
   wraps `<RelatedAlgorithms route="<route>" type="<domain>" compact />`. (DSA/ML only today —
   see §4 for the AI workaround.)
5. **`TheoryModal`**: always mounted at the end, controlled by local `showExplanation` state.

Only breadcrumbs, title, subtitle, ShareButton, "How It Works"/TheoryModal, ThemeToggle,
controls bar, canvas, right-column `ControlGroup`s, and the Related Algorithms accordion are
universal. `CodeTabs`/`FAQSchema`/inline complexity call-outs are optional enhancements used
on a handful of pages — don't treat them as required.

## 3. Visual style system

- Root: `bg-gray-50 dark:bg-gray-900`. Cards/panels: `bg-white dark:bg-gray-800 rounded-lg
  shadow-lg` (controls bar, canvas container) or `shadow-md` (`ControlGroup`). Fixed
  Related-Algorithms popover: `shadow-2xl`.
- Rounding: `rounded-lg` for panels, smaller `rounded` for compact buttons/pills, `rounded-full`
  for the floating Tour button and scrollbar thumbs.
- **Accent color per domain** (codify this; don't add a fourth color) —
  **DSA → `purple-600`**, **AI → `purple-600`**, **ML → `blue-600`** (use blue even though
  several older ML pages drifted to purple — blue is what the two flagship, fully
  tour-instrumented ML pages use; don't copy the purple ones for new ML topics).
  Secondary/status colors are consistent everywhere regardless of domain: green = success/
  converged/found, red = current position/error/outlier, amber/yellow = step/warning,
  gray = neutral/default/excluded. `CodeTabs`'s active-tab indicator is indigo — that's
  modal-only, not a page accent.
- Typography: global font is Space Grotesk (set on `<body>` in root layout). `<h1>`:
  `text-3xl font-bold` (a couple of older pages use `text-2xl` — prefer `text-3xl` for new
  ones). `ControlGroup` titles: `text-lg font-semibold`. Ad-hoc panel headers: `text-sm
  font-semibold`. Body/label text: `text-xs`, legend/debug text down to `text-[10px]`.
- Dark mode: every single color utility needs a paired `dark:` variant — there's no separate
  dark stylesheet, it's inline everywhere via Tailwind's class-based dark mode + the shared
  `useTheme` hook.
- No glassmorphism, blur, or gradient backgrounds inside playgrounds — flat solid colors only.
  (Gradients/`backdrop-blur` are reserved for the Tour button and the marketing homepage.)
- Icons: `react-icons/fa` for playback controls (Play/Pause/StepForward/FastForward/Redo/
  Random), `react-icons/vsc` (`VscDebugAltSmall`) for the debug toggle, `react-icons/gi`
  (`GiBookCover`) for "How It Works". Don't mix in lucide/heroicons here.
- Scrollable side panels always get this exact scrollbar class chain (copy verbatim):
  `[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-200
  dark:[&::-webkit-scrollbar-track]:bg-gray-800 [&::-webkit-scrollbar-thumb]:bg-gray-400
  [&::-webkit-scrollbar-thumb]:rounded-full`.

## 4. Interaction & animation patterns

- **No Framer Motion.** 2D visualizations draw via the shared `useCanvas` hook
  (`src/core/canvas/useCanvas.ts`): pass a `draw(ctx)` callback, call `redraw()` imperatively
  whenever engine state changes:
  ```tsx
  useEffect(() => { redraw() }, [engineState, redraw])
  ```
  3D visualizations (k-means, PCA, t-SNE style topics) use react-three-fiber scene components
  instead, but mount inside the identical `bg-white dark:bg-gray-800 rounded-lg shadow-lg`
  container — keep the shell the same even if the render tech differs.
- **Playback loop**: `isPlaying` state + a `setInterval` ref calling `engine.step()` every
  `animationSpeed` ms, cleared on pause/reset/unmount. Steps are snap transitions, not eased —
  don't add tweening between discrete algorithm steps.
- **Controls layout**: playback buttons are a `flex gap-1` cluster of `w-8 h-8` square icon
  buttons; separate clusters with `<div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />`.
  Sliders (`<input type="range">`) live in the right-column `ControlGroup`s; inline numeric
  steppers (`<input type="number" className="w-16">`) live in the top controls bar.
- Every icon-only button is wrapped in the shared `Tooltip` component
  (`src/core/controls/Tooltip.tsx`) — **and must also get an explicit `aria-label` on the
  `<button>` itself**, not just rely on the tooltip text (a real gap in a couple of existing
  pages — don't repeat it).
- Hover/focus: `hover:bg-*-700` / `hover:bg-gray-100`, `disabled:opacity-50
  disabled:cursor-not-allowed`, `focus:outline-none focus:ring-2 focus:ring-{accent}-500`.
  The shared `Button` (`src/core/controls/Button.tsx`) already adds
  `focus-visible:ring-2 focus-visible:ring-offset-2`.
- **Tour onboarding** (driver.js, `src/components/tour/`): stamp these `data-tour` attributes
  so the global tour works on the new page — model this on `LinearRegressionPlayground.tsx`,
  not on pages missing them:
  - `data-tour="playground-breadcrumbs"` — already on `Breadcrumbs`' own root, no action needed.
  - `data-tour="playground-controls"` — the playback controls bar wrapper.
  - `data-tour="playground-parameters"` — the parameter-inputs wrapper.
  - `data-tour="playground-visualization"` — the canvas/3D-scene container.
  - `data-tour="playground-insights"` — already added by `ControlGroup` itself; no action needed.
  - `data-tour="playground-related"` — the Related Algorithms accordion wrapper.

## 5. Component reuse

- **`Breadcrumbs`** — `<Breadcrumbs />`, zero props, no config needed. Always immediately
  followed by the page `<h1>` in the same flex row.
- **`TheoryModal`** — mount once, trigger via a `showExplanation` boolean + a
  `Button variant="outline" size="sm"` with `<GiBookCover />` + "How It Works":
  ```tsx
  <TheoryModal
    isOpen={showExplanation}
    onClose={() => setShowExplanation(false)}
    theoryFile="/theory/<domain>/<route>.md"
    title="Understanding <Topic Name>"
  />
  ```
  Use the nested `/theory/<domain>/<route>.md` path — don't use a flat `/theory/<route>.md`
  path (one existing AI page did that; it's a bug, not a pattern).
- **`CodeTabs`** — never imported directly in a page. Multi-language code examples belong in
  the theory markdown file as fenced code blocks with `# Tab: Python` / `# Tab: JavaScript`
  sections; `TheoryModal` auto-detects ≥2 tab headers and renders `CodeTabs` for you.
- **`RelatedAlgorithms`** — `<RelatedAlgorithms route="<route>" type="dsa" | "ml" compact />`
  inside the fixed bottom-right accordion. Requires adding the new route to the relation map
  in `RelatedAlgorithms.tsx` (DSA) or `src/modules/ml/config/algorithmRelations.ts` (ML) —
  it won't show up automatically. `type` only supports `'dsa' | 'ml'` today; for an AI page,
  follow the existing workaround of a static "Related Algorithms — coming soon" card in the
  same accordion position, rather than skipping the section.
- **`AlgorithmStructuredData`** — rendered in `page.tsx` (not the playground), first child,
  `type="<domain>" route="<route>"`.
- **`FAQSchema`** — optional, page-level opt-in for a handful of pages that want FAQ rich
  results; not required for a new topic page unless you're specifically adding an SEO FAQ
  section.

## 6. Metadata / SEO

Add an entry to `src/app/<domain>/metadata-config.ts` (ML/DSA shape — use this shape even
for a new AI page rather than the AI file's divergent one):

```ts
'<route>': {
  title: '<Topic Name> - <short subtitle> | Interactive [3D] Visualization',
  description: '2-4 sentences, mentions specific interactive features.',
  keywords: [ /* 15-35 long-tail + exact-match keyword strings */ ],
  ogImage: '/og/og-<domain>-<route>.png',   // must exist as a real generated asset
},
```
`generate<Domain>Metadata(route)` / `generate<Domain>StructuredData(route)` then produce the
full Next `Metadata` object (canonical URL, robots, openGraph/twitter) and the JSON-LD for
`AlgorithmStructuredData` automatically — don't hand-roll either. Canonical domain is
`https://www.learn-algo.com` — if touching AI metadata, fix the existing `learnalgo.com`
(no `www`) mismatch rather than propagate it, and don't leave placeholder fields (e.g. an
unfilled Google verification string) in a new entry.

## 7. Accessibility & responsiveness checklist

- Every icon-only `<button>` has both a `Tooltip` wrapper AND an explicit `aria-label`.
- `<nav aria-label="Breadcrumb">` semantics come for free from `Breadcrumbs` — don't
  reimplement breadcrumbs manually.
- Exactly one `<h1>` per page; `ControlGroup` panel titles are `<h3>`.
- If the visualization has canvas click-targets (e.g. a game board), wrap each clickable
  region in a real `<button type="button">` for focus/keyboard support rather than a bare
  `onClick` on the canvas.
- Layout responsiveness is a single breakpoint: `grid lg:grid-cols-4` stacking to one column
  below `lg`. Don't add extra `sm:`/`md:` reflow rules inside the playground — these are
  desktop-first tools that degrade to a stacked column on mobile, not fully responsive grids.

## 8. Quick build checklist for a new page

1. Create the engine (`.step/.run/.reset/.getState`), hook (UI state + `useShareableQueryState`),
   and `<Topic>Playground.tsx` under `src/modules/<domain>/...`, export it from
   `playground/index.ts`.
2. Build the playground UI following §2–§5 exactly (header row → subtitle → controls+canvas →
   right-column `ControlGroup`s → Related Algorithms accordion → `TheoryModal`).
3. Apply the correct domain accent color (§3) and stamp all `data-tour` attributes (§4).
4. Write `public/theory/<domain>/<route>.md` with the explanation (+ optional `# Tab:` code
   examples).
5. Add the metadata-config entry (§6) and generate the matching `/og/og-<domain>-<route>.png`.
6. Register the route in the Related Algorithms relation map for its domain.
7. Write the 12-line `page.tsx` shim.
8. Sanity-check against the accessibility checklist (§7) before calling it done.
