/**
 * Inventory Manager
 * Copyright (c) Hidekazu Kubota
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */
import { applyMiddleware, combineReducers, createStore } from 'redux';
import thunk from 'redux-thunk';
import { BoxAction, ItemAction, WorkAction } from './action';

import {
  BoxState,
  initialTemporalSettingsState,
  ItemState,
  TemporalSettingsAction,
  TemporalSettingsState,
  WorkState,
} from '../modules_common/store.types';
import { generateId, getCurrentDateAndTime } from '../modules_common/utils';

// eslint-disable-next-line default-param-last, complexity
const itemReducer = (state: ItemState = {}, action: ItemAction) => {
  switch (action.type) {
    case 'item-init': {
      return { ...action.payload };
    }
    case 'item-add': {
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
    case 'item-update': {
      const newState = { ...state };
      const date = action.payload.modified_date ?? getCurrentDateAndTime();
      newState[action.payload._id] = {
        ...newState[action.payload._id],
        modified_date: date,
        name: action.payload.name ?? newState[action.payload._id].name,
        takeout: action.payload.takeout ?? newState[action.payload._id].takeout,
      };
      return newState;
    }
    case 'item-insert': {
      const newState = { ...state };
      newState[action.payload._id] = {
        ...action.payload,
      };
      return newState;
    }
    case 'item-replace': {
      const newState = { ...state };
      newState[action.payload._id] = {
        ...action.payload,
      };
      return newState;
    }
    case 'item-delete': {
      const newState = { ...state };
      delete newState[action.payload];
      return newState;
    }
    default:
      return state;
  }
};

// eslint-disable-next-line default-param-last
const boxReducer = (state: BoxState = {}, action: BoxAction): BoxState => {
  switch (action.type) {
    case 'box-init': {
      return { ...action.payload };
    }
    case 'box-add': {
      const newState = { ...state };
      const id = action.payload.id ?? generateId();
      const name =
        action.payload.name ?? inventoryStore.getState().settings.messages.firstBoxName;
      newState[id] = {
        name: action.payload.name,
        items: [],
      };
      return newState;
    }
    case 'box-update': {
      const newState = JSON.parse(JSON.stringify(state));
      newState[action.payload.id] = {
        name: action.payload.name,
        items: [...state[action.payload.id].items],
      };
      return newState;
    }
    case 'box-delete': {
      const newState = JSON.parse(JSON.stringify(state));
      delete newState[action.payload];
      return newState;
    }
    case 'box-item-add': {
      const newState = JSON.parse(JSON.stringify(state));
      newState[action.payload.box_id].items.push(action.payload.item_id);
      return newState;
    }
    case 'box-item-delete': {
      const newState = JSON.parse(JSON.stringify(state));
      newState[action.payload.box_id] = newState[action.payload.box_id].filter(
        (id: string) => id !== action.payload.item_id
      );
      return newState;
    }
    default:
      return state;
  }
};

const workReducer = (
  // eslint-disable-next-line default-param-last
  state: WorkState = {
    currentBox: '',
    synchronizing: false,
    syncInfo: undefined,
    latestChangeFrom: 'local',
    itemAdded: false,
    itemDeleted: false,
  },
  action: WorkAction
) => {
  switch (action.type) {
    case 'work-current-box-update':
      return { ...state, currentBox: action.payload };
    case 'work-synchronizing-update':
      return {
        ...state,
        synchronizing: action.payload,
      };
    case 'work-sync-info-update':
      return {
        ...state,
        syncInfo: action.payload,
      };
    case 'work-latest-change-from-update':
      return {
        ...state,
        latestChangeFrom: action.payload,
      };
    case 'work-item-added-update':
      return {
        ...state,
        itemAdded: action.payload,
      };
    case 'work-item-deleted-update':
      return {
        ...state,
        itemDeleted: action.payload,
      };
    default:
      return state;
  }
};

const settingsReducer = (
  // eslint-disable-next-line default-param-last
  state: TemporalSettingsState = initialTemporalSettingsState,
  action: TemporalSettingsAction
) => {
  switch (action.type) {
    case 'appinfo-put':
      return { ...state, appinfo: action.payload };
    case 'messages-put':
      return { ...state, messages: action.payload };
    default:
      return state;
  }
};

export const inventory = combineReducers({
  item: itemReducer,
  box: boxReducer,
  work: workReducer,
  settings: settingsReducer,
});

export const inventoryStore = createStore(inventory, applyMiddleware(thunk));
