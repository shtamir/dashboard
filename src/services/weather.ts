// src/services/weather.ts
import axios from 'axios';
import { WeatherData, WeatherResponse } from '@types';

const API_KEY = import.meta.env.VITE_OPENWEATHER_KEY;
const CITY = 'Tel Aviv';
const COUNTRY = 'IL';

export async function fetchWeather(): Promise<WeatherData> {
  try {
    const response = await axios.get<WeatherResponse>(
      `https://api.openweathermap.org/data/2.5/onecall?lat=32.0853&lon=34.7818&exclude=minutely&units=metric&appid=${API_KEY}`
    );

    return {
      current: {
        temp: response.data.current.temp,
        feels_like: response.data.current.feels_like,
        humidity: response.data.current.humidity,
        wind_speed: response.data.current.wind_speed,
        weather: response.data.current.weather
      },
      hourly: response.data.hourly.map((hour: WeatherResponse['hourly'][0]) => ({
        dt: hour.dt,
        temp: hour.temp,
        weather: hour.weather
      })),
      daily: response.data.daily.map((day: WeatherResponse['daily'][0]) => ({
        dt: day.dt,
        temp: {
          min: day.temp.min,
          max: day.temp.max
        },
        weather: day.weather
      }))
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    throw error;
  }
}

export function getWeatherIcon(code: string): string {
  const icons: { [key: string]: string } = {
    '01d': '☀️',
    '01n': '🌙',
    '02d': '⛅',
    '02n': '☁️',
    '03d': '☁️',
    '03n': '☁️',
    '04d': '☁️',
    '04n': '☁️',
    '09d': '🌧️',
    '09n': '🌧️',
    '10d': '🌦️',
    '10n': '🌧️',
    '11d': '⛈️',
    '11n': '⛈️',
    '13d': '🌨️',
    '13n': '🌨️',
    '50d': '🌫️',
    '50n': '🌫️'
  };
  return icons[code] || '❓';
}