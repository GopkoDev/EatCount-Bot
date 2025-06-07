import { DateTime } from 'luxon';

export const timeZone = 'Europe/Kyiv';

export const getTodayRange = (date = new Date()) => {
  const startOfDayKyiv = DateTime.fromJSDate(date)
    .setZone(timeZone)
    .startOf('day');
  const endOfDayKyiv = startOfDayKyiv.endOf('day');

  const dayAndMonthKyiv = startOfDayKyiv.toFormat('dd MMMM', { locale: 'uk' });

  return {
    startOfDay: startOfDayKyiv.toJSDate(),
    endOfDay: endOfDayKyiv.toJSDate(),
    dayAndMonthKyiv,
  };
};

const getWeekRange = (date = new Date()) => {
  const startOfWeekKyiv = DateTime.fromJSDate(date, { zone: timeZone }).startOf(
    'week'
  );
  const endOfWeekKyiv = startOfWeekKyiv.plus({ days: 7 });

  const weekRangeKyiv = `${startOfWeekKyiv.toFormat('dd MMMM', {
    locale: 'uk',
  })} - ${endOfWeekKyiv.toFormat('dd MMMM', { locale: 'uk' })}`;

  return {
    startOfWeek: startOfWeekKyiv.toJSDate(),
    endOfWeek: endOfWeekKyiv.toJSDate(),
    weekRangeKyiv,
  };
};

export const getRangeByKeyType = (
  keyType: 'stats_this_week' | 'stats_last_week',
  date = new Date()
) => {
  if (keyType === 'stats_this_week') {
    return getWeekRange(date);
  } else if (keyType === 'stats_last_week') {
    const lastWeekDate = DateTime.fromJSDate(date, { zone: timeZone }).minus({
      weeks: 1,
    });
    return getWeekRange(lastWeekDate.toJSDate());
  }
  throw new Error(`Unsupported KeyType: ${keyType}`);
};

export const getAllDatesInWeek = (startOfWeek: Date) => {
  const startOfWeekKyiv = DateTime.fromJSDate(startOfWeek, { zone: timeZone });
  return Array.from({ length: 7 }, (_, i) => {
    return startOfWeekKyiv.plus({ days: i }).toFormat('yyyy-MM-dd');
  });
};

export const formatDateToKey = (timestamp: Date) => {
  return DateTime.fromJSDate(timestamp, { zone: timeZone }).toFormat(
    'yyyy-MM-dd'
  );
};

export const getWeekAgoDate = (date = new Date()) => {
  return DateTime.fromJSDate(date, { zone: timeZone })
    .minus({ weeks: 1 })
    .toJSDate();
};
