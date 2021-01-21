"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const electron_1 = require("electron");
const git_documentdb_1 = require("git-documentdb");
const store_1 = require("./modules_main/store");
const i18n_1 = require("./modules_common/i18n");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const electronConnect = require('electron-connect');
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    // eslint-disable-line global-require
    electron_1.app.quit();
}
const createWindow = () => {
    // Create the browser window.
    const mainWindow = new electron_1.BrowserWindow({
        height: 600,
        width: 800,
    });
    // and load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    // hot reload
    if (!electron_1.app.isPackaged && process.env.NODE_ENV === 'development') {
        electronConnect.client.create(mainWindow);
        mainWindow.webContents.openDevTools();
    }
};
let gitDDB;
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    // locale can be got after 'ready'
    const myLocale = electron_1.app.getLocale();
    console.debug(`locale: ${myLocale}`);
    let preferredLanguage = i18n_1.defaultLanguage;
    if (i18n_1.availableLanguages.includes(myLocale)) {
        preferredLanguage = myLocale;
    }
    store_1.initializeGlobalStore(preferredLanguage);
    gitDDB = new git_documentdb_1.GitDocumentDB({
        localDir: store_1.getSettings().persistent.storage.path,
        dbName: 'db',
    });
    yield gitDDB.open();
    yield gitDDB.put({ _id: '1', name: 'Kimari' });
    yield gitDDB.put({ _id: '2', name: 'Shirase' });
    yield gitDDB.put({ _id: '3', name: 'Hinata' });
    yield gitDDB.put({ _id: '4', name: 'Yuzu' });
    yield gitDDB.close();
    createWindow();
});
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
electron_1.app.on('ready', init);
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
