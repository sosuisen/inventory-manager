import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectorCurrentBoxId, selectorMessages, selectorOrderedBoxes } from './selector';
import { BoxColumn } from './BoxColumn';
import './BoxRow.css';
import {
  boxAddActionCreator,
  boxDeleteActionCreator,
  boxRenameActionCreator,
} from './action';

export const BoxRow = () => {
  const [nameValue, setName] = useState('');

  const currentBoxId = useSelector(selectorCurrentBoxId);
  const boxes = useSelector(selectorOrderedBoxes);
  const boxList = boxes.map(box => (
    <BoxColumn box={box.name} currentBoxId={currentBoxId}></BoxColumn>
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
    dispatch(boxAddActionCreator(nameValue));
    setName('');
    document.getElementById('boxNameDialog')!.removeAttribute('open');
  }, [nameValue, boxes, dispatch]);

  const renameBox = useCallback(() => {
    if (nameValue === '') {
      return;
    }
    const sameName = boxes.filter(box => box.name === nameValue);
    if (sameName.length > 0) {
      return;
    }
    dispatch(boxRenameActionCreator(currentBoxId, nameValue));
    setName('');
    document.getElementById('boxRenameDialog')!.removeAttribute('open');
  }, [currentBoxId, nameValue, dispatch]);

  const deleteBox = useCallback(() => {
    dispatch(boxDeleteActionCreator(currentBoxId));
  }, [currentBoxId, dispatch]);

  return (
    <div styleName='boxRow'>
      <dialog id='boxNameDialog' styleName='boxNameDialog'>
        {messages.enterBoxName}
        <div>
          <input
            type='text'
            id='nameInputField'
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
          onClick={() => document.getElementById('boxNameDialog')!.removeAttribute('open')}
        >
          {messages.cancel}
        </div>
      </dialog>
      <dialog id='boxRenameDialog' styleName='boxNameDialog'>
        {messages.enterBoxName}
        <div>
          <input
            type='text'
            id='renameInputField'
            styleName='inputField'
            value={nameValue}
            onChange={e => setName(e.target.value)}
            onKeyPress={e => {
              if (e.key === 'Enter') {
                renameBox();
              }
            }}
          ></input>
        </div>
        <div styleName='changeButton' onClick={renameBox}>
          {messages.change}
        </div>
        <div
          styleName='cancelButton'
          onClick={() =>
            document.getElementById('boxRenameDialog')!.removeAttribute('open')
          }
        >
          {messages.cancel}
        </div>
      </dialog>

      <dialog id='alertDialog' styleName='alertDialog'>
        {messages.cannotDeleteBoxIfNotEmpty}
        <div
          styleName='okButton'
          onClick={() => document.getElementById('alertDialog')!.removeAttribute('open')}
        >
          {messages.ok}
        </div>
      </dialog>

      <div styleName='header'>
        <i className='fas fa-box-open'></i>
      </div>
      <div styleName='boxList'>{boxList}</div>

      <div styleName='deleteBoxButton' onClick={deleteBox} title={messages.delete}>
        <i className='far fa-trash-alt'></i>
      </div>

      <div
        styleName='renameBoxButton'
        onClick={() => {
          document.getElementById('boxRenameDialog')!.setAttribute('open', 'true');
          document.getElementById('renameInputField')!.focus();
        }}
        title={messages.changeBoxName}
      >
        <i className='far fa-edit'></i>
      </div>

      <div
        styleName='addBoxButton'
        onClick={() => {
          document.getElementById('boxNameDialog')!.setAttribute('open', 'true');
          document.getElementById('nameInputField')!.focus();
        }}
      >
        <i className='far fa-plus-square'></i>
      </div>
    </div>
  );
};
