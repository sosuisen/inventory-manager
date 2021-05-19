import * as path from 'path';
import os from 'os';
import { readJsonSync } from 'fs-extra';
import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import {
  ChangedFile,
  Collection,
  GitDocumentDB,
  RemoteOptions,
  Sync,
} from 'git-documentdb';
import { availableLanguages, defaultLanguage, MessageLabel } from './modules_common/i18n';
import {
  getSettings,
  initializeGlobalStore,
  MESSAGE,
  settingsStore,
  subscribeSettingsStore,
} from './modules_main/store.settings';
import { DatabaseCommand } from './modules_common/action.types';
import { Box, Item } from './modules_common/store.types';
import { generateId } from './modules_common/utils';

let gitDDB: GitDocumentDB;
let sync: Sync;
const items: { [key: string]: Item } = {};
const boxes: { [key: string]: Box } = {};

let boxCollection: Collection;

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

const showErrorDialog = (label: MessageLabel) => {
  dialog.showMessageBoxSync({
    type: 'error',
    buttons: ['OK'],
    message: MESSAGE(label),
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
    showErrorDialog('databaseCreateError');
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
  const envConfig = readJsonSync(configPath);
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
  const dbInfo = await gitDDB.open();
  if (!dbInfo.ok) {
    await gitDDB.createDB(remoteOptions).catch(e => {
      showErrorDialog('databaseCreateError');
      console.error(e);
      app.exit();
    });
  }
  else if (remoteOptions) {
    await gitDDB.sync(remoteOptions);
  }

  if (remoteOptions && remoteOptions.remote_url) {
    sync = gitDDB.getSynchronizer(remoteOptions.remote_url);
    sync.on('localChange', (changes: ChangedFile[]) => {
      mainWindow.webContents.send('sync', changes);
    });
    sync.on('start', () => {
      mainWindow.webContents.send('sync-start');
    });
    sync.on('complete', () => {
      mainWindow.webContents.send('sync-complete');
    });
  }

  boxCollection = await gitDDB.collection('box');

  // Get collections directly under item/
  const cols = await gitDDB.getCollections('item');
  cols.forEach(async col => {
    const boxId = col.collectionPath().slice(0, -1); // Remove trailing slash.

    // Get docs by full-path (item/boxId/itemId)
    const boxItems = ((
      await gitDDB.allDocs({ prefix: 'item/' + boxId, include_docs: true })
    ).rows.map(row => row.doc) as unknown) as Item[];

    boxes[boxId].items = [];
    boxItems.forEach(item => {
      items[item._id] = item; // Set full-path as id.
      boxes[boxId].items.push(item._id);
    });

    boxes[boxId].name =
      (await boxCollection.get(boxId)).name ??
      getSettings().temporalSettings.messages.firstBoxName;
  });

  if (cols.length === 0) {
    const box = generateId();
    const boxName = getSettings().temporalSettings.messages.firstBoxName;
    boxes[box].name = boxName;
    boxes[box].items = [];
  }
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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// eslint-disable-next-line complexity
ipcMain.handle('db', (e, command: DatabaseCommand) => {
  let collection: Collection;
  const method = '';
  // eslint-disable-next-line default-case
  switch (command.action) {
    case 'db-item-add':
    case 'db-item-update': {
      const jsonObj = (command.data.item as unknown) as { _id: string };
      gitDDB
        .put(jsonObj)
        .then(() => {
          if (sync) {
            sync.trySync();
          }
        })
        .catch((err: Error) => console.log(err.message + ', ' + JSON.stringify(command)));
      break;
    }
    case 'db-item-delete': {
      const id = command.data;
      gitDDB
        .delete(id)
        .then(() => {
          if (sync) {
            sync.trySync();
          }
        })
        .catch((err: Error) => console.log(err.message + ', ' + JSON.stringify(command)));
      break;
    }
    case 'db-box-add':
    case 'db-box-name-update': {
      const id = command.data.id;
      const name = command.data.name;
      boxCollection
        .put(id, { name })
        .then(() => {
          if (sync) {
            sync.trySync();
          }
        })
        .catch((err: Error) => console.log(err.message + ', ' + JSON.stringify(command)));
      break;
    }
    case 'db-box-delete': {
      const id = command.data;
      boxCollection
        .delete(id)
        .then(() => {
          if (sync) {
            sync.trySync();
          }
        })
        .catch((err: Error) => console.log(err.message + ', ' + JSON.stringify(command)));
      break;
    }
    case 'db-sync': {
      sync.trySync();
    }
  }
});
