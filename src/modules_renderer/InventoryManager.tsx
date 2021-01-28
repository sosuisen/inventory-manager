import * as React from 'react';
import './InventoryManager.css';
import { ItemRow } from './ItemRow';
import { InputArea } from './InputArea';
import { InventoryContext, InventoryProvider } from './StoreProvider';

export const InventoryManager = () => {
  const [inventoryState] = React.useContext(InventoryContext) as InventoryProvider;
  const currentBox = inventoryState.box[inventoryState.work.currentBox];

  let itemList;
  if (currentBox) {
    itemList = currentBox.items.map(_id => {
      const item = inventoryState.item[_id];
      return <ItemRow item={item}></ItemRow>;
    });
  }
  return (
    <div>
      <div styleName='app'>Current box is [{inventoryState.work.currentBox}]</div>
      {itemList}
      <InputArea></InputArea>
    </div>
  );
};
