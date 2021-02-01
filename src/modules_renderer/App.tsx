import React from 'react';
import { Provider } from 'react-redux';
import { InventoryManager } from './InventoryManager';
import { inventoryStore } from './store.inventory';

export const App = () => {
  return (
    <Provider store={inventoryStore}>
      <InventoryManager></InventoryManager>
    </Provider>
  );
};
