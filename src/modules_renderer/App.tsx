import * as React from 'react';
import './App.css';
import { InventoryManager } from './InventoryManager';
import { StoreProvider } from './StoreProvider';

export const App = () => {
  return (
    <StoreProvider>
      <InventoryManager></InventoryManager>
    </StoreProvider>
  );
};
