// Returns UTC date with 'YYYY-MM-DD HH:mm:ss' format
export const getCurrentDateAndTime = (): string => {
  return new Date().toISOString().replace(/^(.+?)T(.+?)\..+?$/, '$1 $2');
};

export const getLocalDateAndTime = (utcDateAndTime: string): string => {
  const regularUTC = utcDateAndTime.replace(
    /^(\d\d\d\d-\d\d-\d\d).(\d\d:\d\d:\d\d)/,
    '$1 $2 GMT'
  );
  const offset = new Date().getTimezoneOffset();
  const utcMsec = Date.parse(regularUTC);
  const localMsec = utcMsec - offset * 60 * 1000;
  return new Date(localMsec).toISOString().replace(/^(.+?)T(.+?)\..+?$/, '$1 $2');
};
