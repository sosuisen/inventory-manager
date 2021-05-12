import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectorCurrentBoxName, selectorCurrentItems, selectorMessages } from './selector';
import './ItemList.css';
import { ItemRow } from './ItemRow';
import { itemAddAction } from './action';
import { inventoryStore } from './store';

export const ItemList = () => {
  const dispatch = useDispatch();

  const messages = useSelector(selectorMessages);
  const [currentItems, firstItemName] = useSelector(selectorCurrentItems);
  const currentBoxName = useSelector(selectorCurrentBoxName);

  const [nameValue, setName] = useState('');
  const [prevFirstItemName, setPrevFirstItemName] = useState(firstItemName);
  const [prevBoxName, setPrevBoxName] = useState('');
  const [prevItemLength, setPrevItemLength] = useState(currentItems.length);

  const itemList = currentItems.map((item, index) => (
    // must have key
    <ItemRow key={item._id} item={item} index={index}></ItemRow>
  ));

  const handleClick = useCallback(() => {
    dispatch(itemAddAction(currentBoxName, nameValue));
    setName('');
  }, [currentBoxName, nameValue, dispatch]);

  // eslint-disable-next-line complexity
  useEffect(() => {
    if (inventoryStore.getState().work.changeFrom === 'remote') {
      // nop
    }
    else if (prevBoxName !== currentBoxName) {
      document.getElementById('nameField')!.focus();
    }
    else if (prevBoxName === currentBoxName) {
      if (prevItemLength < currentItems.length) {
        // Scroll to bottom after a new item is added.
        var element = document.documentElement;
        var bottom = element.scrollHeight - element.clientHeight;
        window.scroll(0, bottom);

        // Focus inline input field
        const inlineField = document.getElementById('inlineNameField');
        if (inlineField) inlineField.focus();
      }

      if (prevFirstItemName === '' && firstItemName !== '') {
        // Focus inline input field
        const inlineField = document.getElementById('inlineNameField');
        if (inlineField) inlineField.focus();
      }

      if (!(document.activeElement instanceof HTMLInputElement)) {
        // Focus inline input field
        const inlineField = document.getElementById('inlineNameField');
        if (inlineField) inlineField.focus();
        else if (currentItems.length === 1 && firstItemName === '') {
          const nameField = document.getElementById(currentItems[0]._id);
          if (nameField) nameField.focus();
        }
      }
    }

    setPrevFirstItemName(firstItemName);
    setPrevItemLength(currentItems.length);
    setPrevBoxName(currentBoxName);
  });

  const newLine = (
    <div styleName='row'>
      <div styleName='col takeout'></div>
      <div styleName='col name'>
        <input
          type='text'
          styleName='field'
          id='inlineNameField'
          placeholder={messages.firstItemName}
          value={nameValue}
          onChange={e => setName(e.target.value)}
          onKeyPress={e => {
            if (e.key === 'Enter') {
              handleClick();
            }
          }}
          onBlur={() => handleClick()}
        ></input>
      </div>
      <div styleName='col created_date'></div>
      <div styleName='col modified_date'></div>
      <div styleName='col delete'></div>
    </div>
  );

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
