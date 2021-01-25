/**
 * Inventory Manager
 * Copyright (c) Hidekazu Kubota
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */

import * as React from 'react';
import { inventory } from './store.inventory';
import {
  initialInventoryState,
  InventoryAction,
  InventoryState,
} from './store.types.inventory';

export type InventoryProvider = [InventoryState, (action: InventoryAction) => void];

export const InventoryContext = React.createContext<InventoryState | any>('');

export const StoreProvider = (props: { children: React.ReactNode }) => {
  const [inventoryState, inventoryDispatch]: InventoryProvider = React.useReducer(
    inventory,
    initialInventoryState
  );
  return (
    <InventoryContext.Provider value={[inventoryState, inventoryDispatch]}>
      {props.children}
    </InventoryContext.Provider>
  );
};
