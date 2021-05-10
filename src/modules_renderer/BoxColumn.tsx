import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { boxSelectAction } from './action';
import './BoxColumn.css';

export const BoxColumn = (prop: { box: string; currentBoxName: string }) => {
  const dispatch = useDispatch();

  const selectBox = useCallback(() => {
    dispatch(boxSelectAction(prop.box));
  }, [prop.box, dispatch]);

  return (
    <div
      styleName={prop.box === prop.currentBoxName ? 'col selected' : 'col'}
      onClick={selectBox}
    >
      {prop.box}
    </div>
  );
};
