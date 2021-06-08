/**
 * Inventory Manager
 * Copyright (c) Hidekazu Kubota
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */

type MessagesMain = {
  firstItemName: string;
  firstBoxName: string;
  databaseCreateError: string;
  databaseOpenError: string;
  syncError: string;
  enterBoxName: string;
  add: string;
  ok: string;
  cancel: string;
  change: string;
  box: string;
  item: string;
  name: string;
  created_date: string;
  modified_date: string;
  takeout: string;
  cannotDeleteBoxIfNotEmpty: string;
  changeBoxName: string;
  delete: string;
  syncCreate: string;
  syncUpdate: string;
  syncDelete: string;
  settingsDialog: string;
  syncSettingsHeader: string;
  syncRemoteUrlHeader: string;
  syncRemoteUrlFooter: string;
  syncRemoteUrlPlaceholder: string;
  syncPersonalAccessTokenHeader: string;
  syncPersonalAccessTokenFooter: string;
  syncPersonalAccessTokenPlaceholder: string;
  syncIntervalHeader: string;
  syncIntervalFooter: string;
  syncIntervalAlert: string;
  languageSettingsHeader: string;
  testingSync: string;
};

type MessagesLanguage = {
  en: string;
  ja: string;
};

export type Messages = MessagesMain & MessagesLanguage;

export type MessageLabel = keyof Messages;

const LanguagesCommon: MessagesLanguage = {
  en: 'English',
  ja: '日本語(Japanese)',
};

export const English: Messages = {
  ...LanguagesCommon,
  firstItemName: 'Please enter new item.',
  firstBoxName: 'MyBox',
  databaseCreateError: 'Error: Cannot create database',
  databaseOpenError: 'Error: Cannot open database',
  syncError: 'Error: Cannot sync with remote',
  enterBoxName: 'Enter box name',
  add: 'Add',
  ok: 'Ok',
  cancel: 'Cancel',
  change: 'Change',
  box: 'Box',
  item: 'Item',
  name: 'Name',
  created_date: 'Created',
  modified_date: 'Modified',
  takeout: 'Check for taking out item or completion of todo',
  cannotDeleteBoxIfNotEmpty: 'A box cannot be deleted if not empty.',
  changeBoxName: 'Change box name',
  delete: 'Delete',
  syncCreate: 'Create: ',
  syncUpdate: 'Update: ',
  syncDelete: 'Delete: ',
  settingsDialog: 'Settings',
  syncSettingsHeader: 'Synchronization',
  syncRemoteUrlHeader: 'Remote URL',
  syncRemoteUrlFooter: 'Please enter your GitHub repository. Keep it empty to stop sync.',
  syncRemoteUrlPlaceholder:
    'e.g.) https://github.com/your_account_name/your_repository_name',
  syncPersonalAccessTokenHeader: 'Personal Access Token',
  syncPersonalAccessTokenFooter:
    'See <a target="_blank" href="https://docs.github.com/en/github/authenticating-to-github/keeping-your-account-and-data-secure/creating-a-personal-access-token">this guide</a> to get your personal access token from GitHub. Be careful to check [repo] at [Select scopes] section.',
  syncPersonalAccessTokenPlaceholder: 'e.g) ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  syncIntervalHeader: 'Interval (sec)',
  syncIntervalFooter:
    'Please enter sync interval time greater than or equal to 10 seconds.',
  syncIntervalAlert: 'Please enter a number greater than or equal to 10.',
  languageSettingsHeader: 'Language',
  testingSync: 'Testing synchronization...',
};

export const Japanese: Messages = {
  ...LanguagesCommon,
  firstItemName: '新しいアイテムを入力してください',
  firstBoxName: 'マイボックス',
  databaseCreateError: 'エラー：データベースを作成できませんでした。',
  databaseOpenError: 'エラー: データベースを開くことができませんでした。',
  syncError: 'エラー：リモートと同期することができませんでした。同期を再設定してください。',
  enterBoxName: '箱の名前を入力してください',
  add: '追加',
  ok: 'Ok',
  cancel: 'キャンセル',
  change: '変更',
  box: '箱',
  item: 'アイテム',
  name: '名前',
  created_date: '作成日時',
  modified_date: '変更日時',
  takeout: '物品を持出中または事項の完了をチェック',
  cannotDeleteBoxIfNotEmpty: '空でない箱は削除できません。',
  changeBoxName: '箱の名前を変更',
  delete: '削除',
  syncCreate: '新規: ',
  syncUpdate: '更新: ',
  syncDelete: '削除: ',
  settingsDialog: '設定',
  syncSettingsHeader: '同期',
  syncRemoteUrlHeader: '同期先のURL',
  syncRemoteUrlFooter:
    'あなたの GitHub リポジトリ名を入力してください。同期をやめる場合は空欄としてください。',
  syncRemoteUrlPlaceholder: '例) https://github.com/your_account_name/your_repository_name',
  syncPersonalAccessTokenHeader: '個人アクセストークン',
  syncPersonalAccessTokenFooter:
    '<a target="_blank" href="https://docs.github.com/ja/github/authenticating-to-github/keeping-your-account-and-data-secure/creating-a-personal-access-token">こちらのガイド</a>を参照して、あなたの個人アクセストークン（Personal Access Token）を取得してください。取得の際は [Select scopes] 項目の [repo] 欄にチェックを必ず入れてください。',
  syncPersonalAccessTokenPlaceholder: '例) ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  syncIntervalHeader: '間隔（秒）',
  syncIntervalFooter: '同期間隔（10秒以上）を入力してください。',
  syncIntervalAlert: '10以上の値を入力してください',
  languageSettingsHeader: '言語',
  testingSync: '同期のテスト中...',
};

export const availableLanguages = ['en', 'ja'];
export const defaultLanguage = 'en';
