import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './ItemRow.css';
import { getLocalDateAndTime } from '../modules_common/utils';
import { selectorCurrentBoxId, selectorMessages } from './selector';
import { itemDeleteAction, itemNameUpdateAction, toggleTakeoutAction } from './action';
import { Item } from '../modules_common/store.types';

export const ItemRow = (prop: { item: Item; index: number }) => {
  const [propNameValue, setPropName] = useState(prop.item.name);
  const [nameValue, setName] = useState(prop.item.name);
  // Note: nameValue is not updated when prop.item.name is changed
  // because useState initializes value only at once.
  // So update nameValue by comparing old and current prop.item.name.
  if (propNameValue !== prop.item.name) {
    setPropName(prop.item.name);
    setName(prop.item.name);
  }
  const currentBoxId = useSelector(selectorCurrentBoxId);
  const messages = useSelector(selectorMessages);

  const dispatch = useDispatch();

  const deleteItem = useCallback(() => {
    dispatch(itemDeleteAction(currentBoxId, prop.item._id));
  }, [currentBoxId, prop.item._id, dispatch]);

  const toggleTakeout = useCallback(() => {
    dispatch(toggleTakeoutAction(prop.item._id));
  }, [prop.item._id, dispatch]);

  const changeName = useCallback(
    (elm: HTMLElement) => {
      dispatch(itemNameUpdateAction(prop.item._id, nameValue, elm));
    },
    [nameValue, dispatch]
  );

  return (
    <div styleName={prop.index % 2 === 0 ? 'row color_bg' : 'row'}>
      <div styleName='col takeout'>
        <input
          type='radio'
          checked={prop.item.takeout}
          onClick={e => toggleTakeout()}
        ></input>
      </div>
      <div styleName='col name'>
        <input
          type='text'
          styleName='nameField'
          className='nameField'
          value={nameValue}
          onChange={e => setName(e.target.value)}
          onKeyPress={e => {
            if (e.key === 'Enter') {
              changeName((e.target as unknown) as HTMLElement);
            }
          }}
          onBlur={e => changeName((e.target as unknown) as HTMLElement)}
        ></input>
      </div>
      <div styleName='col created_date'>
        {getLocalDateAndTime(prop.item.created_date).substr(0, 16)}
      </div>
      <div styleName='col modified_date'>
        {getLocalDateAndTime(prop.item.modified_date).substr(0, 16)}
      </div>
      <div styleName='col delete' title={messages.delete}>
        <div styleName='deleteButton' onClick={deleteItem}>
          <i className='far fa-trash-alt'></i>
        </div>
      </div>
    </div>
  );
};
