/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { GetSourceHealthDetailsQuery, GetSourcesHealthQuery } from '@/lib/graphql/generated/graphql.ts';

export type SourceHealthInfo = GetSourcesHealthQuery['sourcesHealth'][number];
export type SourceHealthStageInfo = SourceHealthInfo['stages'][number];
export type SourceHealthTrendDay = GetSourceHealthDetailsQuery['sourceHealthTrend'][number];
export type SourceHealthFailureInfo = GetSourceHealthDetailsQuery['sourceHealthFailures'][number];

export const SOURCE_HEALTH_WINDOWS_IN_DAYS = [7, 30, 90] as const;
export const DEFAULT_SOURCE_HEALTH_WINDOW_IN_DAYS = 30;

export enum SourceHealthSort {
    RELIABILITY = 'reliability',
    SPEED = 'speed',
    USAGE = 'usage',
    RATING = 'rating',
    NAME = 'name',
}

export type SourceHealthSummaryInfo = {
    /** sources that were used (or rated) in the window */
    total: number;
    good: number;
    fair: number;
    poor: number;
    insufficientData: number;
    /** calls made to the sources in the window */
    attempts: number;
    /** average delivery rate (0 - 1) of the sources with enough data */
    deliveryRate: number | null;
    /** the sources that need attention, worst first */
    worst: SourceHealthInfo[];
};
