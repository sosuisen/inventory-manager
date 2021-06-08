/**
 * Inventory Manager
 * Copyright (c) Hidekazu Kubota
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */

import * as path from 'path';
import { app, BrowserWindow, dialog, ipcMain, nativeImage, shell } from 'electron';
import {
  ChangedFile,
  Collection,
  DuplicatedFile,
  GitDocumentDB,
  RemoteOptions,
  Sync,
  TaskMetadata,
} from 'git-documentdb';
import { selectPreferredLanguage, translate } from 'typed-intl';
import {
  availableLanguages,
  defaultLanguage,
  English,
  Japanese,
  MessageLabel,
} from './modules_common/i18n';
import { DatabaseCommand } from './modules_common/db.types';
import { Box, InfoState, Item, SettingsState } from './modules_common/store.types';
import { generateId, getBoxId } from './modules_common/utils';

export const dataDirName = 'inventory_manager_data';

let inventoryDB: GitDocumentDB;
let settingsDB: GitDocumentDB;

/**
 * Default data directory
 *
 * settingsDB is created in defaultDataDir.
 * inventoryDB is created in settings.dataStorePath. (Default is defaultDataDir.)
 *
 * - '../../../../../../inventory_manager_data' is default path when using asar created by squirrels.windows.
 * - './inventory_manager_data' is default path when starting from command line (npm start).
 * - They can be distinguished by using app.isPackaged
 *
 * TODO: Default path for Mac / Linux is needed.
 */
const defaultDataDir = app.isPackaged
  ? path.join(__dirname, `../../../../../${dataDirName}`)
  : path.join(__dirname, `../${dataDirName}`);

let sync: Sync | undefined;
let remoteOptions: RemoteOptions | undefined;

const items: { [key: string]: Item } = {};
const boxes: { [key: string]: Box } = {};

let boxCollection: Collection;
let itemCollection: Collection;

let mainWindow: BrowserWindow;

const translations = translate(English).supporting('ja', Japanese);

const info: InfoState = {
  messages: English,
  appinfo: {
    name: app.getName(),
    version: app.getVersion(),
    iconDataURL: nativeImage
      // .ico cannot be loaded in ubuntu
      //  .createFromPath(path.resolve(__dirname, '../assets/inventory_manager_icon.ico'))
      .createFromPath(
        path.resolve(__dirname, '../assets/inventory_manager_icon-128x128.png')
      )
      .toDataURL(),
  },
};

let settings: SettingsState = {
  _id: 'settings',
  language: '',
  dataStorePath: defaultDataDir,
  sync: {
    remote_url: '',
    connection: {
      type: 'github',
      personal_access_token: '',
      private: true,
    },
    interval: 30000,
  },
};

// Utility for i18n
export const MESSAGE = (label: MessageLabel, ...args: string[]) => {
  let message: string = info.messages[label];
  if (args) {
    args.forEach((replacement, index) => {
      const variable = '$' + (index + 1); // $1, $2, ...
      message = message.replace(variable, replacement);
    });
  }
  return message;
};

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit();
}

const createWindow = (): void => {
  // Create the browser window.
  let icon = path.join(__dirname, '../assets/inventory_manager_icon.ico');
  if (process.platform !== 'win32') {
    // .ico cannot be loaded in ubuntu
    icon = path.join(__dirname, '../assets/inventory_manager_icon-128x128.png');
  }
  mainWindow = new BrowserWindow({
    height: 900,
    width: 900,
    webPreferences: {
      preload: path.join(__dirname, './preload.js'),
      sandbox: true,
      contextIsolation: true,
    },
    icon: icon,
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));

  if (!app.isPackaged && process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('electron-connect').client.create(mainWindow);
    mainWindow.webContents.openDevTools();
  }

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('initialize-store', items, boxes, info, settings);
  });

  // Open hyperlink on external browser window
  // by preventing to open it on new electron window
  // when target='_blank' is set.
  mainWindow.webContents.on('new-window', (e, _url) => {
    e.preventDefault();
    shell.openExternal(_url);
  });
};

const showErrorDialog = (label: MessageLabel, msg: string) => {
  dialog.showMessageBoxSync({
    type: 'error',
    buttons: ['OK'],
    message: MESSAGE(label) + '(' + msg + ')',
  });
};

const loadData = async () => {
  boxCollection = await inventoryDB.collection('box');
  itemCollection = await inventoryDB.collection('item');

  const boxDocs = ((await boxCollection.allDocs()).rows.map(
    row => row.doc
  ) as unknown) as Box[];
  boxDocs.forEach(boxDoc => {
    // Add lacked property
    boxDoc.items = [];
    boxes[boxDoc._id] = boxDoc;
  });

  const itemDocs = ((await itemCollection.allDocs()).rows.map(
    row => row.doc
  ) as unknown) as Item[];

  itemDocs.forEach(itemDoc => {
    // Set boxId/itemId as id.
    items[itemDoc._id] = itemDoc;
    const boxId = getBoxId(itemDoc._id);
    if (boxId) {
      if (boxes[boxId]) {
        boxes[boxId].items.push(itemDoc._id);
      }
      else {
        // Create box if not exist.
        const boxName = info.messages.firstBoxName;
        boxes[boxId] = {
          _id: boxId,
          name: boxName,
          items: [],
        };
        boxes[boxId].items.push(itemDoc._id);
      }
    }
  });

  if (boxDocs.length === 0) {
    const boxId = 'box' + generateId();
    const boxName = info.messages.firstBoxName;
    boxes[boxId] = {
      _id: boxId,
      name: boxName,
      items: [],
    };
    await boxCollection.put({ _id: boxId, name: boxName });
  }
};

const setSyncEvents = () => {
  if (sync === undefined) return;
  sync.on('localChange', (changes: ChangedFile[], taskMetadata: TaskMetadata) => {
    mainWindow.webContents.send('sync', changes, taskMetadata);
  });

  sync.on('combine', async (duplicatedFiles: DuplicatedFile[]) => {
    await loadData();
    mainWindow.webContents.send('initialize-store', items, boxes, info, settings);
  });

  sync.on('start', () => {
    mainWindow.webContents.send('sync-start');
  });
  sync.on('complete', () => {
    mainWindow.webContents.send('sync-complete');
  });
  sync.on('error', () => {
    mainWindow.webContents.send('sync-complete');
  });
};
// eslint-disable-next-line complexity
const init = async () => {
  // locale can be got after 'ready'
  const myLocale = app.getLocale();
  console.debug(`locale: ${myLocale}`);

  let preferredLanguage: string = defaultLanguage;
  if (availableLanguages.includes(myLocale)) {
    preferredLanguage = myLocale;
  }
  // Set i18n from locale (for initial error)
  selectPreferredLanguage(availableLanguages, [preferredLanguage]);
  info.messages = translations.messages();

  // Open databases
  try {
    settingsDB = new GitDocumentDB({
      local_dir: defaultDataDir,
      db_name: 'local_settings',
    });
    const settingsOpenResult = await settingsDB.open();
    if (!settingsOpenResult.ok) {
      await settingsDB.createDB();
    }

    settings =
      (((await settingsDB.get('settings')) as unknown) as SettingsState) ?? settings;

    inventoryDB = new GitDocumentDB({
      local_dir: settings.dataStorePath,
      db_name: 'db',
      schema: {
        json: {
          plainTextProperties: {
            name: true,
          },
        },
      },
    });

    const openResult = await inventoryDB.open();
    if (!openResult.ok) {
      await inventoryDB.createDB();
    }

    if (settings.sync.remote_url && settings.sync.connection.personal_access_token) {
      remoteOptions = {
        remote_url: settings.sync.remote_url,
        connection: settings.sync.connection,
        interval: settings.sync.interval,
        conflict_resolution_strategy: 'ours-diff',
        live: true,
      };
    }
  } catch (err) {
    showErrorDialog('databaseCreateError', err.message);
    console.log(err);
    app.exit();
  }
  if (remoteOptions) {
    sync = await inventoryDB.sync(remoteOptions).catch(err => {
      showErrorDialog('syncError', err.message);
      return undefined;
    });
  }

  if (!settingsDB || !inventoryDB) {
    return;
  }

  if (settings.language === '') {
    // eslint-disable-next-line require-atomic-updates
    settings.language = preferredLanguage;
  }

  /**
   * Set i18n from settings
   */
  selectPreferredLanguage(availableLanguages, [settings.language, defaultLanguage]);
  info.messages = translations.messages();

  // Load inventory
  try {
  } catch (err) {
    showErrorDialog('databaseCreateError', err.message);
    console.log(err);
    app.exit();
  }
  if (!inventoryDB) {
    return;
  }

  setSyncEvents();
  if (sync !== undefined) console.log(sync.options());

  await loadData();

  createWindow();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', init);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', async () => {
  await inventoryDB.close();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', async () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    await inventoryDB.open();
    createWindow();
  }
});

// eslint-disable-next-line complexity
ipcMain.handle('db', async (e, command: DatabaseCommand) => {
  // eslint-disable-next-line default-case
  switch (command.command) {
    case 'db-item-add':
    case 'db-item-update': {
      const taskId = await new Promise((resolve, reject) => {
        itemCollection
          .put(command.data, {
            enqueueCallback: (taskMetadata: TaskMetadata) => {
              resolve(taskMetadata.taskId);
            },
          })
          .catch(err => reject(err));
      }).catch((err: Error) => console.log(err.message + ', ' + JSON.stringify(command)));
      if (sync) {
        sync.trySync();
      }
      return taskId;
    }
    case 'db-item-delete': {
      const taskId = await new Promise((resolve, reject) => {
        const id = command.data;
        itemCollection
          .delete(id, {
            enqueueCallback: (taskMetadata: TaskMetadata) => {
              resolve(taskMetadata.taskId);
            },
          })
          .catch(err => reject(err));
      }).catch((err: Error) => console.log(err.message + ', ' + JSON.stringify(command)));
      if (sync) {
        sync.trySync();
      }
      return taskId;
    }
    case 'db-box-add':
    case 'db-box-name-update': {
      const taskId = await new Promise((resolve, reject) => {
        boxCollection
          .put(command.data, {
            enqueueCallback: (taskMetadata: TaskMetadata) => {
              resolve(taskMetadata.taskId);
            },
          })
          .catch(err => reject(err));
      }).catch((err: Error) => console.log(err.message + ', ' + JSON.stringify(command)));
      if (sync) {
        sync.trySync();
      }
      return taskId;
    }
    case 'db-box-delete': {
      const taskId = await new Promise((resolve, reject) => {
        const id = command.data;
        boxCollection
          .delete(id, {
            enqueueCallback: (taskMetadata: TaskMetadata) => {
              resolve(taskMetadata.taskId);
            },
          })
          .catch(err => reject(err));
      }).catch((err: Error) => console.log(err.message + ', ' + JSON.stringify(command)));
      if (sync) {
        sync.trySync();
      }
      return taskId;
    }
    case 'db-box-delete-revert': {
      const id = command.data;
      boxCollection
        .get(id, 1)
        .then(box => {
          if (box) boxCollection.put(box);
          else throw new Error('backNumber does not found');
        })
        .then(() => {
          if (sync) {
            sync.trySync();
          }
        })
        .catch((err: Error) => console.log(err.message + ', ' + JSON.stringify(command)));
      break;
    }
    case 'db-exec-sync': {
      if (sync && sync.options().live) {
        sync.trySync();
      }
      break;
    }
    case 'db-language-update': {
      settings.language = command.data;
      selectPreferredLanguage(availableLanguages, [settings.language, defaultLanguage]);
      info.messages = translations.messages();
      mainWindow.webContents.send('update-info', info);
      await settingsDB.put(settings);
      break;
    }
    case 'db-sync-remote-url-update': {
      if (command.data === '') {
        if (sync !== undefined) {
          inventoryDB.unregisterRemote(sync.remoteURL());
          sync = undefined;
        }
      }
      settings.sync.remote_url = command.data;
      await settingsDB.put(settings);
      break;
    }
    case 'db-sync-personal-access-token-update': {
      settings.sync.connection.personal_access_token = command.data;
      await settingsDB.put(settings);
      break;
    }
    case 'db-sync-interval-update': {
      settings.sync.interval = command.data;
      if (sync !== undefined) {
        sync.pause();
        sync.resume({ interval: settings.sync.interval });
      }
      await settingsDB.put(settings);
      break;
    }
    case 'db-test-sync': {
      if (sync !== undefined) {
        inventoryDB.unregisterRemote(sync.remoteURL());
      }
      remoteOptions = {
        remote_url: settings.sync.remote_url,
        connection: settings.sync.connection,
        interval: settings.sync.interval,
        conflict_resolution_strategy: 'ours-diff',
        live: true,
      };
      console.log(remoteOptions);
      // eslint-disable-next-line require-atomic-updates
      const syncOrError: Sync | Error = await inventoryDB.sync(remoteOptions).catch(err => {
        return err;
      });
      if (syncOrError instanceof Error) {
        return syncOrError.name;
      }
      // eslint-disable-next-line require-atomic-updates
      sync = syncOrError;
      setSyncEvents();
      return 'succeed';
    }
    case 'db-pause-sync': {
      if (sync !== undefined) {
        sync.pause();
      }
      break;
    }
    case 'db-resume-sync': {
      if (sync !== undefined) {
        sync.resume();
      }
      break;
    }
  }
});
