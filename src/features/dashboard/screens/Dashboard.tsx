/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { Link as RouterLink } from '@/lib/router';
import { useLingui } from '@lingui/react/macro';
import { useAppTitle } from '@/features/navigation-bar/hooks/useAppTitle.ts';
import { useLocalStorage } from '@/base/hooks/useStorage.tsx';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { LoadingPlaceholder } from '@/base/components/feedback/LoadingPlaceholder.tsx';
import { EmptyViewAbsoluteCentered } from '@/base/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { MostReadSourcesWidget } from '@/features/dashboard/components/MostReadSourcesWidget.tsx';
import { SourceActivityWidget } from '@/features/dashboard/components/SourceActivityWidget.tsx';
import { SourcesNeedingAttentionWidget } from '@/features/dashboard/components/SourcesNeedingAttentionWidget.tsx';
import { SourceHealthDetailDialog } from '@/features/source-health/components/SourceHealthDetailDialog.tsx';
import { SourceHealthSummary } from '@/features/source-health/components/SourceHealthSummary.tsx';
import { SourceHealthWindowToggle } from '@/features/source-health/components/SourceHealthWindowToggle.tsx';
import { useSourcesHealth } from '@/features/source-health/services/SourceHealth.ts';
import { DEFAULT_SOURCE_HEALTH_WINDOW_IN_DAYS } from '@/features/source-health/SourceHealth.types.ts';

/**
 * An overview of how the app is doing. Every block is an independent widget, so adding a new one
 * is just a matter of adding it to the grid below.
 */
export function Dashboard() {
    const { t } = useLingui();
    useAppTitle(t`Dashboard`);

    const [windowDays, setWindowDays] = useLocalStorage<number>(
        'dashboardWindowDays',
        DEFAULT_SOURCE_HEALTH_WINDOW_IN_DAYS,
    );

    const { sources, loading, error, refetch } = useSourcesHealth(windowDays);
    const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);

    // looked up by id, so the dialog shows the latest data after saving a rating
    const selectedSource = sources.find((source) => source.sourceId === selectedSourceId);

    if (loading && !sources.length) {
        return <LoadingPlaceholder />;
    }

    if (error && !sources.length) {
        return (
            <EmptyViewAbsoluteCentered
                message={t`Unable to load data`}
                messageExtra={getErrorMessage(error)}
                retry={() => refetch().catch(defaultPromiseErrorHandler('Dashboard::refetch'))}
            />
        );
    }

    return (
        <Stack sx={{ p: 2, gap: 2 }}>
            <Stack sx={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                <SourceHealthWindowToggle windowDays={windowDays} onChange={setWindowDays} />
                <Button component={RouterLink} to={AppRoutes.sourceHealth.path} size="small">
                    {t`Source ranking`}
                </Button>
            </Stack>

            <Box
                sx={{
                    display: 'grid',
                    gap: 2,
                    gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' },
                    alignItems: 'stretch',
                }}
            >
                <SourceHealthSummary sources={sources} windowDays={windowDays} sx={{ height: '100%' }} />
                <SourceActivityWidget windowDays={windowDays} />
                <SourcesNeedingAttentionWidget sources={sources} onSelect={setSelectedSourceId} />
                <MostReadSourcesWidget sources={sources} onSelect={setSelectedSourceId} />
            </Box>

            {selectedSource && (
                <SourceHealthDetailDialog source={selectedSource} onClose={() => setSelectedSourceId(null)} />
            )}
        </Stack>
    );
}
