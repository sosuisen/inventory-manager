/**
 * Inventory Manager
 * Copyright (c) Hidekazu Kubota
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */

import * as path from 'path';
import os from 'os';
import { readJsonSync } from 'fs-extra';
import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import {
  ChangedFile,
  Collection,
  DuplicatedFile,
  GitDocumentDB,
  RemoteOptions,
  Sync,
  TaskMetadata,
} from 'git-documentdb';
import { availableLanguages, defaultLanguage, MessageLabel } from './modules_common/i18n';
import {
  getSettings,
  initializeGlobalStore,
  MESSAGE,
  settingsStore,
  subscribeSettingsStore,
} from './modules_main/store.settings';
import { DatabaseCommand } from './modules_common/db.types';
import { Box, Item } from './modules_common/store.types';
import { generateId, getBoxId } from './modules_common/utils';

let gitDDB: GitDocumentDB;
let sync: Sync;
const items: { [key: string]: Item } = {};
const boxes: { [key: string]: Box } = {};

let boxCollection: Collection;
let itemCollection: Collection;

let mainWindow: BrowserWindow;

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
    mainWindow.webContents.send('initialize-store', items, boxes, settingsStore.getState());
    subscribeSettingsStore(mainWindow);

    const unsubscribe = subscribeSettingsStore(mainWindow);
    mainWindow.on('close', () => {
      unsubscribe();
    });
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
  boxCollection = await gitDDB.collection('box');
  itemCollection = await gitDDB.collection('item');

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
        const boxName = getSettings().temporalSettings.messages.firstBoxName;
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
    const boxName = getSettings().temporalSettings.messages.firstBoxName;
    boxes[boxId] = {
      _id: boxId,
      name: boxName,
      items: [],
    };
    await boxCollection.put({ _id: boxId, name: boxName });
  }
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

  // Load settings
  initializeGlobalStore(preferredLanguage as string);

  // Load inventory
  try {
    gitDDB = new GitDocumentDB({
      local_dir: getSettings().persistentSettings.storage.path,
      db_name: 'db',
      schema: {
        json: {
          plainTextProperties: {
            name: true,
          },
        },
      },
    });
  } catch (err) {
    showErrorDialog('databaseCreateError', err.message);
    console.log(err);
    app.exit();
  }
  if (!gitDDB) {
    return;
  }

  let remoteConfigFile = 'inventory_manager_env';
  if (!app.isPackaged) {
    remoteConfigFile += '_dev';
  }
  let configPath;
  if (os.platform() === 'win32') {
    configPath = path.resolve('c:\\tmp\\', remoteConfigFile);
  }
  else {
    configPath = path.resolve('/tmp/', remoteConfigFile);
  }
  let envConfig: { [key: string]: string } = {};
  try {
    envConfig = readJsonSync(configPath);
  } catch (e) {}
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
  const remote_url = process.env.INVENTORY_MANAGER_URL;
  const personal_access_token = process.env.INVENTORY_MANAGER_TOKEN;
  let remoteOptions: RemoteOptions | undefined;
  if (remote_url && personal_access_token) {
    remoteOptions = {
      remote_url: remote_url,
      connection: {
        type: 'github',
        personal_access_token,
        private: true,
      },
      conflict_resolution_strategy: 'ours-diff',
      live: true,
    };
  }
  const openResult = await gitDDB.open();
  if (!openResult.ok) {
    await gitDDB.createDB(remoteOptions).catch(e => {
      showErrorDialog('databaseCreateError', e.message);
      console.error(e);
      app.exit();
    });
  }
  else if (remoteOptions) {
    await gitDDB.sync(remoteOptions);
  }

  if (remoteOptions && remoteOptions.remote_url) {
    sync = gitDDB.getSynchronizer(remoteOptions.remote_url);
    sync.on('localChange', (changes: ChangedFile[], taskMetadata: TaskMetadata) => {
      mainWindow.webContents.send('sync', changes, taskMetadata);
    });

    sync.on('combine', async (duplicatedFiles: DuplicatedFile[]) => {
      await loadData();
      mainWindow.webContents.send(
        'initialize-store',
        items,
        boxes,
        settingsStore.getState()
      );
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
  }

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
  await gitDDB.close();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', async () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    await gitDDB.open();
    createWindow();
  }
});

// eslint-disable-next-line complexity
ipcMain.handle('db', async (e, command: DatabaseCommand) => {
  let collection: Collection;
  const method = '';
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
    case 'db-sync': {
      if (sync) {
        sync.trySync();
      }
      break;
    }
  }
});
