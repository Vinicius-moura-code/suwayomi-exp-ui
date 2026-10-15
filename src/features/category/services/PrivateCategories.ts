/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useSyncExternalStore } from 'react';
import { AppStorage } from '@/lib/storage/AppStorage.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import type { CategoryType } from '@/lib/graphql/generated/graphql-base.types.ts';

export const PRIVATE_CATEGORIES_LOCK_TIMEOUT_KEY = 'privateCategoriesLockTimeoutMinutes';
export const DEFAULT_PRIVATE_CATEGORIES_LOCK_TIMEOUT_MINUTES = 5;

const ACTIVITY_EVENTS = ['pointerdown', 'keydown'] as const;

type PrivateCategoryInfo = Pick<CategoryType, 'isPrivate' | 'showWhenLocked'>;

const listeners = new Set<() => void>();
let isUnlocked = false;
let lockTimer: ReturnType<typeof setTimeout> | undefined;
let activityListeners: AbortController | undefined;

const notify = () => listeners.forEach((listener) => listener());

export const lockPrivateCategories = () => {
    if (!isUnlocked) {
        return;
    }

    isUnlocked = false;
    clearTimeout(lockTimer);
    activityListeners?.abort();
    activityListeners = undefined;
    notify();
};

const getLockTimeoutMs = (): number => {
    const minutes = Number(
        AppStorage.local.getItemParsed(
            PRIVATE_CATEGORIES_LOCK_TIMEOUT_KEY,
            DEFAULT_PRIVATE_CATEGORIES_LOCK_TIMEOUT_MINUTES,
        ),
    );

    return Number.isFinite(minutes) && minutes > 0 ? minutes * 60_000 : 0;
};

const scheduleLock = () => {
    clearTimeout(lockTimer);

    const timeoutMs = getLockTimeoutMs();
    if (!isUnlocked || !timeoutMs) {
        return;
    }

    lockTimer = setTimeout(lockPrivateCategories, timeoutMs);
};

const unlockPrivateCategories = () => {
    if (isUnlocked) {
        scheduleLock();
        return;
    }

    isUnlocked = true;
    activityListeners = new AbortController();
    ACTIVITY_EVENTS.forEach((event) =>
        window.addEventListener(event, scheduleLock, { passive: true, signal: activityListeners?.signal }),
    );
    scheduleLock();
    notify();
};

/**
 * The server is the only one who knows the password; the unlocked state is intentionally kept in memory only,
 * so reloading the app locks the private categories again.
 *
 * @returns whether the categories are unlocked now (always true if no password has been set)
 */
export const tryUnlockPrivateCategories = async (password: string): Promise<boolean> => {
    const result = await requestManager.verifyPrivateCategoriesPassword(password).response;
    const unlocked = !!result.data?.verifyPrivateCategoriesPassword?.unlocked;

    if (unlocked) {
        unlockPrivateCategories();
    }

    return unlocked;
};

const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
};

export const useArePrivateCategoriesUnlocked = (): boolean =>
    useSyncExternalStore(
        subscribe,
        () => isUnlocked,
        () => false,
    );

export const isCategoryConcealed = (category: PrivateCategoryInfo, isLocked: boolean): boolean =>
    isLocked && category.isPrivate;

export const isCategoryTabHidden = (category: PrivateCategoryInfo, isLocked: boolean): boolean =>
    isCategoryConcealed(category, isLocked) && !category.showWhenLocked;
