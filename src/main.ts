import * as path from 'path';
import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import {
  DocumentNotFoundError,
  GitDocumentDB,
  InvalidJsonObjectError,
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
import { Box, Item, WorkState } from './modules_common/store.types';
import { getCurrentDateAndTime } from './modules_renderer/utils';

let gitDDB: GitDocumentDB;
const items: { [key: string]: Item } = {};
const boxes: { [key: string]: Box } = {};
let workState: WorkState;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit();
}

const createWindow = (): void => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 900,
    width: 900,
    webPreferences: {
      preload: path.join(__dirname, './preload.js'),
      sandbox: true,
      contextIsolation: true,
    },
    icon: path.join(__dirname, '../assets/inventory_manager_icon.ico'),
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
      items,
      boxes,
      workState,
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
  gitDDB = new GitDocumentDB({
    localDir: getSettings().persistentSettings.storage.path,
    dbName: 'db',
  });

  const dbInfo = await gitDDB.open().catch(e => {
    showErrorDialog('databaseCreateError');
    console.error(e);
    app.exit();
  });

  if (!dbInfo) {
    return;
  }

  const allItems = await gitDDB
    .allDocs({ directory: 'item', include_docs: true })
    .catch(e => {
      showErrorDialog('databaseOpenError');
      app.exit();
    });
  if (!allItems) return;

  if (allItems.total_rows > 0) {
    allItems.rows?.forEach(item => {
      if (item.doc) {
        const doc = (item.doc as unknown) as Item;
        doc._id = doc._id.replace(/^item\//, '');
        items[doc._id] = doc;
      }
    });
  }

  const allBoxes = await gitDDB
    .allDocs({ directory: 'box', include_docs: true })
    .catch(e => {
      showErrorDialog('databaseOpenError');
      app.exit();
    });
  if (!allBoxes) return;

  if (allBoxes.total_rows > 0) {
    allBoxes.rows?.forEach(box => {
      if (box.doc) {
        const doc = (box.doc as unknown) as Box;
        doc._id = doc._id.replace(/^box\//, '');
        boxes[doc._id] = doc;
      }
    });
  }
  else {
    const date = getCurrentDateAndTime();
    const firstBox: Box = {
      _id: 'box/1',
      name: '1',
      items: [],
      created_date: date,
      modified_date: date,
    };
    await gitDDB.put(firstBox);
    firstBox._id = '1';
    boxes[firstBox._id] = firstBox;
  }

  const workId = 'user01';
  workState = ((await gitDDB.get('work/' + workId).catch(async e => {
    if (e instanceof DocumentNotFoundError) {
      const firstWorkState: WorkState = {
        _id: workId,
        boxOrder: Object.keys(boxes),
        currentBox: Object.keys(boxes)[0],
      };
      const workStateForSave = JSON.parse(JSON.stringify(firstWorkState));
      workStateForSave._id = 'work/' + workId;
      await gitDDB.put(workStateForSave);
      return firstWorkState;
    }

    showErrorDialog('databaseOpenError');
    app.exit();
  })) as unknown) as WorkState;

  if (workState !== undefined) {
    if (workState.boxOrder.length === 0 || workState.currentBox === undefined) {
      workState = {
        _id: workId,
        boxOrder: Object.keys(boxes),
        currentBox: workState.boxOrder[0],
      };
      const workStateForSave = JSON.parse(JSON.stringify(workState));
      workStateForSave._id = 'work/' + workId;
      await gitDDB.put(workStateForSave);
    }
    else {
      workState._id = workState._id.replace(/^work\//, '');
    }
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
  let table = '';
  let method = '';
  switch (command.action) {
    case 'item-add':
    case 'item-update':
      table = 'item';
      method = 'put';
      break;
    case 'item-delete':
      table = 'item';
      method = 'delete';
      break;
    case 'box-add':
    case 'box-update':
      table = 'box';
      method = 'put';
      break;
    case 'box-delete':
      table = 'box';
      method = 'delete';
      break;
    case 'work-update':
      table = 'work';
      method = 'put';
      break;
    default:
      return;
  }
  if (method === 'put') {
    const jsonObj = (command.data as unknown) as { _id: string };
    jsonObj._id = table + '/' + jsonObj._id;
    gitDDB
      .put(jsonObj)
      .catch((err: Error) => console.log(err.message + ', ' + JSON.stringify(command)));
  }
  else if (method === 'delete') {
    const id = table + '/' + command.data;
    gitDDB
      .delete(id)
      .catch((err: Error) => console.log(err.message + ', ' + JSON.stringify(command)));
  }
});
