/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import gql from 'graphql-tag';
import { SOURCE_HEALTH_FIELDS } from '@/lib/graphql/source/SourceHealthFragments.ts';

export const SET_SOURCE_RATING = gql`
    ${SOURCE_HEALTH_FIELDS}
    mutation SET_SOURCE_RATING($input: SetSourceRatingInput!) {
        setSourceRating(input: $input) {
            sourceHealth {
                ...SOURCE_HEALTH_FIELDS
            }
        }
    }
`;

export const RESET_SOURCE_HEALTH = gql`
    ${SOURCE_HEALTH_FIELDS}
    mutation RESET_SOURCE_HEALTH($input: ResetSourceHealthInput!) {
        resetSourceHealth(input: $input) {
            sourceHealth {
                ...SOURCE_HEALTH_FIELDS
            }
        }
    }
`;
