export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
  color?: string;
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
    feels_like: number;
    humidity: number;
    wind_speed: number;
    weather: Array<{
      main: string;
      description: string;
      icon: string;
    }>;
  };
  hourly: Array<{
    dt: number;
    temp: number;
    weather: Array<{
      main: string;
      description: string;
      icon: string;
    }>;
  }>;
  daily: Array<{
    dt: number;
    temp: {
      min: number;
      max: number;
    };
    weather: Array<{
      main: string;
      description: string;
      icon: string;
    }>;
  }>;
}

export interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

export interface CalendarState {
  events: CalendarEvent[];
  loading: boolean;
  error: string | null;
}

export interface WeatherResponse {
  current: {
    temp: number;
    feels_like: number;
    humidity: number;
    wind_speed: number;
    weather: Array<{
      main: string;
      description: string;
      icon: string;
    }>;
  };
  hourly: Array<{
    dt: number;
    temp: number;
    weather: Array<{
      main: string;
      description: string;
      icon: string;
    }>;
  }>;
  daily: Array<{
    dt: number;
    temp: {
      min: number;
      max: number;
    };
    weather: Array<{
      main: string;
      description: string;
      icon: string;
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