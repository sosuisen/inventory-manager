/**
 * Inventory Manager
 * Copyright (c) Hidekazu Kubota
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */

import { contextBridge, ipcRenderer } from 'electron';
import { DatabaseCommand } from './modules_common/db.types';

contextBridge.exposeInMainWorld('api', {
  /**
   * Command from Renderer process
   */
  db: (command: DatabaseCommand) => {
    return ipcRenderer.invoke('db', command);
  },
});

/**
 * Command from Main process
 */
ipcRenderer.on('initialize-store', (event, items, boxes, info, settings) => {
  window.postMessage(
    { command: 'initialize-store', items, boxes, info, settings },
    'file://'
  );
});

ipcRenderer.on('sync', (event, changes, taskMetadata) => {
  window.postMessage({ command: 'sync', changes, taskMetadata }, 'file://');
});

ipcRenderer.on('sync-start', () => {
  window.postMessage({ command: 'sync-start' }, 'file://');
});

ipcRenderer.on('sync-complete', () => {
  window.postMessage({ command: 'sync-complete' }, 'file://');
});
