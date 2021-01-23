import * as React from 'react';
import './App.css';
import { InventoryContext, InventoryProvider } from './StoreProvider';

export const InventoryManager = () => {
  const [inventoryState]: InventoryProvider = React.useContext(InventoryContext);
  return <div styleName='app'>Current box is [{inventoryState.status.currentBox}]</div>;
};
