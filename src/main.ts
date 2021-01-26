import * as path from 'path';
import { app, BrowserWindow } from 'electron';
import { GitDocumentDB } from 'git-documentdb';
import installExtension, {
  REACT_DEVELOPER_TOOLS,
  REDUX_DEVTOOLS,
} from 'electron-devtools-installer';
import { availableLanguages, defaultLanguage } from './modules_common/i18n';
import {
  getSettings,
  initializeGlobalStore,
  subscribeSettingsStore,
} from './modules_main/store.settings';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const electronConnect = require('electron-connect');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit();
}

const createWindow = (): void => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));

  if (!app.isPackaged && process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.webContents.on('did-finish-load', () => {
    const unsubscribe = subscribeSettingsStore(mainWindow);
    mainWindow.on('close', () => {
      unsubscribe();
    });
  });
};

let gitDDB: GitDocumentDB;
const init = async () => {
  // locale can be got after 'ready'
  const myLocale = app.getLocale();
  console.debug(`locale: ${myLocale}`);

  let preferredLanguage: string = defaultLanguage;
  if (availableLanguages.includes(myLocale)) {
    preferredLanguage = myLocale;
  }
  initializeGlobalStore(preferredLanguage as string);

  gitDDB = new GitDocumentDB({
    localDir: getSettings().persistentSettings.storage.path,
    dbName: 'db',
  });
  await gitDDB.open();
  await gitDDB.put({ _id: '1', name: 'Kimari' });
  await gitDDB.put({ _id: '2', name: 'Shirase' });
  await gitDDB.put({ _id: '3', name: 'Hinata' });
  await gitDDB.put({ _id: '4', name: 'Yuzu' });
  await gitDDB.close();

  createWindow();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', init);

// eslint-disable-next-line promise/catch-or-return
app.whenReady().then(() => {
  // https://github.com/zalmoxisus/redux-devtools-extension#2-use-with-redux
  // eslint-disable-next-line promise/no-nesting
  installExtension(REDUX_DEVTOOLS)
    .then(name => console.log(`Added Extension:  ${name}`))
    .catch(err => console.log('An error occurred:', err));
  // eslint-disable-next-line promise/no-nesting
  installExtension(REACT_DEVELOPER_TOOLS)
    .then(name => console.log(`Added Extension:  ${name}`))
    .catch(err => console.log('An error occurred:', err));
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
