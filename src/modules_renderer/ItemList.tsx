import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectorCurrentBoxName, selectorCurrentItems, selectorMessages } from './selector';
import './ItemList.css';
import { ItemRow } from './ItemRow';
import { itemAddAction } from './action';

export const ItemList = () => {
  const [nameValue, setName] = useState('');
  const dispatch = useDispatch();
  const messages = useSelector(selectorMessages);
  const [currentItems, firstItemName] = useSelector(selectorCurrentItems);
  const currentBoxName = useSelector(selectorCurrentBoxName);
  const [prevBoxName, setPrevBoxName] = useState(currentBoxName);
  const [prevItemLength, setPrevItemLength] = useState(currentItems.length);

  const itemList = currentItems.map((item, index) => (
    // must have key
    <ItemRow key={item._id} item={item} index={index}></ItemRow>
  ));

  const handleClick = useCallback(() => {
    dispatch(itemAddAction(currentBoxName, nameValue));
    setName('');
  }, [currentBoxName, nameValue, dispatch]);

  const newLine = (
    <div styleName='row'>
      <div styleName='col takeout'></div>
      <div styleName='col name'>
        <input
          type='text'
          styleName='field'
          id='nameField'
          placeholder={messages.firstItemName}
          value={nameValue}
          onChange={e => setName(e.target.value)}
          onKeyPress={e => {
            if (e.key === 'Enter') {
              handleClick();
            }
          }}
        ></input>
      </div>
      <div styleName='col created_date'></div>
      <div styleName='col modified_date'></div>
      <div styleName='col delete'></div>
    </div>
  );

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
      {/* header */}
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
      {/* body */}
      {itemList}
      {currentItems.length > 1 || firstItemName !== '' ? newLine : ''}
    </div>
  );
};
