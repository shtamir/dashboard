// src/services/weather.ts
import axios from 'axios';
import { WeatherData, WeatherResponse } from '../types';

const API_KEY = import.meta.env.VITE_OPENWEATHER_KEY;
const CITY = 'Tel Aviv';
const COUNTRY = 'IL';

export const fetchWeather = async (): Promise<WeatherData> => {
  try {
    const response = await axios.get<WeatherResponse>(
      `https://api.openweathermap.org/data/2.5/forecast?q=${CITY},${COUNTRY}&appid=${API_KEY}&units=metric`
    );

    const current = {
      temp: Math.round(response.data.list[0].main.temp),
      condition: response.data.list[0].weather[0].main,
      icon: getWeatherIcon(response.data.list[0].weather[0].id)
    };

    const hourly = response.data.list.slice(0, 8).map((item) => ({
      time: new Date(item.dt * 1000).toLocaleTimeString('en-US', { hour: 'numeric' }),
      temp: Math.round(item.main.temp),
      condition: item.weather[0].main,
      icon: getWeatherIcon(item.weather[0].id)
    }));

    const daily = response.data.list
      .filter((_, index) => index % 8 === 0)
      .slice(0, 5)
      .map((item) => ({
        date: new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
        temp: Math.round(item.main.temp),
        condition: item.weather[0].main,
        icon: getWeatherIcon(item.weather[0].id)
      }));

    return { current, hourly, daily };
  } catch (error) {
    console.error('Error fetching weather:', error);
    throw error;
  }
};

const getWeatherIcon = (code: number): string => {
  if (code >= 200 && code < 300) return '⛈️';
  if (code >= 300 && code < 400) return '🌧️';
  if (code >= 500 && code < 600) return '🌧️';
  if (code >= 600 && code < 700) return '❄️';
  if (code >= 700 && code < 800) return '🌫️';
  if (code === 800) return '☀️';
  if (code > 800) return '☁️';
  return '🌈';
};