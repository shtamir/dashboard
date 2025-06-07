// src/services/sheets.ts
import { google } from 'googleapis';
import { Message, Todo } from '@types';

const SHEETS_ID = import.meta.env.VITE_SHEETS_ID;

export const fetchMessages = async (accessToken: string): Promise<Message[]> => {
  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const sheets = google.sheets({ version: 'v4', auth });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEETS_ID,
      range: 'Messages!A2:E',
    });

    return (response.data.values || []).map((row: string[]) => ({
      id: parseInt(row[0], 10),
      text: row[1],
      from: row[2],
      priority: row[3] as 'high' | 'medium' | 'low',
      timestamp: row[4] || new Date().toISOString(),
      author: row[2]
    }));
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};

export const fetchTodos = async (accessToken: string): Promise<Todo[]> => {
  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const sheets = google.sheets({ version: 'v4', auth });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEETS_ID,
      range: 'Todos!A2:G',
    });

    return (response.data.values || []).map((row: string[]) => ({
      id: parseInt(row[0], 10),
      text: row[1],
      completed: row[2] === 'TRUE',
      task: row[3] || row[1],
      assignedTo: row[4] || 'Family',
      dueDate: row[5] || new Date().toISOString(),
      priority: (row[6] as 'high' | 'medium' | 'low') || 'medium',
      category: row[7] || 'General'
    }));
  } catch (error) {
    console.error('Error fetching todos:', error);
    return [];
  }
};

export const fetchSheetRows = async (tabName: string, accessToken: string): Promise<string[][]> => {
  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const sheets = google.sheets({ version: 'v4', auth });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEETS_ID,
      range: `${tabName}!A:Z`,
    });

    return response.data.values || [];
  } catch (error) {
    console.error('Error fetching sheet rows:', error);
    return [];
  }
};

export const updateSheetCell = async (
  tab: string,
  rowIndex: number,
  colIndex: number,
  value: string,
  accessToken: string
): Promise<void> => {
  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const sheets = google.sheets({ version: 'v4', auth });
    const range = `${tab}!${columnToLetter(colIndex + 1)}${rowIndex + 1}`;
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEETS_ID,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[value]]
      }
    });
  } catch (error) {
    console.error('Error updating sheet cell:', error);
    throw error;
  }
};

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