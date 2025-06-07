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
  id: string;
  text: string;
  from: string;
  priority: 'high' | 'medium' | 'low';
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
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