/**
 * Inventory Manager
 * Copyright (c) Hidekazu Kubota
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * Action to Database
 */
export type DatabaseCommand = {
  action:
    | 'db-item-add'
    | 'db-item-update'
    | 'db-item-delete'
    | 'db-box-add'
    | 'db-box-delete'
    | 'db-box-name-update'
    | 'db-sync';
  data: any;
};
