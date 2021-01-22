/**
 * Inventory Manager
 * Copyright (c) Hidekazu Kubota
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */
import { BrowserWindow, ipcMain } from 'electron';
import { createStore } from 'redux';

import {
  BOX_ADD,
  BOX_DELETE,
  BOX_UPDATE,
  initialInventoryState,
  InventoryAction,
  InventoryState,
  InventoryStateKeys,
  ITEM_ADD,
  ITEM_DELETE,
  ITEM_UPDATE,
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

const inventory = (
  // eslint-disable-next-line default-param-last
  state: InventoryState = initialInventoryState,
  action: InventoryAction
) => {
  switch (action.type) {
    case ITEM_ADD:
      return { ...state, item: [...state.item, action.payload] };
    case ITEM_UPDATE:
      return {
        ...state,
        item: state.item.map(el => (el._id === action.payload._id ? action.payload : el)),
      };
    case ITEM_DELETE:
      return {
        ...state,
        item: state.item.filter(el => el._id !== action.payload),
      };
    case BOX_ADD:
      return { ...state, box: [...state.box, action.payload] };
    case BOX_UPDATE:
      return {
        ...state,
        box: state.box.map(el => (el._id === action.payload._id ? action.payload : el)),
      };
    case BOX_DELETE:
      return {
        ...state,
        box: state.box.filter(el => el._id !== action.payload),
      };
    default:
      return state;
  }
};

/**
 * Global Redux Store
 */

const inventoryStore = createStore(inventory, initialInventoryState);

/**
 * Redux Dispatches
 */

// Dispatch request from Renderer process
ipcMain.handle('inventory-global-dispatch', (event, action: InventoryAction) => {
  inventoryStore.dispatch(action);
});

/**
 * Add electron-store as as subscriber
 */
let previousState = initialInventoryState;
inventoryStore.subscribe(() => {
  const currentState = inventoryStore.getState();
  const updateIfChanged = (key: InventoryStateKeys) => {
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
      previousState = currentState;
      //      electronStore.set(key, currentState[key]);
      return true;
    }
    return false;
  };
  updateIfChanged('item');
  updateIfChanged('box');
});

/**
 * Add Renderer process as a subscriber
 */
export const subscribeStoreFromRenderer = (subscriber: BrowserWindow) => {
  subscriber.webContents.send('inventoryGlobalStoreChanged', inventoryStore.getState());
  const unsubscribe = inventoryStore.subscribe(() => {
    subscriber.webContents.send('inventoryGlobalStoreChanged', inventoryStore.getState());
  });
  return unsubscribe;
};

/**
 * Initializing
 */

// Inventory is deserialized from git-documentdb
export const initializeGlobalStore = (preferredLanguage: string) => {
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
};

/**
 * Utilities
 */

// API for getting local settings
export const getInventory = () => {
  return inventoryStore.getState();
};

// API for globalDispatch
export const inventoryGlobalDispatch = (action: InventoryAction) => {
  inventoryStore.dispatch(action);
};
