import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { boxSelectActionCreator } from './action';
import './BoxColumn.css';

export const BoxColumn = (prop: { box: string; currentBoxId: string }) => {
  const dispatch = useDispatch();

  const selectBox = useCallback(() => {
    dispatch(boxSelectActionCreator(prop.box));
  }, [prop.box, dispatch]);

  return (
    <div
      styleName={prop.box === prop.currentBoxId ? 'col selected' : 'col'}
      onClick={selectBox}
    >
      {prop.box}
    </div>
  );
};
