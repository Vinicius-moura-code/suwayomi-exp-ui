/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useLingui } from '@lingui/react/macro';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import type {
    CategoryDefaultInfo,
    CategoryIdInfo,
    CategoryNameInfo,
    CategoryPrivacyInfo,
} from '@/features/category/Category.types.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { makeToast } from '@/base/utils/Toast.ts';
import { assertIsDefined } from '@/base/Asserts.ts';

export const CreateOrEditCategoryDialog = ({
    category,
    onClose,
}: {
    category: (CategoryIdInfo & CategoryNameInfo & CategoryDefaultInfo & CategoryPrivacyInfo) | undefined;
    onClose: () => void;
}) => {
    const isEditMode = !!category;

    const { t } = useLingui();

    const [dialogName, setDialogName] = useState(category?.name);
    const [dialogDefault, setDialogDefault] = useState(!!category?.default);
    const [dialogPrivate, setDialogPrivate] = useState(!!category?.isPrivate);
    const [dialogShowWhenLocked, setDialogShowWhenLocked] = useState(!!category?.showWhenLocked);

    const isInvalidName = dialogName !== undefined && !dialogName.trim().length;
    const canSubmit = dialogName !== undefined && !isInvalidName;

    const handleDialogSubmit = () => {
        assertIsDefined(dialogName);

        onClose();

        const privacyPatch = { isPrivate: dialogPrivate, showWhenLocked: dialogPrivate && dialogShowWhenLocked };
        const hasPrivacyChanged =
            dialogPrivate !== !!category?.isPrivate || privacyPatch.showWhenLocked !== !!category?.showWhenLocked;

        if (isEditMode) {
            requestManager
                .updateCategory(category.id, { name: dialogName, default: dialogDefault })
                .response.then(() =>
                    hasPrivacyChanged
                        ? requestManager.updateCategoryPrivacy(category.id, privacyPatch).response
                        : undefined,
                )
                .catch((e) => makeToast(t`Failed to save changes`, 'error', getErrorMessage(e)));

            return;
        }

        requestManager
            .createCategory({ name: dialogName, default: dialogDefault })
            .response.then((result) => {
                const createdCategoryId = result.data?.createCategory?.category.id;

                return hasPrivacyChanged && createdCategoryId !== undefined
                    ? requestManager.updateCategoryPrivacy(createdCategoryId, privacyPatch).response
                    : undefined;
            })
            .catch((e) => makeToast(t`Could not create category`, 'error', getErrorMessage(e)));
    };

    return (
        <Dialog open onClose={onClose}>
            <DialogTitle id="form-dialog-title">{isEditMode ? t`Edit category` : t`New category`}</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    label={t`Category Name`}
                    type="text"
                    fullWidth
                    value={dialogName ?? ''}
                    onChange={(e) => setDialogName(e.target.value.trim())}
                    error={isInvalidName}
                    helperText={isInvalidName ? t`Invalid input` : undefined}
                />
                <FormControlLabel
                    control={<Checkbox checked={dialogDefault} onChange={(e) => setDialogDefault(e.target.checked)} />}
                    label={t`Default category when adding new manga to the library`}
                />
                <FormControlLabel
                    control={<Checkbox checked={dialogPrivate} onChange={(e) => setDialogPrivate(e.target.checked)} />}
                    label={t`Private category (password protected, hidden from History and Updates)`}
                />
                {dialogPrivate && (
                    <FormControlLabel
                        sx={{ ml: 2 }}
                        control={
                            <Checkbox
                                checked={dialogShowWhenLocked}
                                onChange={(e) => setDialogShowWhenLocked(e.target.checked)}
                            />
                        }
                        label={t`Show the tab in the library while locked`}
                    />
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    {t`Cancel`}
                </Button>
                <Button onClick={handleDialogSubmit} color="primary" disabled={!canSubmit}>
                    {t`Submit`}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
