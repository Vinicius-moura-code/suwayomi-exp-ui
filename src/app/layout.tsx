/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import '@/lib/runtimeSetup.ts';
import { AppProviders } from '@/lib/providers/AppProviders.tsx';
import { ClientBootstrap } from '@/lib/providers/ClientBootstrap.tsx';
import './globals.css';

export const metadata: Metadata = {
    title: 'Suwayomi',
    description: "A manga reader that runs tachiyomi's extensions",
    appleWebApp: {
        title: 'Suwayomi',
        statusBarStyle: 'black-translucent',
        capable: true,
    },
    icons: {
        icon: [
            { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
            { url: '/favicon.svg', type: 'image/svg+xml' },
            { url: '/favicon.ico' },
        ],
        apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
    },
    manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    minimumScale: 1,
    viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <base href="/" />
            </head>
            <body>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
(() => {
  const storageValue = window.localStorage.getItem('theme_background');
  let backgroundColor;
  try { backgroundColor = JSON.parse(storageValue); } catch (e) { backgroundColor = storageValue; }
  if (backgroundColor) {
    document.documentElement.style.backgroundColor = backgroundColor;
    let themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (!themeColorMeta) {
      themeColorMeta = document.createElement('meta');
      themeColorMeta.setAttribute('name', 'theme-color');
      document.head.appendChild(themeColorMeta);
    }
    if (themeColorMeta.getAttribute('content') !== backgroundColor) {
      themeColorMeta.setAttribute('content', backgroundColor);
    }
  }
})();
                        `,
                    }}
                />
                <ClientBootstrap>
                    <AppProviders>{children}</AppProviders>
                </ClientBootstrap>
            </body>
        </html>
    );
}
