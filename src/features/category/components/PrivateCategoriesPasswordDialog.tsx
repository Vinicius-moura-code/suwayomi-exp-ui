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
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { makeToast } from '@/base/utils/Toast.ts';

export const PrivateCategoriesPasswordDialog = ({
    hasPassword,
    onClose,
}: {
    hasPassword: boolean;
    onClose: () => void;
}) => {
    const { t } = useLingui();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmedPassword, setConfirmedPassword] = useState('');
    const [isWrongPassword, setIsWrongPassword] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const isMismatch = confirmedPassword.length > 0 && confirmedPassword !== newPassword;
    const canSave = !isSaving && (!hasPassword || currentPassword.length > 0);
    const canSet = canSave && newPassword.length > 0 && newPassword === confirmedPassword;

    const savePassword = async (password: string | undefined) => {
        setIsSaving(true);
        try {
            const result = await requestManager.setPrivateCategoriesPassword(
                hasPassword ? currentPassword : undefined,
                password,
            ).response;

            if (!result.data?.setPrivateCategoriesPassword?.success) {
                setIsWrongPassword(true);
                return;
            }

            makeToast(password ? t`Password saved` : t`Password removed`, 'success');
            onClose();
        } catch (e) {
            makeToast(t`Could not save the password`, 'error', getErrorMessage(e));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open onClose={onClose}>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    if (canSet) {
                        savePassword(newPassword);
                    }
                }}
            >
                <DialogTitle>{hasPassword ? t`Change password` : t`Set password`}</DialogTitle>
                <DialogContent>
                    {hasPassword && (
                        <TextField
                            autoFocus
                            margin="dense"
                            type="password"
                            label={t`Current password`}
                            fullWidth
                            value={currentPassword}
                            onChange={(e) => {
                                setCurrentPassword(e.target.value);
                                setIsWrongPassword(false);
                            }}
                            error={isWrongPassword}
                            helperText={isWrongPassword ? t`Wrong password` : undefined}
                        />
                    )}
                    <TextField
                        autoFocus={!hasPassword}
                        margin="dense"
                        type="password"
                        label={t`New password`}
                        fullWidth
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        type="password"
                        label={t`Confirm new password`}
                        fullWidth
                        value={confirmedPassword}
                        onChange={(e) => setConfirmedPassword(e.target.value)}
                        error={isMismatch}
                        helperText={isMismatch ? t`Passwords do not match` : undefined}
                    />
                </DialogContent>
                <DialogActions>
                    {hasPassword && (
                        <Button color="error" disabled={!canSave} onClick={() => savePassword(undefined)}>
                            {t`Remove password`}
                        </Button>
                    )}
                    <Button onClick={onClose} color="primary">
                        {t`Cancel`}
                    </Button>
                    <Button type="submit" color="primary" disabled={!canSet}>
                        {t`Save`}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};
