import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ChangedFile } from 'git-documentdb';
import { App } from './modules_renderer/App';
import { inventoryStore } from './modules_renderer/store';
import { AppInfo, Item } from './modules_common/store.types';
import { Messages } from './modules_common/i18n';
import {
  boxRenameAction,
  itemDeleteAction,
  itemInsertAction,
  itemReplaceAction,
} from './modules_renderer/action';

const syncActionBuilder = (changes: ChangedFile[]) => {
  // eslint-disable-next-line complexity
  const counter = {
    create: 0,
    update: 0,
    delete: 0,
  };
  changes.forEach(file => {
    if (file.operation.startsWith('create')) {
      itemInsertAction(
        file.data.doc!.box,
        file.data.doc! as Item,
        false
      )(inventoryStore.dispatch, inventoryStore.getState);
      counter.create++;
    }
    else if (file.operation.startsWith('update')) {
      const oldBox = inventoryStore.getState().item[file.data.id].box;
      const newBox = file.data.doc!.box;
      if (oldBox === newBox) {
        itemReplaceAction(file.data.doc as Item, false)(
          inventoryStore.dispatch,
          inventoryStore.getState
        );
      }
      else {
        // Currently, this occurs only when box was renamed in remote site.
        boxRenameAction(
          oldBox,
          newBox,
          false
        )(inventoryStore.dispatch, inventoryStore.getState);
      }
      counter.update++;
    }
    else if (file.operation.startsWith('delete')) {
      itemDeleteAction(
        file.data.doc!.box,
        file.data.id,
        false,
        true
      )(inventoryStore.dispatch, inventoryStore.getState);
      counter.delete++;
    }
  });
  inventoryStore.dispatch({
    type: 'work-sync-update',
    payload: {
      syncInfo: `${inventoryStore.getState().settings.messages.syncCreate}${
        counter.create
      }<br />${inventoryStore.getState().settings.messages.syncUpdate}${counter.update}${
        inventoryStore.getState().settings.messages.syncDelete
      }${counter.delete}`,
    },
  });

  setTimeout(() => {
    inventoryStore.dispatch({
      type: 'work-sync-update',
      payload: {
        syncInfo: '',
      },
    });
  }, 3000);
};

// eslint-disable-next-line complexity
window.addEventListener('message', event => {
  if (event.source !== window || !event.data.command) return;

  switch (event.data.command) {
    case 'initialize-store': {
      const items: { [key: string]: Item } = event.data.items;
      const boxes: { [key: string]: string[] } = event.data.boxes;
      const boxArray = Object.keys(boxes).sort();
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
        payload: currentBox,
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
        type: 'work-sync-update',
        payload: {
          syncWorking: true,
        },
      });
      break;
    }

    case 'sync-complete': {
      inventoryStore.dispatch({
        type: 'work-sync-update',
        payload: {
          syncWorking: false,
        },
      });
      break;
    }

    default:
      break;
  }
});

// window.document.addEventListener('DOMContentLoaded', onready);
