/**
 * Inventory Manager
 * Copyright (c) Hidekazu Kubota
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */
import { applyMiddleware, combineReducers, createStore } from 'redux';
import thunk from 'redux-thunk';

import {
  BOX_ADD,
  BOX_DELETE,
  BOX_INIT,
  BOX_ITEM_ADD,
  BOX_ITEM_DELETE,
  BOX_UPDATE,
  BoxAction,
  BoxState,
  initialWorkState,
  ITEM_ADD,
  ITEM_DELETE,
  ITEM_INIT,
  ITEM_UPDATE,
  ItemAction,
  ItemState,
  WORK_CURRENT_BOX_ADD,
  WORK_CURRENT_BOX_UPDATE,
  WorkAction,
  WorkState,
} from './store.types.inventory';
import { getCurrentDateAndTime } from './utils';

// eslint-disable-next-line default-param-last
const itemReducer = (state: ItemState = {}, action: ItemAction) => {
  switch (action.type) {
    case ITEM_INIT: {
      return { ...action.payload };
    }
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

// eslint-disable-next-line default-param-last
const boxReducer = (state: BoxState = {}, action: BoxAction) => {
  switch (action.type) {
    case BOX_INIT: {
      return { ...action.payload };
    }
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

export const inventoryStore = createStore(inventory, applyMiddleware(thunk));
