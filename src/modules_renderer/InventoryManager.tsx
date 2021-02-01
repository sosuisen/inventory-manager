import React from 'react';
import './InventoryManager.css';
import { useSelector } from 'react-redux';
import { ItemRow } from './ItemRow';
import { InputArea } from './InputArea';
import { InventoryState } from './store.types.inventory';

export const InventoryManager = () => {
  const currentBox = useSelector((state: InventoryState) => {
    const box = state.box[state.work.currentBox];
    const items = box ? box.items.map(_id => state.item[_id]) : [];
    return { name: box.name, items: items };
  });

  const itemList = currentBox.items.map(item => <ItemRow item={item}></ItemRow>);

  return (
    <div>
      <div styleName='app'>Current box is [{currentBox.name}]</div>
      {itemList}
      <InputArea></InputArea>
    </div>
  );
};
