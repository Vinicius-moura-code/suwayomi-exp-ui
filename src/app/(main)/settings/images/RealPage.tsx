/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

'use client';

import { Authenticated } from '@/lib/providers/AppShells.tsx';
import { ImagesSettings } from '@/features/settings/screens/ImagesSettings.tsx';

export default function RealPage() {
    return (
        <Authenticated>
            <ImagesSettings />
        </Authenticated>
    );
}
