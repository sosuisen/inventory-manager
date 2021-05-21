/**
 * Inventory Manager
 * Copyright (c) Hidekazu Kubota
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */

import { Box, BoxDoc, Item } from './store.types';

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

export type DatabaseSync = {
  command: 'db-sync';
};

export type DatabaseCommand =
  | DatabaseBoxAdd
  | DatabaseBoxNameUpdate
  | DatabaseBoxDelete
  | DatabaseItemAdd
  | DatabaseItemDelete
  | DatabaseItemUpdate
  | DatabaseSync;
