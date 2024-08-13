type Duration = "1min" | "5min";
type TimeFormat = "h:m" | "h:m:s";
export function compare(
  timestampA: number,
  timestampB: number,
  duration: Duration
) {
  const differenceInSeconds = (timestampB - timestampA) / 1000;
  switch (duration) {
    case "1min":
      return differenceInSeconds <= 60;
    case "5min":
      return differenceInSeconds <= 300;
    default:
      return false;
  }
}

export function sendedInTheMinutes(timestampA: number, timestampB: number) {
  const dA = new Date(timestampA).getDate();
  const moA = new Date(timestampA).getMonth() + 1;
  const yA = new Date(timestampA).getFullYear();
  const hA = new Date(timestampA).getHours();
  const mA = new Date(timestampA).getMinutes();
  const hB = new Date(timestampB).getHours();
  const mB = new Date(timestampB).getMinutes();
  const dB = new Date(timestampB).getDate();
  const moB = new Date(timestampB).getMonth() + 1;
  const yB = new Date(timestampB).getFullYear();
  const condition =
    dA === dB && moA === moB && yA === yB && hA === hB && mB === mA;
  return condition;
}

export function formatTime(timestamp: number, format: TimeFormat) {
  const h = new Date(timestamp).getHours();
  const m = new Date(timestamp).getMinutes();
  const s = new Date(timestamp).getSeconds();
  switch (format) {
    case "h:m":
      return `${h < 10 ? `0` + h : h}:${m < 10 ? `0` + m : m}`;
    case "h:m:s":
      return `${h < 10 ? `0` + h : h}:${m < 10 ? `0` + m : m}:${s < 10 ? `0` + s : s}`;
    default:
      return `${timestamp}`;
  }
}
