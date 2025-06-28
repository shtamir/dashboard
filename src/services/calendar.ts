// src/services/calendar.ts
import type { CalendarEvent } from '@types';
import { getAccessToken } from '@services/auth';
import { getDateWindow } from '@utils/dateRange';
import { getSettings } from '@services/settings';   // however you expose setting

const CALENDAR_ID = 'primary';

const palette = [
  '#4CAF50', // green
  '#2196F3', // blue
  '#F44336', // red
  '#9C27B0', // purple
  '#FF9800', // orange
  '#00BCD4', // cyan
  '#E91E63', // pink
  '#795548', // brown
  '#607D8B', // blue grey
  '#FFEB3B'  // yellow
];

/**
 * Always returns the 7‑day rolling window starting today @ 00:00.
 * If you later plug a "view‑mode" setting in, compute `rangeStart` and
 * `days` from that value and keep the rest unchanged.
 */
export async function fetchCalendarEvents(): Promise<CalendarEvent[]> {
  const token = await getAccessToken();
  // Always fetch the next 14 days (2 weeks) from today at local midnight
  const rangeStart = new Date();
  rangeStart.setHours(0, 0, 0, 0);
  const days = 14;
  const rangeEnd = new Date(rangeStart);
  rangeEnd.setDate(rangeEnd.getDate() + days);


  // Fetch Google Calendar color palette
  const colorRes = await fetch('https://www.googleapis.com/calendar/v3/colors', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const colorData = await colorRes.json();
  const eventColors = colorData.event || {};

  const url =
    `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events` +
    `?timeMin=${rangeStart.toISOString()}` +
    `&timeMax=${rangeEnd.toISOString()}` +
    `&singleEvents=true&orderBy=startTime`;

  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();


  const items: any[] = data.items ?? [];

  return items.map((e: any) => {
    // Use event color if available, else fallback to a default
    const colorHex = e.colorId && eventColors[e.colorId]?.background ? eventColors[e.colorId].background : '#4CAF50';
    return {
      id: e.id,
      title: e.summary,
      start: new Date(e.start.dateTime || e.start.date),
      end: new Date(e.end.dateTime || e.end.date),
      color: colorHex,
      person: e.organizer?.displayName ?? 'family'
    };
  });
}