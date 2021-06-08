/**
 * Inventory Manager
 * Copyright (c) Hidekazu Kubota
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { availableLanguages } from '../modules_common/i18n';
import { selectorMessages, selectorSettings } from './selector';
import './SettingPanel.css';
import { settingsLanguageUpdateCreator } from './actionCreator';

export const SettingPanel = (prop: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) => {
  const dispatch = useDispatch();

  const messages = useSelector(selectorMessages);
  const settings = useSelector(selectorSettings);

  const [syncUrlValue, setSyncUrlValue] = useState(settings.sync.remote_url);
  const [syncPersonalAccessTokenValue, setSyncPersonalAccessTokenValue] = useState(
    settings.sync.connection.personal_access_token
  );
  const [syncIntervalValue, setSyncIntervalValue] = useState(settings.sync.interval / 1000);
  const [syncIntervalAlertValue, setSyncIntervalAlertValue] = useState('');

  const applyAndCloseSettings = () => {
    if (syncIntervalValue < 10) {
      setSyncIntervalAlertValue(messages.syncIntervalAlert);
      return;
    }
    prop.setIsOpen(false);
  };

  const changeSyncInterval = (interval: number) => {
    setSyncIntervalValue(interval);
    setSyncIntervalAlertValue('');
  };

  const changeLanguage = (lang: string) => {
    dispatch(settingsLanguageUpdateCreator(lang));
  };

  const languageList = availableLanguages.map(lang => (
    <div styleName='language'>
      <input
        type='radio'
        name='language'
        id={'lang_' + lang}
        checked={settings.language === lang}
        onClick={() => changeLanguage(lang)}
      />
      {/* @ts-ignore */}
      <span styleName='languageLabel'>{messages[lang]}</span>
    </div>
  ));

  return (
    <dialog id='settingsDialog' styleName='settingsDialog' open={!!prop.isOpen}>
      <div styleName='closeButton' onClick={applyAndCloseSettings}>
        <i className='far fa-times-circle'></i>
      </div>
      <div styleName='settingsHeader'>{messages.settingsDialog}</div>
      <div styleName='syncSettings'>
        <div styleName='syncSettingsHeader'>
          <i className='fas fa-sync'></i>&nbsp;&nbsp;{messages.syncSettingsHeader}
        </div>
        <div styleName='syncUrl'>
          <div styleName='syncUrlHeader'>{messages.syncUrlHeader}</div>
          <input
            type='text'
            id='syncUrlInput'
            styleName='syncUrlInput'
            value={syncUrlValue}
            placeholder={messages.syncUrlPlaceholder}
            onChange={e => setSyncUrlValue(e.target.value)}
          ></input>
          <div styleName='syncUrlAlert'></div>
          <div styleName='syncUrlFooter'>{messages.syncUrlFooter}</div>
        </div>
        <div styleName='syncPersonalAccessToken'>
          <div styleName='syncPersonalAccessTokenHeader'>
            {messages.syncPersonalAccessTokenHeader}
          </div>
          <input
            type='text'
            id='syncPersonalAccessTokenInput'
            styleName='syncPersonalAccessTokenInput'
            value={syncPersonalAccessTokenValue}
            placeholder={messages.syncPersonalAccessTokenPlaceholder}
            onChange={e => setSyncPersonalAccessTokenValue(e.target.value)}
          ></input>
          <div styleName='syncPersonalAccessTokenAlert'></div>
          <div
            styleName='syncPersonalAccessTokenFooter'
            // eslint-disable-next-line @typescript-eslint/naming-convention
            dangerouslySetInnerHTML={{ __html: messages.syncPersonalAccessTokenFooter }}
          ></div>
        </div>
        <div styleName='syncInterval'>
          <div styleName='syncIntervalHeader'>{messages.syncIntervalHeader}</div>
          <input
            type='number'
            id='syncIntervalInput'
            styleName='syncIntervalInput'
            value={syncIntervalValue}
            onChange={e => changeSyncInterval(parseInt(e.target.value, 10))}
          ></input>
          <div styleName='syncIntervalFooter'>{messages.syncIntervalFooter}</div>
          <div styleName='syncIntervalAlert'>{syncIntervalAlertValue}</div>
        </div>
      </div>
      <div styleName='languageSettings'>
        <div styleName='languageSettingsHeader'>
          <i className='fas fa-globe'></i>&nbsp;&nbsp;{messages.languageSettingsHeader}
        </div>
        <div styleName='languageSelector'>{languageList}</div>
      </div>
    </dialog>
  );
};
