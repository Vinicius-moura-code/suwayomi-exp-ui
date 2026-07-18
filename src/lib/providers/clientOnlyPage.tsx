/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, type ComponentType, type ReactNode } from 'react';
import { MinimalLoading } from '@/lib/providers/MinimalLoading.tsx';
import { Authenticated } from '@/lib/providers/AppShells.tsx';

/**
 * Delay rendering until the browser mounts. Next still prerenders Client Components
 * during `output: 'export'`, and much of the SPA assumes a browser runtime.
 */
export const BrowserOnly = ({ children }: { children: ReactNode }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <MinimalLoading />;
    }

    return children;
};

/**
 * Load a screen only in the browser. Required because much of the existing SPA
 * touches `window` at module scope (Apollo client, storage, etc.).
 */
export function clientOnlyPage<P extends object>(
    loader: () => Promise<{ default: ComponentType<P> } | ComponentType<P> | Record<string, ComponentType<P>>>,
    exportName?: string,
) {
    return dynamic(
        async () => {
            const mod = await loader();
            if (typeof mod === 'function') {
                return mod;
            }
            if ('default' in mod && typeof mod.default === 'function') {
                return mod.default;
            }
            if (exportName && exportName in mod) {
                return (mod as Record<string, ComponentType<P>>)[exportName];
            }
            throw new Error(`clientOnlyPage: could not resolve component${exportName ? ` "${exportName}"` : ''}`);
        },
        {
            ssr: false,
            loading: () => <MinimalLoading />,
        },
    );
}

export function createAuthenticatedPage(
    loader: () => Promise<Record<string, ComponentType>>,
    exportName: string,
) {
    const Screen = clientOnlyPage(loader, exportName);

    return function Page() {
        return (
            <BrowserOnly>
                <Authenticated>
                    <Screen />
                </Authenticated>
            </BrowserOnly>
        );
    };
}
