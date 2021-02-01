import React from 'react';
import './InventoryManager.css';
import { useSelector } from 'react-redux';
import { ItemRow } from './ItemRow';
import { InputArea } from './InputArea';
import { selectorCurrentBoxAndItems } from './selector';

export const InventoryManager = () => {
  const currentBox = useSelector(selectorCurrentBoxAndItems);

  const itemList = currentBox.items.map(item => <ItemRow item={item}></ItemRow>);

  return (
    <div>
      <div styleName='app'>Current box is [{currentBox.name}]</div>
      {itemList}
      <InputArea></InputArea>
    </div>
  );
};
