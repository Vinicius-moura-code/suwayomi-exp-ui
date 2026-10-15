/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import { useLingui } from '@lingui/react/macro';
import { plural } from '@lingui/core/macro';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { NumberSetting } from '@/base/components/settings/NumberSetting.tsx';
import { useLocalStorage } from '@/base/hooks/useStorage.tsx';
import { PrivateCategoriesPasswordDialog } from '@/features/category/components/PrivateCategoriesPasswordDialog.tsx';
import {
    DEFAULT_PRIVATE_CATEGORIES_LOCK_TIMEOUT_MINUTES,
    PRIVATE_CATEGORIES_LOCK_TIMEOUT_KEY,
} from '@/features/category/services/PrivateCategories.ts';

export const PrivateCategoriesSettings = () => {
    const { t } = useLingui();

    const { data } = requestManager.useGetHasPrivateCategoriesPassword();
    const hasPassword = !!data?.hasPrivateCategoriesPassword;

    const [lockTimeoutMinutes, setLockTimeoutMinutes] = useLocalStorage(
        PRIVATE_CATEGORIES_LOCK_TIMEOUT_KEY,
        DEFAULT_PRIVATE_CATEGORIES_LOCK_TIMEOUT_MINUTES,
    );

    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

    return (
        <>
            <List
                subheader={
                    <ListSubheader component="div" id="library-private-categories">
                        {t`Private categories`}
                    </ListSubheader>
                }
            >
                <ListItemButton onClick={() => setIsPasswordDialogOpen(true)}>
                    <ListItemText
                        primary={t`Password`}
                        secondary={hasPassword ? t`Change or remove the password` : t`No password set`}
                    />
                </ListItemButton>
                <NumberSetting
                    settingTitle={t`Lock automatically`}
                    dialogDescription={t`Private categories lock again after this period of inactivity. Set to 0 to keep them unlocked until the app is closed or reloaded.`}
                    settingValue={
                        lockTimeoutMinutes
                            ? plural(lockTimeoutMinutes, { one: 'After # minute', other: 'After # minutes' })
                            : t`Only when the app is closed or reloaded`
                    }
                    value={lockTimeoutMinutes}
                    defaultValue={DEFAULT_PRIVATE_CATEGORIES_LOCK_TIMEOUT_MINUTES}
                    minValue={0}
                    maxValue={1440}
                    stepSize={1}
                    valueUnit={t`min`}
                    showSlider
                    handleUpdate={setLockTimeoutMinutes}
                />
            </List>
            {isPasswordDialogOpen && (
                <PrivateCategoriesPasswordDialog
                    hasPassword={hasPassword}
                    onClose={() => setIsPasswordDialogOpen(false)}
                />
            )}
        </>
    );
};
