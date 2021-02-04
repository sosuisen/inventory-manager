import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectorCurrentBoxId, selectorMessages, selectorOrderedBoxes } from './selector';
import { BoxColumn } from './BoxColumn';
import './BoxRow.css';
import { boxAddAction, boxDeleteAction } from './action';

export const BoxRow = () => {
  const [nameValue, setName] = useState('');

  const currentBoxId = useSelector(selectorCurrentBoxId);
  const boxes = useSelector(selectorOrderedBoxes);
  const boxList = boxes.map(box => (
    <BoxColumn box={box} currentBoxId={currentBoxId}></BoxColumn>
  ));

  const messages = useSelector(selectorMessages);

  const dispatch = useDispatch();

  const addBox = useCallback(() => {
    if (nameValue === '') {
      return;
    }
    const sameName = boxes.filter(box => box.name === nameValue);
    if (sameName.length > 0) {
      return;
    }
    dispatch(boxAddAction(nameValue));
    setName('');
    document.querySelector('dialog')!.removeAttribute('open');
  }, [nameValue, boxes, dispatch]);

  const deleteBox = useCallback(() => {
    dispatch(boxDeleteAction(currentBoxId));
  }, [currentBoxId, dispatch]);

  return (
    <div styleName='boxRow'>
      <dialog styleName='boxNameDialog'>
        <div styleName='dialogHeader'>
          {messages.enterBoxName}
          <div>
            <input
              type='text'
              id='inputField'
              styleName='inputField'
              value={nameValue}
              onChange={e => setName(e.target.value)}
              onKeyPress={e => {
                if (e.key === 'Enter') {
                  addBox();
                }
              }}
            ></input>
          </div>
          <div styleName='addButton' onClick={addBox}>
            {messages.add}
          </div>
          <div
            styleName='cancelButton'
            onClick={() => document.querySelector('dialog')!.removeAttribute('open')}
          >
            {messages.cancel}
          </div>
        </div>
      </dialog>
      <div styleName='header'>
        <i className='fas fa-box-open'></i>
      </div>
      {boxList}
      <div
        styleName='addBoxButton'
        onClick={() => {
          document.querySelector('dialog')!.setAttribute('open', 'true');
          document.getElementById('inputField')!.focus();
        }}
      >
        <i className='far fa-plus-square'></i>
      </div>

      <div styleName='deleteBoxButton' onClick={deleteBox}>
        <i className='far fa-trash-alt'></i>
      </div>
    </div>
  );
};
