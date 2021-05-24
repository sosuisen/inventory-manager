/**
 * Inventory Manager
 * Copyright (c) Hidekazu Kubota
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { DatabaseCommand } from '../modules_common/db.types';
import { SyncInfo } from '../modules_common/store.types';
import { selectorMessages } from './selector';
import './Sync.css';
import window from './window';

const handleClick = () => {
  const syncCommand: DatabaseCommand = {
    command: 'db-sync',
  };
  window.api.db(syncCommand);
};

export const Sync = (prop: { synchronizing: boolean; info: SyncInfo | undefined }) => {
  const messages = useSelector(selectorMessages);

  return (
    <div styleName='sync'>
      {prop.info !== undefined &&
      (prop.info.create > 0 || prop.info.update > 0 || prop.info.delete > 0) ? (
        <div styleName='balloon'>
          {prop.info.create > 0 ? <div>{messages.syncCreate + prop.info.create}</div> : ''}
          {prop.info.update > 0 ? <div>{messages.syncUpdate + prop.info.update}</div> : ''}
          {prop.info.delete > 0 ? <div>{messages.syncDelete + prop.info.delete}</div> : ''}
        </div>
      ) : (
        ''
      )}
      {prop.synchronizing ? (
        <div styleName='syncIcon'>
          <i className='fas fa-sync'></i>
        </div>
      ) : (
        <div styleName='syncIconPause' onClick={handleClick}>
          <i className='fas fa-sync'></i>
        </div>
      )}
    </div>
  );
};
