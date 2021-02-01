import React, { useCallback, useState } from 'react';
import { nanoid } from 'nanoid';

import { useDispatch, useSelector } from 'react-redux';

import {
  BOX_ITEM_ADD,
  BoxAction,
  InventoryState,
  ITEM_ADD,
  ItemAction,
} from './store.types.inventory';
import './InputArea.css';

const generateId = () => {
  return 'id' + nanoid(21); // 23 characters include only 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-
};

export const InputArea = () => {
  const [nameValue, setName] = useState('');

  const currentBoxId = useSelector((state: InventoryState) => state.work.currentBox);
  const dispatch = useDispatch();

  const handleClick = useCallback(() => {
    const _id = generateId();
    const itemAction: ItemAction = {
      type: ITEM_ADD,
      payload: {
        _id: _id,
        name: nameValue,
      },
    };
    dispatch(itemAction);
    const boxAction: BoxAction = {
      type: BOX_ITEM_ADD,
      payload: {
        box_id: currentBoxId,
        item_id: _id,
      },
    };
    dispatch(boxAction);
  }, [nameValue, dispatch]);

  return (
    <div styleName='inputArea'>
      <div styleName='nameField'>
        Name:{' '}
        <input
          type='text'
          id='nameField'
          value={nameValue}
          onChange={e => setName(e.target.value)}
        ></input>
      </div>
      <div styleName='addButton' onClick={handleClick}>
        Add
      </div>
    </div>
  );
};
