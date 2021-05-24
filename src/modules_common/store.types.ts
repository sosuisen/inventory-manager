/**
 * Inventory Manager
 * Copyright (c) Hidekazu Kubota
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */

import { English, Messages } from './i18n';

export type SyncInfo = {
  create: number;
  update: number;
  delete: number;
};

export type AppInfo = {
  name: string;
  version: string;
  iconDataURL: string;
};

export type Item = {
  _id: string;
  name: string;
  takeout: boolean;
  created_date: string;
  modified_date: string;
};

export type ItemState = {
  [_id: string]: Item;
};

/**
 * Type for box document in GitDocumentDB
 */
export type BoxDoc = {
  _id: string;
  name: string;
};

/**
 * Type for box object in redux store
 */
export type Box = BoxDoc & {
  items: string[];
};

export type BoxState = {
  [id: string]: Box;
};

export type LatestChangeFrom = 'local' | 'remote';

export type WorkState = {
  currentBox: string;
  synchronizing: boolean;
  syncInfo?: SyncInfo;
  latestChangeFrom: LatestChangeFrom;
  itemAdded: boolean;
  itemDeleted: boolean;
};

export type MessagesPutAction = {
  type: 'messages-put';
  payload: Messages;
};

export type AppPutAction = {
  type: 'appinfo-put';
  payload: {
    name: string;
    version: string;
    iconDataURL: string;
  };
};

export type TemporalSettingsAction = MessagesPutAction | AppPutAction;

export type TemporalSettingsState = {
  messages: Messages; // It is set and updated when 'settings.language' is changed.
  appinfo: {
    name: string;
    version: string;
    iconDataURL: string;
  };
};

export const initialTemporalSettingsState: TemporalSettingsState = {
  messages: English,
  appinfo: {
    name: '',
    version: '',
    iconDataURL: '',
  },
};

export type InventoryState = {
  item: ItemState;
  box: BoxState;
  work: WorkState;
  settings: TemporalSettingsState;
};

/**
 * Changed file in merge operation
 */
export type ChangedFile = {
  operation: WriteOperation;
  data: JsonDocWithMetadata;
};

/**
 * Write operation
 */
export type WriteOperation =
  | 'create'
  | 'update'
  | 'delete'
  | 'create-merge'
  | 'update-merge';

export type JsonDocWithMetadata = DocMetadata & {
  doc?: JsonDoc;
};

/**
 * Type for a document metadata
 *
 * @remarks
 * - id: id of a document. (You might be confused. Underscored '_id' is used only in a {@link JsonDoc} type. In other cases, 'id' is used. This is a custom of PouchDB/CouchDB.)
 *
 * - file_sha: SHA-1 hash of Git object (40 characters)
 *
 * - type: Default is 'json'.
 */
export type DocMetadata = {
  id: string;
  file_sha: string;
  type?: 'json' | 'raw';
};

export type JsonDoc = {
  [key: string]: any;
};
