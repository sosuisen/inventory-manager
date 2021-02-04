import React from 'react';
import { useSelector } from 'react-redux';
import { ItemList } from './ItemList';
import { InputArea } from './InputArea';
import { BoxRow } from './BoxRow';
import './InventoryManager.css';
import { selectorAppInfo } from './selector';

export const InventoryManager = () => {
  const appInfo = useSelector(selectorAppInfo);
  return (
    <div styleName='inventoryManager'>
      <div styleName='header'>
        <img styleName='appIcon' src={appInfo.iconDataURL}></img>
        {appInfo.name} <span styleName='version'>{appInfo.version}</span>
      </div>
      <BoxRow />
      <InputArea />
      <ItemList />
      <br style={{ clear: 'both' }}></br>
      <InputArea />
    </div>
  );
};
