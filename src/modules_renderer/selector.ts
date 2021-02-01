import { InventoryState } from './store.types.inventory';

export const selectorCurrentBoxId = (state: InventoryState) => state.work.currentBox;
export const selectorCurrentBoxAndItems = (state: InventoryState) => {
  const box = state.box[state.work.currentBox];
  const items = box ? box.items.map(_id => state.item[_id]) : [];
  return { name: box.name, items: items };
};
