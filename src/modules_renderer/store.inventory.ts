/**
 * Inventory Manager
 * Copyright (c) Hidekazu Kubota
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */
import { combineReducers, createStore } from 'redux';

import {
  Box,
  BOX_ADD,
  BOX_DELETE,
  BOX_ITEM_ADD,
  BOX_ITEM_DELETE,
  BOX_UPDATE,
  BoxAction,
  BoxState,
  initialBoxState,
  initialItemState,
  initialWorkState,
  ITEM_ADD,
  ITEM_DELETE,
  ITEM_UPDATE,
  ItemAction,
  ItemState,
  WORK_CURRENT_BOX_ADD,
  WORK_CURRENT_BOX_UPDATE,
  WorkAction,
  WorkState,
} from './store.types.inventory';

/**
 * Redux for individual settings
 * Individual settings are deserialized into Global Redux store.
 */

/**
 * Redux globalReducer
 * * The main process has a global store with globalReducer,
 * * while each renderer process has a local store with a localReducer such as SettingsDialogReducer.
 * * The state of the global store is proxied to the renderer processes.
 * * The state of the local store is used only in the renderer process.
 */

const getCurrentDateAndTime = (): string => {
  // Returns UTC date with 'YYYY-MM-DD HH:mm:ss' format
  return new Date().toISOString().replace(/^(.+?)T(.+?)\..+?$/, '$1 $2');
};

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
      const date = getCurrentDateAndTime();
      const newState: Box = {
        ...action.payload,
        created_date: date,
        modified_date: date,
        items: [],
      };
      return [...state, newState];
    }
    case BOX_UPDATE: {
      const date = getCurrentDateAndTime();
      return state.map(el =>
        el._id === action.payload._id
          ? {
            ...el,
            ...action.payload,
            modified_date: date,
          }
          : el
      );
    }
    case BOX_DELETE:
      return state.filter(el => el._id !== action.payload);
    case BOX_ITEM_ADD: {
      const date = getCurrentDateAndTime();
      return state.map(el =>
        el._id === action.payload.box_id
          ? {
            ...el,
            items: [...el.items, action.payload.item_id],
            modified_date: date,
          }
          : el
      );
    }
    case BOX_ITEM_DELETE: {
      const date = getCurrentDateAndTime();
      return state.map(el =>
        el._id === action.payload.box_id
          ? {
            ...el,
            items: el.items.filter(id => id !== action.payload.item_id),
            modified_date: date,
          }
          : el
      );
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
 * Global Redux Store
 */

const inventoryStore = createStore(inventory);

/**
 * Add electron-store as as subscriber
 */
/*
let previousItemState = initialItemState;
let previousBoxState = initialBoxState;
inventoryStore.subscribe(() => {
  const currentState = inventoryStore.getState();
  const updateIfChanged = (key: any) => {
    const isChanged = () => {
      const prevValue = previousState[key];
      const currentValue = currentState[key];
      if (typeof prevValue === 'string' && typeof currentValue === 'string') {
        return prevValue !== currentValue;
      }
      else if (Array.isArray(prevValue) && Array.isArray(currentValue)) {
        return JSON.stringify(prevValue) !== JSON.stringify(currentValue);
      }
      else if (typeof prevValue === 'object' && typeof currentValue === 'object') {
        return JSON.stringify(prevValue) !== JSON.stringify(currentValue);
      }
      console.error(
        `Error in updateIfChanged: Cannot handle ${key} : ${typeof prevValue} and ${typeof currentValue}`
      );
    };
    if (isChanged()) {
      previousItemState = currentState;
      //      electronStore.set(key, currentState[key]);
      return true;
    }
    return false;
  };
  updateIfChanged('item');
  updateIfChanged('box');
  updateIfChanged('status');
});
*/

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

/**
 * Utilities
 */

// API for getting local settings
export const getInventory = () => {
  return inventoryStore.getState();
};
