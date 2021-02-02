/**
 * Redux Action Types
 */
type ItemActionType = 'item-init' | 'item-add' | 'item-update' | 'item-delete';
type BoxActionType =
  | 'box-init'
  | 'box-add'
  | 'box-update'
  | 'box-delete'
  | 'box-item-add'
  | 'box-item-delete';
type WorkActionType =
  | 'work-init'
  | 'work-box-order-add'
  | 'work-box-order-delete'
  | 'work-current-box-add'
  | 'work-current-box-update'
  | 'work-update';
export type InventoryActionType = ItemActionType | BoxActionType | WorkActionType;

/**
 * Action to Database
 */
export type DatabaseCommand = {
  action: InventoryActionType;
  data: any;
};
