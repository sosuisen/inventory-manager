import { InventoryState } from './store.types.inventory';

export const selectorCurrentBoxId = (state: InventoryState) => state.work.currentBox;

export const selectorCurrentBox = (state: InventoryState) => {
  const currentBoxId = selectorCurrentBoxId(state);
  if (currentBoxId === undefined) {
    return undefined;
  }
  return state.box[state.work.currentBox];
};

export const selectorCurrentBoxName = (state: InventoryState) => {
  const box = selectorCurrentBox(state);
  if (box) {
    return box.name;
  }
  return '';
};

export const selectorOrderedBoxes = (state: InventoryState) =>
  state.work.boxOrder.map(boxId => state.box[boxId]);

export const selectorCurrentItems = (state: InventoryState) => {
  const box = state.box[state.work.currentBox];
  if (box) {
    return box.items.map(_id => state.item[_id]);
  }
  return [];
};
