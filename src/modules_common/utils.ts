import { monotonicFactory } from 'ulid';
const ulid = monotonicFactory();

export const getBoxId = (fullId: string) => {
  const res = fullId.match(/^item\/(.+?)\//);
  if (res.length >= 2) {
    return res[1];
  }
  const res2 = fullId.match(/^box\/(.+?)\.json/);
  if (res2.length >= 2) {
    return res2[1];
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
