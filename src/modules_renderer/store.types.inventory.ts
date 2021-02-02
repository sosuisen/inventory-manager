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

export type ItemState = {
  [_id: string]: Item;
};

export type BoxState = {
  [_id: string]: Box;
};

export type WorkState = {
  _id: string;
  boxOrder: string[];
  currentBox: string;
};

export type InventoryState = {
  item: ItemState;
  box: BoxState;
  work: WorkState;
};
