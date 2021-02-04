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
import { getCurrentDateAndTime } from './utils';

// eslint-disable-next-line default-param-last
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
      const date = getCurrentDateAndTime();
      newState[action.payload._id] = {
        ...newState[action.payload._id],
        modified_date: date,
        name: action.payload.name ?? newState[action.payload._id].name,
        takeout: action.payload.takeout ?? newState[action.payload._id].takeout,
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
const boxReducer = (state: BoxState = {}, action: BoxAction) => {
  switch (action.type) {
    case 'box-init': {
      return { ...action.payload };
    }
    case 'box-add': {
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
    case 'box-update': {
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
    case 'box-delete': {
      const newState = JSON.parse(JSON.stringify(state));
      delete newState[action.payload];
      return newState;
    }
    case 'box-item-add': {
      const newState = JSON.parse(JSON.stringify(state));
      const date = getCurrentDateAndTime();
      newState[action.payload.box_id].items = [
        ...state[action.payload.box_id].items,
        action.payload.item_id,
      ];
      newState[action.payload.box_id].modified_date = date;
      return newState;
    }
    case 'box-item-delete': {
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
  state: WorkState = { _id: '', boxOrder: [], currentBox: '' },
  action: WorkAction
) => {
  switch (action.type) {
    case 'work-init':
      return { ...action.payload, boxOrder: [...action.payload.boxOrder] };
    case 'work-box-order-add':
      return { ...state, boxOrder: [...state.boxOrder, action.payload] };
    case 'work-box-order-delete':
      return { ...state, boxOrder: state.boxOrder.filter(id => id !== action.payload) };
    case 'work-current-box-add':
    case 'work-current-box-update':
      return { ...state, currentBox: action.payload };
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