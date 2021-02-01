import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectorCurrentBoxId, selectorOrderedBoxes } from './selector';
import { BoxColumn } from './BoxColumn';
import './BoxRow.css';
import { boxAddAction } from './action';

export const BoxRow = () => {
  const [nameValue, setName] = useState('');

  const currentBoxId = useSelector(selectorCurrentBoxId);
  const boxes = useSelector(selectorOrderedBoxes);
  const boxList = boxes.map(box => (
    <BoxColumn box={box} currentBoxId={currentBoxId}></BoxColumn>
  ));

  const dispatch = useDispatch();

  const handleClick = useCallback(() => {
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

  return (
    <div styleName='boxRow'>
      <div styleName='header'>BOX</div>
      <div
        styleName='addBoxButton'
        onClick={() => document.querySelector('dialog')!.setAttribute('open', 'true')}
      >
        Add Box
      </div>
      <dialog styleName='boxNameDialog'>
        <div styleName='dialogHeader'>
          Enter box name:
          <input
            type='text'
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
          Add
        </div>
        <div
          styleName='cancelButton'
          onClick={() => document.querySelector('dialog')!.removeAttribute('open')}
        >
          Cancel
        </div>
      </dialog>
      {boxList}
    </div>
  );
};
