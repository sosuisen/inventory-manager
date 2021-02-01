import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { App } from './modules_renderer/App';
import { inventoryStore } from './modules_renderer/store.inventory';
import { Box, BOX_INIT, Item, ITEM_INIT } from './modules_renderer/store.types.inventory';

// eslint-disable-next-line complexity
window.addEventListener('message', event => {
  if (event.source !== window || !event.data.command) return;

  switch (event.data.command) {
    case 'initialize-store': {
      const items: { [key: string]: Item } = event.data.items;
      const boxes: { [key: string]: Box } = event.data.boxes;

      inventoryStore.dispatch({
        type: ITEM_INIT,
        payload: items,
      });
      inventoryStore.dispatch({
        type: BOX_INIT,
        payload: boxes,
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
