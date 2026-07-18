# Building ExpUI

This project uses [Next.js](https://nextjs.org/) (App Router, static export).

## Scripts

### `pnpm dev`

Dev server at [http://localhost:3000](http://localhost:3000). Requires a running Exp Server (default `http://localhost:4567`).

### `pnpm build`

Static export to `build/` (for embedding in the server `webUI/` folder via `scripts/dev/install-ui`).

### `pnpm preview`

Serves the contents of `build/`.
