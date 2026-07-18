# AGENTS.md — suwayomi-exp-ui

## Objetivo

Cliente web experimental do Suwayomi (`suwayomi-exp-ui`). Stack: **Next.js 15 (App Router) + static export** (`output: 'export'` → `build/`), React 19, MUI/Emotion, Apollo, Lingui, PWA.

Reescrito a partir do WebUI upstream com foco em **performance** e melhorias futuras. Não recomeçar migração Vite→Next do zero.

Hub: `F:\workspace\suwayomi-exp\CONTEXT.md`.
Skill: `.cursor/skills/nextjs-migration`.

## Stack

- Next.js 15 App Router, `distDir: 'build'`, `images.unoptimized`
- React 19 + TypeScript
- MUI 9 + Emotion (Theme Registry)
- Apollo Client + GraphQL (**sempre client-side**)
- Lingui (macros via `babel-loader` no Windows)
- PWA: `@ducanh2912/next-pwa`
- Shim de router: `src/lib/router`

## Restrição crítica

`output: 'export'` → sem Node em runtime. Build estático para o Server (`suwayomi-exp-server`).

- Server Components: layouts, shells, UI estática
- Telas com dados: `"use client"` ou wrappers finos
- **Não** introduzir Apollo RSC para dados do Server

## Regras

1. Preferir Server Components; `"use client"` só para interatividade/GraphQL
2. Reutilizar `src/features/**` quando fizer sentido
3. Manter saída `build/` para zip/md5 e o Server
4. Reader é crítico de performance
5. Features do roadmap (Fase 4): **primeiro APIs no Server**, depois UI aqui

## Comandos

```bash
pnpm dev       # http://localhost:3000
pnpm build     # → build/
pnpm preview
```

Porta **3000** colide com Grafana do Server — não subir os dois juntos.

## Fase 4

- [x] Corte A: ocultar Histórico/Updates (filtros + toggles na manga screen)
- Cortes B/C: aguardam API no Server

## Para o agent

- Rotas/Next: skill `nextjs-migration`
- Features de produto: confirme contrato GraphQL no Server + `CONTEXT.md`
