/**
 * Inventory Manager
 * Copyright (c) Hidekazu Kubota
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */

import {
  Box,
  BoxDoc,
  Item,
  LatestChangeFrom,
  SyncInfo,
  WorkState,
} from '../modules_common/store.types';

/**
 * Redux Action Types
 */

export interface ItemInitAction {
  type: 'item-init';
  payload: {
    [key: string]: Item;
  };
}

export interface ItemAddAction {
  type: 'item-add';
  payload: {
    _id: string;
    name: string;
  };
}

export interface ItemUpdateAction {
  type: 'item-update';
  payload: {
    _id: string;
    name?: string;
    takeout?: boolean;
    box?: string;
    modified_date?: string;
  };
}

export interface ItemInsertAction {
  type: 'item-insert';
  payload: Item;
}

export interface ItemReplaceAction {
  type: 'item-replace';
  payload: Item;
}

/**
 * payload: _id of item
 */
export interface ItemDeleteAction {
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

export interface BoxInitAction {
  type: 'box-init';
  payload: {
    [name: string]: Box;
  };
}

export interface BoxAddAction {
  type: 'box-add';
  payload: BoxDoc;
}
export interface BoxNameUpdateAction {
  type: 'box-name-update';
  payload: BoxDoc;
}

export interface BoxDeleteAction {
  type: 'box-delete';
  payload: string;
}

export interface BoxItemAddAction {
  type: 'box-item-add';
  payload: string;
}

export interface BoxItemDeleteAction {
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

export interface WorkInitAction {
  type: 'work-init';
  payload: WorkState;
}

export interface WorkCurrentBoxUpdateAction {
  type: 'work-current-box-update';
  payload: string;
}

export interface WorkSynchronizingUpdateAction {
  type: 'work-synchronizing-update';
  payload: boolean;
}

export interface WorkSyncInfoUpdateAction {
  type: 'work-sync-info-update';
  payload: SyncInfo | undefined;
}

export interface WorkLatestChangeFromUpdateAction {
  type: 'work-latest-change-from-update';
  payload: LatestChangeFrom;
}

export interface WorkItemAddedUpdateAction {
  type: 'work-item-added-update';
  payload: boolean;
}

export interface WorkItemDeletedUpdateAction {
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
