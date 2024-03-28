export function formatTime(time: any) {
  const m = String(Math.floor(time / 60));
  const s = String(time % 60);

  return [m.padStart(2, "0"), s.padStart(2, "0")].join(":");
}

export function formatTimeHours(time: any) {
  if (time <= 3600) {
    const m = String(Math.floor(time / 60));
    const s = String(time % 60);

    return [m.padStart(2, "0"), s.padStart(2, "0")].join(":");
  }

  const h = String(Math.floor(time / 3600)).padStart(2, "0");
  const m = String(Math.floor((time % 3600) / 60)).padStart(2, "0");
  const s = String(time % 60).padStart(2, "0");

  return [h, m, s].join(":");
}

export function formatTimeDays(time: number) {
  const secondsPerMinute = 60;
  const minutesPerHour = 60;
  const hoursPerDay = 24;

  const days = Math.floor(
    time / (hoursPerDay * minutesPerHour * secondsPerMinute),
  );
  const remainingSeconds =
    time % (hoursPerDay * minutesPerHour * secondsPerMinute);
  const hours = Math.floor(
    remainingSeconds / (minutesPerHour * secondsPerMinute),
  );
  const remainingSecondsAfterHours =
    remainingSeconds % (minutesPerHour * secondsPerMinute);
  const minutes = Math.floor(remainingSecondsAfterHours / secondsPerMinute);
  const seconds = remainingSecondsAfterHours % secondsPerMinute;

  const formattedTime = [];

  if (days > 0) {
    formattedTime.push(`${days} day${days > 1 ? "s" : ""}`);
  }

  if (hours > 0) {
    formattedTime.push(`${hours} hr${hours > 1 ? "s" : ""}`);
  }

  if (minutes > 0) {
    formattedTime.push(`${minutes} min${minutes > 1 ? "s" : ""}`);
  }

  if (seconds > 0) {
    formattedTime.push(`${seconds} sec${seconds > 1 ? "s" : ""}`);
  }

  return formattedTime.join(" ");
}
