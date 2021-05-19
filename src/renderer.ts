import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ChangedFile } from 'git-documentdb';
import { App } from './modules_renderer/App';
import { inventoryStore } from './modules_renderer/store';
import { AppInfo, Box, Item } from './modules_common/store.types';
import { Messages } from './modules_common/i18n';
import {
  boxAddAction,
  boxRenameAction,
  itemDeleteAction,
  itemInsertAction,
  itemReplaceAction,
} from './modules_renderer/action';
import { getBoxId } from './modules_common/utils';

const syncActionBuilder = (changes: ChangedFile[]) => {
  // eslint-disable-next-line complexity
  const counter = {
    create: 0,
    update: 0,
    delete: 0,
  };
  changes.forEach(file => {
    if (file.operation.startsWith('create')) {
      if (file.data.id.startsWith('item/')) {
        itemInsertAction(file.data.doc! as Item, 'remote')(
          inventoryStore.dispatch,
          inventoryStore.getState
        );
        counter.create++;
      }
      else if (file.data.id.startsWith('box/')) {
        // File under box/ sets box name.
        boxRenameAction(
          getBoxId(file.data.id),
          file.data.doc.name,
          'remote'
        )(inventoryStore.dispatch, inventoryStore.getState);
      }
    }
    else if (file.operation.startsWith('update')) {
      if (file.data.id.startsWith('item/')) {
        itemReplaceAction(file.data.doc as Item, 'remote')(
          inventoryStore.dispatch,
          inventoryStore.getState
        );
      }
      else if (file.data.id.startsWith('box/')) {
        // File under box/ sets box name.
        boxRenameAction(
          getBoxId(file.data.id),
          file.data.doc.name,
          'remote'
        )(inventoryStore.dispatch, inventoryStore.getState);
      }
      counter.update++;
    }
    else if (file.operation.startsWith('delete')) {
      if (file.data.id.startsWith('item')) {
        itemDeleteAction(file.data.id, 'remote')(
          inventoryStore.dispatch,
          inventoryStore.getState
        );
      }
      else if (file.data.id.startsWith('box')) {
        // nop
      }
      counter.delete++;
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
