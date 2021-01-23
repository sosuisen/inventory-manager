import * as React from 'react';
import { Item } from './store.types.inventory';

export const ItemRow = (prop: { item: Item }) => {
  return (
    <div>
      <div>{prop.item.name}</div>
      <div>{prop.item.created_date}</div>
      <div>{prop.item.modified_date}</div>
      <div>{prop.item.takeout.toString()}</div>
    </div>
  );
};
