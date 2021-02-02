import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { App } from './modules_renderer/App';
import { inventoryStore } from './modules_renderer/store';
import { Box, Item, WorkState } from './modules_common/store.types';

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

      const domContainer = document.getElementById('react-container');
      ReactDOM.render(React.createElement(App), domContainer);

      break;
    }
    default:
      break;
  }
});

// window.document.addEventListener('DOMContentLoaded', onready);
