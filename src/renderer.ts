import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { App } from './modules_renderer/App';
import { inventoryStore } from './modules_renderer/store';
import { AppInfo, Item } from './modules_common/store.types';
import { Messages } from './modules_common/i18n';

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
    default:
      break;
  }
});

// window.document.addEventListener('DOMContentLoaded', onready);
