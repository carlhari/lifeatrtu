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
  const millisecondsPerSecond = 1000;
  const secondsPerMinute = 60;
  const minutesPerHour = 60;
  const hoursPerDay = 24;

  // Convert milliseconds to seconds
  const totalSeconds = Math.floor(time / millisecondsPerSecond);

  // Calculate days, hours, minutes, and seconds
  const days = Math.floor(
    totalSeconds / (hoursPerDay * minutesPerHour * secondsPerMinute),
  );
  const hours = Math.floor(
    (totalSeconds % (hoursPerDay * minutesPerHour * secondsPerMinute)) /
      (minutesPerHour * secondsPerMinute),
  );
  const minutes = Math.floor(
    (totalSeconds % (minutesPerHour * secondsPerMinute)) / secondsPerMinute,
  );
  const seconds = totalSeconds % secondsPerMinute;

  // Construct formatted time string
  const formattedTime = [];

  if (days > 0) {
    formattedTime.push(`${days} days`);
  }

  formattedTime.push(` ${hours.toString().padStart(2, "0")} hr's`);
  formattedTime.push(` ${minutes.toString().padStart(2, "0")} min's`);
  formattedTime.push(` ${seconds.toString().padStart(2, "0")} sec's`);

  return formattedTime.join(" ");
}
