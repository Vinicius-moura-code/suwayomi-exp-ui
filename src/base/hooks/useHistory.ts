/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect, useRef, useState } from 'react';
import { NavigationType, useLocation, useNavigationType } from '@/lib/router';

const MAX_DEPTH = 50;

/** Normalize for history comparisons (Next trailingSlash + optional search). */
export const normalizeHistoryPath = (path: string): string => {
    const [pathnamePart, searchPart] = path.split('?');
    const pathname =
        pathnamePart.length > 1 && pathnamePart.endsWith('/') ? pathnamePart.slice(0, -1) : pathnamePart || '/';
    return searchPart ? `${pathname}?${searchPart}` : pathname;
};

export const useHistory = () => {
    const location = useLocation();
    const navigationType = useNavigationType();
    const lastProcessedPath = useRef<string | null>(null);

    const [history, setHistory] = useState<string[]>(() => [
        normalizeHistoryPath(location.pathname + location.search),
    ]);

    useEffect(() => {
        const nextPath = normalizeHistoryPath(location.pathname + location.search);

        // Skip initial mount and Strict Mode double-invoke for the same path.
        // (The old `location.key === 'default'` guard broke under Next, where key was always default.)
        if (lastProcessedPath.current === null || lastProcessedPath.current === nextPath) {
            lastProcessedPath.current = nextPath;
            return;
        }

        lastProcessedPath.current = nextPath;

        setHistory((prev) => {
            switch (navigationType) {
                case NavigationType.Pop:
                    return prev.slice(0, -1).slice(-MAX_DEPTH);
                case NavigationType.Push:
                    return [...prev, nextPath].slice(-MAX_DEPTH);
                case NavigationType.Replace:
                    return [...prev.slice(0, -1), nextPath].slice(-MAX_DEPTH);
                default:
                    throw new Error(`Unexpected NavigationType "${navigationType}"`);
            }
        });
    }, [location.pathname, location.search, location.key, navigationType]);

    return history;
};
