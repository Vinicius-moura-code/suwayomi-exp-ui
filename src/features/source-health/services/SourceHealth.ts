/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useMemo } from 'react';
import { useLingui } from '@lingui/react/macro';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { STABLE_EMPTY_ARRAY } from '@/base/Base.constants.ts';
import {
    SourceHealthOutcome,
    SourceHealthStage,
    SourceHealthVerdict,
} from '@/lib/graphql/generated/graphql-base.types.ts';
import type { SourceHealthInfo, SourceHealthSummaryInfo } from '@/features/source-health/SourceHealth.types.ts';
import { SourceHealthSort } from '@/features/source-health/SourceHealth.types.ts';

const MAX_WORST_SOURCES = 3;

/** the worse the verdict, the lower the value */
const VERDICT_ORDER: Record<SourceHealthVerdict, number> = {
    [SourceHealthVerdict.Good]: 3,
    [SourceHealthVerdict.Fair]: 2,
    [SourceHealthVerdict.Poor]: 1,
    [SourceHealthVerdict.InsufficientData]: 0,
};

const byName = (a: SourceHealthInfo, b: SourceHealthInfo) => a.name.localeCompare(b.name);

export class SourceHealthUtil {
    static hasEnoughData(source: SourceHealthInfo): boolean {
        return source.verdict !== SourceHealthVerdict.InsufficientData;
    }

    /** e.g. "850 ms", "2.4 s" */
    static formatDuration(ms: number | null | undefined): string {
        if (ms == null) {
            return '-';
        }

        if (ms < 1000) {
            return `${Math.round(ms)} ms`;
        }

        return `${(ms / 1000).toFixed(ms < 10_000 ? 1 : 0)} s`;
    }

    /** e.g. "93%" */
    static formatRate(rate: number | null | undefined): string {
        if (rate == null) {
            return '-';
        }

        // never round a source with failures up to 100%
        const percent = rate < 1 ? Math.min(Math.floor(rate * 100), 99) : 100;
        return `${percent}%`;
    }

    static sort(sources: SourceHealthInfo[], sortBy: SourceHealthSort): SourceHealthInfo[] {
        // sources without enough data have nothing to rank on, so they go last
        const withDataFirst =
            (compare: (a: SourceHealthInfo, b: SourceHealthInfo) => number) =>
            (a: SourceHealthInfo, b: SourceHealthInfo) => {
                const aHasData = SourceHealthUtil.hasEnoughData(a);
                const bHasData = SourceHealthUtil.hasEnoughData(b);
                if (aHasData !== bHasData) {
                    return aHasData ? -1 : 1;
                }

                return compare(a, b) || byName(a, b);
            };

        const sorted = [...sources];
        switch (sortBy) {
            case SourceHealthSort.RELIABILITY:
                return sorted.sort(
                    withDataFirst(
                        (a, b) =>
                            VERDICT_ORDER[b.verdict] - VERDICT_ORDER[a.verdict] ||
                            (b.deliveryRate ?? 0) - (a.deliveryRate ?? 0) ||
                            (a.typicalLoadMs ?? Infinity) - (b.typicalLoadMs ?? Infinity),
                    ),
                );
            case SourceHealthSort.SPEED:
                return sorted.sort(
                    withDataFirst((a, b) => (a.typicalLoadMs ?? Infinity) - (b.typicalLoadMs ?? Infinity)),
                );
            case SourceHealthSort.USAGE:
                return sorted.sort(
                    (a, b) =>
                        b.usage.chaptersRead - a.usage.chaptersRead ||
                        Number(b.usage.lastReadAt ?? 0) - Number(a.usage.lastReadAt ?? 0) ||
                        byName(a, b),
                );
            case SourceHealthSort.RATING:
                return sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || byName(a, b));
            default:
                return sorted.sort(byName);
        }
    }

    /** an overview of all the sources, small enough to be used as a widget (e.g. on a dashboard) */
    static summarize(sources: SourceHealthInfo[]): SourceHealthSummaryInfo {
        const withData = sources.filter(SourceHealthUtil.hasEnoughData);
        const rates = withData.map((source) => source.deliveryRate).filter((rate): rate is number => rate != null);

        return {
            total: sources.length,
            good: sources.filter((source) => source.verdict === SourceHealthVerdict.Good).length,
            fair: sources.filter((source) => source.verdict === SourceHealthVerdict.Fair).length,
            poor: sources.filter((source) => source.verdict === SourceHealthVerdict.Poor).length,
            insufficientData: sources.length - withData.length,
            attempts: sources.reduce((sum, source) => sum + source.attempts, 0),
            deliveryRate: rates.length ? rates.reduce((sum, rate) => sum + rate, 0) / rates.length : null,
            worst: SourceHealthUtil.sort(withData, SourceHealthSort.RELIABILITY)
                .reverse()
                .filter((source) => source.verdict === SourceHealthVerdict.Poor)
                .slice(0, MAX_WORST_SOURCES),
        };
    }
}

/**
 * The health of the sources that were used in the last [days] days.
 *
 * @param fetchPolicy "cache-first" for the places showing a small indicator next to a source, to not refetch for each one
 */
export const useSourcesHealth = (
    days?: number,
    fetchPolicy: 'cache-first' | 'cache-and-network' = 'cache-and-network',
) => {
    const { data, loading, error, refetch } = requestManager.useGetSourcesHealth(days, { fetchPolicy });

    const sources = data?.sourcesHealth ?? STABLE_EMPTY_ARRAY;
    const sourcesById = useMemo(() => new Map(sources.map((source) => [source.sourceId, source])), [sources]);

    return { sources, sourcesById, loading, error, refetch };
};

/** The requests made (and failed) per day, for all the sources together. */
export const useSourcesHealthTrend = (days?: number) => {
    const { data, loading, error } = requestManager.useGetSourcesHealthTrend(days);

    return { trend: data?.sourcesHealthTrend ?? STABLE_EMPTY_ARRAY, loading, error };
};

export const useSourceHealthLabels = () => {
    const { t } = useLingui();

    return {
        verdictLabel: (verdict: SourceHealthVerdict): string => {
            switch (verdict) {
                case SourceHealthVerdict.Good:
                    return t`Reliable`;
                case SourceHealthVerdict.Fair:
                    return t`Fair`;
                case SourceHealthVerdict.Poor:
                    return t`Unreliable`;
                default:
                    return t`Not enough data`;
            }
        },
        stageLabel: (stage: SourceHealthStage): string => {
            switch (stage) {
                case SourceHealthStage.Listing:
                    return t`Listing`;
                case SourceHealthStage.Details:
                    return t`Details`;
                case SourceHealthStage.Chapters:
                    return t`Chapters`;
                case SourceHealthStage.Pages:
                    return t`Pages`;
                case SourceHealthStage.Image:
                    return t`Images`;
                default:
                    return t`Thumbnails`;
            }
        },
        outcomeLabel: (outcome: SourceHealthOutcome): string => {
            switch (outcome) {
                case SourceHealthOutcome.Ok:
                    return t`Worked`;
                case SourceHealthOutcome.Blocked:
                    return t`Blocked`;
                case SourceHealthOutcome.NotFound:
                    return t`Not found`;
                case SourceHealthOutcome.ServerError:
                    return t`Server error`;
                case SourceHealthOutcome.Timeout:
                    return t`Timed out`;
                case SourceHealthOutcome.Network:
                    return t`Connection failed`;
                case SourceHealthOutcome.LocalNetwork:
                    return t`Local connection`;
                case SourceHealthOutcome.Empty:
                    return t`Returned nothing`;
                default:
                    return t`Error`;
            }
        },
    };
};
