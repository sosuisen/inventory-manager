/**
 * Inventory Manager
 * Copyright (c) Hidekazu Kubota
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */

import {
  initialTemporalSettingsState,
  TemporalSettingsState,
} from '../modules_common/store.types';

export const dataDirName = 'inventory_manager_data';

/**
 * Redux State
 * ! A key of the PersistentSettingsState (that is deserialized data) must be same as
 * ! a key of the electron-store (that is serialized data)
 */

/**
 * Settings using electron-store
 */
export interface PersistentSettingsState {
  storage: {
    type: string;
    path: string;
  };
  language: string;
}
export interface SettingsState {
  persistent: PersistentSettingsState; // serialized to storage
  temporal: TemporalSettingsState; // not serialized
}
export type PersistentSettingsStateKeys = keyof PersistentSettingsState;

/**
 * Redux Actions
 * ! 'type' for PersistentSettingsAction must be key of serialized data + '-put/-delete'
 */

export type StoragePutAction = {
  type: 'storage-put';
  payload: { type: string; path: string };
};

export type LanguagePutAction = {
  type: 'language-put';
  payload: string;
};

export type PersistentSettingsAction = StoragePutAction | LanguagePutAction;

export const initialPersistentSettingsState: PersistentSettingsState = {
  storage: {
    type: '',
    path: '',
  },
  language: '',
};

export const initialSettingsState: SettingsState = {
  persistent: initialPersistentSettingsState,
  temporal: initialTemporalSettingsState,
};
