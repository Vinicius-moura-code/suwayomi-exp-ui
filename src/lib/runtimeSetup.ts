/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Side-effect imports that must run before any module-level `d()` / dayjs usage.
 * Import this first in entry points and in files that call `d()` at module scope.
 */
import '@/lib/dayjs/Setup.ts';
import '@/lib/koration/Setup.ts';
