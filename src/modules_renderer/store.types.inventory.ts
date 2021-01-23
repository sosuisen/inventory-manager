/**
 * Inventory Manager
 * Copyright (c) Hidekazu Kubota
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */

export interface Item {
  _id: string;
  name: string;
  takeout: boolean;
  created_date: string;
  modified_date: string;
}

export interface Box {
  _id: string;
  name: string;
  items: string[];
  created_date: string;
  modified_date: string;
}

/**
 * Redux State
 */

export interface InventoryState {
  item: Item[];
  box: Box[];
}

export type InventoryStateKeys = keyof InventoryState;

/**
 * Redux Actions
 * ! 'type' for PersistentSettingsAction must be key of serialized data + '-add/-update/-delete'
 */

export const ITEM_ADD = 'item-add';
export const ITEM_UPDATE = 'item-update';
export const ITEM_DELETE = 'item-delete';
export const BOX_ADD = 'box-add';
export const BOX_UPDATE = 'box-update';
export const BOX_DELETE = 'box-delete';

export type ItemAddAction = {
  type: typeof ITEM_ADD;
  payload: Item;
};

export type ItemUpdateAction = {
  type: typeof ITEM_UPDATE;
  payload: Item;
};

export type ItemDeleteAction = {
  type: typeof ITEM_DELETE;
  payload: string;
};

export type BoxAddAction = {
  type: typeof BOX_ADD;
  payload: Box;
};

export type BoxUpdateAction = {
  type: typeof BOX_UPDATE;
  payload: Box;
};

export type BoxDeleteAction = {
  type: typeof BOX_DELETE;
  payload: string;
};

export type InventoryAction =
  | ItemAddAction
  | ItemUpdateAction
  | ItemDeleteAction
  | BoxAddAction
  | BoxUpdateAction
  | BoxDeleteAction;

export const initialInventoryState: InventoryState = {
  item: [],
  box: [],
};
