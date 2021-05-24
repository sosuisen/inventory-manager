/**
 * Inventory Manager
 * Copyright (c) Hidekazu Kubota
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Box } from '../modules_common/store.types';
import { boxSelectActionCreator } from './actionCreator';
import './BoxColumn.css';

export const BoxColumn = (prop: { box: Box; currentBoxId: string }) => {
  const dispatch = useDispatch();

  const selectBox = useCallback(() => {
    dispatch(boxSelectActionCreator(prop.box._id));
  }, [prop.box, dispatch]);

  return (
    <div
      styleName={prop.box._id === prop.currentBoxId ? 'col selected' : 'col'}
      onClick={selectBox}
    >
      {prop.box.name}
    </div>
  );
};
