import React from 'react';
import { ItemList } from './ItemList';
import { InputArea } from './InputArea';
import { BoxRow } from './BoxRow';
import './InventoryManager.css';

export const InventoryManager = () => {
  return (
    <div styleName='inventoryManager'>
      <div styleName='header'>Inventory Manager</div>
      <BoxRow />
      <InputArea />
      <ItemList />
      <br style={{ clear: 'both' }}></br>
      <InputArea />
    </div>
  );
};
