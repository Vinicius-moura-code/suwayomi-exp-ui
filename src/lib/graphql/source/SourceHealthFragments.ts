/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import gql from 'graphql-tag';

export const SOURCE_HEALTH_FIELDS = gql`
    fragment SOURCE_HEALTH_FIELDS on SourceHealthType {
        sourceId
        name
        lang
        iconUrl
        windowDays
        verdict
        deliveryRate
        typicalLoadMs
        weakestStage
        attempts
        rating
        ratingNote
        usage {
            chaptersRead
            mangasRead
            lastReadAt
        }
        stages {
            stage
            attempts
            successes
            failures
            deliveryRate
            p50Ms
            p95Ms
            failuresByOutcome {
                outcome
                count
            }
        }
    }
`;
