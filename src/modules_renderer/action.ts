import { nanoid } from 'nanoid';
import { Dispatch } from 'redux';
import { DatabaseCommand } from '../modules_common/types';
import {
  BOX_ITEM_ADD,
  BOX_ITEM_DELETE,
  BoxAction,
  InventoryState,
  ITEM_ADD,
  ITEM_DELETE,
  ItemAction,
} from './store.types.inventory';
import window from './window';

const generateId = () => {
  return 'id' + nanoid(21); // 23 characters include only 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-
};
export const itemAddAction = (boxId: string, nameValue: string) => {
  return function (dispatch: Dispatch<any>, getState: () => InventoryState) {
    // put()
    const _id = generateId();
    const itemAction: ItemAction = {
      type: ITEM_ADD,
      payload: {
        _id: _id,
        name: nameValue,
      },
    };
    dispatch(itemAction);
    const newItem = getState().item[_id];
    const itemAddCommand: DatabaseCommand = {
      table: 'item',
      action: 'create',
      data: newItem,
    };
    window.api.db(itemAddCommand);

    const boxAction: BoxAction = {
      type: BOX_ITEM_ADD,
      payload: {
        box_id: boxId,
        item_id: _id,
      },
    };
    dispatch(boxAction);

    const newBox = getState().box[boxId];
    const boxUpdateCommand: DatabaseCommand = {
      table: 'box',
      action: 'update',
      data: newBox,
    };
    window.api.db(boxUpdateCommand);
  };
};

export const itemDeleteAction = (boxId: string, itemId: string) => {
  return function (dispatch: Dispatch<any>, getState: () => InventoryState) {
    const itemAction: ItemAction = {
      type: ITEM_DELETE,
      payload: itemId,
    };
    dispatch(itemAction);
    const boxAction: BoxAction = {
      type: BOX_ITEM_DELETE,
      payload: {
        box_id: boxId,
        item_id: itemId,
      },
    };
    dispatch(boxAction);

    const itemDeleteCommand: DatabaseCommand = {
      table: 'item',
      action: 'delete',
      data: itemId,
    };
    window.api.db(itemDeleteCommand);

    const newBox = getState().box[boxId];
    const boxUpdateCommand: DatabaseCommand = {
      table: 'box',
      action: 'update',
      data: newBox,
    };
    window.api.db(boxUpdateCommand);
  };
};
