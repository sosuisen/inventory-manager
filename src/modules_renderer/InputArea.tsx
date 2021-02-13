import React, { useCallback, useEffect, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import './InputArea.css';
import { selectorCurrentBoxId, selectorMessages } from './selector';
import { itemAddAction } from './action';

export const InputArea = () => {
  const [nameValue, setName] = useState('');

  const messages = useSelector(selectorMessages);
  const currentBoxId = useSelector(selectorCurrentBoxId);
  const dispatch = useDispatch();

  const handleClick = useCallback(() => {
    dispatch(itemAddAction(currentBoxId, nameValue));
    setName('');
  }, [currentBoxId, nameValue, dispatch]);

  useEffect(() => {
    // scroll to bottom
    var element = document.documentElement;
    var bottom = element.scrollHeight - element.clientHeight;
    window.scroll(0, bottom);
  });

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
