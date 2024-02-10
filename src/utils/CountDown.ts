export const getRemainingTime = (startingTime: number) => {
  const currentTime = new Date().getTime();

  const remaining = Math.max(
    0,
    Math.floor((startingTime + 1 * 60 * 60 * 1000 - currentTime) / 1000)
  );

  return remaining;
};
