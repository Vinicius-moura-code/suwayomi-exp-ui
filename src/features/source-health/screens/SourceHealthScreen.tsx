/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useMemo, useState } from 'react';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import { useLingui } from '@lingui/react/macro';
import { useAppTitle } from '@/features/navigation-bar/hooks/useAppTitle.ts';
import { useLocalStorage } from '@/base/hooks/useStorage.tsx';
import { LoadingPlaceholder } from '@/base/components/feedback/LoadingPlaceholder.tsx';
import { EmptyViewAbsoluteCentered } from '@/base/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { SourceHealthCard } from '@/features/source-health/components/SourceHealthCard.tsx';
import { SourceHealthDetailDialog } from '@/features/source-health/components/SourceHealthDetailDialog.tsx';
import { SourceHealthSummary } from '@/features/source-health/components/SourceHealthSummary.tsx';
import { SourceHealthWindowToggle } from '@/features/source-health/components/SourceHealthWindowToggle.tsx';
import { SourceHealthUtil, useSourcesHealth } from '@/features/source-health/services/SourceHealth.ts';
import { DEFAULT_SOURCE_HEALTH_WINDOW_IN_DAYS, SourceHealthSort } from '@/features/source-health/SourceHealth.types.ts';

export function SourceHealthScreen() {
    const { t } = useLingui();
    useAppTitle(t`Source ranking`);

    const [windowDays, setWindowDays] = useLocalStorage<number>(
        'sourceHealthWindowDays',
        DEFAULT_SOURCE_HEALTH_WINDOW_IN_DAYS,
    );
    const [sortBy, setSortBy] = useLocalStorage<SourceHealthSort>('sourceHealthSort', SourceHealthSort.RELIABILITY);
    const [hideWithoutData, setHideWithoutData] = useLocalStorage<boolean>('sourceHealthHideWithoutData', false);

    const { sources, loading, error, refetch } = useSourcesHealth(windowDays);
    const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);

    const visibleSources = useMemo(
        () => SourceHealthUtil.sort(hideWithoutData ? sources.filter(SourceHealthUtil.hasEnoughData) : sources, sortBy),
        [sources, sortBy, hideWithoutData],
    );
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
                retry={() => refetch().catch(defaultPromiseErrorHandler('SourceHealthScreen::refetch'))}
            />
        );
    }

    return (
        <Stack sx={{ p: 2, gap: 2 }}>
            <SourceHealthSummary sources={sources} windowDays={windowDays} />

            <Stack sx={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <SourceHealthWindowToggle windowDays={windowDays} onChange={setWindowDays} />
                <Select size="small" value={sortBy} onChange={(e) => setSortBy(e.target.value as SourceHealthSort)}>
                    <MenuItem value={SourceHealthSort.RELIABILITY}>{t`Sort by reliability`}</MenuItem>
                    <MenuItem value={SourceHealthSort.SPEED}>{t`Sort by speed`}</MenuItem>
                    <MenuItem value={SourceHealthSort.USAGE}>{t`Sort by usage`}</MenuItem>
                    <MenuItem value={SourceHealthSort.RATING}>{t`Sort by your rating`}</MenuItem>
                    <MenuItem value={SourceHealthSort.NAME}>{t`Sort by name`}</MenuItem>
                </Select>
                <FormControlLabel
                    control={
                        <Switch checked={hideWithoutData} onChange={(e) => setHideWithoutData(e.target.checked)} />
                    }
                    label={t`Hide sources without enough data`}
                />
            </Stack>

            {visibleSources.length ? (
                <Stack sx={{ gap: 1 }}>
                    {visibleSources.map((source) => (
                        <SourceHealthCard
                            key={source.sourceId}
                            health={source}
                            onClick={() => setSelectedSourceId(source.sourceId)}
                        />
                    ))}
                </Stack>
            ) : (
                <EmptyViewAbsoluteCentered
                    message={t`No source to show yet`}
                    messageExtra={t`Sources show up here once you browse or read from them. Nothing is measured for sources you don't use.`}
                />
            )}

            {selectedSource && (
                <SourceHealthDetailDialog source={selectedSource} onClose={() => setSelectedSourceId(null)} />
            )}
        </Stack>
    );
}
