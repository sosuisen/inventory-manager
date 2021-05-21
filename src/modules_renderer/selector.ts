/**
 * Inventory Manager
 * Copyright (c) Hidekazu Kubota
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */

import { InventoryState, Item } from '../modules_common/store.types';

export const selectorCurrentBoxId = (state: InventoryState) => state.work.currentBox;

export const selectorCurrentBox = (state: InventoryState) => {
  const currentBoxId = selectorCurrentBoxId(state);
  if (currentBoxId === undefined) {
    return undefined;
  }
  return state.box[currentBoxId];
};

export const selectorOrderedBoxes = (state: InventoryState) => {
  return Object.values(state.box).sort((a, b) => {
    if (a.name > b.name) return 1;
    if (a.name > b.name) return -1;
    return 0;
  });
};

export const selectorCurrentItems = (state: InventoryState): Item[] => {
  const box = state.box[state.work.currentBox];
  if (box) {
    const items = box.items
      .map(_id => state.item[_id])
      .sort((a, b) => {
        if (a.created_date > b.created_date) return 1;
        if (a.created_date < b.created_date) return -1;
        return 0;
      });
    return items;
  }
  return [];
};

export const selectorAppInfo = (state: InventoryState) => {
  return state.settings.appinfo;
};

export const selectorMessages = (state: InventoryState) => {
  return state.settings.messages;
};

export const selectorSync = (state: InventoryState) => {
  return {
    synchronizing: state.work.synchronizing,
    syncInfo: state.work.syncInfo,
  };
};
