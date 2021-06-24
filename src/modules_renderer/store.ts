/**
 * Inventory Manager
 * Copyright (c) Hidekazu Kubota
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */
import { applyMiddleware, combineReducers, createStore } from 'redux';
import thunk from 'redux-thunk';
import { BoxAction, InfoAction, ItemAction, SettingsAction, WorkAction } from './action';
import {
  BoxState,
  InfoState,
  ItemState,
  SettingsState,
  WorkState,
} from '../modules_common/store.types';
import { getBoxId, getCurrentDateAndTime } from '../modules_common/utils';
import { English } from '../modules_common/i18n';

// eslint-disable-next-line default-param-last, complexity
const itemReducer = (state: ItemState = {}, action: ItemAction) => {
  switch (action.type) {
    case 'item-init': {
      return JSON.parse(JSON.stringify(action.payload));
    }
    case 'item-add': {
      const newState = { ...state };
      newState[action.payload._id] = {
        ...action.payload,
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

// eslint-disable-next-line complexity, default-param-last
const boxReducer = (state: BoxState = {}, action: BoxAction): BoxState => {
  switch (action.type) {
    case 'box-init': {
      return JSON.parse(JSON.stringify(action.payload));
    }
    case 'box-add': {
      const newState = JSON.parse(JSON.stringify(state));
      if (newState[action.payload._id]) {
        newState[action.payload._id].name = action.payload.name;
        return newState;
      }

      newState[action.payload._id] = {
        _id: action.payload._id,
        name: action.payload.name,
        items: [],
      };
      return newState;
    }
    case 'box-name-update': {
      const newState = JSON.parse(JSON.stringify(state));
      if (!newState[action.payload._id]) {
        return newState;
      }
      newState[action.payload._id].name = action.payload.name;
      return newState;
    }
    case 'box-delete': {
      const newState = JSON.parse(JSON.stringify(state));
      delete newState[action.payload];
      return newState;
    }
    case 'box-item-add': {
      const newState = JSON.parse(JSON.stringify(state));
      const boxId = getBoxId(action.payload);
      if (boxId === undefined || !newState[boxId]) {
        return newState;
      }
      newState[boxId].items.push(action.payload);
      return newState;
    }
    case 'box-item-delete': {
      const newState = JSON.parse(JSON.stringify(state));
      const boxId = getBoxId(action.payload);
      if (boxId === undefined || !newState[boxId]) {
        return newState;
      }
      newState[boxId].items = newState[boxId].items.filter(
        (id: string) => id !== action.payload
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

const infoReducer = (
  // eslint-disable-next-line default-param-last
  state: InfoState = {
    messages: English,
    appinfo: {
      name: '',
      version: '',
      iconDataURL: '',
    },
  },
  action: InfoAction
) => {
  switch (action.type) {
    case 'info-init':
      return JSON.parse(JSON.stringify(action.payload));
    default:
      return state;
  }
};

const settingsReducer = (
  // eslint-disable-next-line default-param-last
  state: SettingsState = {
    _id: 'settings',
    language: 'en',
    dataStorePath: '',
    sync: {
      remoteUrl: '',
      connection: {
        type: 'github',
        personalAccessToken: '',
        private: true,
      },
      interval: 30000,
    },
  },
  action: SettingsAction
) => {
  switch (action.type) {
    case 'settings-init':
      return JSON.parse(JSON.stringify(action.payload));
    case 'settings-language-update': {
      const newState = JSON.parse(JSON.stringify(state));
      newState.language = action.payload;
      return newState;
    }
    case 'settings-sync-remote-url-update': {
      const newState = JSON.parse(JSON.stringify(state));
      newState.sync.remote_url = action.payload;
      return newState;
    }
    case 'settings-sync-personal-access-token-update': {
      const newState = JSON.parse(JSON.stringify(state));
      newState.sync.connection.personal_access_token = action.payload;
      return newState;
    }
    case 'settings-sync-interval-update': {
      const newState = JSON.parse(JSON.stringify(state));
      newState.sync.interval = action.payload;
      return newState;
    }
    default:
      return state;
  }
};

export const inventory = combineReducers({
  item: itemReducer,
  box: boxReducer,
  work: workReducer,
  info: infoReducer,
  settings: settingsReducer,
});

export const inventoryStore = createStore(inventory, applyMiddleware(thunk));
