/**
 * Inventory Manager
 * Copyright (c) Hidekazu Kubota
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */

import { contextBridge, ipcRenderer, MouseInputEvent } from 'electron';
import { DatabaseCommand } from './modules_common/types';

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
ipcRenderer.on('initialize-store', (event, items, boxes) => {
  window.postMessage({ command: 'initialize-store', items, boxes }, 'file://');
});
