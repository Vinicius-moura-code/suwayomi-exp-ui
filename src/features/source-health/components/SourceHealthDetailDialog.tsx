/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Link from '@mui/material/Link';
import Rating from '@mui/material/Rating';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useLingui } from '@lingui/react/macro';
import { plural } from '@lingui/core/macro';
import { Link as RouterLink } from '@/lib/router';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { Confirmation } from '@/base/AppAwaitableComponent.ts';
import { makeToast } from '@/base/utils/Toast.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { STABLE_EMPTY_ARRAY } from '@/base/Base.constants.ts';
import { SourceHealthVerdictChip } from '@/features/source-health/components/SourceHealthVerdictChip.tsx';
import { SourceHealthTrend } from '@/features/source-health/components/SourceHealthTrend.tsx';
import { SourceHealthUtil, useSourceHealthLabels } from '@/features/source-health/services/SourceHealth.ts';
import type { SourceHealthInfo } from '@/features/source-health/SourceHealth.types.ts';

const MAX_FAILURES = 20;

const formatDateTime = (epochSeconds: number | string): string =>
    new Date(Number(epochSeconds) * 1000).toLocaleString();

export const SourceHealthDetailDialog = ({ source, onClose }: { source: SourceHealthInfo; onClose: () => void }) => {
    const { t } = useLingui();
    const { stageLabel, outcomeLabel } = useSourceHealthLabels();

    const { sourceId, name, windowDays, verdict, usage } = source;
    const lastRead = usage.lastReadAt ? formatDateTime(usage.lastReadAt) : null;

    const { data } = requestManager.useGetSourceHealthDetails(sourceId, windowDays, MAX_FAILURES);
    const trend = data?.sourceHealthTrend ?? STABLE_EMPTY_ARRAY;
    const failures = data?.sourceHealthFailures ?? STABLE_EMPTY_ARRAY;

    const [rating, setRating] = useState<number | null>(source.rating ?? null);
    const [note, setNote] = useState(source.ratingNote ?? '');
    const [isSaving, setIsSaving] = useState(false);
    const hasRatingChanges = rating !== (source.rating ?? null) || note !== (source.ratingNote ?? '');

    const saveRating = async (newRating: number | null) => {
        setIsSaving(true);
        try {
            await requestManager.setSourceRating(sourceId, newRating, newRating ? note : null).response;
            if (!newRating) {
                setRating(null);
                setNote('');
            }
        } catch (e) {
            makeToast(t`Could not save the rating`, 'error', getErrorMessage(e));
        } finally {
            setIsSaving(false);
        }
    };

    const resetHealth = async () => {
        try {
            await Confirmation.show({
                title: t`Are you sure?`,
                message: t`This forgets everything measured about "${name}" (your rating is kept). Use it when the source came back from an outage.`,
            });
        } catch {
            // dismissed
            return;
        }

        try {
            await requestManager.resetSourceHealth(sourceId).response;
        } catch (e) {
            makeToast(t`Could not reset the measurements`, 'error', getErrorMessage(e));
        }
    };

    return (
        <Dialog open onClose={onClose} fullWidth maxWidth="md" scroll="paper">
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                {name}
                <SourceHealthVerdictChip verdict={verdict} />
            </DialogTitle>
            <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Stack sx={{ gap: 1 }}>
                    <Typography variant="subtitle2" component="h3">
                        {t`Your rating`}
                    </Typography>
                    <Rating value={rating} max={5} onChange={(_, value) => setRating(value)} />
                    <TextField
                        size="small"
                        label={t`Note`}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        multiline
                        maxRows={3}
                        slotProps={{ htmlInput: { maxLength: 1000 } }}
                    />
                    <Stack sx={{ flexDirection: 'row', gap: 1 }}>
                        <Button
                            variant="contained"
                            size="small"
                            disabled={!rating || !hasRatingChanges || isSaving}
                            onClick={() => saveRating(rating)}
                        >
                            {t`Save rating`}
                        </Button>
                        <Button
                            size="small"
                            disabled={source.rating == null || isSaving}
                            onClick={() => saveRating(null)}
                        >
                            {t`Remove rating`}
                        </Button>
                    </Stack>
                </Stack>

                <Stack sx={{ gap: 1 }}>
                    <Typography variant="subtitle2" component="h3">
                        {t`Usage`}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {plural(usage.chaptersRead, { one: '# chapter read', other: '# chapters read' })}
                        {` · ${t`${usage.mangasRead} manga`}`}
                        {lastRead ? ` · ${t`last read ${lastRead}`}` : ''}
                    </Typography>
                    <SourceHealthTrend trend={trend} windowDays={windowDays} />
                </Stack>

                <Stack sx={{ gap: 1 }}>
                    <Typography variant="subtitle2" component="h3">
                        {t`Did it deliver?`}
                    </Typography>
                    {source.stages.length ? (
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>{t`Step`}</TableCell>
                                    <TableCell align="right">{t`Requests`}</TableCell>
                                    <TableCell align="right">{t`Delivered`}</TableCell>
                                    <TableCell align="right">{t`Typical`}</TableCell>
                                    <TableCell align="right">{t`Slowest`}</TableCell>
                                    <TableCell>{t`Failures`}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {source.stages.map((stage) => (
                                    <TableRow key={stage.stage}>
                                        <TableCell>{stageLabel(stage.stage)}</TableCell>
                                        <TableCell align="right">{stage.attempts}</TableCell>
                                        <TableCell align="right">
                                            {SourceHealthUtil.formatRate(stage.deliveryRate)}
                                        </TableCell>
                                        <TableCell align="right">
                                            {SourceHealthUtil.formatDuration(stage.p50Ms)}
                                        </TableCell>
                                        <TableCell align="right">
                                            {SourceHealthUtil.formatDuration(stage.p95Ms)}
                                        </TableCell>
                                        <TableCell>
                                            <Stack sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: 0.5 }}>
                                                {stage.failuresByOutcome.map(({ outcome, count }) => (
                                                    <Chip
                                                        key={outcome}
                                                        size="small"
                                                        variant="outlined"
                                                        color="error"
                                                        label={`${outcomeLabel(outcome)} · ${count}`}
                                                    />
                                                ))}
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <Typography variant="body2" color="text.secondary">
                            {t`Nothing was measured yet. Browse or read from this source and it shows up here.`}
                        </Typography>
                    )}
                </Stack>

                {!!failures.length && (
                    <Stack sx={{ gap: 1 }}>
                        <Typography variant="subtitle2" component="h3">
                            {t`Latest failures`}
                        </Typography>
                        {failures.map((failure) => (
                            <Stack key={failure.id} sx={{ gap: 0.25 }}>
                                <Typography variant="body2">
                                    {failure.mangaId != null && failure.mangaTitle ? (
                                        <Link
                                            component={RouterLink}
                                            to={AppRoutes.manga.path(failure.mangaId)}
                                            onClick={onClose}
                                        >
                                            {failure.mangaTitle}
                                        </Link>
                                    ) : (
                                        t`Source`
                                    )}
                                    {` · ${stageLabel(failure.stage)} · ${outcomeLabel(failure.outcome)}`}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
                                    {formatDateTime(failure.occurredAt)}
                                    {failure.message ? ` · ${failure.message}` : ''}
                                </Typography>
                            </Stack>
                        ))}
                    </Stack>
                )}
            </DialogContent>
            <DialogActions>
                <Button color="error" onClick={resetHealth}>
                    {t`Reset measurements`}
                </Button>
                <Button onClick={onClose}>{t`Close`}</Button>
            </DialogActions>
        </Dialog>
    );
};
