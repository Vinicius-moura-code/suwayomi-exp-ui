/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { plural } from '@lingui/core/macro';
import { SOURCE_HEALTH_WINDOWS_IN_DAYS } from '@/features/source-health/SourceHealth.types.ts';

/**
 * Picks how many days of data the source health widgets / screens look at.
 */
export const SourceHealthWindowToggle = ({
    windowDays,
    onChange,
}: {
    windowDays: number;
    onChange: (windowDays: number) => void;
}) => (
    <ToggleButtonGroup
        size="small"
        exclusive
        value={windowDays}
        onChange={(_, value: number | null) => value && onChange(value)}
    >
        {SOURCE_HEALTH_WINDOWS_IN_DAYS.map((days) => (
            <ToggleButton key={days} value={days} sx={{ textTransform: 'none' }}>
                {plural(days, { one: '# day', other: '# days' })}
            </ToggleButton>
        ))}
    </ToggleButtonGroup>
);
