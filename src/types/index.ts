export interface CalendarEvent {
  id: string;
  summary: string;
  start: string;
  end: string;
  description?: string;
  location?: string;
  day?: string;
  time?: string;
}

export interface Message {
  id: number;
  text: string;
  from: string;
  priority: 'high' | 'medium' | 'low';
  timestamp?: string;
  author?: string;
}

export interface Todo {
  id: number;
  text: string;
  completed: boolean;
  task?: string;
  assignedTo?: string;
  dueDate?: string;
  priority?: 'high' | 'medium' | 'low';
  category?: string;
}

export interface Photo {
  id: string;
  url: string;
  caption?: string;
}

export interface WeatherData {
  current: {
    temp: number;
    condition: string;
    icon: string;
  };
  hourly: Array<{
    time: string;
    temp: number;
    condition: string;
    icon: string;
  }>;
  daily: Array<{
    date: string;
    temp: number;
    condition: string;
    icon: string;
  }>;
}

export interface Translations {
  en: {
    [key: string]: string;
  };
  he: {
    [key: string]: string;
  };
}

export interface CalendarState {
  events: CalendarEvent[];
  startDate: string;
  days: number;
}

export interface WeatherResponse {
  list: Array<{
    dt: number;
    main: {
      temp: number;
    };
    weather: Array<{
      id: number;
      main: string;
    }>;
  }>;
}

export interface SheetsResponse {
  data: {
    values?: string[][];
  };
}

export interface MediaItem {
  id?: string;
  baseUrl?: string;
  description?: string;
} 