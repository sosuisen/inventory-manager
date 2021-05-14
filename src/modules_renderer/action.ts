import { Dispatch } from 'redux';
import { DatabaseCommand, InventoryActionType } from '../modules_common/action.types';
import {
  InventoryState,
  Item,
  LatestChangeFrom,
  SyncInfo,
  WorkState,
} from '../modules_common/store.types';
import { generateId } from '../modules_common/utils';
import window from './window';

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
    box: string;
  };
}

export interface ItemUpdateAction extends InventoryActionBase {
  type: 'item-update';
  payload: {
    _id: string;
    name?: string;
    takeout?: boolean;
    box?: string;
  };
}

export interface ItemInsertAction extends InventoryActionBase {
  type: 'item-insert';
  payload: Item;
}

export interface ItemReplaceAction extends InventoryActionBase {
  type: 'item-replace';
  payload: Item;
}

/**
 * payload: _id of item
 */
export interface ItemDeleteAction extends InventoryActionBase {
  type: 'item-delete';
  payload: string;
}

export type ItemAction =
  | ItemInitAction
  | ItemAddAction
  | ItemUpdateAction
  | ItemInsertAction
  | ItemReplaceAction
  | ItemDeleteAction;

export interface BoxInitAction extends InventoryActionBase {
  type: 'box-init';
  payload: {
    [key: string]: string[];
  };
}

export interface BoxAddAction extends InventoryActionBase {
  type: 'box-add';
  payload: {
    name: string;
  };
}
export interface BoxUpdateAction extends InventoryActionBase {
  type: 'box-update';
  payload: {
    old_name: string;
    new_name: string;
  };
}

export interface BoxDeleteAction extends InventoryActionBase {
  type: 'box-delete';
  payload: string;
}

export interface BoxItemAddAction extends InventoryActionBase {
  type: 'box-item-add';
  payload: {
    box_name: string;
    item_id: string;
  };
}

export interface BoxItemDeleteAction extends InventoryActionBase {
  type: 'box-item-delete';
  payload: {
    box_name: string;
    item_id: string;
  };
}

export type BoxAction =
  | BoxInitAction
  | BoxAddAction
  | BoxUpdateAction
  | BoxDeleteAction
  | BoxItemAddAction
  | BoxItemDeleteAction;

export interface WorkInitAction extends InventoryActionBase {
  type: 'work-init';
  payload: WorkState;
}

export interface WorkCurrentBoxUpdateAction extends InventoryActionBase {
  type: 'work-current-box-update';
  payload: string;
}

export interface WorkSynchronizingUpdateAction extends InventoryActionBase {
  type: 'work-synchronizing-update';
  payload: boolean;
}

export interface WorkSyncInfoUpdateAction extends InventoryActionBase {
  type: 'work-sync-info-update';
  payload: SyncInfo | undefined;
}

export interface WorkLatestChangeFromUpdateAction extends InventoryActionBase {
  type: 'work-latest-change-from-update';
  payload: LatestChangeFrom;
}

export interface WorkItemAddedUpdateAction extends InventoryActionBase {
  type: 'work-item-added-update';
  payload: boolean;
}

export interface WorkItemDeletedUpdateAction extends InventoryActionBase {
  type: 'work-item-deleted-update';
  payload: boolean;
}

export type WorkAction =
  | WorkInitAction
  | WorkCurrentBoxUpdateAction
  | WorkSynchronizingUpdateAction
  | WorkSyncInfoUpdateAction
  | WorkLatestChangeFromUpdateAction
  | WorkItemAddedUpdateAction
  | WorkItemDeletedUpdateAction;

export type InventoryAction = ItemAction | BoxAction | WorkAction;

/**
 * Action creators (redux-thunk)
 */

export const itemAddAction = (
  boxName: string,
  nameValue: string,
  latestChangeFrom: LatestChangeFrom = 'local'
) => {
  return function (dispatch: Dispatch<any>, getState: () => InventoryState) {
    if (nameValue === '' || nameValue.match(/^\s+$/)) {
      return;
    }
    const latestChangeFromAction: WorkLatestChangeFromUpdateAction = {
      type: 'work-latest-change-from-update',
      payload: latestChangeFrom,
    };
    dispatch(latestChangeFromAction);

    if (
      getState().box[boxName].length === 1 &&
      getState().item[getState().box[boxName][0]].name === ''
    ) {
      // Update first empty item
      const _id = getState().box[boxName][0];
      const itemAction: ItemUpdateAction = {
        type: 'item-update',
        payload: {
          _id,
          name: nameValue,
        },
      };
      dispatch(itemAction);

      if (latestChangeFrom === 'local') {
        const newItem = getState().item[_id];
        const itemCommand: DatabaseCommand = {
          action: 'item-update',
          data: newItem,
        };
        window.api.db(itemCommand);
      }
      return;
    }

    const _id = generateId();
    const itemAction: ItemAddAction = {
      type: 'item-add',
      payload: {
        _id: _id,
        name: nameValue,
        box: boxName,
      },
    };
    dispatch(itemAction);

    const box = getState().box[boxName];
    if (!box) {
      const boxAction: BoxAddAction = {
        type: 'box-add',
        payload: {
          name: boxName,
        },
      };
      dispatch(boxAction);
    }

    const boxAction: BoxItemAddAction = {
      type: 'box-item-add',
      payload: {
        box_name: boxName,
        item_id: _id,
      },
    };
    dispatch(boxAction);

    const workAction: WorkItemAddedUpdateAction = {
      type: 'work-item-added-update',
      payload: true,
    };
    dispatch(workAction);

    if (latestChangeFrom === 'local') {
      const newItem = getState().item[_id];
      const itemCommand: DatabaseCommand = {
        action: 'item-add',
        data: newItem,
      };
      window.api.db(itemCommand);
    }
  };
};

export const itemDeleteAction = (
  boxName: string,
  itemId: string,
  latestChangeFrom: LatestChangeFrom = 'local',
  forced = false
) => {
  return function (dispatch: Dispatch<any>, getState: () => InventoryState) {
    const latestChangeFromAction: WorkLatestChangeFromUpdateAction = {
      type: 'work-latest-change-from-update',
      payload: latestChangeFrom,
    };
    dispatch(latestChangeFromAction);

    if (!forced && getState().box[boxName].length === 1) {
      const name = '';
      const itemAction: ItemUpdateAction = {
        type: 'item-update',
        payload: {
          _id: itemId,
          name,
          takeout: false,
        },
      };
      dispatch(itemAction);

      if (latestChangeFrom === 'local') {
        const newItem = getState().item[itemId];
        const itemCommand: DatabaseCommand = {
          action: 'item-update',
          data: newItem,
        };
        window.api.db(itemCommand);
      }
      return;
    }

    const boxAction: BoxItemDeleteAction = {
      type: 'box-item-delete',
      payload: {
        box_name: boxName,
        item_id: itemId,
      },
    };
    dispatch(boxAction);

    const itemAction: ItemDeleteAction = {
      type: 'item-delete',
      payload: itemId,
    };
    dispatch(itemAction);

    const workAction: WorkItemDeletedUpdateAction = {
      type: 'work-item-deleted-update',
      payload: true,
    };
    dispatch(workAction);

    if (getState().box[boxName].length === 0) {
      // Delete box
      const boxes = Object.keys(getState().box).sort();
      let prevBox = boxes[0];
      for (let i = 0; i < boxes.length; i++) {
        if (boxes[i] === boxName) {
          break;
        }
        prevBox = boxes[i];
      }
      const boxDeleteAction: BoxDeleteAction = {
        type: 'box-delete',
        payload: boxName,
      };
      dispatch(boxDeleteAction);

      const workCurrentBoxAction: WorkCurrentBoxUpdateAction = {
        type: 'work-current-box-update',
        payload: prevBox,
      };
      dispatch(workCurrentBoxAction);
    }

    if (latestChangeFrom === 'local') {
      const itemDeleteCommand: DatabaseCommand = {
        action: 'item-delete',
        data: itemId,
      };
      window.api.db(itemDeleteCommand);
    }
  };
};

export const itemNameUpdateAction = (
  _id: string,
  nameValue: string,
  elm: HTMLElement,
  latestChangeFrom: LatestChangeFrom = 'local'
) => {
  return function (dispatch: Dispatch<any>, getState: () => InventoryState) {
    if (nameValue === '' || nameValue.match(/^\s+$/)) {
      return;
    }
    if (nameValue === getState().item[_id].name) {
      elm.blur();
      return;
    }

    const latestChangeFromAction: WorkLatestChangeFromUpdateAction = {
      type: 'work-latest-change-from-update',
      payload: latestChangeFrom,
    };
    dispatch(latestChangeFromAction);

    // put()
    const itemAction: ItemUpdateAction = {
      type: 'item-update',
      payload: {
        _id: _id,
        name: nameValue,
      },
    };
    dispatch(itemAction);

    if (latestChangeFrom === 'local') {
      const newItem = getState().item[_id];
      const itemCommand: DatabaseCommand = {
        action: 'item-update',
        data: newItem,
      };
      window.api.db(itemCommand);
    }
    elm.blur();
  };
};

export const toggleTakeoutAction = (
  id: string,
  latestChangeFrom: LatestChangeFrom = 'local'
) => {
  return function (dispatch: Dispatch<any>, getState: () => InventoryState) {
    const latestChangeFromAction: WorkLatestChangeFromUpdateAction = {
      type: 'work-latest-change-from-update',
      payload: latestChangeFrom,
    };
    dispatch(latestChangeFromAction);

    const itemAction: ItemUpdateAction = {
      type: 'item-update',
      payload: {
        _id: id,
        takeout: !getState().item[id].takeout,
      },
    };
    dispatch(itemAction);

    if (latestChangeFrom === 'local') {
      const newItem = getState().item[id];
      const itemUpdateCommand: DatabaseCommand = {
        action: 'item-update',
        data: newItem,
      };
      window.api.db(itemUpdateCommand);
    }
  };
};

export const itemInsertAction = (
  boxName: string,
  item: Item,
  latestChangeFrom: LatestChangeFrom = 'local'
) => {
  return function (dispatch: Dispatch<any>, getState: () => InventoryState) {
    const latestChangeFromAction: WorkLatestChangeFromUpdateAction = {
      type: 'work-latest-change-from-update',
      payload: latestChangeFrom,
    };
    dispatch(latestChangeFromAction);

    const itemAction: ItemInsertAction = {
      type: 'item-insert',
      payload: item,
    };
    dispatch(itemAction);

    const box = getState().box[boxName];
    if (!box) {
      const boxAction: BoxAddAction = {
        type: 'box-add',
        payload: {
          name: boxName,
        },
      };
      dispatch(boxAction);
    }

    const boxAction: BoxItemAddAction = {
      type: 'box-item-add',
      payload: {
        box_name: boxName,
        item_id: item._id,
      },
    };
    dispatch(boxAction);

    if (latestChangeFrom === 'local') {
      const newItem = getState().item[item._id];
      const itemCommand: DatabaseCommand = {
        action: 'item-add',
        data: newItem,
      };
      window.api.db(itemCommand);
    }
  };
};

export const itemReplaceAction = (
  item: Item,
  latestChangeFrom: LatestChangeFrom = 'local'
) => {
  return function (dispatch: Dispatch<any>, getState: () => InventoryState) {
    const latestChangeFromAction: WorkLatestChangeFromUpdateAction = {
      type: 'work-latest-change-from-update',
      payload: latestChangeFrom,
    };
    dispatch(latestChangeFromAction);

    const itemAction: ItemReplaceAction = {
      type: 'item-replace',
      payload: item,
    };
    dispatch(itemAction);

    if (latestChangeFrom === 'local') {
      const newItem = getState().item[item._id];
      const itemCommand: DatabaseCommand = {
        action: 'item-update',
        data: newItem,
      };
      window.api.db(itemCommand);
    }
  };
};

export const boxAddAction = (
  name: string,
  latestChangeFrom: LatestChangeFrom = 'local'
) => {
  return function (dispatch: Dispatch<any>, getState: () => InventoryState) {
    const latestChangeFromAction: WorkLatestChangeFromUpdateAction = {
      type: 'work-latest-change-from-update',
      payload: latestChangeFrom,
    };
    dispatch(latestChangeFromAction);

    const _id = generateId();
    const itemName = '';
    const itemAction: ItemAddAction = {
      type: 'item-add',
      payload: {
        _id: _id,
        name: itemName,
        box: name,
      },
    };
    dispatch(itemAction);

    const boxAction: BoxAddAction = {
      type: 'box-add',
      payload: {
        name: name,
      },
    };
    dispatch(boxAction);

    const boxItemAction: BoxItemAddAction = {
      type: 'box-item-add',
      payload: {
        box_name: name,
        item_id: _id,
      },
    };
    dispatch(boxItemAction);

    const workCurrentBoxAction: WorkCurrentBoxUpdateAction = {
      type: 'work-current-box-update',
      payload: name,
    };
    dispatch(workCurrentBoxAction);

    if (latestChangeFrom === 'local') {
      const newItem = getState().item[_id];
      const itemCommand: DatabaseCommand = {
        action: 'item-add',
        data: newItem,
      };
      window.api.db(itemCommand);
    }
  };
};

export const boxRenameAction = (
  old_name: string,
  new_name: string,
  latestChangeFrom: LatestChangeFrom = 'local'
) => {
  return function (dispatch: Dispatch<any>, getState: () => InventoryState) {
    const latestChangeFromAction: WorkLatestChangeFromUpdateAction = {
      type: 'work-latest-change-from-update',
      payload: latestChangeFrom,
    };
    dispatch(latestChangeFromAction);

    const items = getState().box[old_name];
    items.forEach(_id => {
      const itemAction: ItemUpdateAction = {
        type: 'item-update',
        payload: {
          _id: _id,
          box: new_name,
        },
      };
      dispatch(itemAction);

      if (latestChangeFrom === 'local') {
        const newItem = getState().item[_id];
        const itemCommand: DatabaseCommand = {
          action: 'item-update',
          data: newItem,
        };
        window.api.db(itemCommand);
      }
    });
    const boxAction: BoxUpdateAction = {
      type: 'box-update',
      payload: {
        old_name,
        new_name,
      },
    };
    dispatch(boxAction);

    const workAction: WorkCurrentBoxUpdateAction = {
      type: 'work-current-box-update',
      payload: new_name,
    };
    dispatch(workAction);
  };
};

export const boxDeleteAction = (
  name: string,
  latestChangeFrom: LatestChangeFrom = 'local'
) => {
  return function (dispatch: Dispatch<any>, getState: () => InventoryState) {
    // Cannot delete if the box has items.
    const items = getState().box[name];
    if (items.length > 1 || (items.length === 1 && getState().item[items[0]].name !== '')) {
      document.getElementById('alertDialog')!.setAttribute('open', 'true');
      return;
    }
    // Cannot delete if the box is the last one.
    const boxes = Object.keys(getState().box).sort();
    if (boxes.length === 1) {
      return;
    }

    const latestChangeFromAction: WorkLatestChangeFromUpdateAction = {
      type: 'work-latest-change-from-update',
      payload: latestChangeFrom,
    };
    dispatch(latestChangeFromAction);

    let prevBox = boxes[0];
    if (prevBox === name) {
      prevBox = boxes[1];
    }
    else {
      for (let i = 0; i < boxes.length; i++) {
        if (boxes[i] === name) {
          break;
        }
        prevBox = boxes[i];
      }
    }
    const boxAction: BoxDeleteAction = {
      type: 'box-delete',
      payload: name,
    };
    dispatch(boxAction);

    const workCurrentBoxAction: WorkCurrentBoxUpdateAction = {
      type: 'work-current-box-update',
      payload: prevBox,
    };
    dispatch(workCurrentBoxAction);

    if (items.length === 1) {
      const itemAction: ItemDeleteAction = {
        type: 'item-delete',
        payload: items[0],
      };
      dispatch(itemAction);

      if (latestChangeFrom === 'local') {
        const itemDeleteCommand: DatabaseCommand = {
          action: 'item-delete',
          data: items[0],
        };
        window.api.db(itemDeleteCommand);
      }
    }
  };
};

export const boxSelectAction = (name: string) => {
  return function (dispatch: Dispatch<any>, getState: () => InventoryState) {
    const workAction: WorkCurrentBoxUpdateAction = {
      type: 'work-current-box-update',
      payload: name,
    };
    dispatch(workAction);
  };
};
