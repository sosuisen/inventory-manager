import * as path from 'path';
import os from 'os';
import dotenv from 'dotenv';
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
import { Item } from './modules_common/store.types';
import { generateId, getCurrentDateAndTime } from './modules_common/utils';

let gitDDB: GitDocumentDB;
let sync: Sync;
const items: { [key: string]: Item } = {};
const boxes: { [key: string]: string[] } = {};

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
  if (os.platform() === 'win32') {
    dotenv.config({ path: path.resolve('c:\\', remoteConfigFile) });
  }
  else {
    dotenv.config({ path: path.resolve('/tmp/', remoteConfigFile) });
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
      diff_options: {
        plainTextProperties: {
          name: true,
        },
      },
      conflict_resolve_strategy: 'ours-prop',
      live: true,
    };
  }
  const dbInfo = await gitDDB.open();
  if (!dbInfo.ok) {
    await gitDDB.create(remoteOptions).catch(e => {
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

  const allItems = await gitDDB.allDocs({ include_docs: true }).catch(e => {
    showErrorDialog('databaseOpenError');
    app.exit();
  });
  if (!allItems) return;

  if (allItems.total_rows > 0) {
    allItems.rows?.forEach(item => {
      if (item.doc) {
        const doc = (item.doc as unknown) as Item;
        items[doc._id] = doc;
        if (!boxes[doc.box]) {
          boxes[doc.box] = [];
        }
        boxes[doc.box].push(doc._id);
      }
    });
  }
  else {
    const _id = generateId();
    const name = '';
    const box = getSettings().temporalSettings.messages.firstBoxName;
    const date = getCurrentDateAndTime();
    const firstDoc: Item = {
      _id,
      name,
      box,
      created_date: date,
      modified_date: date,
      takeout: false,
    };
    items[firstDoc._id] = firstDoc;
    boxes[box] = [];
    boxes[box].push(_id);
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
    case 'item-add':
    case 'item-update': {
      const jsonObj = (command.data as unknown) as { _id: string };
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
    case 'item-delete': {
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
    case 'sync': {
      sync.trySync();
    }
  }
});
