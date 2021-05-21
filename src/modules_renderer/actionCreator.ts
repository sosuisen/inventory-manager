/**
 * Inventory Manager
 * Copyright (c) Hidekazu Kubota
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */

import { Dispatch } from 'redux';
import { DatabaseCommand } from '../modules_common/db.types';
import { InventoryState, Item, LatestChangeFrom } from '../modules_common/store.types';
import { generateId, getBoxId } from '../modules_common/utils';
import {
  BoxAddAction,
  BoxDeleteAction,
  BoxItemAddAction,
  BoxItemDeleteAction,
  BoxNameUpdateAction,
  ItemAddAction,
  ItemDeleteAction,
  ItemInsertAction,
  ItemReplaceAction,
  ItemUpdateAction,
  WorkCurrentBoxUpdateAction,
  WorkItemAddedUpdateAction,
  WorkItemDeletedUpdateAction,
  WorkLatestChangeFromUpdateAction,
} from './action';
import window from './window';

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
