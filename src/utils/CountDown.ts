export const getRemainingTime = (startingTime: any) => {
  const currentTime = new Date().getTime();

  const remaining = Math.max(
    0,
    Math.floor((startingTime + 1 * 60 * 60 * 1000 - currentTime) / 1000),
  );

  return remaining;
};

export const getRemainingTimeEdit = (startingTime: any) => {
  const currentTime = new Date().getTime();

  const remaining = Math.max(
    0,
    Math.floor((startingTime + 3 * 60 * 60 * 1000 - currentTime) / 1000),
  );

  return remaining;
};
