/**
 * Inventory Manager
 * Copyright (c) Hidekazu Kubota
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */

import { Dispatch } from 'redux';
import { DatabaseCommand } from '../modules_common/db.types';
import {
  Box,
  InventoryState,
  Item,
  LatestChangeFrom,
  SyncInfo,
  WorkState,
} from '../modules_common/store.types';
import { generateId, getBoxId } from '../modules_common/utils';
import window from './window';

/**
 * Redux Action Types
 */
type ItemActionType =
  | 'item-init'
  | 'item-add'
  | 'item-update'
  | 'item-insert'
  | 'item-replace'
  | 'item-delete';
type BoxActionType =
  | 'box-init'
  | 'box-add'
  | 'box-name-update'
  | 'box-delete'
  | 'box-item-add'
  | 'box-item-delete';
type WorkActionType =
  | 'work-init'
  | 'work-current-box-update'
  | 'work-synchronizing-update'
  | 'work-sync-info-update'
  | 'work-latest-change-from-update'
  | 'work-item-added-update'
  | 'work-item-deleted-update';

export interface InventoryActionBase {
  type: ItemActionType | BoxActionType | WorkActionType;
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
    box?: string;
    modified_date?: string;
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
    [name: string]: Box;
  };
}

export interface BoxAddAction extends InventoryActionBase {
  type: 'box-add';
  payload: {
    id: string;
    name: string;
  };
}
export interface BoxNameUpdateAction extends InventoryActionBase {
  type: 'box-name-update';
  payload: {
    id: string;
    name: string;
  };
}

export interface BoxDeleteAction extends InventoryActionBase {
  type: 'box-delete';
  payload: string;
}

export interface BoxItemAddAction extends InventoryActionBase {
  type: 'box-item-add';
  payload: string;
}

export interface BoxItemDeleteAction extends InventoryActionBase {
  type: 'box-item-delete';
  payload: string;
}

export type BoxAction =
  | BoxInitAction
  | BoxAddAction
  | BoxNameUpdateAction
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

export const itemAddActionCreator = (
  boxId: string,
  name: string,
  latestChangeFrom: LatestChangeFrom = 'local'
) => {
  return function (dispatch: Dispatch<any>, getState: () => InventoryState) {
    if (name === '' || name.match(/^\s+$/)) {
      return;
    }
    const latestChangeFromAction: WorkLatestChangeFromUpdateAction = {
      type: 'work-latest-change-from-update',
      payload: latestChangeFrom,
    };
    dispatch(latestChangeFromAction);

    const id = 'item/' + boxId + '/' + generateId();
    const itemAction: ItemAddAction = {
      type: 'item-add',
      payload: {
        _id: id,
        name,
      },
    };
    dispatch(itemAction);

    const box = getState().box[boxId];
    if (!box) {
      const boxAction: BoxAddAction = {
        type: 'box-add',
        payload: {
          id: boxId,
          name: getState().settings.messages.firstBoxName,
        },
      };
      dispatch(boxAction);
    }

    const boxAction: BoxItemAddAction = {
      type: 'box-item-add',
      payload: id,
    };
    dispatch(boxAction);

    const workAction: WorkItemAddedUpdateAction = {
      type: 'work-item-added-update',
      payload: true,
    };
    dispatch(workAction);

    if (latestChangeFrom === 'local') {
      const newItem = getState().item[id];
      const itemCommand: DatabaseCommand = {
        action: 'db-item-add',
        data: {
          item: newItem,
        },
      };
      window.api.db(itemCommand);
    }
  };
};

export const itemDeleteActionCreator = (
  id: string,
  latestChangeFrom: LatestChangeFrom = 'local'
) => {
  return function (dispatch: Dispatch<any>, getState: () => InventoryState) {
    const latestChangeFromAction: WorkLatestChangeFromUpdateAction = {
      type: 'work-latest-change-from-update',
      payload: latestChangeFrom,
    };
    dispatch(latestChangeFromAction);

    const boxAction: BoxItemDeleteAction = {
      type: 'box-item-delete',
      payload: id,
    };
    dispatch(boxAction);

    const itemAction: ItemDeleteAction = {
      type: 'item-delete',
      payload: id,
    };
    dispatch(itemAction);

    const workAction: WorkItemDeletedUpdateAction = {
      type: 'work-item-deleted-update',
      payload: true,
    };
    dispatch(workAction);

    if (latestChangeFrom === 'local') {
      const itemDeleteCommand: DatabaseCommand = {
        action: 'db-item-delete',
        data: id,
      };
      window.api.db(itemDeleteCommand);
    }
  };
};

export const itemNameUpdateActionCreator = (
  id: string,
  name: string,
  elm: HTMLElement,
  latestChangeFrom: LatestChangeFrom = 'local'
) => {
  return function (dispatch: Dispatch<any>, getState: () => InventoryState) {
    if (name === '' || name.match(/^\s+$/)) {
      return;
    }
    if (name === getState().item[id].name) {
      elm.blur();
      return;
    }

    const latestChangeFromAction: WorkLatestChangeFromUpdateAction = {
      type: 'work-latest-change-from-update',
      payload: latestChangeFrom,
    };
    dispatch(latestChangeFromAction);

    const itemAction: ItemUpdateAction = {
      type: 'item-update',
      payload: {
        _id: id,
        name,
      },
    };
    dispatch(itemAction);

    if (latestChangeFrom === 'local') {
      const newItem = getState().item[id];
      const itemCommand: DatabaseCommand = {
        action: 'db-item-update',
        data: newItem,
      };
      window.api.db(itemCommand);
    }
    elm.blur();
  };
};

export const toggleTakeoutActionCreator = (
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
        action: 'db-item-update',
        data: newItem,
      };
      window.api.db(itemUpdateCommand);
    }
  };
};

export const itemInsertActionCreator = (
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

    const boxId = getBoxId(item._id);
    const box = getState().box[boxId];
    if (!box) {
      const boxAction: BoxAddAction = {
        type: 'box-add',
        payload: {
          id: boxId,
          name: getState().settings.messages.firstBoxName,
        },
      };
      dispatch(boxAction);
    }

    const boxAction: BoxItemAddAction = {
      type: 'box-item-add',
      payload: item._id,
    };
    dispatch(boxAction);

    const workAction: WorkItemAddedUpdateAction = {
      type: 'work-item-added-update',
      payload: true,
    };
    dispatch(workAction);

    if (latestChangeFrom === 'local') {
      const newItem = getState().item[item._id];
      const itemCommand: DatabaseCommand = {
        action: 'db-item-add',
        data: newItem,
      };
      window.api.db(itemCommand);
    }
  };
};

export const itemReplaceActionCreator = (
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
        action: 'db-item-update',
        data: newItem,
      };
      window.api.db(itemCommand);
    }
  };
};

export const boxAddActionCreator = (
  name: string,
  latestChangeFrom: LatestChangeFrom = 'local'
) => {
  return function (dispatch: Dispatch<any>, getState: () => InventoryState) {
    const latestChangeFromAction: WorkLatestChangeFromUpdateAction = {
      type: 'work-latest-change-from-update',
      payload: latestChangeFrom,
    };
    dispatch(latestChangeFromAction);
    const id = generateId();
    const boxAction: BoxAddAction = {
      type: 'box-add',
      payload: {
        id,
        name,
      },
    };
    dispatch(boxAction);

    const workCurrentBoxAction: WorkCurrentBoxUpdateAction = {
      type: 'work-current-box-update',
      payload: name,
    };
    dispatch(workCurrentBoxAction);

    if (latestChangeFrom === 'local') {
      const itemCommand: DatabaseCommand = {
        action: 'db-box-add',
        data: {
          id,
          name,
        },
      };
      window.api.db(itemCommand);
    }
  };
};

export const boxRenameActionCreator = (
  id: string,
  name: string,
  latestChangeFrom: LatestChangeFrom = 'local'
) => {
  return function (dispatch: Dispatch<any>, getState: () => InventoryState) {
    const latestChangeFromAction: WorkLatestChangeFromUpdateAction = {
      type: 'work-latest-change-from-update',
      payload: latestChangeFrom,
    };
    dispatch(latestChangeFromAction);

    const box = getState().box[id];
    if (!box) {
      const boxAction: BoxAddAction = {
        type: 'box-add',
        payload: {
          id,
          name,
        },
      };
      dispatch(boxAction);

      if (latestChangeFrom === 'local') {
        const command: DatabaseCommand = {
          action: 'db-box-add',
          data: {
            id,
            name,
          },
        };
        window.api.db(command);
      }
    }
    else {
      const boxAction: BoxNameUpdateAction = {
        type: 'box-name-update',
        payload: {
          id,
          name,
        },
      };
      dispatch(boxAction);

      if (latestChangeFrom === 'local') {
        const command: DatabaseCommand = {
          action: 'db-box-name-update',
          data: {
            id,
            name,
          },
        };
        window.api.db(command);
      }
    }
  };
};

export const boxDeleteActionCreator = (
  id: string,
  latestChangeFrom: LatestChangeFrom = 'local'
) => {
  return function (dispatch: Dispatch<any>, getState: () => InventoryState) {
    // Cannot delete if the box has items.
    const items = getState().box[id].items;
    if (items.length > 0) {
      document.getElementById('alertDialog')!.setAttribute('open', 'true');
      return;
    }
    // Cannot delete if the box is the last one.
    const boxState = getState().box;
    const boxIds = Object.keys(boxState).sort((a, b) => {
      if (boxState[a].name > boxState[b].name) return 1;
      if (boxState[a].name < boxState[b].name) return -1;
      return 0;
    });
    if (boxIds.length === 1) {
      return;
    }

    const latestChangeFromAction: WorkLatestChangeFromUpdateAction = {
      type: 'work-latest-change-from-update',
      payload: latestChangeFrom,
    };
    dispatch(latestChangeFromAction);

    let prevBoxId = boxIds[0];
    if (prevBoxId === id) {
      prevBoxId = boxIds[1];
    }
    else {
      for (let i = 0; i < boxIds.length; i++) {
        if (boxIds[i] === id) {
          break;
        }
        prevBoxId = boxIds[i];
      }
    }
    const boxAction: BoxDeleteAction = {
      type: 'box-delete',
      payload: id,
    };
    dispatch(boxAction);

    const workCurrentBoxAction: WorkCurrentBoxUpdateAction = {
      type: 'work-current-box-update',
      payload: prevBoxId,
    };
    dispatch(workCurrentBoxAction);

    if (latestChangeFrom === 'local') {
      const command: DatabaseCommand = {
        action: 'db-box-delete',
        data: id,
      };
      window.api.db(command);
    }
  };
};

export const boxSelectActionCreator = (id: string) => {
  return function (dispatch: Dispatch<any>, getState: () => InventoryState) {
    const workAction: WorkCurrentBoxUpdateAction = {
      type: 'work-current-box-update',
      payload: id,
    };
    dispatch(workAction);
  };
};
