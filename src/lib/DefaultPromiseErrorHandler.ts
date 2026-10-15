/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

// rejection reason of awaitable dialogs (see "awaitable-component") that were dismissed by the user
const USER_CANCELLATION_MESSAGE = 'User cancellation';

export const defaultPromiseErrorHandler =
    (name: string, allowProd: boolean = false) =>
    (error: any) => {
        if (!allowProd && process.env.NODE_ENV === 'production') {
            return;
        }

        // dismissing a dialog is not an error
        if (error instanceof Error && error.message === USER_CANCELLATION_MESSAGE) {
            return;
        }

        // oxlint-disable-next-line no-console
        console.error(`${name} failed due to`, error);
    };
