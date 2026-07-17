/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

'use client';

import Box from '@mui/material/Box';
import type { PropsWithChildren } from 'react';
import { DefaultNavBar } from '@/features/navigation-bar/components/DefaultNavBar.tsx';
import { ErrorBoundary } from '@/base/components/feedback/ErrorBoundary.tsx';
import { useNavBarContext } from '@/features/navigation-bar/NavbarContext.tsx';
import { RequireAuth } from '@/lib/providers/AppProviders.tsx';

export const MainShell = ({ children }: PropsWithChildren) => {
    const { navBarWidth, appBarHeight, bottomBarHeight } = useNavBarContext();

    return (
        <Box sx={{ display: 'flex' }}>
            <Box sx={{ flexShrink: 0, position: 'relative', height: '100vh' }}>
                <DefaultNavBar />
            </Box>
            <Box
                id="appMainContainer"
                component="main"
                sx={{
                    minHeight: `calc(100vh - ${appBarHeight + bottomBarHeight}px)`,
                    width: `calc(100vw - (100vw - 100%) - ${navBarWidth}px)`,
                    minWidth: `calc(100vw - (100vw - 100%) - ${navBarWidth}px)`,
                    maxWidth: `calc(100vw - (100vw - 100%) - ${navBarWidth}px)`,
                    position: 'relative',
                    mt: `${appBarHeight}px`,
                    pb: `calc(${bottomBarHeight}px + ${!bottomBarHeight ? 'env(safe-area-inset-bottom)' : '0px'})`,
                    pr: 'env(safe-area-inset-right)',
                }}
            >
                <ErrorBoundary>{children}</ErrorBoundary>
            </Box>
        </Box>
    );
};

export const ReaderShell = ({ children }: PropsWithChildren) => (
    <RequireAuth>
        <ErrorBoundary>{children}</ErrorBoundary>
    </RequireAuth>
);

export const Authenticated = ({ children }: PropsWithChildren) => <RequireAuth>{children}</RequireAuth>;
