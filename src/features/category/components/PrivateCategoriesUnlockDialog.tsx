/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { useLingui } from '@lingui/react/macro';
import { tryUnlockPrivateCategories } from '@/features/category/services/PrivateCategories.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { makeToast } from '@/base/utils/Toast.ts';

export const PrivateCategoriesUnlockDialog = ({
    onClose,
    onUnlocked,
}: {
    onClose: () => void;
    onUnlocked?: () => void;
}) => {
    const { t } = useLingui();

    const [password, setPassword] = useState('');
    const [isWrongPassword, setIsWrongPassword] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    const handleSubmit = async () => {
        setIsVerifying(true);
        try {
            const unlocked = await tryUnlockPrivateCategories(password);
            if (!unlocked) {
                setIsWrongPassword(true);
                return;
            }

            onClose();
            onUnlocked?.();
        } catch (e) {
            makeToast(t`Could not verify the password`, 'error', getErrorMessage(e));
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <Dialog open onClose={onClose}>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit();
                }}
            >
                <DialogTitle>{t`Private categories`}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        type="password"
                        label={t`Password`}
                        fullWidth
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            setIsWrongPassword(false);
                        }}
                        error={isWrongPassword}
                        helperText={isWrongPassword ? t`Wrong password` : undefined}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="primary">
                        {t`Cancel`}
                    </Button>
                    <Button type="submit" color="primary" disabled={!password.length || isVerifying}>
                        {t`Unlock`}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};
