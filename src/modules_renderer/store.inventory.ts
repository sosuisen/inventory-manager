/**
 * Inventory Manager
 * Copyright (c) Hidekazu Kubota
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */
import { applyMiddleware, combineReducers, createStore } from 'redux';
import thunk from 'redux-thunk';
import { DatabaseCommand } from '../modules_common/types';

import {
  BOX_ADD,
  BOX_DELETE,
  BOX_ITEM_ADD,
  BOX_ITEM_DELETE,
  BOX_UPDATE,
  BoxAction,
  BoxState,
  initialBoxState,
  initialInventoryState,
  initialItemState,
  initialWorkState,
  InventoryState,
  ITEM_ADD,
  ITEM_DELETE,
  ITEM_UPDATE,
  ItemAction,
  ItemState,
  ObjectTypeState,
  ObjectTypeTable,
  WORK_CURRENT_BOX_ADD,
  WORK_CURRENT_BOX_UPDATE,
  WorkAction,
  WorkState,
} from './store.types.inventory';
import { getCurrentDateAndTime } from './utils';

const itemReducer = (
  // eslint-disable-next-line default-param-last
  state: ItemState = initialItemState,
  action: ItemAction
) => {
  switch (action.type) {
    case ITEM_ADD: {
      const newState = { ...state };
      const date = getCurrentDateAndTime();
      newState[action.payload._id] = {
        ...action.payload,
        created_date: date,
        modified_date: date,
        takeout: false,
      };
      return newState;
    }
    case ITEM_UPDATE: {
      const newState = { ...state };
      const date = getCurrentDateAndTime();
      newState[action.payload._id] = {
        ...newState[action.payload._id],
        modified_date: date,
        name: action.payload.name ?? newState[action.payload._id].name,
        takeout: action.payload.takeout ?? newState[action.payload._id].takeout,
      };
      return newState;
    }
    case ITEM_DELETE: {
      const newState = { ...state };
      delete newState[action.payload];
      return newState;
    }
    default:
      return state;
  }
};

const boxReducer = (
  // eslint-disable-next-line default-param-last
  state: BoxState = initialBoxState,
  action: BoxAction
) => {
  switch (action.type) {
    case BOX_ADD: {
      const newState = { ...state };
      const date = getCurrentDateAndTime();
      newState[action.payload._id] = {
        ...action.payload,
        created_date: date,
        modified_date: date,
        items: [],
      };
      return newState;
    }
    case BOX_UPDATE: {
      const newState = JSON.parse(JSON.stringify(state));
      const date = getCurrentDateAndTime();
      newState[action.payload._id] = {
        ...state[action.payload._id],
        ...action.payload,
        modified_date: date,
      };
      newState[action.payload._id].items = [...state[action.payload._id].items];

      return newState;
    }
    case BOX_DELETE: {
      const newState = JSON.parse(JSON.stringify(state));
      delete newState[action.payload];
      return newState;
    }
    case BOX_ITEM_ADD: {
      const newState = JSON.parse(JSON.stringify(state));
      const date = getCurrentDateAndTime();
      newState[action.payload.box_id].items = [
        ...state[action.payload.box_id].items,
        action.payload.item_id,
      ];
      newState[action.payload.box_id].modified_date = date;
      return newState;
    }
    case BOX_ITEM_DELETE: {
      const newState = JSON.parse(JSON.stringify(state));
      const date = getCurrentDateAndTime();
      newState[action.payload.box_id].items = newState[action.payload.box_id].items.filter(
        (id: string) => id !== action.payload.item_id
      );
      newState[action.payload.box_id].modified_date = date;
      return newState;
    }
    default:
      return state;
  }
};

const workReducer = (
  // eslint-disable-next-line default-param-last
  state: WorkState = initialWorkState,
  action: WorkAction
) => {
  switch (action.type) {
    case WORK_CURRENT_BOX_ADD:
    case WORK_CURRENT_BOX_UPDATE:
      return { ...state, currentBox: action.payload };
    default:
      return state;
  }
};

export const inventory = combineReducers({
  item: itemReducer,
  box: boxReducer,
  work: workReducer,
});

/**
 * Create store
 */

export const inventoryStore = createStore(inventory, applyMiddleware(thunk));

/**
 * Update persistent store
 */

const previousInventoryState: InventoryState = JSON.parse(
  JSON.stringify(initialInventoryState)
);

/**
 * Initializing
 */

// Inventory is deserialized from git-documentdb
export const initializeGlobalStore = (preferredLanguage: string) => {
  /*
  const loadOrCreate = (key: string) => {
    //    const value: any = electronStore.get(key, defaultValue);
    const value: any = '';

    inventoryStore.dispatch({
      type: key + '-add',
      payload: value,
    } as InventoryAction);
  };

  loadOrCreate('item');
  loadOrCreate('box');
  loadOrCreate('status');
  */
};
