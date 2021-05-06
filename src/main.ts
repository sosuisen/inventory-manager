import * as path from 'path';
import os from 'os';
import dotenv from 'dotenv';
import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import { Collection, GitDocumentDB, RemoteOptions } from 'git-documentdb';
import { availableLanguages, defaultLanguage, MessageLabel } from './modules_common/i18n';
import {
  getSettings,
  initializeGlobalStore,
  MESSAGE,
  settingsStore,
  subscribeSettingsStore,
} from './modules_main/store.settings';
import { DatabaseCommand } from './modules_common/action.types';
import { Box, Item, WorkState } from './modules_common/store.types';
import { generateId, getCurrentDateAndTime } from './modules_common/utils';

let gitDDB: GitDocumentDB;
let items: Collection;
let boxes: Collection;
let works: Collection;
const loadedItems: { [key: string]: Item } = {};
const loadedBoxes: { [key: string]: Box } = {};
let loadedWorkState: WorkState;

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
  const mainWindow = new BrowserWindow({
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
    mainWindow.webContents.send(
      'initialize-store',
      loadedItems,
      loadedBoxes,
      loadedWorkState,
      settingsStore.getState()
    );
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
  items = gitDDB.collection('item');
  boxes = gitDDB.collection('box');
  works = gitDDB.collection('work');

  if (os.platform() === 'win32') {
    dotenv.config({ path: 'c:\\inventory_manager_env' });
  }
  else {
    dotenv.config({ path: '/tmp/inventory_manager_env' });
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

  const allItems = await items.allDocs({ include_docs: true }).catch(e => {
    showErrorDialog('databaseOpenError');
    app.exit();
  });
  if (!allItems) return;

  if (allItems.total_rows > 0) {
    allItems.rows?.forEach(item => {
      if (item.doc) {
        const doc = (item.doc as unknown) as Item;
        loadedItems[doc._id] = doc;
      }
    });
  }

  const allBoxes = await boxes.allDocs({ include_docs: true }).catch(e => {
    showErrorDialog('databaseOpenError');
    app.exit();
  });
  if (!allBoxes) return;

  if (allBoxes.total_rows > 0) {
    allBoxes.rows?.forEach(box => {
      if (box.doc) {
        const doc = (box.doc as unknown) as Box;
        loadedBoxes[doc._id] = doc;
      }
    });
  }
  else {
    const date = getCurrentDateAndTime();
    const _id = generateId();
    const firstBox: Box = {
      _id: _id,
      name: getSettings().temporalSettings.messages.firstBoxName,
      items: [],
      created_date: date,
      modified_date: date,
    };
    await boxes.put(firstBox);
    firstBox._id = _id;
    loadedBoxes[firstBox._id] = firstBox;
  }

  const workId = 'user01';
  loadedWorkState = ((await works.get(workId).catch(() => {
    showErrorDialog('databaseOpenError');
    app.exit();
  })) as unknown) as WorkState;

  if (loadedWorkState === undefined) {
    loadedWorkState = {
      _id: workId,
      boxOrder: Object.keys(loadedBoxes),
      currentBox: Object.keys(loadedBoxes)[0],
    };
    const workStateForSave = JSON.parse(JSON.stringify(loadedWorkState));
    await works.put(workStateForSave);
  }
  else if (
    loadedWorkState.boxOrder.length === 0 ||
    loadedWorkState.currentBox === undefined
  ) {
    loadedWorkState = {
      _id: workId,
      boxOrder: Object.keys(loadedBoxes),
      currentBox: loadedWorkState.boxOrder[0],
    };
    const workStateForSave = JSON.parse(JSON.stringify(loadedWorkState));
    await works.put(workStateForSave);
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
  let method = '';
  switch (command.action) {
    case 'item-add':
    case 'item-update':
      collection = items;
      method = 'put';
      break;
    case 'item-delete':
      collection = items;
      method = 'delete';
      break;
    case 'box-add':
    case 'box-update':
      collection = boxes;
      method = 'put';
      break;
    case 'box-delete':
      collection = boxes;
      method = 'delete';
      break;
    case 'work-update':
      collection = works;
      method = 'put';
      break;
    default:
      return;
  }
  if (method === 'put') {
    const jsonObj = (command.data as unknown) as { _id: string };
    collection
      .put(jsonObj)
      .catch((err: Error) => console.log(err.message + ', ' + JSON.stringify(command)));
  }
  else if (method === 'delete') {
    const id = command.data;
    collection
      .delete(id)
      .catch((err: Error) => console.log(err.message + ', ' + JSON.stringify(command)));
  }
});
