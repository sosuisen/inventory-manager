import * as path from 'path';
import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import { GitDocumentDB } from 'git-documentdb';

import { availableLanguages, defaultLanguage, MessageLabel } from './modules_common/i18n';
import {
  getSettings,
  initializeGlobalStore,
  MESSAGE,
  subscribeSettingsStore,
} from './modules_main/store.settings';
import { DatabaseCommand } from './modules_common/types';
import { Box, Item } from './modules_renderer/store.types.inventory';
import { getCurrentDateAndTime } from './modules_renderer/utils';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit();
}

const createWindow = (): void => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 900,
    width: 1200,
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
    mainWindow.webContents.send('initialize-store', items, boxes);

    const unsubscribe = subscribeSettingsStore(mainWindow);
    mainWindow.on('close', () => {
      unsubscribe();
    });
  });
};

let gitDDB: GitDocumentDB;
const items: { [key: string]: Item } = {};
const boxes: { [key: string]: Box } = {};

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

  if (!allItems) {
    return;
  }

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

  if (!allBoxes) {
    return;
  }

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

ipcMain.handle('db', (e, command: DatabaseCommand) => {
  switch (command.action) {
    case 'create':
    case 'update': {
      const jsonObj = (command.data as unknown) as { _id: string };
      jsonObj._id = command.table + '/' + jsonObj._id;
      gitDDB.put(jsonObj);
      break;
    }
    case 'delete': {
      const id = command.table + '/' + command.data;
      gitDDB.delete(id);
      break;
    }
    default:
      break;
  }
});
