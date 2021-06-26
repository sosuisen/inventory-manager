/**
 * Inventory Manager
 * Copyright (c) Hidekazu Kubota
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */

import { Dispatch } from 'redux';
import AsyncLock from 'async-lock';
import { TaskMetadata } from 'git-documentdb';
import {
  DatabaseBoxDelete,
  DatabaseBoxInsert,
  DatabaseBoxPut,
  DatabaseItemDelete,
  DatabaseItemInsert,
  DatabaseItemPut,
  DatabaseLanguageUpdate,
  DatabaseSyncIntervalUpdate,
  DatabaseSyncPersonalAccessTokenUpdate,
  DatabaseSyncRemoteUrlUpdate,
} from '../modules_common/db.types';
import { InventoryState, Item, LatestChangeFrom } from '../modules_common/store.types';
import { getBoxId, getCurrentDateAndTime } from '../modules_common/utils';
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
  SettingsSyncIntervalUpdateAction,
  SettingsSyncPersonalAccessTokenUpdateAction,
  SettingsSyncRemoteUrlUpdateAction,
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
 *
 * @remarks
 * Cannot be called from remote.
 */
export const itemAddActionCreator = (boxId: string, name: string) => {
  return async function (dispatch: Dispatch<any>, getState: () => InventoryState) {
    if (name === '' || name.match(/^\s+$/)) {
      return;
    }
    const latestChangeFrom: LatestChangeFrom = 'local';

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
        const cmd: DatabaseBoxPut = {
          command: 'db-box-put',
          data: {
            _id: boxId,
            name: getState().info.messages.firstBoxName,
          },
        };
        window.api.db(cmd);
      }
    }

    const date = getCurrentDateAndTime();
    // _id will be automatically generated in db.
    const newItem = {
      name,
      created_date: date,
      modified_date: date,
      takeout: false,
    };

    const cmd: DatabaseItemInsert = {
      command: 'db-item-insert',
      data: {
        boxId,
        item: newItem,
      },
    };
    const taskMetadata: TaskMetadata = await window.api.db(cmd);
    // _id management in InventoryManager differs between db and redux store.
    // Get generated _id from db and add prefix for redux store.
    const _id = boxId + '/' + taskMetadata.shortId!;
    const itemAction: ItemAddAction = {
      type: 'item-add',
      payload: {
        ...newItem,
        _id,
      },
    };
    dispatch(itemAction);

    const boxAction: BoxItemAddAction = {
      type: 'box-item-add',
      payload: _id,
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
        const cmd: DatabaseItemPut = {
          command: 'db-item-put',
          data: newItem,
        };
        const taskMetadata: TaskMetadata = await window.api.db(cmd);
        // eslint-disable-next-line require-atomic-updates
        itemNameUpdateTime = taskMetadata.enqueueTime!;
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
        const cmd: DatabaseItemPut = {
          command: 'db-item-put',
          data: newItem,
        };
        const taskMetadata: TaskMetadata = await window.api.db(cmd);
        // eslint-disable-next-line require-atomic-updates
        itemTakeoutUpdateTime = taskMetadata.enqueueTime!;
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
          const cmd: DatabaseBoxPut = {
            command: 'db-box-put',
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
      const cmd: DatabaseItemPut = {
        command: 'db-item-put',
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
 *
 * @remarks
 * Cannot be called from remote.
 */
export const boxAddActionCreator = (name: string) => {
  return async function (dispatch: Dispatch<any>, getState: () => InventoryState) {
    const latestChangeFrom: LatestChangeFrom = 'local';

    const latestChangeFromAction: WorkLatestChangeFromUpdateAction = {
      type: 'work-latest-change-from-update',
      payload: latestChangeFrom,
    };
    dispatch(latestChangeFromAction);

    const cmd: DatabaseBoxInsert = {
      command: 'db-box-insert',
      data: {
        name,
      },
    };
    const taskMetadata: TaskMetadata = await window.api.db(cmd);
    const _id = taskMetadata.shortId!;
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
          const command: DatabaseBoxPut = {
            command: 'db-box-put',
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
          const command: DatabaseBoxPut = {
            command: 'db-box-put',
            data: {
              _id,
              name,
            },
          };
          const taskMetadata: TaskMetadata = await window.api.db(command);
          // eslint-disable-next-line require-atomic-updates
          boxNameUpdateTime = taskMetadata.enqueueTime!;
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
    const cmd: DatabaseLanguageUpdate = {
      command: 'db-language-update',
      data: lang,
    };
    await window.api.db(cmd);
  };
};

export const settingsSyncRemoteUrlUpdateCreator = (remote_url: string) => {
  return async function (dispatch: Dispatch<any>, getState: () => InventoryState) {
    const settingsAction: SettingsSyncRemoteUrlUpdateAction = {
      type: 'settings-sync-remote-url-update',
      payload: remote_url,
    };
    dispatch(settingsAction);
    const cmd: DatabaseSyncRemoteUrlUpdate = {
      command: 'db-sync-remote-url-update',
      data: remote_url,
    };
    await window.api.db(cmd);
  };
};

export const settingsSyncPersonalAccessTokenUpdateCreator = (token: string) => {
  return async function (dispatch: Dispatch<any>, getState: () => InventoryState) {
    const settingsAction: SettingsSyncPersonalAccessTokenUpdateAction = {
      type: 'settings-sync-personal-access-token-update',
      payload: token,
    };
    dispatch(settingsAction);
    const cmd: DatabaseSyncPersonalAccessTokenUpdate = {
      command: 'db-sync-personal-access-token-update',
      data: token,
    };
    await window.api.db(cmd);
  };
};

export const settingsSyncIntervalUpdateCreator = (interval: number) => {
  return async function (dispatch: Dispatch<any>, getState: () => InventoryState) {
    const settingsAction: SettingsSyncIntervalUpdateAction = {
      type: 'settings-sync-interval-update',
      payload: interval * 1000,
    };
    dispatch(settingsAction);
    const cmd: DatabaseSyncIntervalUpdate = {
      command: 'db-sync-interval-update',
      data: interval * 1000,
    };
    await window.api.db(cmd);
  };
};
