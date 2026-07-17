# AGENTS.md - Suwayomi-WebUI (Migração para Next.js)

## Objetivo
Migrar completamente o Suwayomi-WebUI de **Vite + React 19** para **Next.js 15 (App Router)**, seguindo as **melhores práticas de performance** do Next.js.

### Stack Atual
- React 19 + TypeScript
- Vite
- React Router DOM
- MUI 9 + Emotion
- Apollo Client + GraphQL
- Lingui.js (internacionalização)
- Zustand + Immer
- React Virtuoso, @dnd-kit, etc.
- PWA (VitePWA + Workbox)

### Stack Alvo
- **Next.js 15** (App Router + Turbopack)
- React 19
- TypeScript (strict mode)
- MUI 9 + Emotion (bem configurado)
- Apollo Client
- Melhores práticas de performance do Next.js

---

## Regras e Melhores Práticas (obrigatórias)

### 1. Performance (Next.js Best Practices)
- Usar **Server Components** por padrão
- Marcar como `"use client"` apenas componentes interativos
- Utilizar **React Server Components** onde possível (especialmente em páginas de listagem)
- Implementar **Streaming** e **Suspense** boundaries
- Usar `next/image` para todas as imagens (quando viável)
- Otimizar bundle splitting automaticamente (Next.js faz isso bem)
- Manter o Reader o mais leve e performático possível

### 2. Estrutura de Pastas Recomendada
```bash
src/
├── app/                    # App Router
│   ├── (main)/             # Route Group (sem afetar URL)
│   │   ├── layout.tsx
│   │   ├── page.tsx        # Library/Home
│   │   ├── manga/
│   │   └── reader/
│   ├── globals.css
│   ├── layout.tsx          # Root layout
│   └── loading.tsx
├── components/             # Componentes reutilizáveis
├── features/               # Feature-based (opcional mas recomendado)
├── lib/
│   ├── apollo/
│   ├── theme/
│   └── utils/
├── hooks/
├── graphql/                # Codegen
└── styles/
```

### 3. Configurações Importantes

- **next.config.mjs** → `output: 'export'` (para manter compatibilidade com Suwayomi-Server)
- Configurar Emotion corretamente com Theme Registry
- Manter alias `@/*`
- Configurar `transpilePackages` se necessário

### 4. Pontos Críticos

- O **Reader** é a parte mais sensível para performance → deve continuar extremamente otimizado
- Manter PWA funcional
- Preservar integração GraphQL com o Suwayomi-Server
- Manter os scripts de build (`build-zip`, `build-md5`, etc.)

---

## Prioridade da Migração

1. Configuração inicial (`next.config`, Emotion, Theme, Apollo)
2. Root Layout + Global Styles
3. Migração de rotas (App Router)
4. Componentes principais (Library, Manga, Reader)
5. PWA + Internacionalização (Lingui)
6. Build e scripts de produção

---

## Comandos

```bash
pnpm dev          # Desenvolvimento (Next.js)
pnpm build        # Build para produção (deve gerar pasta build/)
pnpm preview      # Preview do build
```

---

## Instruções para o Agente (Cursor)

- Sempre priorize **performance** e **Server Components**
- Use **Suspense** e **loading states** adequados
- Evite Client Components desnecessários
- Mantenha a compatibilidade com o Suwayomi-Server (build estático)
- Quando migrar um componente, avalie se ele pode ser Server Component
- Mantenha o mesmo comportamento visual e funcionalidade atual

**Este arquivo é a fonte de verdade para toda a migração.**
