export interface CalendarEvent {
  id: string;
  summary: string;
  start: { dateTime: string; timeZone?: string };
  end: { dateTime: string; timeZone?: string };
  description?: string;
  location?: string;
  color?: string;
  person?: string;
}

export interface Message {
  id: number;
  text: string;
  from: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: string;
  author: string;
  read?: boolean;
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
  timestamp: string;
}

export interface Photo {
  id: string;
  url: string;
  caption?: string;
  title?: string;
  date?: string;
  timestamp?: string;
}

export interface WeatherData {
  current: {
    temp: number;
    feels_like: number;
    humidity: number;
    wind_speed: number;
    sunrise: number;
    sunset: number;
    weather: Array<{
      id: number;
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
      day: number;
      min: number;
      max: number;
    };
    weather: Array<{
      id: number;
      main: string;
      description: string;
      icon: string;
    }>;
  }>;
}

export interface WeatherResponse {
  current: WeatherData['current'];
  hourly: WeatherData['hourly'];
  daily: WeatherData['daily'];
}

export interface SheetsResponse {
  values: string[][];
}

export interface MediaItem {
  id: string;
  baseUrl: string;
  filename: string;
  description?: string;
  mediaMetadata?: {
    creationTime?: string;
  };
}

export interface Translations {
  [key: string]: {
    [key: string]: string;
  };
} 