import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectorCurrentBoxName, selectorCurrentItems, selectorMessages } from './selector';
import './ItemList.css';
import { ItemRow } from './ItemRow';

export const ItemList = () => {
  const messages = useSelector(selectorMessages);
  const currentItems = useSelector(selectorCurrentItems);
  const currentBoxName = useSelector(selectorCurrentBoxName);
  const [prevBoxName, setPrevBoxName] = useState(currentBoxName);
  const [prevItemLength, setPrevItemLength] = useState(currentItems.length);

  const itemList = currentItems.map((item, index) => (
    // must have key
    <ItemRow key={item._id} item={item} index={index}></ItemRow>
  ));

  useEffect(() => {
    if (prevItemLength < currentItems.length && prevBoxName === currentBoxName) {
      // Scroll to bottom after a new item is added.
      var element = document.documentElement;
      var bottom = element.scrollHeight - element.clientHeight;
      window.scroll(0, bottom);
    }
    setPrevItemLength(currentItems.length);
    setPrevBoxName(currentBoxName);
  });

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
      </div>
      {itemList}
    </div>
  );
};
