/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Card from '@mui/material/Card';
import type { CardProps } from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useLingui } from '@lingui/react/macro';
import { plural } from '@lingui/core/macro';
import { SourceHealthVerdict } from '@/lib/graphql/generated/graphql-base.types.ts';
import { SourceHealthVerdictChip } from '@/features/source-health/components/SourceHealthVerdictChip.tsx';
import { SourceHealthUtil } from '@/features/source-health/services/SourceHealth.ts';
import type { SourceHealthInfo } from '@/features/source-health/SourceHealth.types.ts';

/**
 * An overview of how the sources are doing.
 * It only depends on the list of sources, so it can be dropped into any screen (e.g. a dashboard).
 */
export const SourceHealthSummary = ({
    sources,
    windowDays,
    sx,
}: {
    sources: SourceHealthInfo[];
    windowDays: number;
    sx?: CardProps['sx'];
}) => {
    const { t } = useLingui();

    const summary = SourceHealthUtil.summarize(sources);
    const averageDelivery = SourceHealthUtil.formatRate(summary.deliveryRate);
    const worstSources = summary.worst.map((source) => source.name).join(', ');

    return (
        <Card sx={sx}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Typography variant="subtitle1" component="h2">
                    {t`Last ${windowDays} days`}
                </Typography>
                <Stack sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: 1 }}>
                    <Stack sx={{ flexDirection: 'row', alignItems: 'center', gap: 0.5 }}>
                        <SourceHealthVerdictChip verdict={SourceHealthVerdict.Good} />
                        <Typography variant="body2">{summary.good}</Typography>
                    </Stack>
                    <Stack sx={{ flexDirection: 'row', alignItems: 'center', gap: 0.5 }}>
                        <SourceHealthVerdictChip verdict={SourceHealthVerdict.Fair} />
                        <Typography variant="body2">{summary.fair}</Typography>
                    </Stack>
                    <Stack sx={{ flexDirection: 'row', alignItems: 'center', gap: 0.5 }}>
                        <SourceHealthVerdictChip verdict={SourceHealthVerdict.Poor} />
                        <Typography variant="body2">{summary.poor}</Typography>
                    </Stack>
                    <Stack sx={{ flexDirection: 'row', alignItems: 'center', gap: 0.5 }}>
                        <SourceHealthVerdictChip verdict={SourceHealthVerdict.InsufficientData} />
                        <Typography variant="body2">{summary.insufficientData}</Typography>
                    </Stack>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                    {plural(summary.attempts, {
                        one: '# request to the sources',
                        other: '# requests to the sources',
                    })}
                    {summary.deliveryRate != null && ` · ${t`${averageDelivery} delivered on average`}`}
                </Typography>
                {!!summary.worst.length && (
                    <Typography variant="body2" color="error">
                        {t`Needs attention: ${worstSources}`}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
};
