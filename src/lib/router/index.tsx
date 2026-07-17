/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

'use client';

import NextLink from 'next/link';
import { usePathname, useRouter, useParams as useNextParams, useSearchParams as useNextSearchParams } from 'next/navigation';
import type { NavigateOptions as NextNavigateOptions } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import {
    createContext,
    forwardRef,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ForwardedRef,
    type MouseEvent,
    type ReactNode,
} from 'react';

const LOCATION_STATE_KEY = '__suwayomi_location_state__';

export type To =
    | string
    | {
          pathname?: string;
          search?: string;
          hash?: string;
      };

export type NavigateOptions = {
    replace?: boolean;
    state?: unknown;
};

export type NavigateFunction = {
    (to: To, options?: NavigateOptions): void;
    (delta: number): void;
};

export type Location<State = unknown> = {
    pathname: string;
    search: string;
    hash: string;
    state: State | null;
    key: string;
};

type SetURLSearchParams = (
    nextInit?: URLSearchParams | Record<string, string | string[]> | ((prev: URLSearchParams) => URLSearchParams),
    navigateOptions?: NavigateOptions,
) => void;

type HistoryEntry = {
    pathname: string;
    search: string;
    state: unknown;
    key: string;
};

export enum NavigationType {
    Pop = 'POP',
    Push = 'PUSH',
    Replace = 'REPLACE',
}

const RouterHistoryContext = createContext<{
    locationState: unknown;
    setLocationState: (state: unknown) => void;
    pushHistory: (entry: HistoryEntry) => void;
    navigationType: NavigationType;
    setNavigationType: (type: NavigationType) => void;
} | null>(null);

const pathFromTo = (to: To): string => {
    if (typeof to === 'string') {
        return to;
    }

    return `${to.pathname ?? ''}${to.search ?? ''}${to.hash ?? ''}`;
};

const readStoredState = (pathname: string, search: string): unknown => {
    if (typeof window === 'undefined') {
        return null;
    }

    try {
        const raw = sessionStorage.getItem(LOCATION_STATE_KEY);
        if (!raw) {
            return null;
        }

        const parsed = JSON.parse(raw) as { path?: string; state?: unknown };
        if (parsed.path === `${pathname}${search}`) {
            return parsed.state ?? null;
        }
    } catch {
        // ignore
    }

    return null;
};

const writeStoredState = (pathname: string, search: string, state: unknown) => {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        sessionStorage.setItem(LOCATION_STATE_KEY, JSON.stringify({ path: `${pathname}${search}`, state }));
    } catch {
        // ignore
    }
};

export const RouterProvider = ({ children }: { children: ReactNode }) => {
    const pathname = usePathname() ?? '/';
    const searchParams = useNextSearchParams();
    const search = searchParams?.toString() ? `?${searchParams.toString()}` : '';
    const [locationState, setLocationState] = useState<unknown>(() => readStoredState(pathname, search));
    const [navigationType, setNavigationType] = useState<NavigationType>(NavigationType.Push);

    useEffect(() => {
        setLocationState(readStoredState(pathname, search));
    }, [pathname, search]);

    useEffect(() => {
        const onPopState = () => setNavigationType(NavigationType.Pop);
        window.addEventListener('popstate', onPopState);
        return () => window.removeEventListener('popstate', onPopState);
    }, []);

    const pushHistory = useCallback((entry: HistoryEntry) => {
        writeStoredState(entry.pathname, entry.search, entry.state);
        setLocationState(entry.state ?? null);
    }, []);

    const value = useMemo(
        () => ({
            locationState,
            setLocationState,
            pushHistory,
            navigationType,
            setNavigationType,
        }),
        [locationState, navigationType, pushHistory],
    );

    return <RouterHistoryContext.Provider value={value}>{children}</RouterHistoryContext.Provider>;
};

export const useNavigationType = (): NavigationType =>
    useContext(RouterHistoryContext)?.navigationType ?? NavigationType.Push;

export const useNavigate = (): NavigateFunction => {
    const router = useRouter();
    const pathname = usePathname() ?? '/';
    const searchParams = useNextSearchParams();
    const history = useContext(RouterHistoryContext);

    return useCallback(
        (toOrDelta: To | number, options?: NavigateOptions) => {
            if (typeof toOrDelta === 'number') {
                if (toOrDelta < 0) {
                    router.back();
                } else if (toOrDelta > 0) {
                    router.forward();
                }
                return;
            }

            const href = pathFromTo(toOrDelta);
            const [pathPart, hashPart] = href.split('#');
            const [nextPathname, nextSearch = ''] = pathPart.split('?');
            const search = nextSearch ? `?${nextSearch}` : '';

            if (options?.state !== undefined) {
                history?.pushHistory({
                    pathname: nextPathname || pathname,
                    search,
                    state: options.state,
                    key: String(Date.now()),
                });
            }

            history?.setNavigationType(options?.replace ? NavigationType.Replace : NavigationType.Push);

            const nextOptions = { scroll: true } satisfies Partial<NextNavigateOptions>;
            if (options?.replace) {
                router.replace(href, nextOptions);
            } else {
                router.push(href, nextOptions);
            }

            void hashPart;
            void searchParams;
        },
        [history, pathname, router, searchParams],
    ) as NavigateFunction;
};

export const useLocation = <State = unknown,>(): Location<State> => {
    const pathname = usePathname() ?? '/';
    const searchParams = useNextSearchParams();
    const search = searchParams?.toString() ? `?${searchParams.toString()}` : '';
    const history = useContext(RouterHistoryContext);
    const hash = typeof window !== 'undefined' ? window.location.hash : '';

    return {
        pathname,
        search,
        hash,
        state: (history?.locationState as State | null) ?? null,
        key: 'default',
    };
};

export const useParams = <Params extends Record<string, string | undefined> = Record<string, string>>(): Params =>
    (useNextParams() ?? {}) as Params;

export { usePathname };

export const useSearchParams = (): [URLSearchParams, SetURLSearchParams] => {
    const router = useRouter();
    const pathname = usePathname() ?? '/';
    const nextSearchParams = useNextSearchParams();
    const searchParams = useMemo(() => new URLSearchParams(nextSearchParams?.toString() ?? ''), [nextSearchParams]);

    const setSearchParams = useCallback<SetURLSearchParams>(
        (nextInit, navigateOptions) => {
            const current = new URLSearchParams(nextSearchParams?.toString() ?? '');
            let next: URLSearchParams;

            if (typeof nextInit === 'function') {
                next = nextInit(current);
            } else if (nextInit instanceof URLSearchParams) {
                next = nextInit;
            } else if (nextInit) {
                next = new URLSearchParams();
                Object.entries(nextInit).forEach(([key, value]) => {
                    if (Array.isArray(value)) {
                        value.forEach((entry) => next.append(key, entry));
                    } else {
                        next.set(key, value);
                    }
                });
            } else {
                next = new URLSearchParams();
            }

            const qs = next.toString();
            const href = qs ? `${pathname}?${qs}` : pathname;

            if (navigateOptions?.replace) {
                router.replace(href);
            } else {
                router.push(href);
            }
        },
        [nextSearchParams, pathname, router],
    );

    return [searchParams, setSearchParams];
};

type LinkProps = React.ComponentPropsWithoutRef<'a'> & {
    to: To;
    replace?: boolean;
    state?: unknown;
    reloadDocument?: boolean;
};

export const Link = forwardRef(function RouterLink(
    { to, replace, state, onClick, href: _href, ...rest }: LinkProps,
    ref: ForwardedRef<HTMLAnchorElement>,
) {
    const history = useContext(RouterHistoryContext);
    const href = pathFromTo(to);

    const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
        if (state !== undefined) {
            const [pathPart] = href.split('#');
            const [nextPathname, nextSearch = ''] = pathPart.split('?');
            history?.pushHistory({
                pathname: nextPathname,
                search: nextSearch ? `?${nextSearch}` : '',
                state,
                key: String(Date.now()),
            });
        }

        onClick?.(event);
    };

    return <NextLink ref={ref} href={href} replace={replace} onClick={handleClick} {...rest} />;
});

export const Navigate = ({ to, replace = false, state }: { to: To; replace?: boolean; state?: unknown }) => {
    const navigate = useNavigate();

    useEffect(() => {
        navigate(to, { replace, state });
    }, [navigate, replace, state, to]);

    return null;
};

export const Outlet = ({ children }: { children?: ReactNode }) => children ?? null;
