/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Typography from '@mui/material/Typography';
import { useLingui } from '@lingui/react/macro';
import { plural } from '@lingui/core/macro';
import { DashboardWidget } from '@/features/dashboard/components/DashboardWidget.tsx';
import { SourceHealthTrend } from '@/features/source-health/components/SourceHealthTrend.tsx';
import { SourceHealthUtil, useSourcesHealthTrend } from '@/features/source-health/services/SourceHealth.ts';

/**
 * How many requests were made to the sources per day, and how many of them failed.
 */
export const SourceActivityWidget = ({ windowDays }: { windowDays: number }) => {
    const { t } = useLingui();
    const { trend } = useSourcesHealthTrend(windowDays);

    const attempts = trend.reduce((sum, day) => sum + day.attempts, 0);
    const failures = trend.reduce((sum, day) => sum + day.failures, 0);
    const failureRate = SourceHealthUtil.formatRate(attempts ? 1 - failures / attempts : null);

    return (
        <DashboardWidget title={t`Requests per day`} subtitle={t`Green: worked, red: failed`}>
            <SourceHealthTrend trend={trend} windowDays={windowDays} />
            <Typography variant="body2" color="text.secondary">
                {attempts
                    ? `${plural(attempts, { one: '# request', other: '# requests' })} · ${t`${failureRate} worked`}`
                    : t`Nothing was requested from the sources in this period`}
            </Typography>
        </DashboardWidget>
    );
};
