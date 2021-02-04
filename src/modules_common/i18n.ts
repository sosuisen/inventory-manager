/**
 * Inventory Manager
 * Copyright (c) Hidekazu Kubota
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */

type MessagesMain = {
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
  takeout: 'Check for taking out item or completion of todo',
};

export const Japanese: Messages = {
  ...LanguagesCommon,
  databaseCreateError: 'エラー：データベースを作成できませんでした。',
  databaseOpenError: 'エラー: データベースを開くことができませんでした。',
  enterBoxName: '箱の名前を入力してください',
  add: '追加',
  cancel: 'キャンセル',
  box: '箱',
  item: 'アイテム',
  name: '名前',
  created_date: '作成日時',
  modified_date: '変更日時',
  takeout: '物品を持出中または事項の完了をチェック',
};

export const availableLanguages = ['en', 'ja'];
export const defaultLanguage = 'en';
