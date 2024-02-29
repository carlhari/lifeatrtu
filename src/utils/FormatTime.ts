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
