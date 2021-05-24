/**
 * Inventory Manager
 * Copyright (c) Hidekazu Kubota
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ChangedFile } from 'git-documentdb';
import { App } from './modules_renderer/App';
import { inventoryStore } from './modules_renderer/store';
import { AppInfo, Box, Item } from './modules_common/store.types';
import { Messages } from './modules_common/i18n';
import {
  boxDeleteActionCreator,
  boxRenameActionCreator,
  itemDeleteActionCreator,
  itemInsertActionCreator,
  itemReplaceActionCreator,
} from './modules_renderer/actionCreator';
import { getBoxId } from './modules_common/utils';
import window from './modules_renderer/window';
import { DatabaseBoxDeleteRevert } from './modules_common/db.types';

const syncActionBuilder = (changes: ChangedFile[]) => {
  // eslint-disable-next-line complexity
  const counter = {
    create: 0,
    update: 0,
    delete: 0,
  };
  const boxChanges: ChangedFile[] = [];

  // Item changes
  changes.forEach(file => {
    if (file.data.id.startsWith('box/')) {
      boxChanges.push(file);
    }
    else if (file.operation.startsWith('insert')) {
      itemInsertActionCreator(file.data.doc! as Item, 'remote')(
        inventoryStore.dispatch,
        inventoryStore.getState
      );
      counter.create++;
    }
    else if (file.operation.startsWith('update')) {
      itemReplaceActionCreator(file.data.doc as Item, 'remote')(
        inventoryStore.dispatch,
        inventoryStore.getState
      );
      counter.update++;
    }
    else if (file.operation.startsWith('delete')) {
      itemDeleteActionCreator(file.data.id, 'remote')(
        inventoryStore.dispatch,
        inventoryStore.getState
      );
      counter.delete++;
    }
  });

  // Box changes
  boxChanges.forEach(file => {
    if (file.operation.startsWith('insert')) {
      const boxId = getBoxId(file.data.id);
      if (boxId) {
        boxRenameActionCreator(
          boxId,
          file.data.doc!.name,
          'remote'
        )(inventoryStore.dispatch, inventoryStore.getState);
        counter.create++;
      }
    }
    else if (file.operation.startsWith('update')) {
      const boxId = getBoxId(file.data.id);
      if (boxId) {
        boxRenameActionCreator(
          boxId,
          file.data.doc!.name,
          'remote'
        )(inventoryStore.dispatch, inventoryStore.getState);
        counter.update++;
      }
    }
    else if (file.operation.startsWith('delete')) {
      if (!inventoryStore.getState().box[file.data.id]) {
        // nop
      }
      else if (inventoryStore.getState().box[file.data.id].items.length > 0) {
        // Revert deleted box
        const cmd: DatabaseBoxDeleteRevert = {
          command: 'db-box-delete-revert',
          data: file.data.id,
        };
        window.api.db(cmd);
      }
      else {
        const boxId = getBoxId(file.data.id);
        if (boxId) {
          boxDeleteActionCreator(boxId, 'remote')(
            inventoryStore.dispatch,
            inventoryStore.getState
          );
          counter.delete++;
        }
      }
    }
  });

  inventoryStore.dispatch({
    type: 'work-sync-info-update',
    payload: {
      create: counter.create,
      update: counter.update,
      delete: counter.delete,
    },
  });

  setTimeout(() => {
    inventoryStore.dispatch({
      type: 'work-sync-info-update',
      payload: undefined,
    });
  }, 3000);
};

// eslint-disable-next-line complexity
window.addEventListener('message', event => {
  if (event.source !== window || !event.data.command) return;

  switch (event.data.command) {
    case 'initialize-store': {
      const items: { [key: string]: Item } = event.data.items;
      const boxes: { [key: string]: Box } = event.data.boxes;
      const boxArray = Object.values(boxes).sort((a, b) => {
        if (a.name > b.name) return 1;
        if (a.name < b.name) return -1;
        return 0;
      });
      const currentBox = boxArray[0];
      inventoryStore.dispatch({
        type: 'item-init',
        payload: items,
      });
      inventoryStore.dispatch({
        type: 'box-init',
        payload: boxes,
      });
      inventoryStore.dispatch({
        type: 'work-current-box-update',
        payload: currentBox._id,
      });

      const appInfo = (event.data.settings.temporalSettings.app as unknown) as AppInfo;
      const messages = (event.data.settings.temporalSettings
        .messages as unknown) as Messages;
      inventoryStore.dispatch({
        type: 'appinfo-put',
        payload: appInfo,
      });
      inventoryStore.dispatch({
        type: 'messages-put',
        payload: messages,
      });

      const domContainer = document.getElementById('react-container');
      ReactDOM.render(React.createElement(App), domContainer);

      break;
    }
    case 'sync': {
      syncActionBuilder(event.data.changes);
      break;
    }

    case 'sync-start': {
      inventoryStore.dispatch({
        type: 'work-synchronizing-update',
        payload: true,
      });
      break;
    }

    case 'sync-complete': {
      inventoryStore.dispatch({
        type: 'work-synchronizing-update',
        payload: false,
      });
      break;
    }

    default:
      break;
  }
});

// window.document.addEventListener('DOMContentLoaded', onready);
