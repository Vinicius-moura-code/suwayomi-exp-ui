/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useLingui } from '@lingui/react/macro';
import { DashboardWidget } from '@/features/dashboard/components/DashboardWidget.tsx';
import { SourceHealthCard } from '@/features/source-health/components/SourceHealthCard.tsx';
import { SourceHealthVerdict } from '@/lib/graphql/generated/graphql-base.types.ts';
import { SourceHealthUtil } from '@/features/source-health/services/SourceHealth.ts';
import { SourceHealthSort } from '@/features/source-health/SourceHealth.types.ts';
import type { SourceHealthInfo } from '@/features/source-health/SourceHealth.types.ts';

/**
 * The sources that are failing to deliver what they promise (worst first).
 */
export const SourcesNeedingAttentionWidget = ({
    sources,
    onSelect,
}: {
    sources: SourceHealthInfo[];
    onSelect: (sourceId: string) => void;
}) => {
    const { t } = useLingui();

    const poorSources = SourceHealthUtil.sort(
        sources.filter((source) => source.verdict === SourceHealthVerdict.Poor),
        SourceHealthSort.RELIABILITY,
    ).reverse();
    const hasJudgedSources = sources.some(SourceHealthUtil.hasEnoughData);

    return (
        <DashboardWidget title={t`Needs attention`} subtitle={t`Sources that fail to deliver or are too slow`}>
            {poorSources.length ? (
                <Stack sx={{ gap: 1 }}>
                    {poorSources.map((source) => (
                        <SourceHealthCard
                            key={source.sourceId}
                            health={source}
                            onClick={() => onSelect(source.sourceId)}
                        />
                    ))}
                </Stack>
            ) : (
                <Typography variant="body2" color="text.secondary">
                    {hasJudgedSources
                        ? t`All the sources you use are doing fine`
                        : t`Not enough usage yet to judge the sources`}
                </Typography>
            )}
        </DashboardWidget>
    );
};
