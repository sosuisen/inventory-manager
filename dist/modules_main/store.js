"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MESSAGE = exports.globalDispatch = exports.getSettings = exports.initializeGlobalStore = exports.subscribeStoreFromSettings = void 0;
/**
 * @license Media Stickies
 * Copyright (c) Hidekazu Kubota
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */
const path_1 = __importDefault(require("path"));
const electron_store_1 = __importDefault(require("electron-store"));
const electron_1 = require("electron");
const redux_1 = require("redux");
const typed_intl_1 = require("typed-intl");
const i18n_1 = require("../modules_common/i18n");
const event_1 = require("./event");
const store_types_1 = require("./store.types");
/**
 * i18n
 */
const translations = typed_intl_1.translate(i18n_1.English).supporting('ja', i18n_1.Japanese);
/**
 * Media stickies data store path
 * * '../../../../../../media_stickies_data' is default path when using asar created by squirrels.windows.
 * * './media_stickies_data' is default path when starting from command line (npm start).
 * * They can be distinguished by using app.isPackaged
 *
 * TODO: Default path for Mac / Linux is needed.
 */
const defaultDataDir = electron_1.app.isPackaged
    ? path_1.default.join(__dirname, `../../../../../../${store_types_1.dataDirName}`)
    : path_1.default.join(__dirname, `../../${store_types_1.dataDirName}`);
const defaultStorage = {
    type: 'local',
    path: defaultDataDir,
};
/**
 * electron-store for individual settings (a.k.a local machine settings)
 *
 * * Individual settings are serialized into config.json
 * * It is saved to:
 * * app.isPackaged == true ? C:\Users\{UserName}\AppData\Roaming\Media Stickies
 * *                        : Project root directory (/media_stickies)
 * TODO: config.json path for Mac / Linux is needed.
 */
const electronStore = new electron_store_1.default({
    cwd: electron_1.app.isPackaged ? './' : path_1.default.join(__dirname, '../../'),
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
 * persistent reducer
 * operates serializable states
 */
const persistent = (
// eslint-disable-next-line default-param-last
state = store_types_1.initialPersistentSettingsState, action) => {
    if (action.type === 'storage-put') {
        return Object.assign(Object.assign({}, state), { storage: action.payload });
    }
    else if (action.type === 'language-put') {
        return Object.assign(Object.assign({}, state), { language: action.payload });
    }
    return state;
};
/**
 * temporal reducer
 * operates temporal states
 */
const temporal = (
// eslint-disable-next-line default-param-last
state = store_types_1.initialTemporalSettingsState, action) => {
    if (action.type === 'messages-put') {
        return Object.assign(Object.assign({}, state), { messages: action.payload });
    }
    else if (action.type === 'app-put') {
        return Object.assign(Object.assign({}, state), { app: action.payload });
    }
    return state;
};
const globalReducer = redux_1.combineReducers({
    persistent,
    temporal,
});
/**
 * Global Redux Store
 */
const store = redux_1.createStore(globalReducer);
/**
 * Redux Dispatches
 */
// Dispatch request from Renderer process
electron_1.ipcMain.handle('global-dispatch', (event, action) => {
    store.dispatch(action);
});
/**
 * Add electron-store as as subscriber
 */
let previousState = store_types_1.initialPersistentSettingsState;
store.subscribe(() => {
    const currentState = store.getState().persistent;
    const updateIfChanged = (key) => {
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
            console.error(`Error in updateIfChanged: Cannot handle ${key} : ${typeof prevValue} and ${typeof currentValue}`);
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
        typed_intl_1.selectPreferredLanguage(i18n_1.availableLanguages, [
            store.getState().persistent.language,
            i18n_1.defaultLanguage,
        ]);
        store.dispatch({ type: 'messages-put', payload: translations.messages() });
    }
});
/**
 * Add Renderer process as a subscriber
 */
exports.subscribeStoreFromSettings = (subscriber) => {
    subscriber.webContents.send('globalStoreChanged', store.getState());
    const unsubscribe = store.subscribe(() => {
        event_1.emitter.emit('updateTrayContextMenu');
        subscriber.webContents.send('globalStoreChanged', store.getState());
    });
    return unsubscribe;
};
/**
 * Initializing
 */
// Temporal settings
/*
app
  .getFileIcon(path.join(__dirname, '../assets/media_stickies_grad_icon.ico'))
  .then(img => {
    const appName = app.getName();
    const appVersion = app.getVersion();
    const dataURL = img.toDataURL();
    store.dispatch({
      type: 'app-put',
      payload: { name: appName, version: appVersion, iconDataURL: dataURL },
    });
  })
  .catch(e => console.error(e));
*/
// Persistent settings are deserialized from electron-store
exports.initializeGlobalStore = (preferredLanguage) => {
    const loadOrCreate = (key, defaultValue) => {
        const value = electronStore.get(key, defaultValue);
        store.dispatch({
            type: key + '-put',
            payload: value,
        });
    };
    loadOrCreate('storage', defaultStorage);
    loadOrCreate('language', preferredLanguage);
};
/**
 * Utilities
 */
// API for getting local settings
exports.getSettings = () => {
    return store.getState();
};
// API for globalDispatch
exports.globalDispatch = (action) => {
    store.dispatch(action);
};
// Utility for i18n
exports.MESSAGE = (label, ...args) => {
    let message = exports.getSettings().temporal.messages[label];
    if (args) {
        args.forEach((replacement, index) => {
            const variable = '$' + (index + 1); // $1, $2, ...
            message = message.replace(variable, replacement);
        });
    }
    return message;
};
