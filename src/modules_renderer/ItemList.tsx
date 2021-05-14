import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectorCurrentBoxName, selectorCurrentItems, selectorMessages } from './selector';
import './ItemList.css';
import { ItemRow } from './ItemRow';
import {
  itemAddAction,
  WorkItemAddedUpdateAction,
  WorkItemDeletedUpdateAction,
} from './action';
import { inventoryStore } from './store';

export const ItemList = () => {
  const dispatch = useDispatch();

  const messages = useSelector(selectorMessages);
  const currentItems = useSelector(selectorCurrentItems);
  const currentBoxName = useSelector(selectorCurrentBoxName);

  const [nameValue, setName] = useState('');
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
    if (prevBoxName !== currentBoxName) {
      document.getElementById('nameField')!.focus();
    }
    else if (prevBoxName === currentBoxName) {
      if (inventoryStore.getState().work.itemAdded) {
        if (inventoryStore.getState().work.latestChangeFrom === 'local') {
          // Scroll to bottom after a new item is added.
          var element = document.documentElement;
          var bottom = element.scrollHeight - element.clientHeight;
          window.scroll(0, bottom);

          // Focus inline input field
          const inlineField = document.getElementById('inlineNameField');
          if (inlineField) inlineField.focus();
        }
        const workAction: WorkItemAddedUpdateAction = {
          type: 'work-item-added-update',
          payload: false,
        };
        dispatch(workAction);
      }

      if (inventoryStore.getState().work.itemDeleted) {
        if (inventoryStore.getState().work.latestChangeFrom === 'local') {
          // Focus inline input field
          const inlineField = document.getElementById('inlineNameField');
          if (inlineField) inlineField.focus();
        }
        const workAction: WorkItemDeletedUpdateAction = {
          type: 'work-item-deleted-update',
          payload: false,
        };
        dispatch(workAction);
      }
    }

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
      {newLine}
    </div>
  );
};
