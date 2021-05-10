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
};

export const Japanese: Messages = {
  ...LanguagesCommon,
  firstItemName: '新しいアイテムを入力してください',
  firstBoxName: 'マイボックス',
  databaseCreateError: 'エラー：データベースを作成できませんでした。',
  databaseOpenError: 'エラー: データベースを開くことができませんでした。',
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
};

export const availableLanguages = ['en', 'ja'];
export const defaultLanguage = 'en';
