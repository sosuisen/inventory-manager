import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  BOX_ITEM_DELETE,
  BoxAction,
  Item,
  ITEM_DELETE,
  ItemAction,
} from './store.types.inventory';
import './ItemRow.css';
import { getLocalDateAndTime } from './utils';
import { selectorCurrentBoxId } from './selector';

export const ItemRow = (prop: { item: Item }) => {
  const currentBoxId = useSelector(selectorCurrentBoxId);
  const dispatch = useDispatch();

  const deleteItem = useCallback(() => {
    const _id = prop.item._id;
    const itemAction: ItemAction = {
      type: ITEM_DELETE,
      payload: _id,
    };
    dispatch(itemAction);
    const boxAction: BoxAction = {
      type: BOX_ITEM_DELETE,
      payload: {
        box_id: currentBoxId,
        item_id: _id,
      },
    };
    dispatch(boxAction);
  }, [dispatch]);

  return (
    <div styleName='row'>
      <div styleName='col name'>{prop.item.name}</div>
      <div styleName='col created_date'>{getLocalDateAndTime(prop.item.created_date)}</div>
      <div styleName='col modified_date'>
        {getLocalDateAndTime(prop.item.modified_date)}
      </div>
      <div styleName='col takeout'>{prop.item.takeout.toString()}</div>
      <div styleName='col delete'>
        <div styleName='deleteButton' onClick={deleteItem}>
          Delete
        </div>
      </div>
    </div>
  );
};
