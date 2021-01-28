import * as React from 'react';
import { nanoid } from 'nanoid';
import { BOX_ITEM_ADD, BoxAction, ITEM_ADD, ItemAction } from './store.types.inventory';
import { InventoryContext, InventoryProvider } from './StoreProvider';
import './InputArea.css';

const generateId = () => {
  return 'id' + nanoid(21); // 23 characters include only 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-
};

export const InputArea = () => {
  const [nameValue, setName] = React.useState('');

  const [state, dispatch]: InventoryProvider = React.useContext(InventoryContext);
  const handleClick = () => {
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
        box_id: state.work.currentBox,
        item_id: _id,
      },
    };
    dispatch(boxAction);
  };

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
