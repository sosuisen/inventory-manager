import React from 'react';
import { useSelector } from 'react-redux';
import { selectorCurrentItems } from './selector';
import './ItemList.css';
import { ItemRow } from './ItemRow';

export const ItemList = () => {
  const currentItems = useSelector(selectorCurrentItems);
  const itemList = currentItems.map((item, index) => (
    <ItemRow item={item} index={index}></ItemRow>
  ));

  return (
    <div styleName='itemList'>
      <div styleName='header'>
        <i className='fas fa-list'></i>
      </div>
      {itemList}
    </div>
  );
};
