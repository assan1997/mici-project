type Duration = '1min' | '5min';
type TimeFormat = 'h:m' | 'h:m:s' | 'd:mo:y' | 'd:mo:y';

const dayShort = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

const dayLong = [
  'Dimanche',
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
];

const monthLong = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
];

export function compare(
  timestampA: number,
  timestampB: number,
  duration: Duration,
) {
  const differenceInSeconds = (timestampB - timestampA) / 1000;
  switch (duration) {
    case '1min':
      return differenceInSeconds <= 60;
    case '5min':
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

export function sendedInTheDay(timestampA: number, timestampB: number) {
  const dA = new Date(timestampA).getDate();
  const moA = new Date(timestampA).getMonth() + 1;
  const yA = new Date(timestampA).getFullYear();
  // const hA = new Date(timestampA).getHours();
  // const mA = new Date(timestampA).getMinutes();
  // const hB = new Date(timestampB).getHours();
  // const mB = new Date(timestampB).getMinutes();
  const dB = new Date(timestampB).getDate();
  const moB = new Date(timestampB).getMonth() + 1;
  const yB = new Date(timestampB).getFullYear();
  const condition = dA === dB && moA === moB && yA === yB;
  //   && hA === hB && mB === mA;
  return condition;
}

export function formatTime(
  timestamp: number,
  format: TimeFormat,
  type: 'long' | 'short',
) {
  const h = new Date(timestamp).getHours();
  const m = new Date(timestamp).getMinutes();
  const s = new Date(timestamp).getSeconds();

  const d = new Date(timestamp).getDate();
  const mo = new Date(timestamp).getMonth() + 1;
  const y = new Date(timestamp).getFullYear();
  const day = new Date(timestamp).getDay();

  switch (format) {
    case 'h:m':
      if (type === 'long')
        return `${h < 10 ? `0` + h : h} ${h > 1 ? 'heures' : 'heure'} - ${
          m < 10 ? `0` + m : m
        } ${m > 1 ? 'minutes' : 'minute'}`;
      if (type === 'short')
        return `${h < 10 ? `0` + h : h}:${m < 10 ? `0` + m : m}`;

    case 'h:m:s':
      if (type === 'long')
        return `${h < 10 ? `0` + h : h} ${h > 0 ? 'heures' : 'heure'} - ${
          m < 10 ? `0` + m : m
        } ${m > 1 ? 'minutes' : 'minute'} - ${s < 10 ? `0` + s : s} ${
          s > 1 ? 'secondes' : 'seconde'
        }`;
      if (type === 'short')
        return `${h < 10 ? `0` + h : h}:${m < 10 ? `0` + m : m}:${
          s < 10 ? `0` + s : s
        }`;

    case 'd:mo:y':
      if (type === 'short')
        return `${d < 10 ? `0` + d : d}/${mo < 10 ? `0` + mo : mo}/${y}`;
      if (type === 'long') {
        return `${dayLong[day]} ${d} ${monthLong[mo - 1]} ${y}`;
      }

    default:
      return `${timestamp}`;
  }
}

// time
const formatShortDate = (date: Date) => {
  const _date = date.getUTCDate();
  return dayShort[date.getUTCDay()] + ` ${_date < 10 ? '0' + _date : _date}`;
};
// format last message time
const timeToSeconds = (date: Date) => {
  return date.getUTCHours() * 3600 + date.getUTCMinutes() * 60;
};

export const formatLastMessageTime = (date: Date) => {
  let today = new Date();
  // timestamp
  const lastMessageTimestamp = new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  ).getTime();
  const todayTimestamp = new Date(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate(),
  ).getTime();
  const diffTimestamp = todayTimestamp - lastMessageTimestamp;
  //time in seconds
  const lastMessageTime = timeToSeconds(date);
  const todayTime = timeToSeconds(today);

  // today verification
  if (lastMessageTimestamp === todayTimestamp) {
    // get difference of seconds between time;
    let diffTime = todayTime - lastMessageTime;
    // make conditions
    if (diffTime === 0) return 'maintenant'; //dffTime equal to zero
    // diffTime is between 0 and 3560 minutes
    if (diffTime >= 60 && diffTime < 3600)
      return `il y'a ${Math.floor(diffTime / 60)} min`;
    // diffTime is between 1 and 23 hours
    if (diffTime >= 3600 && diffTime < 86400)
      return `il y'a ${Math.floor(diffTime / 3600)} h`;
  }

  // yesterday verificaton
  if (diffTimestamp === 86400)
    return `hier ${formatTime(date.getTime(), 'h:m', 'short')}`;
  return `${formatShortDate(date)}`;
};
