/**
 * Inventory Manager
 * Copyright (c) Hidekazu Kubota
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */
import { combineReducers } from 'redux';
import { DatabaseCommand } from '../modules_common/types';
import window from './window';

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
 * Update persistent store
 */

const previousInventoryState: InventoryState = JSON.parse(
  JSON.stringify(initialInventoryState)
);

export const updatePersistentStore = (
  table: ObjectTypeTable,
  currentInventoryState: InventoryState
) => {
  const prev = previousInventoryState[table] as ObjectTypeState;
  const current = currentInventoryState[table] as ObjectTypeState;
  const prevKeys = Object.keys(prev);
  const currentKeys = Object.keys(current);
  if (currentKeys.length - prevKeys.length > 0) {
    // key is added
    const newKeys = currentKeys.filter(id => prev[id] === undefined);
    if (newKeys.length === 1) {
      const newKey = newKeys[0];
      const newObject = current[newKey];
      // put()
      const command: DatabaseCommand = {
        table: table,
        action: 'create',
        data: newObject,
      };
      window.api.db(command);
      console.log(`add: ${newObject.name}`);
      prev[newKey] = newObject;
    }
  }
  else if (currentKeys.length - prevKeys.length < 0) {
    // key is deleted
    const deletedKeys = prevKeys.filter(id => current[id] === undefined);
    if (deletedKeys.length === 1) {
      const deletedKey = deletedKeys[0];
      const deletedObject = prev[deletedKey];
      // delete()
      const command: DatabaseCommand = {
        table: table,
        action: 'delete',
        data: deletedObject._id,
      };
      window.api.db(command);
      console.log(`delete: ${table}#${deletedObject.name}`);
      delete prev[deletedKey];
    }
  }
  else {
    // Object is updated
    let updatedKey;
    for (const key of currentKeys) {
      if (JSON.stringify(current[key]) !== JSON.stringify(prev[key])) {
        updatedKey = key;
        break;
      }
    }
    // update()
    if (updatedKey !== undefined) {
      const command: DatabaseCommand = {
        table: table,
        action: 'update',
        data: current[updatedKey],
      };
      window.api.db(command);
      console.log(`update: ${table}#${current[updatedKey]._id}`);
      prev[updatedKey] = JSON.parse(JSON.stringify(current[updatedKey]));
    }
  }
};

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
