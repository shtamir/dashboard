// src/services/weather.ts
import axios from 'axios';
import { WeatherData } from '../types';

const API_KEY = import.meta.env.VITE_OPENWEATHER_KEY;
const CITY = 'Tel Aviv';
const COUNTRY = 'IL';

export const fetchWeather = async (): Promise<WeatherData> => {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?q=${CITY},${COUNTRY}&appid=${API_KEY}&units=metric`
    );

    const current = response.data.list[0];
    const hourly = response.data.list.slice(0, 8);
    const daily = response.data.list.filter((item: any, index: number) => index % 8 === 0).slice(0, 5);

    return {
      current: {
        temperature: Math.round(current.main.temp),
        condition: current.weather[0].main,
        icon: getWeatherIcon(current.weather[0].id),
        sunrise: new Date(response.data.city.sunrise * 1000).toLocaleTimeString(),
        sunset: new Date(response.data.city.sunset * 1000).toLocaleTimeString()
      },
      hourly: hourly.map((item: any) => ({
        time: new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        temperature: Math.round(item.main.temp),
        condition: item.weather[0].main,
        icon: getWeatherIcon(item.weather[0].id)
      })),
      daily: daily.map((item: any) => ({
        time: new Date(item.dt * 1000).toLocaleDateString([], { weekday: 'short' }),
        temperature: {
          min: Math.round(item.main.temp_min),
          max: Math.round(item.main.temp_max)
        },
        condition: item.weather[0].main,
        icon: getWeatherIcon(item.weather[0].id)
      }))
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    throw error;
  }
};

const getWeatherIcon = (code: number): string => {
  if (code >= 200 && code < 300) return '⛈️'; // Thunderstorm
  if (code >= 300 && code < 400) return '🌧️'; // Drizzle
  if (code >= 500 && code < 600) return '🌧️'; // Rain
  if (code >= 600 && code < 700) return '❄️'; // Snow
  if (code >= 700 && code < 800) return '🌫️'; // Atmosphere
  if (code === 800) return '☀️'; // Clear
  if (code > 800) return '☁️'; // Clouds
  return '❓'; // Unknown
};