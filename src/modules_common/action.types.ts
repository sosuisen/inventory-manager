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
  | 'box-update'
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

export type InventoryActionType = ItemActionType | BoxActionType | WorkActionType;

type SyncActionType = 'sync';

/**
 * Action to Database
 */
export type DatabaseCommand = {
  action: ItemActionType | SyncActionType;
  data: any;
};
