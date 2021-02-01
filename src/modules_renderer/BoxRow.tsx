import React from 'react';
import { useSelector } from 'react-redux';
import { selectorCurrentBoxId, selectorOrderedBoxes } from './selector';
import { BoxColumn } from './BoxColumn';
import './BoxRow.css';

export const BoxRow = () => {
  const currentBoxId = useSelector(selectorCurrentBoxId);
  const boxes = useSelector(selectorOrderedBoxes);
  const boxList = boxes.map(box => (
    <BoxColumn box={box} currentBoxId={currentBoxId}></BoxColumn>
  ));

  return (
    <div styleName='boxRow'>
      <div styleName='header'>BOX: </div>
      {boxList}
    </div>
  );
};
