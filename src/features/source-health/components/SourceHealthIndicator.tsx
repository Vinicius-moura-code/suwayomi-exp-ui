/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Stack from '@mui/material/Stack';
import Rating from '@mui/material/Rating';
import { useLingui } from '@lingui/react/macro';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { SourceHealthVerdictChip } from '@/features/source-health/components/SourceHealthVerdictChip.tsx';
import { SourceHealthUtil, useSourcesHealth } from '@/features/source-health/services/SourceHealth.ts';
import type { SourceHealthInfo } from '@/features/source-health/SourceHealth.types.ts';
import { DEFAULT_SOURCE_HEALTH_WINDOW_IN_DAYS } from '@/features/source-health/SourceHealth.types.ts';

/**
 * Shows how a source performed for the user (and what they rated it), next to the name of the source.
 * Nothing is shown for sources that weren't used yet.
 */
export const SourceHealthIndicatorContent = ({ health }: { health: SourceHealthInfo }) => {
    const { t } = useLingui();

    const { windowDays } = health;
    const rate = SourceHealthUtil.formatRate(health.deliveryRate);
    const load = SourceHealthUtil.formatDuration(health.typicalLoadMs);

    const tooltip = SourceHealthUtil.hasEnoughData(health)
        ? t`Delivers ${rate} of the time, typically in ${load} (last ${windowDays} days)`
        : t`Not enough usage in the last ${windowDays} days to judge this source`;

    return (
        <CustomTooltip title={tooltip}>
            <Stack sx={{ flexDirection: 'row', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                <SourceHealthVerdictChip verdict={health.verdict} />
                {!!health.rating && <Rating size="small" value={health.rating} max={5} readOnly />}
            </Stack>
        </CustomTooltip>
    );
};

export const SourceHealthIndicator = ({ sourceId }: { sourceId: string }) => {
    // one request is shared by all the indicators, so don't refetch for each of them
    const { sourcesById } = useSourcesHealth(DEFAULT_SOURCE_HEALTH_WINDOW_IN_DAYS, 'cache-first');

    const health = sourcesById.get(sourceId);
    if (!health) {
        return null;
    }

    return <SourceHealthIndicatorContent health={health} />;
};
