// utils/dateRange.ts
export type ViewMode =
  | 'full-week'        // Sun-Sat of the current ISO week
  | 'upcoming-week'    // Today .. Today+6  (your new default)
  | 'work-week'        // Mon-Fri of current week
  | 'weekend'          // Fri-Sun *this* week
  | 'next-3-days'
  | 'today';

export function getDateWindow(mode: ViewMode, now = new Date()) {
  // Create a new date and set it to local midnight
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  switch (mode) {
    case 'full-week': {
      const dayOfWeek = start.getDay();          // Sun=0 … Sat=6
      start.setDate(start.getDate() - dayOfWeek);
      return { start, days: 7 };
    }
    case 'work-week': {
      const day = start.getDay();
      const diffToMon = (day + 6) % 7;           // Sun→6, Mon→0, … Sat→5
      start.setDate(start.getDate() - diffToMon);
      return { start, days: 5 };
    }
    case 'weekend': {
      const diffToFri = (start.getDay() + 2) % 7; // Sun→5, Mon→4, … Fri→0
      start.setDate(start.getDate() - diffToFri);
      return { start, days: 3 };
    }
    case 'next-3-days':
      return { start, days: 3 };
    case 'today':
      return { start, days: 1 };
    default:                    // 'upcoming-week'
      return { start, days: 7 };
  }
}
