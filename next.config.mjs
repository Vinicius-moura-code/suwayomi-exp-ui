/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import path from 'path';
import { fileURLToPath } from 'url';
import withPWAInit from '@ducanh2912/next-pwa';
import { d } from 'koration';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const withPWA = withPWAInit({
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
    register: true,
    workboxOptions: {
        skipWaiting: true,
        runtimeCaching: [
            {
                urlPattern: ({ url }) => pathnameMatches(url.pathname, /\/chapter\/[0-9]+\/page\/[0-9]+/g),
                handler: 'CacheFirst',
                options: {
                    // !!! IMPORTANT !!! - Update along with ImageCache.ts
                    cacheName: 'image-cache-chapter-pages',
                    expiration: {
                        purgeOnQuotaError: true,
                        maxAgeSeconds: d(1).days.inWholeSeconds,
                        maxEntries: 2500,
                        matchOptions: { ignoreVary: true },
                    },
                    cacheableResponse: { statuses: [0, 200] },
                    matchOptions: { ignoreVary: true },
                },
            },
            {
                urlPattern: ({ url }) => pathnameMatches(url.pathname, /\/manga\/[0-9]+\/thumbnail/g),
                handler: 'CacheFirst',
                options: {
                    // !!! IMPORTANT !!! - Update along with ImageCache.ts
                    cacheName: 'image-cache-manga-thumbnails',
                    expiration: {
                        purgeOnQuotaError: true,
                        maxAgeSeconds: d(1).days.inWholeSeconds,
                        maxEntries: 5000,
                        matchOptions: { ignoreVary: true },
                    },
                    cacheableResponse: { statuses: [0, 200] },
                    matchOptions: { ignoreVary: true },
                },
            },
            {
                urlPattern: ({ url }) => url.pathname.includes('/extension/icon/'),
                handler: 'CacheFirst',
                options: {
                    // !!! IMPORTANT !!! - Update along with ImageCache.ts
                    cacheName: 'image-cache-extension-icons',
                    expiration: {
                        purgeOnQuotaError: true,
                        maxAgeSeconds: d(365).days.inWholeSeconds,
                        maxEntries: 300,
                        matchOptions: { ignoreVary: true },
                    },
                    cacheableResponse: { statuses: [0, 200] },
                    matchOptions: { ignoreVary: true },
                },
            },
            {
                urlPattern: ({ request }) => request.destination === 'image',
                handler: 'CacheFirst',
                options: {
                    // !!! IMPORTANT !!! - Update along with ImageCache.ts
                    cacheName: 'image-cache-other',
                    expiration: {
                        purgeOnQuotaError: true,
                        maxAgeSeconds: d(4).days.inWholeSeconds,
                        maxEntries: 500,
                        matchOptions: { ignoreVary: true },
                    },
                    cacheableResponse: { statuses: [0, 200] },
                    matchOptions: { ignoreVary: true },
                },
            },
        ],
    },
});

function pathnameMatches(pathname, pattern) {
    return Boolean(pathname.match(pattern));
}

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Static export cannot serve unknown dynamic params (e.g. /manga/8) — only paths
    // returned by generateStaticParams. Keep export for production builds (Suwayomi zip);
    // omit it in `next dev` so client navigation to real IDs works.
    ...(process.env.NODE_ENV === 'production' ? { output: 'export' } : {}),
    distDir: 'build',
    trailingSlash: true,
    images: {
        unoptimized: true,
    },
    reactStrictMode: true,
    transpilePackages: ['@mui/material', '@mui/system', '@mui/icons-material', '@mui/x-date-pickers'],
    // Turbopack does not use webpack() rules — register Lingui .po loading here too.
    turbopack: {
        rules: {
            '*.po': {
                loaders: ['@lingui/loader'],
                as: '*.js',
            },
        },
    },
    webpack: (config, { isServer }) => {
        // Client Components are still SSR'd at build time. Omit the `react-server` export
        // condition so packages like @mantine/hooks can resolve `useEffectEvent` from React.
        if (isServer) {
            const conditions = config.resolve.conditionNames ?? ['...', 'import', 'require', 'default'];
            config.resolve.conditionNames = conditions.filter((name) => name !== 'react-server');
            config.resolve.alias = {
                ...config.resolve.alias,
                react$: path.join(__dirname, 'node_modules/react/index.js'),
            };
        }

        // colorthief pulls sharp (native); not needed in the browser bundle
        config.resolve.alias = {
            ...config.resolve.alias,
            sharp$: false,
        };

        // Transform Lingui macros in app source only (SWC plugin is broken on Windows + Next 15).
        // Exclude `src/app` so Babel does not strip Next.js `'use client'` directives.
        config.module.rules.push({
            test: /\.[jt]sx?$/,
            include: [path.join(__dirname, 'src')],
            exclude: [path.join(__dirname, 'src/app')],
            enforce: 'pre',
            use: {
                loader: 'babel-loader',
                options: {
                    babelrc: false,
                    configFile: false,
                    presets: [
                        ['@babel/preset-typescript', { isTSX: true, allExtensions: true }],
                        ['@babel/preset-react', { runtime: 'automatic' }],
                    ],
                    plugins: [
                        '@lingui/babel-plugin-lingui-macro',
                        // Keep Next/React Client Component boundary markers
                        function preserveUseClientDirective() {
                            return {
                                visitor: {
                                    Program(programPath) {
                                        const hasUseClient = programPath.node.directives?.some(
                                            (directive) => directive.value.value === 'use client',
                                        );
                                        if (hasUseClient) {
                                            programPath.node.directives = [
                                                {
                                                    type: 'Directive',
                                                    value: { type: 'DirectiveLiteral', value: 'use client' },
                                                },
                                                ...(programPath.node.directives ?? []).filter(
                                                    (directive) => directive.value.value !== 'use client',
                                                ),
                                            ];
                                        }
                                    },
                                },
                            };
                        },
                    ],
                },
            },
        });
        config.module.rules.push({
            test: /\.po$/,
            use: {
                loader: '@lingui/loader',
            },
        });
        return config;
    },
    env: {
        NEXT_PUBLIC_SUBPATH: process.env.NEXT_PUBLIC_SUBPATH || process.env.VITE_SUBPATH || '',
        NEXT_PUBLIC_SERVER_URL_DEFAULT:
            process.env.NEXT_PUBLIC_SERVER_URL_DEFAULT || process.env.VITE_SERVER_URL_DEFAULT || '',
    },
};

export default withPWA(nextConfig);
