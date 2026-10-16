/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import Rating from '@mui/material/Rating';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useLingui } from '@lingui/react/macro';
import { plural } from '@lingui/core/macro';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { ListCardAvatar } from '@/base/components/lists/cards/ListCardAvatar.tsx';
import { ListCardContent } from '@/base/components/lists/cards/ListCardContent.tsx';
import { languageCodeToName } from '@/base/utils/Languages.ts';
import { SourceHealthVerdictChip } from '@/features/source-health/components/SourceHealthVerdictChip.tsx';
import { SourceHealthUtil, useSourceHealthLabels } from '@/features/source-health/services/SourceHealth.ts';
import type { SourceHealthInfo } from '@/features/source-health/SourceHealth.types.ts';

const Metric = ({ label, value }: { label: string; value: string }) => (
    <Stack sx={{ minWidth: 64 }}>
        <Typography variant="caption" color="text.secondary">
            {label}
        </Typography>
        <Typography variant="body2">{value}</Typography>
    </Stack>
);

export const SourceHealthCard = ({ health, onClick }: { health: SourceHealthInfo; onClick?: () => void }) => {
    const { t } = useLingui();
    const { stageLabel } = useSourceHealthLabels();

    const { name, lang, iconUrl, verdict, deliveryRate, typicalLoadMs, weakestStage, rating, usage } = health;
    const hasData = SourceHealthUtil.hasEnoughData(health);
    const weakestStageLabel = weakestStage ? stageLabel(weakestStage) : '';

    return (
        <Card>
            <CardActionArea onClick={onClick} disabled={!onClick}>
                <ListCardContent sx={{ alignItems: 'center' }}>
                    <ListCardAvatar
                        iconUrl={requestManager.getValidImgUrlFor(iconUrl ?? '')}
                        alt={name}
                        slots={{ spinnerImageProps: { ignoreQueue: true } }}
                    />
                    <Stack sx={{ flexGrow: 1, minWidth: 0, gap: 0.5 }}>
                        <Stack sx={{ flexDirection: 'row', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Typography variant="h6" component="h3" sx={{ wordBreak: 'break-word' }}>
                                {name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {languageCodeToName(lang)}
                            </Typography>
                        </Stack>
                        <Stack sx={{ flexDirection: 'row', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <SourceHealthVerdictChip verdict={verdict} />
                            {!!rating && <Rating size="small" value={rating} max={5} readOnly />}
                            {hasData && weakestStage && (
                                <Typography variant="caption" color="text.secondary">
                                    {t`Weakest step: ${weakestStageLabel}`}
                                </Typography>
                            )}
                        </Stack>
                        <Stack sx={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 3, rowGap: 0.5 }}>
                            <Metric label={t`Delivers`} value={SourceHealthUtil.formatRate(deliveryRate)} />
                            <Metric label={t`Typical load`} value={SourceHealthUtil.formatDuration(typicalLoadMs)} />
                            <Metric
                                label={t`Read`}
                                value={plural(usage.chaptersRead, {
                                    one: '# chapter',
                                    other: '# chapters',
                                })}
                            />
                        </Stack>
                    </Stack>
                </ListCardContent>
            </CardActionArea>
        </Card>
    );
};
