import * as React from 'react';
import './InventoryManager.css';
import { ItemRow } from './ItemRow';
import { InventoryContext, InventoryProvider } from './StoreProvider';

export const InventoryManager = () => {
  const [inventoryState]: InventoryProvider = React.useContext(InventoryContext);
  const currentBox = inventoryState.box.find(
    elm => elm._id === inventoryState.status.currentBox
  );
  let itemList;
  if (currentBox) {
    itemList = currentBox.items.map(_id => {
      const item = inventoryState.item[_id];
      return <ItemRow item={item}></ItemRow>;
    });
  }
  return (
    <div>
      <div styleName='app'>Current box is [{inventoryState.status.currentBox}]</div>
      {itemList}
    </div>
  );
};
