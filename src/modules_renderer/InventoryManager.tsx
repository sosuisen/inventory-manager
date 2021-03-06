/**
 * Inventory Manager
 * Copyright (c) Hidekazu Kubota
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { ItemList } from './ItemList';
import { InputArea } from './InputArea';
import { BoxRow } from './BoxRow';
import './InventoryManager.css';
import { selectorAppInfo, selectorSync } from './selector';
import { Header } from './Header';

export const InventoryManager = () => {
  return (
    <div styleName='inventoryManager'>
      <Header />
      <BoxRow />
      <InputArea />
      <ItemList />
      <br style={{ clear: 'both' }}></br>
    </div>
  );
};
