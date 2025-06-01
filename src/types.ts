// src/types.ts
export interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    color: string;
    person?: string;
  }
  
  export interface Message {
    id: number;
    timestamp: string; // ISO or display string
    text: string;
    author: string;
    priority: 'high' | 'medium' | 'low';
    read?: boolean;
  }
  
  export interface Todo {
    id: number;
    task: string;
    assignedTo: string;
    dueDate: string; // ISO or display string
    priority: 'high' | 'medium' | 'low';
    category: string;
    completed: boolean;
  }
  
  export interface HourlyWeather {
    time: string;
    temp: number;
    condition: string;
  }
  
  export interface DailyWeather {
    day: number;
    high: number;
    low: number;
    condition: string;
    name: string;
  }
  
  export interface WeatherData {
    temperature: number;
    condition: string;
    icon: string;
    sunrise: string;
    sunset: string;
    forecast: Array<{
      time: string;
      temperature: number;
      condition: string;
      icon: string;
    }>;
    threeHourForecast?: Array<{
      time: string;
      temperature: number;
      condition: string;
      icon: string;
    }>;
    dailyForecast: Array<{
      time: string;
      temperature: number;
      condition: string;
      icon: string;
    }>;
  }
  
  export interface Photo {
    id: string;
    url: string;
    title: string;
    date: Date;
  }