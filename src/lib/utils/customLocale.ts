export const customLocale = {
  months: [
    'Janvier',
    'Fevrier',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Decembre',
  ],
  weekDays: [
    {
      name: 'Dimanche',
      short: 'Dim',
      isWeekend: true,
    },
    {
      name: 'Lundi',
      short: 'Lun',
    },
    {
      name: 'Mardi',
      short: 'Mar',
    },
    {
      name: 'Mercredi',
      short: 'Mer',
    },
    {
      name: 'Jeudi',
      short: 'Jeu',
    },
    {
      name: 'Vendredi',
      short: 'Ven',
    },
    {
      name: 'Samedi',
      short: 'Sam',
      isWeekend: true,
    },
  ],
  weekStartingIndex: 0,
  getToday(gregorainTodayObject: any) {
    return gregorainTodayObject;
  },
  toNativeDate(date: { year: number; month: number; day: number | undefined }) {
    return new Date(date.year, date.month - 1, date.day);
  },
  getMonthLength(date: { year: number; month: number }) {
    return new Date(date.year, date.month, 0).getDate();
  },
  transformDigit(digit: any) {
    return digit;
  },
  digitSeparator: ',',
  yearLetterSkip: 0,
  isRtl: false,
  nextMonth: '',
  previousMonth: '',
  openMonthSelector: '',
  openYearSelector: '',
  closeMonthSelector: '',
  closeYearSelector: '',
  from: '',
  to: '',
  defaultPlaceholder: '',
};

const getToday = (): { year: number; month: number; day: number } => {
  const today: Date = new Date();
  return {
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    day: today.getDate(),
  };
};

export const defaultFrom = getToday();

export const defaultTo = getToday();

export const defaultValue = getToday();

export const getfullMonthByIndex = (alpha: any) => {
  let month = '';
  let monthLong = '';
  let monthShort = '';

  switch (alpha) {
    case 1:
      month = 'Janv.';
      monthLong = 'janvier';
      monthShort = 'jan'
      break;
    case 2:
      month = 'Févr.';
      monthLong = 'février';
      monthShort = 'fév'
      break;
    case 3:
      month = 'Mars';
      monthLong = 'mars';
      monthShort = 'mars'
      break;
    case 4:
      month = 'Avril';
      monthLong = 'avril';
      monthShort = 'avril'
      break;
    case 5:
      month = 'Mai';
      monthLong = 'mai';
      monthShort = 'mai'
      break;
    case 6:
      month = 'Juin';
      monthLong = 'juin';
      monthShort = 'juin'
      break;
    case 7:
      month = 'Juill.';
      monthLong = 'juillet';
      monthShort = 'juil'
      break;
    case 8:
      month = 'Août';
      monthLong = 'août';
      monthShort = 'août'
      break;
    case 9:
      month = 'Sept.';
      monthLong = 'septembre';
      monthShort = 'sep' 
      break;
    case 10:
      month = 'Oct.';
      monthLong = 'octobre';
      monthShort = 'oct'
      break;
    case 11:
      month = 'Nov.';
      monthLong = 'novembre';
      monthShort = 'nov'
      break;
    case 12:
      month = 'Déc.';
      monthLong = 'décembre';
      monthShort = 'déc'
      break;
    default:
      month = '';
      monthLong = '';
      monthShort = ''
      break;
  }

  return {
    month,
    monthLong,
    monthShort
  };
};
