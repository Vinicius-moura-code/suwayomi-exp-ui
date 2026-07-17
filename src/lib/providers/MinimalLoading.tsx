/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Lightweight loading placeholder for static export prerender / dynamic(ssr:false).
 * Avoids browser-only hooks (theme, Apollo, storage) that crash during SSG.
 */
export const MinimalLoading = () => (
    <div
        style={{
            minWidth: '100vw',
            minHeight: '100vh',
            backgroundColor: '#121212',
        }}
    />
);
