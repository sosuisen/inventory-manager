import { nanoid } from 'nanoid';

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
  return 'id' + nanoid(21); // 23 characters include only 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-
};
