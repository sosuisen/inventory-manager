import React from 'react';
import { useSelector } from 'react-redux';
import { selectorCurrentItems, selectorMessages } from './selector';
import './ItemList.css';
import { ItemRow } from './ItemRow';

export const ItemList = () => {
  const messages = useSelector(selectorMessages);
  const currentItems = useSelector(selectorCurrentItems);
  const itemList = currentItems.map((item, index) => (
    <ItemRow item={item} index={index}></ItemRow>
  ));

  return (
    <div styleName='itemList'>
      <div styleName='row'>
        <div styleName='col takeout'>
          <i className='fas fa-exclamation-circle' title={messages.takeout}></i>
        </div>
        <div styleName='col name'>
          <i className='fas fa-list'></i>&nbsp;&nbsp;&nbsp;{messages.name}
        </div>
        <div styleName='col created_date'>{messages.created_date}</div>
        <div styleName='col modified_date'>{messages.modified_date}</div>
        <div styleName='col delete'></div>
      </div>{' '}
      {itemList}
    </div>
  );
};
