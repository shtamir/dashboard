export interface CalendarEvent {
  id: string;
  summary: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
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
}

export interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export interface Photo {
  id: number;
  url: string;
  caption: string;
}

export interface WeatherData {
  current: {
    temperature: number;
    condition: string;
    icon: string;
    sunrise: string;
    sunset: string;
  };
  hourly: Array<{
    time: string;
    temperature: number;
    condition: string;
    icon: string;
  }>;
  daily: Array<{
    time: string;
    temperature: {
      min: number;
      max: number;
    };
    condition: string;
    icon: string;
  }>;
}

export interface Translations {
  en: {
    title: string;
    calendar: string;
    messages: string;
    todos: string;
    weather: string;
    photos: string;
    settings: string;
    signIn: string;
    signOut: string;
    today: string;
    tomorrow: string;
    noEvents: string;
    dailyPhoto: string;
    [key: string]: string;
  };
  he: {
    [key: string]: string;
  };
}

export interface CalendarState {
  events: CalendarEvent[];
  rangeStart: Date;
  days: number;
} 