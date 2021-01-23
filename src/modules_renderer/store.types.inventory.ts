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

export interface Status {
  currentBox: string;
}

/**
 * Redux State
 */

export interface InventoryState {
  item: {
    [_id: string]: Item;
  };
  box: Box[];
  status: Status;
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
export const STATUS_CURRENT_BOX_ADD = 'status-current-box-status-add'; // NOTE: Adding status-current-box-status is same as updating it.
export const STATUS_CURRENT_BOX_UPDATE = 'status-current-box-status-update';

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

export type StatusCurrentBoxAddAction = {
  type: typeof STATUS_CURRENT_BOX_ADD;
  payload: string;
};

export type StatusCurrentBoxUpdateAction = {
  type: typeof STATUS_CURRENT_BOX_UPDATE;
  payload: string;
};

export type InventoryAction =
  | ItemAddAction
  | ItemUpdateAction
  | ItemDeleteAction
  | BoxAddAction
  | BoxUpdateAction
  | BoxDeleteAction
  | StatusCurrentBoxAddAction
  | StatusCurrentBoxUpdateAction;

export const initialInventoryState: InventoryState = {
  item: {
    '1': {
      _id: '1',
      name: 'kimari',
      takeout: false,
      created_date: '2020-01-01 00:00:00',
      modified_date: '2020-01-01 00:00:00',
    },
    '2': {
      _id: '2',
      name: 'shirase',
      takeout: false,
      created_date: '2020-01-01 00:00:00',
      modified_date: '2020-01-01 00:00:00',
    },
    '10': {
      _id: '10',
      name: 'gin',
      takeout: false,
      created_date: '2020-01-01 00:00:00',
      modified_date: '2020-01-01 00:00:00',
    },
  },
  box: [
    {
      _id: '1',
      name: 'doukou',
      created_date: '2020-01-01 00:00:00',
      modified_date: '2020-01-01 00:00:00',
      items: ['1', '2'],
    },
    {
      _id: '2',
      name: 'member',
      created_date: '2020-01-01 00:00:00',
      modified_date: '2020-01-01 00:00:00',
      items: ['10'],
    },
  ],
  status: {
    currentBox: '1',
  },
};
