/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useLingui } from '@lingui/react/macro';
import { plural } from '@lingui/core/macro';
import { DashboardWidget } from '@/features/dashboard/components/DashboardWidget.tsx';
import { SourceHealthVerdictChip } from '@/features/source-health/components/SourceHealthVerdictChip.tsx';
import { SourceHealthUtil } from '@/features/source-health/services/SourceHealth.ts';
import { SourceHealthSort } from '@/features/source-health/SourceHealth.types.ts';
import type { SourceHealthInfo } from '@/features/source-health/SourceHealth.types.ts';

const MAX_SOURCES = 5;

/**
 * The sources chapters were read from the most, next to how reliable they are.
 */
export const MostReadSourcesWidget = ({
    sources,
    onSelect,
}: {
    sources: SourceHealthInfo[];
    onSelect: (sourceId: string) => void;
}) => {
    const { t } = useLingui();

    const mostRead = SourceHealthUtil.sort(
        sources.filter((source) => source.usage.chaptersRead > 0),
        SourceHealthSort.USAGE,
    ).slice(0, MAX_SOURCES);
    const maxChaptersRead = Math.max(1, ...mostRead.map((source) => source.usage.chaptersRead));

    return (
        <DashboardWidget title={t`Most read sources`} subtitle={t`By chapters read in this period`}>
            {mostRead.length ? (
                <Stack sx={{ gap: 1.5 }}>
                    {mostRead.map((source) => (
                        <ButtonBase
                            key={source.sourceId}
                            onClick={() => onSelect(source.sourceId)}
                            sx={{ display: 'block', textAlign: 'start', borderRadius: 1 }}
                        >
                            <Stack sx={{ gap: 0.5 }}>
                                <Stack
                                    sx={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: 1,
                                    }}
                                >
                                    <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                                        {source.name}
                                    </Typography>
                                    <Stack sx={{ flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            {plural(source.usage.chaptersRead, {
                                                one: '# chapter',
                                                other: '# chapters',
                                            })}
                                        </Typography>
                                        <SourceHealthVerdictChip verdict={source.verdict} />
                                    </Stack>
                                </Stack>
                                <Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={(source.usage.chaptersRead / maxChaptersRead) * 100}
                                    />
                                </Box>
                            </Stack>
                        </ButtonBase>
                    ))}
                </Stack>
            ) : (
                <Typography variant="body2" color="text.secondary">
                    {t`No chapter was read in this period`}
                </Typography>
            )}
        </DashboardWidget>
    );
};
