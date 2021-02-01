import React, { useCallback, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import './InputArea.css';
import { selectorCurrentBoxId } from './selector';
import { itemAddAction } from './action';

export const InputArea = () => {
  const [nameValue, setName] = useState('');

  const currentBoxId = useSelector(selectorCurrentBoxId);
  const dispatch = useDispatch();

  const handleClick = useCallback(() => {
    dispatch(itemAddAction(currentBoxId, nameValue));
  }, [currentBoxId, nameValue, dispatch]);

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
