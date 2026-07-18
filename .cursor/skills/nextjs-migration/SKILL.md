---
name: nextjs-migration
description: >-
  Guides the Suwayomi-WebUI migration from Vite + React Router to Next.js 15
  App Router with static export. Use when migrating routes, converting
  components, configuring next.config, Emotion/Theme Registry, Apollo, Lingui,
  PWA, or when working on Next.js performance for this project.
---

# Suwayomi-WebUI → Next.js 15 Migration

Source of truth: [AGENTS.md](../../../AGENTS.md).

## Critical constraint

`output: 'export'` — no Node server at runtime. GraphQL against Suwayomi-Server stays **client-side** (`src/lib/requests/`).

- Server Components: layouts, shells, static UI, metadata.
- Data pages (Library, Manga, Reader, Settings…): `"use client"` or thin client wrappers around existing screens.
- Do **not** introduce Apollo RSC / server streaming for live data.

## Rules

1. Prefer Server Components; add `"use client"` only for interactivity or GraphQL.
2. Reuse `src/features/**` — do not rewrite business logic.
3. Keep `build/` output for `build-zip` / `build-md5` and Suwayomi-Server.
4. Reader is performance-critical — keep it client-heavy and lean; migrate last.
5. Preserve visual/functional parity with the Vite SPA.

## Vite → Next map

| Vite | Next |
|------|------|
| `react-router-dom` | App Router + `src/lib/router` helpers |
| `import.meta.env.VITE_*` | `process.env.NEXT_PUBLIC_*` |
| `import.meta.env.DEV/PROD` | `process.env.NODE_ENV` |
| `@lingui/vite-plugin` | Babel macros via `babel-loader` on `src/` + `@lingui/loader` for `.po` (use `pnpm dev` / webpack; Turbopack has `.po` rule but macros need Babel) |
| `vite-plugin-pwa` | `@ducanh2912/next-pwa` (static export compatible) |
| `use-query-params` + RR adapter | `WindowHistoryAdapter` or `nuqs` |
| `BrowserRouter` / basename | `basePath` + `SubpathUtil` |

## Phase checklist

Track progress in [checklist.md](checklist.md).

1. **Scaffold** — `next.config.mjs` (`output: 'export'`, `distDir: 'build'`, `images.unoptimized`), Theme Registry, root layout
2. **Providers** — client providers without `BrowserRouter`
3. **Routes** — App Router tree `(main)` vs reader shell; map `AppRoute.constants.ts`
4. **Features** — thin `page.tsx` wrappers in order: Library → Auth → Browse → Manga → Updates/History/Downloads → Settings → Reader
5. **Lingui + PWA** — SWC Lingui; next-pwa with chapter/thumbnail/icon caches
6. **Cutover** — remove Vite (`vite.config.ts`, `index.html`, `src/index.tsx`); update BUILDING.md

## When migrating a screen

1. Add `src/app/.../page.tsx` that imports the existing screen.
2. Mark page or screen `"use client"` if it uses hooks/GraphQL.
3. Replace `react-router-dom` imports with `@/lib/router` (or `next/navigation` / `next/link`).
4. For dynamic segments under static export, provide `generateStaticParams` (placeholder ok). **`next dev` omits `output: 'export'`** so unknown IDs (e.g. `/manga/8`) work; production builds still export placeholders only — soft-nav to unlisted IDs needs host SPA fallback / future Cache Components support.
5. Verify nav, auth guard, and theme still work.

## Do not

- Rewrite features from scratch
- Assume SSR for GraphQL
- Migrate Reader early or “optimize” without need
- Break `build/` zip/md5 scripts
