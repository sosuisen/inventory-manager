/**
 * Inventory Manager
 * Copyright (c) Hidekazu Kubota
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */

import { Dispatch } from 'redux';
import AsyncLock from 'async-lock';
import {
  DatabaseBoxAdd,
  DatabaseBoxDelete,
  DatabaseBoxNameUpdate,
  DatabaseItemAdd,
  DatabaseItemDelete,
  DatabaseItemUpdate,
  SettingsLanguageUpdate,
} from '../modules_common/db.types';
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
  ItemUpdateAction,
  SettingsLanguageUpdateAction,
  WorkCurrentBoxUpdateAction,
  WorkItemAddedUpdateAction,
  WorkItemDeletedUpdateAction,
  WorkLatestChangeFromUpdateAction,
} from './action';
import window from './window';

const lock = new AsyncLock();

/**
 * Action creators (redux-thunk)
 */

/**
 * Create a new item from name
 */
export const itemAddActionCreator = (
  boxId: string,
  name: string,
  latestChangeFrom: LatestChangeFrom = 'local'
) => {
  return async function (dispatch: Dispatch<any>, getState: () => InventoryState) {
    if (name === '' || name.match(/^\s+$/)) {
      return;
    }
    const latestChangeFromAction: WorkLatestChangeFromUpdateAction = {
      type: 'work-latest-change-from-update',
      payload: latestChangeFrom,
    };
    dispatch(latestChangeFromAction);

    const box = getState().box[boxId];
    if (!box) {
      const boxAction: BoxAddAction = {
        type: 'box-add',
        payload: {
          _id: boxId,
          name: getState().info.messages.firstBoxName,
        },
      };
      dispatch(boxAction);

      if (latestChangeFrom === 'local') {
        const cmd: DatabaseBoxAdd = {
          command: 'db-box-add',
          data: {
            _id: boxId,
            name: getState().info.messages.firstBoxName,
          },
        };
        window.api.db(cmd);
      }
    }

    const id = boxId + '/item' + generateId();
    const itemAction: ItemAddAction = {
      type: 'item-add',
      payload: {
        _id: id,
        name,
      },
    };
    dispatch(itemAction);

    if (latestChangeFrom === 'local') {
      const newItem = getState().item[id];
      const cmd: DatabaseItemAdd = {
        command: 'db-item-add',
        data: newItem,
      };
      await window.api.db(cmd);
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
  };
};

export const itemDeleteActionCreator = (
  id: string,
  latestChangeFrom: LatestChangeFrom = 'local'
) => {
  return async function (dispatch: Dispatch<any>, getState: () => InventoryState) {
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

    if (latestChangeFrom === 'local') {
      const cmd: DatabaseItemDelete = {
        command: 'db-item-delete',
        data: id,
      };
      await window.api.db(cmd);
    }

    const workAction: WorkItemDeletedUpdateAction = {
      type: 'work-item-deleted-update',
      payload: true,
    };
    dispatch(workAction);
  };
};

let itemNameUpdateTime = '';
export const itemNameUpdateActionCreator = (
  id: string,
  name: string,
  elm?: HTMLElement,
  modified_date?: string,
  enqueueTime?: string,
  latestChangeFrom: LatestChangeFrom = 'local'
) => {
  return async function (dispatch: Dispatch<any>, getState: () => InventoryState) {
    await lock.acquire('itemNameUpdate', async () => {
      console.log(
        'itemNameUpdateTime: ' + itemNameUpdateTime + ', enqueueTime: ' + enqueueTime
      );
      if (
        enqueueTime !== undefined &&
        itemNameUpdateTime !== '' &&
        itemNameUpdateTime > enqueueTime
      ) {
        console.log('Block expired remote update');
        return;
      }
      if (name === '' || name.match(/^\s+$/)) {
        return;
      }
      if (name === getState().item[id].name) {
        if (elm) {
          elm.blur();
        }
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
          modified_date,
        },
      };
      dispatch(itemAction);

      if (latestChangeFrom === 'local') {
        const newItem = getState().item[id];
        const cmd: DatabaseItemUpdate = {
          command: 'db-item-update',
          data: newItem,
        };
        // eslint-disable-next-line require-atomic-updates
        itemNameUpdateTime = await window.api.db(cmd);
      }
      if (elm) {
        elm.blur();
      }
    });
  };
};

let itemTakeoutUpdateTime = '';
export const itemTakeoutUpdateActionCreator = (
  id: string,
  takeout: boolean,
  modified_date?: string,
  enqueueTime?: string,
  latestChangeFrom: LatestChangeFrom = 'local'
) => {
  return async function (dispatch: Dispatch<any>, getState: () => InventoryState) {
    await lock.acquire('itemTakeoutUpdate', async () => {
      console.log(
        'itemTakeoutUpdateTime: ' + itemTakeoutUpdateTime + ', enqueueTime: ' + enqueueTime
      );
      if (
        enqueueTime !== undefined &&
        itemTakeoutUpdateTime !== '' &&
        itemTakeoutUpdateTime > enqueueTime
      ) {
        console.log('Block expired remote update');
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
          takeout,
          modified_date,
        },
      };
      dispatch(itemAction);

      if (latestChangeFrom === 'local') {
        const newItem = getState().item[id];
        const cmd: DatabaseItemUpdate = {
          command: 'db-item-update',
          data: newItem,
        };
        // eslint-disable-next-line require-atomic-updates
        itemTakeoutUpdateTime = await window.api.db(cmd);
      }
    });
  };
};

/**
 * Insert a specified item
 */
export const itemInsertActionCreator = (
  item: Item,
  latestChangeFrom: LatestChangeFrom = 'local'
) => {
  return async function (dispatch: Dispatch<any>, getState: () => InventoryState) {
    const latestChangeFromAction: WorkLatestChangeFromUpdateAction = {
      type: 'work-latest-change-from-update',
      payload: latestChangeFrom,
    };
    dispatch(latestChangeFromAction);

    const boxId = getBoxId(item._id);
    if (boxId !== undefined) {
      const box = getState().box[boxId];
      if (!box) {
        const boxAction: BoxAddAction = {
          type: 'box-add',
          payload: {
            _id: boxId,
            name: getState().info.messages.firstBoxName,
          },
        };
        dispatch(boxAction);

        if (latestChangeFrom === 'local') {
          const cmd: DatabaseBoxAdd = {
            command: 'db-box-add',
            data: {
              _id: boxId,
              name: getState().info.messages.firstBoxName,
            },
          };
          await window.api.db(cmd);
        }
      }
    }

    const itemAction: ItemInsertAction = {
      type: 'item-insert',
      payload: item,
    };
    dispatch(itemAction);

    if (latestChangeFrom === 'local') {
      const newItem = getState().item[item._id];
      const cmd: DatabaseItemAdd = {
        command: 'db-item-add',
        data: newItem,
      };
      await window.api.db(cmd);
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
  };
};

/**
 * Create a new box from name
 */
export const boxAddActionCreator = (
  name: string,
  latestChangeFrom: LatestChangeFrom = 'local'
) => {
  return async function (dispatch: Dispatch<any>, getState: () => InventoryState) {
    const latestChangeFromAction: WorkLatestChangeFromUpdateAction = {
      type: 'work-latest-change-from-update',
      payload: latestChangeFrom,
    };
    dispatch(latestChangeFromAction);
    const _id = 'box' + generateId();
    const boxAction: BoxAddAction = {
      type: 'box-add',
      payload: {
        _id,
        name,
      },
    };
    dispatch(boxAction);

    const workCurrentBoxAction: WorkCurrentBoxUpdateAction = {
      type: 'work-current-box-update',
      payload: _id,
    };
    dispatch(workCurrentBoxAction);

    if (latestChangeFrom === 'local') {
      const cmd: DatabaseBoxAdd = {
        command: 'db-box-add',
        data: {
          _id,
          name,
        },
      };
      await window.api.db(cmd);
    }
  };
};

let boxNameUpdateTime = '';
export const boxNameUpdateActionCreator = (
  _id: string,
  name: string,
  enqueueTime?: string,
  latestChangeFrom: LatestChangeFrom = 'local'
) => {
  return async function (dispatch: Dispatch<any>, getState: () => InventoryState) {
    await lock.acquire('boxNameUpdate', async () => {
      console.log(
        'boxNameUpdateTime: ' + boxNameUpdateTime + ', enqueueTime: ' + enqueueTime
      );
      if (
        enqueueTime !== undefined &&
        boxNameUpdateTime !== '' &&
        boxNameUpdateTime > enqueueTime
      ) {
        console.log('Block expired remote update');
        return;
      }
      const latestChangeFromAction: WorkLatestChangeFromUpdateAction = {
        type: 'work-latest-change-from-update',
        payload: latestChangeFrom,
      };
      dispatch(latestChangeFromAction);

      const box = getState().box[_id];
      if (!box) {
        const boxAction: BoxAddAction = {
          type: 'box-add',
          payload: {
            _id,
            name,
          },
        };
        dispatch(boxAction);

        if (latestChangeFrom === 'local') {
          const command: DatabaseBoxAdd = {
            command: 'db-box-add',
            data: {
              _id,
              name,
            },
          };
          await window.api.db(command);
        }
      }
      else {
        const boxAction: BoxNameUpdateAction = {
          type: 'box-name-update',
          payload: {
            _id,
            name,
          },
        };
        dispatch(boxAction);

        if (latestChangeFrom === 'local') {
          const command: DatabaseBoxNameUpdate = {
            command: 'db-box-name-update',
            data: {
              _id,
              name,
            },
          };
          // eslint-disable-next-line require-atomic-updates
          boxNameUpdateTime = await window.api.db(command);
        }
      }
    });
  };
};

export const boxDeleteActionCreator = (
  id: string,
  latestChangeFrom: LatestChangeFrom = 'local'
) => {
  return async function (dispatch: Dispatch<any>, getState: () => InventoryState) {
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

    if (latestChangeFrom === 'local') {
      const cmd: DatabaseBoxDelete = {
        command: 'db-box-delete',
        data: id,
      };
      await window.api.db(cmd);
    }

    const workCurrentBoxAction: WorkCurrentBoxUpdateAction = {
      type: 'work-current-box-update',
      payload: prevBoxId,
    };
    dispatch(workCurrentBoxAction);
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

export const settingsLanguageUpdateCreator = (lang: string) => {
  return async function (dispatch: Dispatch<any>, getState: () => InventoryState) {
    const settingsAction: SettingsLanguageUpdateAction = {
      type: 'settings-language-update',
      payload: lang,
    };
    dispatch(settingsAction);
    const cmd: SettingsLanguageUpdate = {
      command: 'settings-language-update',
      data: lang,
    };
    await window.api.settings(cmd);
  };
};
