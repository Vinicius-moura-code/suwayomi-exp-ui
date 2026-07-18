import fs from 'fs';
import path from 'path';

const copyright = `/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
`;

const pageLoader = `${copyright}
'use client';

import dynamic from 'next/dynamic';
import { SplashScreen } from '@/features/authentication/components/SplashScreen.tsx';

export default dynamic(() => import('./RealPage'), {
    ssr: false,
    loading: () => <SplashScreen />,
});
`;

function writeAuth(dir, importPath, exportName) {
    const dirPath = path.join('src/app/(main)', dir);
    fs.mkdirSync(dirPath, { recursive: true });
    fs.writeFileSync(
        path.join(dirPath, 'RealPage.tsx'),
        `${copyright}
'use client';

import { Authenticated } from '@/lib/providers/AppShells.tsx';
import { ${exportName} } from '${importPath}';

export default function RealPage() {
    return (
        <Authenticated>
            <${exportName} />
        </Authenticated>
    );
}
`,
    );
    fs.writeFileSync(path.join(dirPath, 'page.tsx'), pageLoader);
}

const pages = [
    ['library', '@/features/library/screens/Library.tsx', 'Library'],
    ['browse', '@/features/browse/screens/Browse.tsx', 'Browse'],
    ['updates', '@/features/updates/screens/Updates.tsx', 'Updates'],
    ['history', '@/features/history/screens/History.tsx', 'History'],
    ['downloads', '@/features/downloads/screens/DownloadQueue.tsx', 'DownloadQueue'],
    ['more', '@/features/settings/screens/More.tsx', 'More'],
    ['about', '@/features/settings/screens/About.tsx', 'About'],
    ['settings', '@/features/settings/screens/Settings.tsx', 'Settings'],
    ['settings/categories', '@/features/category/screens/CategorySettings.tsx', 'CategorySettings'],
    ['settings/reader', '@/features/reader/settings/screens/GlobalReaderSettings.tsx', 'GlobalReaderSettings'],
    ['settings/library', '@/features/library/screens/LibrarySettings.tsx', 'LibrarySettings'],
    ['settings/library/duplicates', '@/features/library/screens/LibraryDuplicates.tsx', 'LibraryDuplicates'],
    ['settings/download', '@/features/downloads/screens/DownloadSettings.tsx', 'DownloadSettings'],
    ['settings/images', '@/features/settings/screens/ImagesSettings.tsx', 'ImagesSettings'],
    ['settings/backup', '@/features/backup/screens/Backup.tsx', 'Backup'],
    ['settings/server', '@/features/settings/screens/ServerSettings.tsx', 'ServerSettings'],
    ['settings/webui', '@/features/settings/screens/WebUISettings.tsx', 'WebUISettings'],
    ['settings/browse', '@/features/browse/screens/BrowseSettings.tsx', 'BrowseSettings'],
    ['settings/browse/extension-stores', '@/features/extension/store/screens/ExtensionStores.tsx', 'ExtensionStores'],
    ['settings/history', '@/features/history/screens/HistorySettings.tsx', 'HistorySettings'],
    ['settings/device', '@/features/device/screens/DeviceSetting.tsx', 'DeviceSetting'],
    ['settings/tracking', '@/features/tracker/screens/TrackingSettings.tsx', 'TrackingSettings'],
    ['settings/appearance', '@/features/settings/screens/Appearance.tsx', 'Appearance'],
    ['migrate', '@/features/migration/screens/Migration.tsx', 'Migration'],
    ['tracker/login/oauth', '@/features/tracker/screens/TrackerOAuthLogin.tsx', 'TrackerOAuthLogin'],
    ['sources/all/search', '@/features/global-search/screens/SearchAll.tsx', 'SearchAll'],
];

for (const page of pages) {
    writeAuth(...page);
}

fs.mkdirSync('src/app/(main)/auth/login', { recursive: true });
fs.writeFileSync(
    'src/app/(main)/auth/login/RealPage.tsx',
    `${copyright}
'use client';

import { LoginPage } from '@/features/authentication/screens/LoginPage.tsx';

export default function RealPage() {
    return <LoginPage />;
}
`,
);
fs.writeFileSync('src/app/(main)/auth/login/page.tsx', pageLoader);

for (const [dir, type] of [
    ['settings/images/processing/downloads', 'DOWNLOAD'],
    ['settings/images/processing/serve', 'SERVE'],
]) {
    const dirPath = path.join('src/app/(main)', dir);
    fs.mkdirSync(dirPath, { recursive: true });
    fs.writeFileSync(
        path.join(dirPath, 'RealPage.tsx'),
        `${copyright}
'use client';

import { Authenticated } from '@/lib/providers/AppShells.tsx';
import { ImageProcessingSetting } from '@/features/settings/screens/ImageProcessingSetting.tsx';
import { ImageProcessingType } from '@/features/settings/Settings.types.ts';

export default function RealPage() {
    return (
        <Authenticated>
            <ImageProcessingSetting type={ImageProcessingType.${type}} />
        </Authenticated>
    );
}
`,
    );
    fs.writeFileSync(path.join(dirPath, 'page.tsx'), pageLoader);
}

function writeDynamic(dir, importPath, exportName, staticParams) {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
        path.join(dir, 'RealPage.tsx'),
        `${copyright}
'use client';

import { Authenticated } from '@/lib/providers/AppShells.tsx';
import { ${exportName} } from '${importPath}';

export default function RealPage() {
    return (
        <Authenticated>
            <${exportName} />
        </Authenticated>
    );
}
`,
    );
    fs.writeFileSync(
        path.join(dir, 'page.tsx'),
        `${copyright}
'use client';

import dynamic from 'next/dynamic';
import { SplashScreen } from '@/features/authentication/components/SplashScreen.tsx';

export function generateStaticParams() {
    return ${staticParams};
}

export default dynamic(() => import('./RealPage'), {
    ssr: false,
    loading: () => <SplashScreen />,
});
`,
    );
    try {
        fs.unlinkSync(path.join(dir, 'ClientPage.tsx'));
    } catch {
        // ignore
    }
}

writeDynamic('src/app/(main)/manga/[mangaId]', '@/features/manga/screens/Manga.tsx', 'Manga', "[{ mangaId: '_' }]");
writeDynamic(
    'src/app/(main)/sources/[sourceId]',
    '@/features/source/browse/screens/SourceMangas.tsx',
    'SourceMangas',
    "[{ sourceId: '_' }]",
);
writeDynamic(
    'src/app/(main)/sources/[sourceId]/configure',
    '@/features/source/configuration/screens/SourceConfigure.tsx',
    'SourceConfigure',
    "[{ sourceId: '_' }]",
);
writeDynamic(
    'src/app/(main)/extension/[pkgName]',
    '@/features/extension/info/screens/ExtensionInfo.tsx',
    'ExtensionInfo',
    "[{ pkgName: '_' }]",
);
writeDynamic(
    'src/app/(main)/migrate/manual-search/[mangaId]',
    '@/features/migration/screens/MigrationManualSearch.tsx',
    'MigrationManualSearch',
    "[{ mangaId: '_' }]",
);
writeDynamic(
    'src/app/(main)/migrate/source/[sourceId]/manga/[mangaId]/search',
    '@/features/global-search/screens/SearchAll.tsx',
    'SearchAll',
    "[{ sourceId: '_', mangaId: '_' }]",
);

const readerDir = 'src/app/(reader)/manga/[mangaId]/chapter/[chapterSourceOrder]';
fs.writeFileSync(
    path.join(readerDir, 'RealPage.tsx'),
    `${copyright}
'use client';

import { Reader } from '@/features/reader/screens/Reader.tsx';

export default function RealPage() {
    return <Reader />;
}
`,
);
fs.writeFileSync(
    path.join(readerDir, 'page.tsx'),
    `${copyright}
'use client';

import dynamic from 'next/dynamic';
import { SplashScreen } from '@/features/authentication/components/SplashScreen.tsx';

export function generateStaticParams() {
    return [{ mangaId: '_', chapterSourceOrder: '_' }];
}

export default dynamic(() => import('./RealPage'), {
    ssr: false,
    loading: () => <SplashScreen />,
});
`,
);
try {
    fs.unlinkSync(path.join(readerDir, 'ClientPage.tsx'));
} catch {
    // ignore
}

fs.writeFileSync(
    'src/app/(main)/RealHomePage.tsx',
    `${copyright}
'use client';

import { Authenticated } from '@/lib/providers/AppShells.tsx';
import { Navigate } from '@/lib/router';
import { AppRoutes } from '@/base/AppRoute.constants.ts';

export default function RealHomePage() {
    return (
        <Authenticated>
            <Navigate to={AppRoutes.library.path()} replace />
        </Authenticated>
    );
}
`,
);
fs.writeFileSync(
    'src/app/(main)/page.tsx',
    `${copyright}
'use client';

import dynamic from 'next/dynamic';
import { SplashScreen } from '@/features/authentication/components/SplashScreen.tsx';

export default dynamic(() => import('./RealHomePage'), {
    ssr: false,
    loading: () => <SplashScreen />,
});
`,
);

console.log('pages regenerated');
