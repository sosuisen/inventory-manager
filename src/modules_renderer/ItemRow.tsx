import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './ItemRow.css';
import { getLocalDateAndTime } from '../modules_common/utils';
import { selectorCurrentBoxName, selectorMessages } from './selector';
import { itemDeleteAction, itemNameUpdateAction, toggleTakeoutAction } from './action';
import { Item } from '../modules_common/store.types';

export const ItemRow = (prop: { item: Item; index: number }) => {
  const [nameValue, setName] = useState(prop.item.name);

  const currentBoxName = useSelector(selectorCurrentBoxName);
  const messages = useSelector(selectorMessages);

  const dispatch = useDispatch();

  const deleteItem = useCallback(() => {
    dispatch(itemDeleteAction(currentBoxName, prop.item._id));
  }, [currentBoxName, prop.item._id, dispatch]);

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
