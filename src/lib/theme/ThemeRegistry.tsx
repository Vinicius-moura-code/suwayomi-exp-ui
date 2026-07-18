/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

'use client';

import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import type { ReactNode } from 'react';

type Props = {
    children: ReactNode;
};

export const ThemeRegistry = ({ children }: Props) => (
    <AppRouterCacheProvider options={{ key: 'mui', enableCssLayer: false }}>{children}</AppRouterCacheProvider>
);
