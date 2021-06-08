/**
 * Inventory Manager
 * Copyright (c) Hidekazu Kubota
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */

import { BoxDoc, Item } from './store.types';

/**
 * Action to Database
 */

export type DatabaseBoxAdd = {
  command: 'db-box-add';
  data: BoxDoc;
};

export type DatabaseBoxNameUpdate = {
  command: 'db-box-name-update';
  data: BoxDoc;
};

export type DatabaseBoxDelete = {
  command: 'db-box-delete';
  data: string;
};

export type DatabaseBoxDeleteRevert = {
  command: 'db-box-delete-revert';
  data: string;
};

export type DatabaseItemAdd = {
  command: 'db-item-add';
  data: Item;
};

export type DatabaseItemDelete = {
  command: 'db-item-delete';
  data: string;
};

export type DatabaseItemUpdate = {
  command: 'db-item-update';
  data: Item;
};

export type DatabaseExecSync = {
  command: 'db-exec-sync';
};

export type DatabaseSyncRemoteUrlUpdate = {
  command: 'db-sync-remote-url-update';
  data: string;
};

export type DatabaseSyncPersonalAccessTokenUpdate = {
  command: 'db-sync-personal-access-token-update';
  data: string;
};

export type DatabaseSyncIntervalUpdate = {
  command: 'db-sync-interval-update';
  data: number;
};

export type DatabaseTestSync = {
  command: 'db-test-sync';
};

export type DatabasePauseSync = {
  command: 'db-pause-sync';
};

export type DatabaseResumeSync = {
  command: 'db-resume-sync';
};

export type DatabaseLanguageUpdate = {
  command: 'db-language-update';
  data: string;
};

export type DatabaseCommand =
  | DatabaseBoxAdd
  | DatabaseBoxNameUpdate
  | DatabaseBoxDelete
  | DatabaseBoxDeleteRevert
  | DatabaseItemAdd
  | DatabaseItemDelete
  | DatabaseItemUpdate
  | DatabaseExecSync
  | DatabaseSyncRemoteUrlUpdate
  | DatabaseSyncPersonalAccessTokenUpdate
  | DatabaseSyncIntervalUpdate
  | DatabaseTestSync
  | DatabasePauseSync
  | DatabaseResumeSync
  | DatabaseLanguageUpdate;
