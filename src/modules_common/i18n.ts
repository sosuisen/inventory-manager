/**
 * Inventory Manager
 * Copyright (c) Hidekazu Kubota
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */

type MessagesMain = {
  appName: string;
  databaseCreateError: string;
  databaseOpenError: string;
  enterBoxName: string;
  add: string;
  cancel: string;
  box: string;
  item: string;
  name: string;
  created_date: string;
  modified_date: string;
  takeout: string;
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
  appName: 'Inventory Manager',
  databaseCreateError: 'Error: Cannot create database',
  databaseOpenError: 'Error: Cannot open database',
  enterBoxName: 'Enter box name',
  add: 'Add',
  cancel: 'Cancel',
  box: 'Box',
  item: 'Item',
  name: 'Name',
  created_date: 'Created',
  modified_date: 'Modified',
  takeout: 'Take out',
};

export const Japanese: Messages = {
  ...LanguagesCommon,
  appName: '収納管理',
  databaseCreateError: 'エラー：データベースを作成できませんでした。',
  databaseOpenError: 'エラー: データベースを開くことができませんでした。',
  enterBoxName: '箱の名前を入力してください',
  add: '追加',
  cancel: 'キャンセル',
  box: '箱',
  item: '物品',
  name: '名前',
  created_date: '作成日時',
  modified_date: '変更日時',
  takeout: '持出',
};

export const availableLanguages = ['en', 'ja'];
export const defaultLanguage = 'en';
