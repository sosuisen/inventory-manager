import { InventoryState, Item } from '../modules_common/store.types';

export const selectorCurrentBoxName = (state: InventoryState) => state.work.currentBox;

export const selectorCurrentBox = (state: InventoryState) => {
  const currentBoxName = selectorCurrentBoxName(state);
  if (currentBoxName === undefined) {
    return undefined;
  }
  return state.box[currentBoxName];
};

export const selectorOrderedBoxes = (state: InventoryState) => {
  return Object.keys(state.box).sort();
};

export const selectorCurrentItems = (
  state: InventoryState
): [Item[], string | undefined] => {
  const box = state.box[state.work.currentBox];
  if (box) {
    const items = box
      .map(_id => state.item[_id])
      .sort((a, b) => {
        if (a.created_date > b.created_date) return 1;
        if (a.created_date < b.created_date) return -1;
        return 0;
      });
    if (items.length > 0) {
      return [items, items[0].name];
    }
    return [items, undefined];
  }
  return [[], undefined];
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
