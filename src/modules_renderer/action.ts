import { nanoid } from 'nanoid';
import { Dispatch } from 'redux';
import { DatabaseCommand, InventoryActionType } from '../modules_common/action.types';
import { Box, InventoryState, Item, WorkState } from './store.types.inventory';
import window from './window';

const generateId = () => {
  return 'id' + nanoid(21); // 23 characters include only 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-
};

export interface InventoryActionBase {
  type: InventoryActionType;
  payload: any;
}

export interface ItemInitAction extends InventoryActionBase {
  type: 'item-init';
  payload: {
    [key: string]: Item;
  };
}

export interface ItemAddAction extends InventoryActionBase {
  type: 'item-add';
  payload: {
    _id: string;
    name: string;
  };
}

export interface ItemUpdateAction extends InventoryActionBase {
  type: 'item-update';
  payload: {
    _id: string;
    name?: string;
    takeout?: boolean;
  };
}

/**
 * payload: _id of item
 */
export interface ItemDeleteAction extends InventoryActionBase {
  type: 'item-delete';
  payload: string;
}

export interface BoxInitAction extends InventoryActionBase {
  type: 'box-init';
  payload: {
    [key: string]: Box;
  };
}

export interface BoxAddAction extends InventoryActionBase {
  type: 'box-add';
  payload: {
    _id: string;
    name: string;
  };
}

export interface BoxUpdateAction extends InventoryActionBase {
  type: 'box-update';
  payload: {
    _id: string;
    name: string;
  };
}

export interface BoxDeleteAction extends InventoryActionBase {
  type: 'box-delete';
  payload: string;
}

export interface BoxItemAddAction extends InventoryActionBase {
  type: 'box-item-add';
  payload: {
    box_id: string;
    item_id: string;
  };
}

export interface BoxItemDeleteAction extends InventoryActionBase {
  type: 'box-item-delete';
  payload: {
    box_id: string;
    item_id: string;
  };
}

export interface WorkInitAction extends InventoryActionBase {
  type: 'work-init';
  payload: WorkState;
}

/**
 * payload: _id of box
 */
export interface WorkBoxOrderAddAction extends InventoryActionBase {
  type: 'work-box-order-add';
  payload: string;
}

/**
 * payload: _id of box
 */
export interface WorkBoxOrderDeleteAction extends InventoryActionBase {
  type: 'work-box-order-delete';
  payload: string;
}

/**
 * payload: _id of box
 */
export interface WorkCurrentBoxAddAction extends InventoryActionBase {
  type: 'work-current-box-add';
  payload: string;
}

/**
 * payload: _id of box
 */
export interface WorkCurrentBoxUpdateAction extends InventoryActionBase {
  type: 'work-current-box-update';
  payload: string;
}

export type ItemAction =
  | ItemInitAction
  | ItemAddAction
  | ItemUpdateAction
  | ItemDeleteAction;

export type BoxAction =
  | BoxInitAction
  | BoxAddAction
  | BoxUpdateAction
  | BoxDeleteAction
  | BoxItemAddAction
  | BoxItemDeleteAction;

export type WorkAction =
  | WorkInitAction
  | WorkBoxOrderAddAction
  | WorkBoxOrderDeleteAction
  | WorkCurrentBoxAddAction
  | WorkCurrentBoxUpdateAction;

export type InventoryAction = ItemAction | BoxAction | WorkAction;

/**
 * Action creators (redux-thunk)
 */

export const itemAddAction = (boxId: string, nameValue: string) => {
  return function (dispatch: Dispatch<any>, getState: () => InventoryState) {
    // put()
    const _id = generateId();
    const itemAction: ItemAddAction = {
      type: 'item-add',
      payload: {
        _id: _id,
        name: nameValue,
      },
    };
    dispatch(itemAction);
    const newItem = getState().item[_id];
    const itemCommand: DatabaseCommand = {
      action: 'item-add',
      data: newItem,
    };
    window.api.db(itemCommand);

    const boxAction: BoxItemAddAction = {
      type: 'box-item-add',
      payload: {
        box_id: boxId,
        item_id: _id,
      },
    };
    dispatch(boxAction);

    const newBox = getState().box[boxId];
    const boxCommand: DatabaseCommand = {
      action: 'box-item-add',
      data: newBox,
    };
    window.api.db(boxCommand);
  };
};

export const itemDeleteAction = (boxId: string, itemId: string) => {
  return function (dispatch: Dispatch<any>, getState: () => InventoryState) {
    const itemAction: ItemDeleteAction = {
      type: 'item-delete',
      payload: itemId,
    };
    dispatch(itemAction);

    const boxAction: BoxItemDeleteAction = {
      type: 'box-item-delete',
      payload: {
        box_id: boxId,
        item_id: itemId,
      },
    };
    dispatch(boxAction);

    const itemDeleteCommand: DatabaseCommand = {
      action: 'item-delete',
      data: itemId,
    };
    window.api.db(itemDeleteCommand);

    const newBox = getState().box[boxId];
    const boxCommand: DatabaseCommand = {
      action: 'box-update',
      data: newBox,
    };
    window.api.db(boxCommand);
  };
};

export const boxAddAction = (name: string) => {
  return function (dispatch: Dispatch<any>, getState: () => InventoryState) {
    // put()
    const _id = generateId();
    const boxAction: BoxAddAction = {
      type: 'box-add',
      payload: {
        _id: _id,
        name,
      },
    };
    dispatch(boxAction);

    const newBox = getState().box[_id];
    const boxCreateCommand: DatabaseCommand = {
      action: 'box-add',
      data: newBox,
    };
    window.api.db(boxCreateCommand);

    const workAction: WorkBoxOrderAddAction = {
      type: 'work-box-order-add',
      payload: _id,
    };
    dispatch(workAction);

    const newWork = getState().work;
    const workCommand: DatabaseCommand = {
      action: 'work-update',
      data: newWork,
    };
    window.api.db(workCommand);
  };
};

export const boxDeleteAction = (_id: string) => {
  return function (dispatch: Dispatch<any>, getState: () => InventoryState) {
    const boxAction: BoxDeleteAction = {
      type: 'box-delete',
      payload: _id,
    };
    dispatch(boxAction);

    const newBox = getState().box[_id];
    const boxCommand: DatabaseCommand = {
      action: 'box-delete',
      data: newBox,
    };
    window.api.db(boxCommand);

    const workAction: WorkBoxOrderDeleteAction = {
      type: 'work-box-order-delete',
      payload: _id,
    };
    dispatch(workAction);

    const newWork = getState().work;
    const workCommand: DatabaseCommand = {
      action: 'work-update',
      data: newWork,
    };
    window.api.db(workCommand);
  };
};

export const boxSelectAction = (_id: string) => {
  return function (dispatch: Dispatch<any>, getState: () => InventoryState) {
    const workAction: WorkCurrentBoxUpdateAction = {
      type: 'work-current-box-update',
      payload: _id,
    };
    dispatch(workAction);

    const newWork = getState().work;
    const workCommand: DatabaseCommand = {
      action: 'work-update',
      data: newWork,
    };
    window.api.db(workCommand);
  };
};
