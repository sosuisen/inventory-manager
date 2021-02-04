import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './ItemRow.css';
import { getLocalDateAndTime } from './utils';
import { selectorCurrentBoxId } from './selector';
import { itemDeleteAction, toggleTakeoutAction } from './action';
import { Item } from '../modules_common/store.types';

export const ItemRow = (prop: { item: Item; index: number }) => {
  const currentBoxId = useSelector(selectorCurrentBoxId);
  const dispatch = useDispatch();

  const deleteItem = useCallback(() => {
    dispatch(itemDeleteAction(currentBoxId, prop.item._id));
  }, [currentBoxId, prop.item._id, dispatch]);

  const toggleTakeout = useCallback(() => {
    dispatch(toggleTakeoutAction(prop.item._id));
  }, [prop.item._id, dispatch]);

  return (
    <div styleName={prop.index % 2 === 0 ? 'row color_bg' : 'row'}>
      <div styleName='col takeout'>
        <input
          type='radio'
          checked={prop.item.takeout}
          onClick={e => toggleTakeout()}
        ></input>
      </div>
      <div styleName='col name'>{prop.item.name}</div>
      <div styleName='col created_date'>
        {getLocalDateAndTime(prop.item.created_date).substr(0, 16)}
      </div>
      <div styleName='col modified_date'>
        {getLocalDateAndTime(prop.item.modified_date).substr(0, 16)}
      </div>
      <div styleName='col delete'>
        <div styleName='deleteButton' onClick={deleteItem}>
          <i className='far fa-trash-alt'></i>
        </div>
      </div>
    </div>
  );
};
