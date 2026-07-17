# Migration checklist

## Infra

- [x] Skill (`.cursor/skills/nextjs-migration`)
- [x] Next.js 15 + `next.config.mjs` (static export → `build/`)
- [x] Theme Registry (Emotion + MUI)
- [x] Root layout + globals.css
- [x] Client providers (no BrowserRouter)
- [x] Lingui on Next (babel-loader macros; SWC plugin broken on Windows)
- [x] PWA (next-pwa + image caches)
- [x] Vite removed

## Routes `(main)`

- [x] `/` → redirect library
- [x] `/library`
- [x] `/auth/login`
- [x] `/browse`
- [x] `/manga/[id]`
- [x] `/updates`
- [x] `/history`
- [x] `/downloads`
- [x] `/more`
- [x] `/about`
- [x] `/settings` (+ children)
- [x] `/sources/...`
- [x] `/extension/...`
- [x] `/migrate/...`
- [x] `/tracker/login/oauth`

## Reader shell

- [x] `/manga/[mangaId]/chapter/[chapterSourceOrder]`
