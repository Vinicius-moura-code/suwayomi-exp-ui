/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

'use client';

import type { PropsWithChildren } from 'react';
import { MainShell } from '@/lib/providers/AppShells.tsx';
import { BrowserOnly } from '@/lib/providers/clientOnlyPage.tsx';

export default function MainLayout({ children }: PropsWithChildren) {
    return (
        <BrowserOnly>
            <MainShell>{children}</MainShell>
        </BrowserOnly>
    );
}
