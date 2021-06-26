/**
 * Inventory Manager
 * Copyright (c) Hidekazu Kubota
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ChangedFile, FatJsonDoc, TaskMetadata } from 'git-documentdb';
import { App } from './modules_renderer/App';
import { inventoryStore } from './modules_renderer/store';
import { Box, InfoState, Item, SettingsState } from './modules_common/store.types';
import {
  boxDeleteActionCreator,
  boxNameUpdateActionCreator,
  itemDeleteActionCreator,
  itemInsertActionCreator,
  itemNameUpdateActionCreator,
  itemTakeoutUpdateActionCreator,
} from './modules_renderer/actionCreator';
import window from './modules_renderer/window';
import { DatabaseBoxDeleteRevert } from './modules_common/db.types';

let counter = {
  create: 0,
  update: 0,
  delete: 0,
};

const syncItemActionBuilder = (changes: ChangedFile[], taskMetadata: TaskMetadata) => {
  // eslint-disable-next-line complexity
  counter = {
    create: 0,
    update: 0,
    delete: 0,
  };
  // Item changes
  changes.forEach(file => {
    let id = '';
    if (file.operation === 'insert') {
      id = (file.new as FatJsonDoc)._id;
    }
    else if (file.operation === 'update') {
      id = (file.new as FatJsonDoc)._id;
    }
    else if (file.operation === 'delete') {
      id = (file.old as FatJsonDoc)._id;
    }

    if (file.operation === 'insert') {
      const newItem = (file.new.doc as unknown) as Item;

      itemInsertActionCreator(newItem, 'remote')(
        inventoryStore.dispatch,
        inventoryStore.getState
      );
      counter.create++;
    }
    else if (file.operation === 'update') {
      const oldItem = (file.old.doc as unknown) as Item;
      const newItem = (file.new.doc as unknown) as Item;
      if (oldItem.name !== newItem.name) {
        itemNameUpdateActionCreator(
          newItem._id,
          newItem.name,
          undefined,
          newItem.modified_date,
          taskMetadata.enqueueTime,
          'remote'
        )(inventoryStore.dispatch, inventoryStore.getState);
      }
      if (oldItem.takeout !== newItem.takeout) {
        itemTakeoutUpdateActionCreator(
          newItem._id,
          newItem.takeout,
          newItem.modified_date,
          taskMetadata.enqueueTime,
          'remote'
        )(inventoryStore.dispatch, inventoryStore.getState);
      }
      counter.update++;
    }
    else if (file.operation.startsWith('delete')) {
      const oldItem = (file.old.doc as unknown) as Item;
      itemDeleteActionCreator(oldItem._id, 'remote')(
        inventoryStore.dispatch,
        inventoryStore.getState
      );
      counter.delete++;
    }
  });
};

const syncBoxActionBuilder = (changes: ChangedFile[], taskMetadata: TaskMetadata) => {
  // Box changes
  changes.forEach(file => {
    if (file.operation === 'insert') {
      const newBox = (file.new.doc as unknown) as Box;
      if (
        newBox.name === inventoryStore.getState().info.messages.firstBoxName &&
        inventoryStore.getState().box[newBox._id].items.length === 0
      ) {
        // Skip inserting a new box when it is empty and its name is firstBoxName.
      }
      else {
        boxNameUpdateActionCreator(
          newBox._id,
          newBox.name,
          taskMetadata.enqueueTime,
          'remote'
        )(inventoryStore.dispatch, inventoryStore.getState);
        counter.create++;
      }
    }
    else if (file.operation === 'update') {
      const newBox = (file.new.doc as unknown) as Box;
      boxNameUpdateActionCreator(
        newBox._id,
        newBox.name,
        taskMetadata.enqueueTime,
        'remote'
      )(inventoryStore.dispatch, inventoryStore.getState);
      counter.update++;
    }
    else if (file.operation.startsWith('delete')) {
      const oldBox = (file.old.doc as unknown) as Box;
      if (!inventoryStore.getState().box[oldBox._id]) {
        // nop
      }
      else if (inventoryStore.getState().box[oldBox._id].items.length > 0) {
        // Revert deleted box
        const cmd: DatabaseBoxDeleteRevert = {
          command: 'db-box-delete-revert',
          data: oldBox._id,
        };
        window.api.db(cmd);
      }
      else {
        boxDeleteActionCreator(oldBox._id, 'remote')(
          inventoryStore.dispatch,
          inventoryStore.getState
        );
        counter.delete++;
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

      const info: InfoState = event.data.info;
      const settings: SettingsState = event.data.settings;

      inventoryStore.dispatch({
        type: 'info-init',
        payload: info,
      });

      inventoryStore.dispatch({
        type: 'settings-init',
        payload: settings,
      });

      const domContainer = document.getElementById('react-container');
      ReactDOM.render(React.createElement(App), domContainer);

      break;
    }
    case 'update-info': {
      const info: InfoState = event.data.info;
      inventoryStore.dispatch({
        type: 'info-init',
        payload: info,
      });
      break;
    }

    case 'sync-item': {
      syncItemActionBuilder(event.data.changes, event.data.taskMetadata);
      break;
    }

    case 'sync-box': {
      syncBoxActionBuilder(event.data.changes, event.data.taskMetadata);
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
