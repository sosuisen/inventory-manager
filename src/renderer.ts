import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ChangedFile } from 'git-documentdb';
import { App } from './modules_renderer/App';
import { inventoryStore } from './modules_renderer/store';
import { AppInfo, Box, Item, WorkState } from './modules_common/store.types';
import { Messages } from './modules_common/i18n';

const syncActionBuilder = (changes: ChangedFile[]) => {
  // itemAddAction: ItemAddAction, BoxItemAddAction
  // itemDeleteAction: ItemDeleteAction, BoxItemDeleteAction
  // itemNameUpdateAction: ItemUpdateAction
  // toggleTakeoutAction: ItemUpdateAction
  // boxAddAction: BoxAddAction, WorkBoxOrderAddAction, WorkCurrentBoxUpdateAction
  // boxRenameAction: BoxUpdateAction
  // boxDeleteAction: BoxDeleteAction, WorkBoxOrderDeleteAction, WorkCurrentBoxUpdateAction
  // boxSelectAction: WorkCurrentBoxUpdateAction
  // eslint-disable-next-line complexity
  changes.forEach(file => {
    if (file.data.id.startsWith('item/')) {
      if (file.operation.startsWith('create')) {
      }
      else if (file.operation.startsWith('update')) {
      }
      else if (file.operation.startsWith('delete')) {
      }
    }
    else if (file.data.id.startsWith('box/')) {
      if (file.operation.startsWith('create')) {
      }
      else if (file.operation.startsWith('update')) {
      }
      else if (file.operation.startsWith('delete')) {
      }
    }
    else if (file.data.id.startsWith('work/')) {
      if (file.operation.startsWith('create')) {
      }
      else if (file.operation.startsWith('update')) {
      }
      else if (file.operation.startsWith('delete')) {
      }
    }
  });
};

// eslint-disable-next-line complexity
window.addEventListener('message', event => {
  if (event.source !== window || !event.data.command) return;

  switch (event.data.command) {
    case 'initialize-store': {
      const items: { [key: string]: Item } = event.data.items;
      const boxes: { [key: string]: Box } = event.data.boxes;
      const workState: WorkState = event.data.workState;

      inventoryStore.dispatch({
        type: 'item-init',
        payload: items,
      });
      inventoryStore.dispatch({
        type: 'box-init',
        payload: boxes,
      });
      inventoryStore.dispatch({
        type: 'work-init',
        payload: workState,
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
      syncActionBuilder(event.data.items);
      break;
    }
    default:
      break;
  }
});

// window.document.addEventListener('DOMContentLoaded', onready);
