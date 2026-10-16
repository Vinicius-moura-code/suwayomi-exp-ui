/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import gql from 'graphql-tag';
import { SOURCE_HEALTH_FIELDS } from '@/lib/graphql/source/SourceHealthFragments.ts';

export const GET_SOURCES_HEALTH = gql`
    ${SOURCE_HEALTH_FIELDS}
    query GET_SOURCES_HEALTH($days: Int) {
        sourcesHealth(days: $days) {
            ...SOURCE_HEALTH_FIELDS
        }
    }
`;

export const GET_SOURCE_HEALTH_DETAILS = gql`
    query GET_SOURCE_HEALTH_DETAILS($sourceId: LongString!, $days: Int, $failuresLimit: Int) {
        sourceHealthTrend(sourceId: $sourceId, days: $days) {
            day
            attempts
            failures
        }
        sourceHealthFailures(sourceId: $sourceId, limit: $failuresLimit) {
            id
            mangaId
            mangaTitle
            stage
            outcome
            message
            occurredAt
        }
    }
`;

export const GET_SOURCES_HEALTH_TREND = gql`
    query GET_SOURCES_HEALTH_TREND($days: Int) {
        sourcesHealthTrend(days: $days) {
            day
            attempts
            failures
        }
    }
`;
