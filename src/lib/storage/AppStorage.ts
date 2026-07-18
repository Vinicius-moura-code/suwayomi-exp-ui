/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/* oxlint-disable max-classes-per-file */
import { jsonSaveParse } from '@/lib/HelperFunctions.ts';

type WebStorage = Pick<globalThis.Storage, 'getItem' | 'setItem' | 'removeItem' | 'clear' | 'key' | 'length'>;

const createMemoryStorage = (): WebStorage => {
    const data = new Map<string, string>();
    return {
        get length() {
            return data.size;
        },
        clear: () => data.clear(),
        getItem: (key: string) => data.get(key) ?? null,
        key: (index: number) => [...data.keys()][index] ?? null,
        removeItem: (key: string) => {
            data.delete(key);
        },
        setItem: (key: string, value: string) => {
            data.set(key, value);
        },
    };
};

const getBrowserStorage = (type: 'local' | 'session'): WebStorage => {
    if (typeof window === 'undefined') {
        return createMemoryStorage();
    }

    return type === 'local' ? window.localStorage : window.sessionStorage;
};

export class Storage {
    constructor(private readonly storage: WebStorage) {}

    parseValue<T>(value: string | null, defaultValue: T): T {
        if (value === null) {
            return defaultValue;
        }

        const parsedValue = jsonSaveParse(value);

        if (value === 'null' || value === 'undefined') {
            return parsedValue;
        }

        return parsedValue ?? (value as T);
    }

    getItem(key: string): string | null {
        return this.storage.getItem(key);
    }

    getItemParsed<T>(key: string, defaultValue: T): T {
        return this.parseValue(this.getItem(key), defaultValue);
    }

    setItem(key: string, value: unknown, emitEvent: boolean = true): void {
        const currentValue = this.getItem(key);

        const fireEvent = (valueToStore: string | undefined) => {
            if (!emitEvent || typeof window === 'undefined') {
                return;
            }

            window.dispatchEvent(
                new StorageEvent('storage', {
                    key,
                    oldValue: currentValue,
                    newValue: valueToStore,
                }),
            );
        };

        if (value === undefined) {
            this.storage.removeItem(key);
            fireEvent(undefined);
            return;
        }

        const stringify = typeof value !== 'string';
        const valueToStore = stringify ? JSON.stringify(value) : value;

        this.storage.setItem(key, valueToStore);
        fireEvent(valueToStore as string);
    }

    setItemIfMissing(key: string, value: unknown, emitEvent?: boolean): void {
        if (this.getItem(key) === null) {
            this.setItem(key, value, emitEvent);
        }
    }
}

export class AppStorage {
    static readonly local: Storage = new Storage(getBrowserStorage('local'));

    static readonly session: Storage = new Storage(getBrowserStorage('session'));
}
