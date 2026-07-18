# ExpUI

Open-source web client for **[Suwayomi Exp Server](https://github.com/Vinicius-moura-code/suwayomi-exp-server)** — a personal hard fork of [Suwayomi-WebUI](https://github.com/Suwayomi/Suwayomi-WebUI), rewritten on **Next.js** (App Router, static export) with a focus on performance and independent evolution.

Default server flavor name: **`ExpUI`**. Not affiliated with the upstream Suwayomi project.

## Credits

This project is based on work by many people. Thank you.

| Project                                                        | Role                                                          |
| -------------------------------------------------------------- | ------------------------------------------------------------- |
| [Suwayomi-WebUI](https://github.com/Suwayomi/Suwayomi-WebUI)   | Upstream client this fork started from                        |
| [Suwayomi-Server](https://github.com/Suwayomi/Suwayomi-Server) | Server / GraphQL API the original WebUI targeted              |
| Contributors to the Suwayomi project                           | Features, UX, and translations that still shape this codebase |

## Features

Core reader and library experience from Suwayomi-WebUI (library, sources, reader modes, downloads, themes, …), with Exp-oriented direction:

- Next.js 15 static export (embeddable in the server `webUI/` directory)
- Performance-first client work
- First-class pairing with Suwayomi Exp Server (e.g. History / Updates visibility)

## Related

| Repo                                                                              | What                            |
| --------------------------------------------------------------------------------- | ------------------------------- |
| [suwayomi-exp-server](https://github.com/Vinicius-moura-code/suwayomi-exp-server) | Exp Server — pairs with this UI |
| [Suwayomi-WebUI](https://github.com/Suwayomi/Suwayomi-WebUI)                      | Upstream (reference)            |

## Development

Requirements: **Node.js 24+**, [pnpm](https://pnpm.io/). A running Exp Server (default http://localhost:4567) for GraphQL.

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build        # static export → build/
```

Embed into the server data directory (Windows / Git Bash):

```bash
# from suwayomi-exp-server
scripts/dev/install-ui.sh
# or: scripts/dev/install-ui.bat
```

Then open http://localhost:4567 with server flavor `ExpUI`.

## License

```
Copyright (C) Contributors to the Suwayomi project
Copyright (C) Contributors to Suwayomi Exp

This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at http://mozilla.org/MPL/2.0/.
```

Full text: [`LICENSE`](./LICENSE).

## Disclaimer

This software is not affiliated with any content providers or with the upstream Suwayomi organization. You are responsible for how you use it and for complying with applicable laws.
