/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Label from '@mui/icons-material/Label';
import MoreHoriz from '@mui/icons-material/MoreHoriz';
import Refresh from '@mui/icons-material/Refresh';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Visibility from '@mui/icons-material/Visibility';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import React from 'react';
import { Link } from '@/lib/router';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { AwaitableComponent } from 'awaitable-component';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import { useLingui } from '@lingui/react/macro';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { CategorySelect } from '@/features/category/components/CategorySelect.tsx';
import { useMetadataServerSettings } from '@/features/settings/services/ServerSettingsMetadata.ts';
import { ThemeCreationDialog } from '@/features/theme/components/CreateThemeDialog.tsx';
import type {
    MangaIdInfo,
    MangaInLibraryInfo,
    MangaSourceIdInfo,
    MangaTitleInfo,
} from '@/features/manga/Manga.types.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';

type MangaVisibilityInfo = {
    hideFromHistory?: boolean;
    hideFromUpdates?: boolean;
};

interface IProps {
    manga: MangaIdInfo & MangaInLibraryInfo & MangaSourceIdInfo & MangaTitleInfo & MangaVisibilityInfo;
    onRefresh: () => any;
    refreshing: boolean;
}

export const MangaToolbarMenu = ({ manga, onRefresh, refreshing }: IProps) => {
    const { t } = useLingui();

    const theme = useTheme();
    const isLargeScreen = useMediaQuery(theme.breakpoints.up('sm'));
    const { settings } = useMetadataServerSettings();

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClose = () => {
        setAnchorEl(null);
    };

    const openCategorySelection = () => {
        AwaitableComponent.show(CategorySelect, { mangaId: manga.id });
    };

    // oxlint-disable-next-line unicorn/consistent-function-scoping
    const saveDynamicColorTheme = () => {
        AwaitableComponent.show(ThemeCreationDialog, {
            mode: 'save_dynamic',
        });
    };

    const hideFromHistory = manga.hideFromHistory ?? false;
    const hideFromUpdates = manga.hideFromUpdates ?? false;

    const toggleVisibility = (field: keyof MangaVisibilityInfo) => {
        requestManager
            .updateMangaVisibility(manga.id, {
                hideFromHistory: field === 'hideFromHistory' ? !hideFromHistory : hideFromHistory,
                hideFromUpdates: field === 'hideFromUpdates' ? !hideFromUpdates : hideFromUpdates,
            })
            .response.catch(defaultPromiseErrorHandler('MangaToolbarMenu::updateMangaVisibility'));
        handleClose();
    };

    const visibilityMenuItems = manga.inLibrary
        ? [
              <MenuItem key="hide-history" onClick={() => toggleVisibility('hideFromHistory')}>
                  <ListItemIcon>
                      {hideFromHistory ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
                  </ListItemIcon>
                  <ListItemText>{hideFromHistory ? t`Show in History` : t`Hide from History`}</ListItemText>
              </MenuItem>,
              <MenuItem key="hide-updates" onClick={() => toggleVisibility('hideFromUpdates')}>
                  <ListItemIcon>
                      {hideFromUpdates ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
                  </ListItemIcon>
                  <ListItemText>{hideFromUpdates ? t`Show in Updates` : t`Hide from Updates`}</ListItemText>
              </MenuItem>,
          ]
        : [];

    return (
        <>
            {isLargeScreen && (
                <>
                    <CustomTooltip title={t`Reload data from source`} disabled={refreshing}>
                        <IconButton
                            onClick={() => {
                                onRefresh();
                            }}
                            disabled={refreshing}
                            color="inherit"
                        >
                            <Refresh />
                        </IconButton>
                    </CustomTooltip>
                    {settings.mangaDynamicColorSchemes && (
                        <CustomTooltip title={t`Save dynamic color theme`}>
                            <IconButton onClick={saveDynamicColorTheme} color="inherit">
                                <ColorLensIcon />
                            </IconButton>
                        </CustomTooltip>
                    )}
                    {manga.inLibrary && (
                        <>
                            <CustomTooltip title={hideFromHistory ? t`Show in History` : t`Hide from History`}>
                                <IconButton onClick={() => toggleVisibility('hideFromHistory')} color="inherit">
                                    {hideFromHistory ? <Visibility /> : <VisibilityOff />}
                                </IconButton>
                            </CustomTooltip>
                            <CustomTooltip title={hideFromUpdates ? t`Show in Updates` : t`Hide from Updates`}>
                                <IconButton onClick={() => toggleVisibility('hideFromUpdates')} color="inherit">
                                    {hideFromUpdates ? <Visibility /> : <VisibilityOff />}
                                </IconButton>
                            </CustomTooltip>
                            <CustomTooltip title={t`Migrate`}>
                                <Link
                                    to={AppRoutes.migrate.children.singleMangaSearch.path(
                                        manga.sourceId,
                                        manga.id,
                                        manga.title,
                                    )}
                                    state={AppRoutes.migrate.children.singleMangaSearch.state({
                                        title: t`Migrate "${manga.title}"`,
                                        mode: 'migrate.select.single',
                                    })}
                                    style={{ textDecoration: 'none', color: 'inherit' }}
                                >
                                    <IconButton color="inherit">
                                        <SyncAltIcon />
                                    </IconButton>
                                </Link>
                            </CustomTooltip>
                            <CustomTooltip title={t`Edit manga categories`}>
                                <IconButton
                                    onClick={() => {
                                        openCategorySelection();
                                    }}
                                    color="inherit"
                                >
                                    <Label />
                                </IconButton>
                            </CustomTooltip>
                        </>
                    )}
                </>
            )}
            {!isLargeScreen && (
                <>
                    <IconButton
                        id="chaptersMenuButton"
                        aria-controls={open ? 'chaptersMenu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? 'true' : undefined}
                        onClick={(e) => setAnchorEl(e.currentTarget)}
                        color="inherit"
                    >
                        <MoreHoriz />
                    </IconButton>
                    <Menu
                        id="chaptersMenu"
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        slotProps={{
                            list: {
                                'aria-labelledby': 'chaptersMenuButton',
                            },
                        }}
                    >
                        <MenuItem
                            onClick={() => {
                                onRefresh();
                                handleClose();
                            }}
                            disabled={refreshing}
                        >
                            <ListItemIcon>
                                <Refresh fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>{t`Reload data from source`}</ListItemText>
                        </MenuItem>
                        {settings.mangaDynamicColorSchemes && (
                            <MenuItem onClick={saveDynamicColorTheme}>
                                <ListItemIcon>
                                    <ColorLensIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText>{t`Save dynamic color theme`}</ListItemText>
                            </MenuItem>
                        )}
                        {visibilityMenuItems}
                        {manga.inLibrary && [
                            <MenuItem
                                key="migrate"
                                component={Link}
                                to={AppRoutes.migrate.children.singleMangaSearch.path(
                                    manga.sourceId,
                                    manga.id,
                                    manga.title,
                                )}
                                state={AppRoutes.migrate.children.singleMangaSearch.state({
                                    title: t`Migrate "${manga.title}"`,
                                    mode: 'migrate.select.single',
                                })}
                                style={{ textDecoration: 'none', color: 'inherit' }}
                            >
                                <ListItemIcon>
                                    <SyncAltIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText>{t`Migrate`}</ListItemText>
                            </MenuItem>,
                            <MenuItem
                                key="categories"
                                onClick={() => {
                                    openCategorySelection();
                                    handleClose();
                                }}
                            >
                                <ListItemIcon>
                                    <Label fontSize="small" />
                                </ListItemIcon>
                                <ListItemText>{t`Edit manga categories`}</ListItemText>
                            </MenuItem>,
                        ]}
                    </Menu>
                </>
            )}
        </>
    );
};
