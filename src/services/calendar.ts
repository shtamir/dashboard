// src/services/calendar.ts
import { google } from 'googleapis';
import { CalendarEvent } from '@types';
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
  try {
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/calendar.readonly']
    });

    const calendar = google.calendar({ version: 'v3', auth });
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime'
    });

    return (response.data.items || []).map(event => ({
      id: event.id || '',
      summary: event.summary || '',
      start: {
        dateTime: event.start?.dateTime || event.start?.date || '',
        timeZone: event.start?.timeZone
      },
      end: {
        dateTime: event.end?.dateTime || event.end?.date || '',
        timeZone: event.end?.timeZone
      },
      description: event.description,
      location: event.location,
      color: event.colorId,
      person: event.creator?.displayName
    }));
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    throw error;
  }
}