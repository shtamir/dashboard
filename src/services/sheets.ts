// src/services/sheets.ts
import { google } from 'googleapis';
import { Message, Todo } from '../types';

const SHEETS_ID = import.meta.env.VITE_SHEETS_ID;

export const fetchMessages = async (): Promise<Message[]> => {
  try {
    const sheets = google.sheets({ version: 'v4' });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEETS_ID,
      range: 'Messages!A2:D',
    });

    return (response.data.values || []).map((row: any[]) => ({
      id: row[0],
      text: row[1],
      from: row[2],
      priority: row[3] as 'high' | 'medium' | 'low'
    }));
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};

export const fetchTodos = async (): Promise<Todo[]> => {
  try {
    const sheets = google.sheets({ version: 'v4' });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEETS_ID,
      range: 'Todos!A2:C',
    });

    return (response.data.values || []).map((row: any[]) => ({
      id: row[0],
      text: row[1],
      completed: row[2] === 'TRUE'
    }));
  } catch (error) {
    console.error('Error fetching todos:', error);
    return [];
  }
};

export async function fetchSheetRows(tabName: string, accessToken: string): Promise<any[]> {
  const url = `