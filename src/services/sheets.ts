// src/services/sheets.ts
import { google } from 'googleapis';
import { Message, Todo, SheetsResponse } from '@types';

const SHEETS_ID = import.meta.env.VITE_SHEETS_ID;

export async function fetchMessages(): Promise<Message[]> {
  try {
    const rows = await fetchSheetRows('Messages');
    return rows.map((row, index) => ({
      id: index + 1,
      text: row[0] || '',
      from: row[1] || '',
      priority: (row[2] as 'high' | 'medium' | 'low') || 'medium',
      timestamp: row[3] || new Date().toISOString(),
      author: row[4] || 'Unknown'
    }));
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
}

export async function fetchTodos(): Promise<Todo[]> {
  try {
    const rows = await fetchSheetRows('Todos');
    return rows.map((row, index) => ({
      id: index + 1,
      text: row[0] || '',
      completed: row[1] === 'TRUE',
      task: row[2] || '',
      assignedTo: row[3] || '',
      dueDate: row[4] || '',
      priority: (row[5] as 'high' | 'medium' | 'low') || 'medium',
      category: row[6] || '',
      timestamp: row[7] || new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error fetching todos:', error);
    throw error;
  }
}

export async function fetchSheetRows(tabName: string): Promise<string[][]> {
  try {
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEETS_ID,
      range: `${tabName}!A:H`
    });

    return response.data.values || [];
  } catch (error) {
    console.error(`Error fetching sheet rows from ${tabName}:`, error);
    throw error;
  }
}

export async function updateSheetCell(
  tabName: string,
  cell: string,
  value: string
): Promise<void> {
  try {
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({ version: 'v4', auth });
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEETS_ID,
      range: `${tabName}!${cell}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[value]]
      }
    });
  } catch (error) {
    console.error(`Error updating sheet cell ${cell} in ${tabName}:`, error);
    throw error;
  }
}

function columnToLetter(col: number): string {
  let temp: number;
  let letter = '';
  let n = col;
  while (n > 0) {
    temp = (n - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    n = Math.floor((n - temp - 1) / 26);
  }
  return letter;
}