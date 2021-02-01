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
  boxName: string;
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
  boxName: 'Box name',
};

export const Japanese: Messages = {
  ...LanguagesCommon,
  appName: '収納管理',
  databaseCreateError: 'エラー：データベースを作成できませんでした。',
  databaseOpenError: 'エラー: データベースを開くことができませんでした。',
  enterBoxName: 'ボックス名を入力してください',
  boxName: 'ボックス名',
};

export const availableLanguages = ['en', 'ja'];
export const defaultLanguage = 'en';
