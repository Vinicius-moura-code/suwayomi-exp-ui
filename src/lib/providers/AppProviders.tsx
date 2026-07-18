/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

'use client';

import '@/lib/runtimeSetup.ts';
import { StyledEngineProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import React, { useEffect, useLayoutEffect, useState, type PropsWithChildren } from 'react';
import { QueryParamProvider } from 'use-query-params';
import { WindowHistoryAdapter } from 'use-query-params/adapters/window';
import { SnackbarProvider } from 'notistack';
import { I18nProvider } from '@lingui/react';
import { AwaitableComponent } from 'awaitable-component';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { loadErrorMessages, loadDevMessages } from '@apollo/client/dev';
import { ActiveDeviceContextProvider } from '@/features/device/DeviceContext.tsx';
import { AppHotkeysProvider } from '@/features/hotkeys/AppHotkeysProvider.tsx';
import { SnackbarWithDescription } from '@/base/components/feedback/SnackbarWithDescription.tsx';
import { AppPageHistoryContextProvider } from '@/base/contexts/AppPageHistoryContext.tsx';
import { AppThemeContextProvider } from '@/features/theme/AppThemeContext.tsx';import { NavBarContextProvider } from '@/features/navigation-bar/NavbarContext.tsx';
import { i18n } from '@/i18n';
import { ThemeRegistry } from '@/lib/theme/ThemeRegistry.tsx';
import { RouterProvider, Navigate, useNavigate, usePathname } from '@/lib/router';
import { ReactRouter } from '@/lib/react-router/ReactRouter.ts';
import { AuthGuard } from '@/features/authentication/components/AuthGuard.tsx';
import { SplashScreen } from '@/features/authentication/components/SplashScreen.tsx';
import { MinimalLoading } from '@/lib/providers/MinimalLoading.tsx';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { d } from 'koration';
import { WebUIUpdateChecker } from '@/features/app-updates/components/WebUIUpdateChecker.tsx';
import { ServerUpdateChecker } from '@/features/app-updates/components/ServerUpdateChecker.tsx';
import { AuthManager } from '@/features/authentication/AuthManager.ts';
import { MigrationManager } from '@/features/migration/MigrationManager.ts';
import { MigrationFABIndicator } from '@/features/migration/components/MigrationFABIndicator.tsx';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { SearchParam } from '@/base/Base.types.ts';

if (process.env.NODE_ENV === 'development') {
    loadDevMessages();
    loadErrorMessages();
}

const ScrollToTop = () => {
    const pathname = usePathname();

    useLayoutEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
};

const InitializeGuard = ({ children }: PropsWithChildren) => {
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        type RequestConfig = [string, () => Promise<unknown>][];
        type InFlightRequest = [string, Promise<unknown>];

        const initialRequests: RequestConfig = [
            ['globalMeta', () => requestManager.getGlobalMeta().response],
            ['serverSettings', () => requestManager.getServerSettings().response],
        ];

        const executeRequests = async (requests: RequestConfig, timeout: number = d(5).seconds.inWholeMilliseconds) => {
            const runningRequests = requests.map(([key, fn]) => [key, fn()] satisfies InFlightRequest);

            const failedRequests = runningRequests.filter(async ([_, request]) => {
                try {
                    await request;
                    return false;
                } catch {
                    return true;
                }
            });

            if (failedRequests.length) {
                await new Promise((resolve) => {
                    setTimeout(resolve, timeout);
                });

                return executeRequests(
                    requests.filter(([key]) => !failedRequests.some(([k]) => k === key)),
                    (timeout * 1.5) % d(2).minutes.inWholeMilliseconds,
                );
            }
        };

        executeRequests(initialRequests).catch(defaultPromiseErrorHandler('InitializeGuard'));
        setIsInitialized(true);
    }, []);

    if (isInitialized) {
        return children;
    }

    return <SplashScreen />;
};

const InitialBackgroundRequests = () => {
    requestManager.useGetDownloadStatus({ nextFetchPolicy: 'standby' });

    const [fetchExtensionList] = requestManager.useExtensionListFetch();

    useEffect(() => {
        fetchExtensionList().catch(defaultPromiseErrorHandler('App::InitialBackgroundRequests: extension list'));
    }, []);

    return null;
};

const BackgroundSubscriptions = () => {
    const { isAuthRequired, accessToken } = AuthManager.useSession();
    const skipConnection = isAuthRequired === null || (isAuthRequired && !accessToken);

    requestManager.useDownloadSubscription({ skip: skipConnection });
    requestManager.useUpdaterSubscription({ skip: skipConnection });
    requestManager.useWebUIUpdateSubscription({ skip: skipConnection });
    requestManager.useSyncSubscription({ skip: skipConnection });

    return null;
};

const ReactRouterSetter = () => {
    const navigate = useNavigate();

    useEffect(() => {
        ReactRouter.setNavigateFn(navigate);
    }, [navigate]);

    return null;
};

const ResumeMigration = () => {
    useEffect(() => {
        if (!MigrationManager.isActive()) {
            navigator.locks
                ?.request('migration-executor', async () => {
                    const resumed = await MigrationManager.resume();
                    if (resumed) {
                        await MigrationManager.awaitCompletion();
                    }
                })
                .catch(defaultPromiseErrorHandler('ResumeMigration'));
        }
    }, []);

    return null;
};

export const RequireAuth = ({ children }: PropsWithChildren) => {
    const isAuthenticated = AuthManager.useIsAuthenticated();

    if (!isAuthenticated) {
        return (
            <Navigate
                to={{
                    pathname: AppRoutes.authentication.children.login.path,
                    search: `?${SearchParam.REDIRECT}=${encodeURIComponent(window.location.pathname)}`,
                }}
                replace
            />
        );
    }

    return children;
};

interface Props {
    children: React.ReactNode;
}

const AppProvidersInner: React.FC<Props> = ({ children }) => (
    <NuqsAdapter>
        <ThemeRegistry>
            <StyledEngineProvider injectFirst>
                <I18nProvider i18n={i18n}>
                    <AppThemeContextProvider>
                        <QueryParamProvider adapter={WindowHistoryAdapter}>
                            <RouterProvider>
                                <NavBarContextProvider>
                                    <AppPageHistoryContextProvider>
                                        <ActiveDeviceContextProvider>
                                            <SnackbarProvider
                                                Components={{
                                                    default: SnackbarWithDescription,
                                                    info: SnackbarWithDescription,
                                                    success: SnackbarWithDescription,
                                                    warning: SnackbarWithDescription,
                                                    error: SnackbarWithDescription,
                                                }}
                                            >
                                                <AppHotkeysProvider>
                                                    <ScrollToTop />
                                                    <AwaitableComponent.Root />
                                                    <ReactRouterSetter />
                                                    <CssBaseline enableColorScheme />
                                                    <AuthGuard>
                                                        <InitializeGuard>
                                                            <ServerUpdateChecker />
                                                            <WebUIUpdateChecker />
                                                            <InitialBackgroundRequests />
                                                            <BackgroundSubscriptions />
                                                            <ResumeMigration />
                                                            {children}
                                                            <MigrationFABIndicator />
                                                        </InitializeGuard>
                                                    </AuthGuard>
                                                </AppHotkeysProvider>
                                            </SnackbarProvider>
                                        </ActiveDeviceContextProvider>
                                    </AppPageHistoryContextProvider>
                                </NavBarContextProvider>
                            </RouterProvider>
                        </QueryParamProvider>
                    </AppThemeContextProvider>
                </I18nProvider>
            </StyledEngineProvider>
        </ThemeRegistry>
    </NuqsAdapter>
);

export const AppProviders: React.FC<Props> = ({ children }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Avoid prerender crashes from Next navigation hooks / browser-only modules
    if (!mounted) {
        return <MinimalLoading />;
    }

    return <AppProvidersInner>{children}</AppProvidersInner>;
};
