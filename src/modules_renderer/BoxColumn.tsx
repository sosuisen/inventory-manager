import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { boxSelectAction } from './action';
import './BoxColumn.css';
import { Box } from './store.types.inventory';

export const BoxColumn = (prop: { box: Box; currentBoxId: string }) => {
  const dispatch = useDispatch();

  const selectBox = useCallback(() => {
    dispatch(boxSelectAction(prop.box._id));
  }, [prop.box._id, dispatch]);

  return (
    <div
      styleName={prop.box._id === prop.currentBoxId ? 'col selected' : 'col'}
      onClick={selectBox}
    >
      {prop.box.name}
    </div>
  );
};
