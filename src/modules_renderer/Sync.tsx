import React from 'react';
import './Sync.css';

export const Sync = (prop: { working: boolean; info: string }) => {
  return (
    <div styleName='sync'>
      {prop.info !== '' ? <div styleName='balloon'>{prop.info}</div> : ''}
      {prop.working ? (
        <div styleName='syncIcon'>
          <i className='fas fa-sync'></i>
        </div>
      ) : (
        <div styleName='syncIconPause'>
          <i className='fas fa-sync'></i>
        </div>
      )}
    </div>
  );
};
