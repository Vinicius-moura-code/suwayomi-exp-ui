/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useLocation, useNavigate } from '@/lib/router';
import { useCallback } from 'react';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { useAppPageHistoryContext } from '@/base/contexts/AppPageHistoryContext.tsx';
import { normalizeHistoryPath } from '@/base/hooks/useHistory.ts';

const READER_REGEX = /\/manga\/[0-9]+\/chapter\/[0-9]+/g;
const PAGES_TO_IGNORE: readonly RegExp[] = [READER_REGEX];

export const useBackButton = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { history, onBack } = useAppPageHistoryContext();
    const currentPath = normalizeHistoryPath(location.pathname + location.search);

    return useCallback(async () => {
        const getDelta = (historyToCheck: string[] = history, delta: number = 0) => {
            const isHistoryEmpty = !historyToCheck.length;
            if (isHistoryEmpty) {
                return 0;
            }

            const isLastPageInHistoryCurrentPage =
                historyToCheck.length === 1 && normalizeHistoryPath(historyToCheck[0]) === currentPath;
            if (isLastPageInHistoryCurrentPage) {
                return 0;
            }

            const [previousPage] = historyToCheck.slice(-2);
            const normalizedPreviousPage = normalizeHistoryPath(previousPage);

            const isPreviousPageCurrentPage = normalizedPreviousPage === currentPath;
            const ignorePreviousPage = PAGES_TO_IGNORE.some((page) => !!normalizedPreviousPage.match(page));

            const skipPreviousPage = isPreviousPageCurrentPage || ignorePreviousPage;
            if (!skipPreviousPage) {
                return delta - 1;
            }

            return getDelta(historyToCheck.slice(0, -1), delta - 1);
        };

        const isAllowedToGoBack = await onBack();
        if (!isAllowedToGoBack) {
            return;
        }

        const backDelta = getDelta();

        const canNavigateBack = backDelta < 0;
        if (!canNavigateBack) {
            navigate(AppRoutes.library.path());
            return;
        }

        navigate(backDelta);
    }, [history, onBack, currentPath, navigate]);
};
