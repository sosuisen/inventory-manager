/**
 * Inventory Manager
 * Copyright (c) Hidekazu Kubota
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import './Header.css';
import { useSelector } from 'react-redux';
import { Sync } from './Sync';
import { SettingPanel } from './SettingPanel';
import { selectorAppInfo, selectorSync } from './selector';

export const Header = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);

  const appInfo = useSelector(selectorAppInfo);
  const sync = useSelector(selectorSync);

  const handleClick = () => {
    setSettingsOpen(true);
  };

  const setIsOpen = (isOpen: boolean) => {
    setSettingsOpen(isOpen);
  };

  return (
    <div styleName='header'>
      <img styleName='appIcon' src={appInfo.iconDataURL}></img>
      <span styleName='title'>{appInfo.name}</span>{' '}
      <span styleName='version'>{appInfo.version}</span>
      <div styleName='settingsIcon' onClick={handleClick}>
        <i className='fas fa-sliders-h'></i>
      </div>
      <SettingPanel isOpen={!settingsOpen} setIsOpen={setIsOpen} />
      <Sync synchronizing={sync.synchronizing} info={sync.syncInfo} />
    </div>
  );
};
