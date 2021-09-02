import {
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";

export const TODAY =
  new Date(new Date().setUTCHours(0, 0, 0, 0)).getTime() / 1000;

export const YESTERDAY = subDays(TODAY * 1000, 1).getTime() / 1000;

export const THIS_WEEK =
  startOfWeek((TODAY + new Date().getTimezoneOffset() * 60) * 1000).getTime() /
    1000 -
  new Date().getTimezoneOffset() * 60;

export const LAST_WEEK = subWeeks(THIS_WEEK * 1000, 1).getTime() / 1000;

export const THIS_MONTH =
  startOfMonth((TODAY + new Date().getTimezoneOffset() * 60) * 1000).getTime() /
    1000 -
  new Date().getTimezoneOffset() * 60;

export const LAST_MONTH = subMonths(THIS_MONTH * 1000, 1).getTime() / 1000;
