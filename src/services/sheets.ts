// src/services/sheets.ts
import type { Message, Todo } from '../types';

const SHEETS_ID = import.meta.env.VITE_SHEETS_ID;

export async function fetchMessages(): Promise<Message[]> {
  // TODO: replace with real Google Sheets API v4 call
  return [
    { id: 1, text: "Don't forget to take out the trash", from: 'Mom', priority: 'high' }
  ];
}

export async function fetchTodos(): Promise<Todo[]> {
  return [
    { id: 1, text: 'Pay bills', completed: false }
  ];
}

export async function fetchSheetRows(tabName: string, accessToken: string): Promise<any[]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEETS_ID}/values/${encodeURIComponent(tabName)}?majorDimension=ROWS`;
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
    },
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  // data.values is an array of arrays (rows)
  return data.values || [];
}

export async function updateSheetCell(tab: string, rowIndex: number, colIndex: number, value: string, accessToken: string): Promise<void> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEETS_ID}/values/${encodeURIComponent(tab)}!${columnToLetter(colIndex + 1)}${rowIndex + 1}?valueInputOption=USER_ENTERED`;
  const body = {
    range: `${tab}!${columnToLetter(colIndex + 1)}${rowIndex + 1}`,
    majorDimension: 'ROWS',
    values: [[value]]
  };
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(await res.text());
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