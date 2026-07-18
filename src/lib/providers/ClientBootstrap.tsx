/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import '@/base/AppSession.ts';
import '@/polyfill.manual';
import '@/lib/runtimeSetup.ts';
import { initializeLocalization } from '@/i18n';
import '@/lib/PointerDeviceUtil.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { MinimalLoading } from '@/lib/providers/MinimalLoading.tsx';

export const ClientBootstrap = ({ children }: { children: ReactNode }) => {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        initializeLocalization()
            .catch(defaultPromiseErrorHandler('i18n', true))
            .finally(() => setReady(true));
    }, []);

    if (!ready) {
        return <MinimalLoading />;
    }

    return children;
};
