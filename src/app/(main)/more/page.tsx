/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

'use client';

import dynamic from 'next/dynamic';
import { MinimalLoading } from '@/lib/providers/MinimalLoading.tsx';

export default dynamic(() => import('./RealPage'), {
    ssr: false,
    loading: () => <MinimalLoading />,
});
