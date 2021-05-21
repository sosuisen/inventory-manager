/**
 * Inventory Manager
 * Copyright (c) Hidekazu Kubota
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './ItemRow.css';
import { getLocalDateAndTime } from '../modules_common/utils';
import { selectorCurrentBoxId, selectorMessages } from './selector';
import {
  itemDeleteActionCreator,
  itemNameUpdateActionCreator,
  toggleTakeoutActionCreator,
} from './actionCreator';
import { Item } from '../modules_common/store.types';

export const ItemRow = (prop: { item: Item; index: number }) => {
  const [nameValue, setName] = useState(prop.item.name);
  const [prevNameValue, setPrevName] = useState(prop.item.name);

  const currentBoxId = useSelector(selectorCurrentBoxId);
  const messages = useSelector(selectorMessages);

  const dispatch = useDispatch();

  const deleteItem = useCallback(() => {
    dispatch(itemDeleteActionCreator(prop.item._id));
  }, [currentBoxId, prop.item._id, dispatch]);

  const toggleTakeout = useCallback(() => {
    dispatch(toggleTakeoutActionCreator(prop.item._id));
  }, [prop.item._id, dispatch]);

  const changeName = useCallback(
    (elm: HTMLElement) => {
      dispatch(itemNameUpdateActionCreator(prop.item._id, nameValue, elm));
    },
    [nameValue, dispatch]
  );

  useEffect(() => {
    if (prevNameValue !== prop.item.name) {
      setName(prop.item.name);
    }
    setPrevName(prop.item.name);
  });
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
          id={prop.item._id}
          styleName='nameField'
          placeholder={messages.firstItemName}
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
