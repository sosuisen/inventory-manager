/**
 * Inventory Manager
 * Copyright (c) Hidekazu Kubota
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */
import path from 'path';
import Store from 'electron-store';
import { app, BrowserWindow, nativeImage } from 'electron';
import { combineReducers, createStore } from 'redux';
import { selectPreferredLanguage, translate } from 'typed-intl';
import {
  availableLanguages,
  defaultLanguage,
  English,
  Japanese,
  MessageLabel,
} from '../modules_common/i18n';
import { emitter } from './event';
import {
  dataDirName,
  initialPersistentSettingsState,
  PersistentSettingsAction,
  PersistentSettingsState,
  PersistentSettingsStateKeys,
} from './store.types.settings';
import {
  initialTemporalSettingsState,
  TemporalSettingsAction,
  TemporalSettingsState,
} from '../modules_common/store.types';

/**
 * i18n
 */
const translations = translate(English).supporting('ja', Japanese);

/**
 * Data store path
 * * '../../../../../../inventory_manager_data' is default path when using asar created by squirrels.windows.
 * * './inventory_manager_data' is default path when starting from command line (npm start).
 * * They can be distinguished by using app.isPackaged
 *
 * TODO: Default path for Mac / Linux is needed.
 */
const defaultDataDir = app.isPackaged
  ? path.join(__dirname, `../../../../../../${dataDirName}`)
  : path.join(__dirname, `../../${dataDirName}`);

const defaultStorage = {
  type: 'local',
  path: defaultDataDir,
};

/**
 * electron-store for individual settings (a.k.a local machine settings)
 *
 * * Individual settings are serialized into config.json
 * * It is saved to:
 * * app.isPackaged == true ? C:\Users\{UserName}\AppData\Roaming\Inventory Manager
 * *                        : Project root directory (/media_stickies)
 * TODO: config.json path for Mac / Linux is needed.
 */

const electronStore = new Store({
  cwd: app.isPackaged ? `./` : path.join(__dirname, '../../'),
});

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

/**
 * Persistent settings reducer
 * handle serializable settings
 */
const persistentSettings = (
  // eslint-disable-next-line default-param-last
  state: PersistentSettingsState = initialPersistentSettingsState,
  action: PersistentSettingsAction
) => {
  if (action.type === 'storage-put') {
    return { ...state, storage: action.payload };
  }
  else if (action.type === 'language-put') {
    return {
      ...state,
      language: action.payload,
    };
  }
  return state;
};

/**
 * Temporal settings reducer
 * handle temporal settings
 */
const temporalSettings = (
  // eslint-disable-next-line default-param-last
  state: TemporalSettingsState = initialTemporalSettingsState,
  action: TemporalSettingsAction
) => {
  if (action.type === 'messages-put') {
    return {
      ...state,
      messages: action.payload,
    };
  }
  else if (action.type === 'appinfo-put') {
    // App info
    return {
      ...state,
      app: action.payload,
    };
  }
  return state;
};

const settingsGlobalReducer = combineReducers({
  persistentSettings,
  temporalSettings,
});

/**
 * Global Redux Store
 */

export const settingsStore = createStore(settingsGlobalReducer);

/**
 * Add electron-store as as subscriber
 */
let previousState = initialPersistentSettingsState;
settingsStore.subscribe(() => {
  const currentState = settingsStore.getState().persistentSettings;
  const updateIfChanged = (key: PersistentSettingsStateKeys) => {
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
      electronStore.set(key, currentState[key]);
      return true;
    }
    return false;
  };
  updateIfChanged('storage');
  if (updateIfChanged('language')) {
    selectPreferredLanguage(availableLanguages, [
      settingsStore.getState().persistentSettings.language,
      defaultLanguage,
    ]);
    settingsStore.dispatch({ type: 'messages-put', payload: translations.messages() });
  }
});

/**
 * Add Renderer process as a subscriber
 */
export const subscribeSettingsStore = (subscriber: BrowserWindow) => {
  const unsubscribe = settingsStore.subscribe(() => {
    emitter.emit('updateTrayContextMenu');
    subscriber.webContents.send('globalStoreChanged', settingsStore.getState());
  });
  return unsubscribe;
};

/**
 * Initializing
 */
// Temporal settings

const dataURL = nativeImage
  .createFromPath(path.resolve(__dirname, '../../assets/inventory_manager_icon.ico'))
  .toDataURL();
const appName = app.getName();
const appVersion = app.getVersion();

settingsStore.dispatch({
  type: 'appinfo-put',
  payload: { name: appName, version: appVersion, iconDataURL: dataURL },
});

// Persistent settings are deserialized from electron-store
export const initializeGlobalStore = (preferredLanguage: string) => {
  const loadOrCreate = (key: string, defaultValue: any) => {
    const value: any = electronStore.get(key, defaultValue);
    settingsStore.dispatch({
      type: key + '-put',
      payload: value,
    } as PersistentSettingsAction);
  };

  loadOrCreate('storage', defaultStorage);
  loadOrCreate('language', preferredLanguage);
};

/**
 * Utilities
 */

// API for getting local settings
export const getSettings = () => {
  return settingsStore.getState();
};

// API for globalDispatch
export const globalDispatch = (action: PersistentSettingsAction) => {
  settingsStore.dispatch(action);
};

// Utility for i18n
export const MESSAGE = (label: MessageLabel, ...args: string[]) => {
  let message: string = getSettings().temporalSettings.messages[label];
  if (args) {
    args.forEach((replacement, index) => {
      const variable = '$' + (index + 1); // $1, $2, ...
      message = message.replace(variable, replacement);
    });
  }
  return message;
};
