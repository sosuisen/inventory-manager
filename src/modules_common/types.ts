export type DatabaseCommand = {
  table: 'item' | 'box';
  action: 'create' | 'delete' | 'update';
  data: any;
};
