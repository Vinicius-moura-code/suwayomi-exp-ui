/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useLingui } from '@lingui/react/macro';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import type { SourceHealthTrendDay } from '@/features/source-health/SourceHealth.types.ts';

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const BAR_AREA_HEIGHT = 56;

/** ISO dates (UTC) of the last [windowDays] days, oldest first */
const getDays = (windowDays: number): string[] =>
    Array.from({ length: windowDays }, (_, index) =>
        new Date(Date.now() - (windowDays - 1 - index) * DAY_IN_MS).toISOString().slice(0, 10),
    );

/**
 * A bar per day: how many requests were made to a source and how many of them failed.
 */
export const SourceHealthTrend = ({ trend, windowDays }: { trend: SourceHealthTrendDay[]; windowDays: number }) => {
    const { t } = useLingui();

    const days = useMemo(() => getDays(windowDays), [windowDays]);
    const trendByDay = useMemo(() => new Map(trend.map((day) => [day.day, day])), [trend]);
    const maxAttempts = Math.max(1, ...trend.map((day) => day.attempts));

    return (
        <Stack sx={{ flexDirection: 'row', alignItems: 'flex-end', gap: '2px', height: BAR_AREA_HEIGHT }}>
            {days.map((day) => {
                const stats = trendByDay.get(day);
                const attempts = stats?.attempts ?? 0;
                const failures = stats?.failures ?? 0;
                const height = attempts ? Math.max(4, (attempts / maxAttempts) * BAR_AREA_HEIGHT) : 2;

                return (
                    <CustomTooltip key={day} title={t`${day}: ${attempts} requests, ${failures} failed`}>
                        <Box
                            sx={{
                                flex: 1,
                                minWidth: 2,
                                height,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'flex-end',
                                borderRadius: '2px',
                                overflow: 'hidden',
                                bgcolor: attempts ? 'success.main' : 'action.disabledBackground',
                            }}
                        >
                            {!!failures && (
                                <Box sx={{ height: `${(failures / attempts) * 100}%`, bgcolor: 'error.main' }} />
                            )}
                        </Box>
                    </CustomTooltip>
                );
            })}
        </Stack>
    );
};
