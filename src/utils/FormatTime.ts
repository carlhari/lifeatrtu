export function formatTime(time: any) {
  const m = String(Math.floor(time / 60));
  const s = String(time % 60);

  return [m.padStart(2, "0"), s.padStart(2, "0")].join(":");
}
