import React, { useCallback, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import './InputArea.css';
import { selectorCurrentBoxId, selectorMessages } from './selector';
import { itemAddActionCreator } from './action';

export const InputArea = () => {
  const [nameValue, setName] = useState('');

  const messages = useSelector(selectorMessages);
  const currentBoxId = useSelector(selectorCurrentBoxId);
  const dispatch = useDispatch();

  const handleClick = useCallback(() => {
    dispatch(itemAddActionCreator(currentBoxId, nameValue));
    setName('');
  }, [currentBoxId, nameValue, dispatch]);

  return (
    <div styleName='inputArea'>
      <div styleName='name'>
        <div styleName='header'>
          <i className='fas fa-shapes'></i>
        </div>
        <input
          type='text'
          styleName='field'
          id='nameField'
          value={nameValue}
          onChange={e => setName(e.target.value)}
          onKeyPress={e => {
            if (e.key === 'Enter') {
              handleClick();
            }
          }}
        ></input>
      </div>
      <div styleName='addButton' onClick={handleClick}>
        <i className='far fa-plus-square'></i> {messages.item}
      </div>
    </div>
  );
};
