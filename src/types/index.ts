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
  person?: string;
}

export interface Message {
  id: string;
  text: string;
  timestamp: string;
  author: string;
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  timestamp: string;
}

export interface Photo {
  id: string;
  url: string;
  caption?: string;
  title?: string;
  timestamp?: string;
}

export interface WeatherData {
  current: {
    temp: number;
    feels_like: number;
    humidity: number;
    wind_speed: number;
    weather: Array<{
      id: number;
      main: string;
      description: string;
      icon: string;
    }>;
  };
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
  data: WeatherData;
}

export interface SheetsResponse {
  values: string[][];
}

export interface MediaItem {
  id: string;
  baseUrl: string;
  filename: string;
  mediaMetadata?: {
    creationTime?: string;
  };
} 