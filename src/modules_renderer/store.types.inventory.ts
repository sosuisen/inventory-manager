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
  boxOrder: string[];
  currentBox: string;
};

export type ObjectTypeState = ItemState | BoxState;
export type ObjectTypeTable = 'item' | 'box';

export type InventoryState = {
  item: ItemState;
  box: BoxState;
  work: WorkState;
};

/**
 * Redux Actions
 */

export const ITEM_ADD = 'item-add';
export const ITEM_UPDATE = 'item-update';
export const ITEM_DELETE = 'item-delete';
export const BOX_ADD = 'box-add';
export const BOX_UPDATE = 'box-update';
export const BOX_DELETE = 'box-delete';
export const BOX_ITEM_ADD = 'box-item-add';
export const BOX_ITEM_DELETE = 'box-item-delete';
export const WORK_CURRENT_BOX_ADD = 'work-current-box-status-add'; // NOTE: Adding status-current-box-status is same as updating it.
export const WORK_CURRENT_BOX_UPDATE = 'work-current-box-status-update';

export type ItemAddAction = {
  type: typeof ITEM_ADD;
  payload: {
    _id: string;
    name: string;
  };
};

export type ItemUpdateAction = {
  type: typeof ITEM_UPDATE;
  payload: {
    _id: string;
    name?: string;
    takeout?: boolean;
  };
};

export type ItemDeleteAction = {
  type: typeof ITEM_DELETE;
  payload: string;
};

export type BoxAddAction = {
  type: typeof BOX_ADD;
  payload: {
    _id: string;
    name: string;
  };
};

export type BoxUpdateAction = {
  type: typeof BOX_UPDATE;
  payload: {
    _id: string;
    name: string;
  };
};

export type BoxDeleteAction = {
  type: typeof BOX_DELETE;
  payload: string;
};

export type BoxItemAddAction = {
  type: typeof BOX_ITEM_ADD;
  payload: {
    box_id: string;
    item_id: string;
  };
};

export type BoxItemDeleteAction = {
  type: typeof BOX_ITEM_DELETE;
  payload: {
    box_id: string;
    item_id: string;
  };
};

export type WorkCurrentBoxAddAction = {
  type: typeof WORK_CURRENT_BOX_ADD;
  payload: string;
};

export type WorkCurrentBoxUpdateAction = {
  type: typeof WORK_CURRENT_BOX_UPDATE;
  payload: string;
};

export type ItemAction = ItemAddAction | ItemUpdateAction | ItemDeleteAction;

export type BoxAction =
  | BoxAddAction
  | BoxUpdateAction
  | BoxDeleteAction
  | BoxItemAddAction
  | BoxItemDeleteAction;

export type WorkAction = WorkCurrentBoxAddAction | WorkCurrentBoxUpdateAction;

export type InventoryAction = ItemAction | BoxAction | WorkAction;

export const initialItemState: ItemState = {
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
};
export const initialBoxState: BoxState = {
  '1': {
    _id: '1',
    name: 'submember',
    created_date: '2020-01-01 00:00:00',
    modified_date: '2020-01-01 00:00:00',
    items: ['1', '2'],
  },
  '2': {
    _id: '2',
    name: 'member',
    created_date: '2020-01-01 00:00:00',
    modified_date: '2020-01-01 00:00:00',
    items: ['10'],
  },
};
export const initialWorkState: WorkState = {
  boxOrder: ['1', '2'],
  currentBox: '1',
};

export const initialInventoryState = {
  item: initialItemState,
  box: initialBoxState,
  work: initialWorkState,
};
