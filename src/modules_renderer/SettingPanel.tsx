/**
 * Inventory Manager
 * Copyright (c) Hidekazu Kubota
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { availableLanguages } from '../modules_common/i18n';
import { selectorMessages, selectorSettings } from './selector';
import './SettingPanel.css';
import {
  settingsLanguageUpdateCreator,
  settingsSyncIntervalUpdateCreator,
  settingsSyncPersonalAccessTokenUpdateCreator,
  settingsSyncRemoteUrlUpdateCreator,
} from './actionCreator';
import window from './window';

export const SettingPanel = (prop: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) => {
  const dispatch = useDispatch();

  const messages = useSelector(selectorMessages);
  const settings = useSelector(selectorSettings);

  const [syncRemoteUrlValue, setSyncRemoteUrlValue] = useState(settings.sync.remote_url);
  const [syncPersonalAccessTokenValue, setSyncPersonalAccessTokenValue] = useState(
    settings.sync.connection.personal_access_token
  );
  const [syncIntervalValue, setSyncIntervalValue] = useState(settings.sync.interval / 1000);
  const [syncIntervalAlertValue, setSyncIntervalAlertValue] = useState('');
  const [isTestSyncDialogOpen, setIsTestSyncDialogOpen] = useState(false);
  const [testSyncDialogMessage, setTestSyncDialogMessage] = useState(messages.testingSync);

  const applyAndCloseSettings = async () => {
    if (syncIntervalAlertValue !== '') {
      return;
    }
    if (syncRemoteUrlValue === '') {
      // nop
    }
    else if (
      syncRemoteUrlValue !== settings.sync.remote_url ||
      syncPersonalAccessTokenValue !== settings.sync.connection.personal_access_token
    ) {
      if (syncRemoteUrlValue !== settings.sync.remote_url) {
        dispatch(settingsSyncRemoteUrlUpdateCreator(syncRemoteUrlValue));
      }
      if (syncPersonalAccessTokenValue !== settings.sync.connection.personal_access_token) {
        dispatch(
          settingsSyncPersonalAccessTokenUpdateCreator(syncPersonalAccessTokenValue)
        );
      }

      // Test sync
      setTestSyncDialogMessage(messages.testingSync);
      setIsTestSyncDialogOpen(true);

      const result = await window.api
        .db({
          command: 'db-test-sync',
        })
        .catch(e => {
          return e;
        });
      if (result !== 'succeed') {
        console.log(result);
        setTestSyncDialogMessage(messages.syncError);
        return;
      }
      // Success
      setTestSyncDialogMessage('');
      setIsTestSyncDialogOpen(false);
    }
    window.api.db({
      command: 'db-resume-sync',
    });

    prop.setIsOpen(false);
  };

  const changeSyncInterval = () => {
    if (syncIntervalValue < 10) {
      setSyncIntervalAlertValue(messages.syncIntervalAlert);
    }
    else {
      setSyncIntervalAlertValue('');
      dispatch(settingsSyncIntervalUpdateCreator(syncIntervalValue));
    }
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
      <dialog id='testSyncDialog' styleName='testSyncDialog' open={isTestSyncDialogOpen}>
        <div
          styleName='testSyncDialogCloseButton'
          onClick={e => setIsTestSyncDialogOpen(false)}
        >
          <i className='far fa-times-circle'></i>
        </div>
        <div styleName='testSyncDialogMessage'>{testSyncDialogMessage}</div>
      </dialog>
      <div styleName='closeButton' onClick={applyAndCloseSettings}>
        <i className='far fa-times-circle'></i>
      </div>
      <div styleName='settingsHeader'>{messages.settingsDialog}</div>
      <div styleName='syncSettings'>
        <div styleName='syncSettingsHeader'>
          <i className='fas fa-sync'></i>&nbsp;&nbsp;{messages.syncSettingsHeader}
        </div>
        <div styleName='syncRemoteUrl'>
          <div styleName='syncRemoteUrlHeader'>{messages.syncRemoteUrlHeader}</div>
          <input
            type='text'
            id='syncRemoteUrlInput'
            styleName='syncRemoteUrlInput'
            value={syncRemoteUrlValue}
            placeholder={messages.syncRemoteUrlPlaceholder}
            onChange={e => setSyncRemoteUrlValue(e.target.value)}
          ></input>
          <div styleName='syncRemoteUrlAlert'></div>
          <div styleName='syncRemoteUrlFooter'>{messages.syncRemoteUrlFooter}</div>
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
            onChange={e => setSyncIntervalValue(parseInt(e.target.value, 10))}
            onBlur={changeSyncInterval}
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
