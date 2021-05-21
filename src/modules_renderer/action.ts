/**
 * Inventory Manager
 * Copyright (c) Hidekazu Kubota
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */

import {
  Box,
  Item,
  LatestChangeFrom,
  SyncInfo,
  WorkState,
} from '../modules_common/store.types';

/**
 * Redux Action Types
 */
type ItemActionType =
  | 'item-init'
  | 'item-add'
  | 'item-update'
  | 'item-insert'
  | 'item-replace'
  | 'item-delete';
type BoxActionType =
  | 'box-init'
  | 'box-add'
  | 'box-name-update'
  | 'box-delete'
  | 'box-item-add'
  | 'box-item-delete';
type WorkActionType =
  | 'work-init'
  | 'work-current-box-update'
  | 'work-synchronizing-update'
  | 'work-sync-info-update'
  | 'work-latest-change-from-update'
  | 'work-item-added-update'
  | 'work-item-deleted-update';

export interface InventoryActionBase {
  type: ItemActionType | BoxActionType | WorkActionType;
  payload: any;
}

export interface ItemInitAction extends InventoryActionBase {
  type: 'item-init';
  payload: {
    [key: string]: Item;
  };
}

export interface ItemAddAction extends InventoryActionBase {
  type: 'item-add';
  payload: {
    _id: string;
    name: string;
  };
}

export interface ItemUpdateAction extends InventoryActionBase {
  type: 'item-update';
  payload: {
    _id: string;
    name?: string;
    takeout?: boolean;
    box?: string;
    modified_date?: string;
  };
}

export interface ItemInsertAction extends InventoryActionBase {
  type: 'item-insert';
  payload: Item;
}

export interface ItemReplaceAction extends InventoryActionBase {
  type: 'item-replace';
  payload: Item;
}

/**
 * payload: _id of item
 */
export interface ItemDeleteAction extends InventoryActionBase {
  type: 'item-delete';
  payload: string;
}

export type ItemAction =
  | ItemInitAction
  | ItemAddAction
  | ItemUpdateAction
  | ItemInsertAction
  | ItemReplaceAction
  | ItemDeleteAction;

export interface BoxInitAction extends InventoryActionBase {
  type: 'box-init';
  payload: {
    [name: string]: Box;
  };
}

export interface BoxAddAction extends InventoryActionBase {
  type: 'box-add';
  payload: {
    id: string;
    name: string;
  };
}
export interface BoxNameUpdateAction extends InventoryActionBase {
  type: 'box-name-update';
  payload: {
    id: string;
    name: string;
  };
}

export interface BoxDeleteAction extends InventoryActionBase {
  type: 'box-delete';
  payload: string;
}

export interface BoxItemAddAction extends InventoryActionBase {
  type: 'box-item-add';
  payload: string;
}

export interface BoxItemDeleteAction extends InventoryActionBase {
  type: 'box-item-delete';
  payload: string;
}

export type BoxAction =
  | BoxInitAction
  | BoxAddAction
  | BoxNameUpdateAction
  | BoxDeleteAction
  | BoxItemAddAction
  | BoxItemDeleteAction;

export interface WorkInitAction extends InventoryActionBase {
  type: 'work-init';
  payload: WorkState;
}

export interface WorkCurrentBoxUpdateAction extends InventoryActionBase {
  type: 'work-current-box-update';
  payload: string;
}

export interface WorkSynchronizingUpdateAction extends InventoryActionBase {
  type: 'work-synchronizing-update';
  payload: boolean;
}

export interface WorkSyncInfoUpdateAction extends InventoryActionBase {
  type: 'work-sync-info-update';
  payload: SyncInfo | undefined;
}

export interface WorkLatestChangeFromUpdateAction extends InventoryActionBase {
  type: 'work-latest-change-from-update';
  payload: LatestChangeFrom;
}

export interface WorkItemAddedUpdateAction extends InventoryActionBase {
  type: 'work-item-added-update';
  payload: boolean;
}

export interface WorkItemDeletedUpdateAction extends InventoryActionBase {
  type: 'work-item-deleted-update';
  payload: boolean;
}

export type WorkAction =
  | WorkInitAction
  | WorkCurrentBoxUpdateAction
  | WorkSynchronizingUpdateAction
  | WorkSyncInfoUpdateAction
  | WorkLatestChangeFromUpdateAction
  | WorkItemAddedUpdateAction
  | WorkItemDeletedUpdateAction;

export type InventoryAction = ItemAction | BoxAction | WorkAction;
