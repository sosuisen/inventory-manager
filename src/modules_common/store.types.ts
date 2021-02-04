/**
 * Inventory Manager
 * Copyright (c) Hidekazu Kubota
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */

import { English, Messages } from './i18n';

export interface AppInfo {
  name: string;
  version: string;
  iconDataURL: string;
}

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

export type ItemState = {
  [_id: string]: Item;
};

export type BoxState = {
  [_id: string]: Box;
};

export type WorkState = {
  _id: string;
  boxOrder: string[];
  currentBox: string;
};

export type MessagesPutAction = {
  type: 'messages-put';
  payload: Messages;
};

export type AppPutAction = {
  type: 'appinfo-put';
  payload: {
    name: string;
    version: string;
    iconDataURL: string;
  };
};

export type TemporalSettingsAction = MessagesPutAction | AppPutAction;

export interface TemporalSettingsState {
  messages: Messages; // It is set and updated when 'settings.language' is changed.
  appinfo: {
    name: string;
    version: string;
    iconDataURL: string;
  };
}

export const initialTemporalSettingsState: TemporalSettingsState = {
  messages: English,
  appinfo: {
    name: '',
    version: '',
    iconDataURL: '',
  },
};

export type InventoryState = {
  item: ItemState;
  box: BoxState;
  work: WorkState;
  settings: TemporalSettingsState;
};
