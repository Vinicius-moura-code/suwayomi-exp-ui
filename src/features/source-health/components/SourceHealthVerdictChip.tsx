/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Chip from '@mui/material/Chip';
import type { ChipProps } from '@mui/material/Chip';
import { SourceHealthVerdict } from '@/lib/graphql/generated/graphql-base.types.ts';
import { useSourceHealthLabels } from '@/features/source-health/services/SourceHealth.ts';

const VERDICT_COLOR: Record<SourceHealthVerdict, ChipProps['color']> = {
    [SourceHealthVerdict.Good]: 'success',
    [SourceHealthVerdict.Fair]: 'warning',
    [SourceHealthVerdict.Poor]: 'error',
    [SourceHealthVerdict.InsufficientData]: 'default',
};

export const SourceHealthVerdictChip = ({
    verdict,
    size = 'small',
    ...chipProps
}: { verdict: SourceHealthVerdict } & Omit<ChipProps, 'label' | 'color'>) => {
    const { verdictLabel } = useSourceHealthLabels();

    return (
        <Chip
            size={size}
            color={VERDICT_COLOR[verdict]}
            variant={verdict === SourceHealthVerdict.InsufficientData ? 'outlined' : 'filled'}
            label={verdictLabel(verdict)}
            {...chipProps}
        />
    );
};
