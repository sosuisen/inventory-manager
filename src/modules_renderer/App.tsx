/**
 * Inventory Manager
 * Copyright (c) Hidekazu Kubota
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Provider } from 'react-redux';
import { InventoryManager } from './InventoryManager';
import { inventoryStore } from './store';

export const App = () => {
  return (
    <Provider store={inventoryStore}>
      <InventoryManager></InventoryManager>
    </Provider>
  );
};
