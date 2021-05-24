/**
 * Inventory Manager
 * Copyright (c) Hidekazu Kubota
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */

import { monotonicFactory } from 'ulid';
const ulid = monotonicFactory();

export const getBoxId = (id: string) => {
  const resBox = id.match(/^box\/(.+?)\.json/);
  if (resBox && resBox.length >= 2) {
    return resBox[1];
  }
  const resItem = id.match(/^(.+?)\//);
  if (resItem && resItem.length >= 2) {
    return resItem[1];
  }

  return undefined;
};

// Returns UTC date with 'YYYY-MM-DD HH:mm:ss' format
export const getCurrentDateAndTime = (): string => {
  return new Date().toISOString().replace(/^(.+?)T(.+?)\..+?$/, '$1 $2');
};

export const getLocalDateAndTime = (utcDateAndTime: string): string => {
  const regularUTC = utcDateAndTime.replace(
    /^(\d\d\d\d-\d\d-\d\d).(\d\d:\d\d:\d\d)/,
    '$1 $2'
  );
  const offset = new Date().getTimezoneOffset();
  const utcMsec = Date.parse(regularUTC);
  const localMsec = utcMsec - offset * 60 * 1000;
  const localDate = new Date(localMsec);
  const zeroPad = (num: number) => ('00' + num).slice(-2);
  return `${localDate.getFullYear()}/${zeroPad(localDate.getMonth() + 1)}/${zeroPad(
    localDate.getDate()
  )} ${zeroPad(localDate.getHours())}:${zeroPad(localDate.getMinutes())}`;
  //  return new Date(localMsec).toISOString().replace(/^(.+?)T(.+?)\..+?$/, '$1 $2');
};
export const generateId = () => {
  return ulid(Date.now());
};
