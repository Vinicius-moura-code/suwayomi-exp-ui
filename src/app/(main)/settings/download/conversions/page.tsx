/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

'use client';

import { Authenticated } from '@/lib/providers/AppShells.tsx';
import { Navigate } from '@/lib/router';
import { AppRoutes } from '@/base/AppRoute.constants.ts';

export default function Page() {
    return (
        <Authenticated>
            <Navigate to={AppRoutes.settings.children.images.children.processingDownloads.path} replace />
        </Authenticated>
    );
}
