// src/services/weather.ts
import axios from 'axios';
import { WeatherData, WeatherResponse } from '@types';

const API_KEY = import.meta.env.VITE_OPENWEATHER_KEY;
const CITY = 'London';

export async function fetchWeather(): Promise<WeatherData> {
  try {
    const response = await axios.get<WeatherResponse>(
      `https://api.openweathermap.org/data/2.5/onecall?lat=51.5074&lon=-0.1278&exclude=minutely&units=metric&appid=${API_KEY}`
    );

    return {
      current: response.data.current,
      hourly: response.data.hourly,
      daily: response.data.daily,
      temperature: response.data.current.temp,
      condition: response.data.current.weather[0].main,
      forecast: response.data.daily,
      threeHourForecast: response.data.hourly,
      sunrise: new Date(response.data.current.sunrise * 1000).toISOString(),
      sunset: new Date(response.data.current.sunset * 1000).toISOString(),
      dailyForecast: response.data.daily
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    throw error;
  }
}

export function getWeatherIcon(code: number): string {
  const icons: { [key: number]: string } = {
    200: '⛈️', // thunderstorm with rain
    201: '⛈️', // thunderstorm with heavy rain
    202: '⛈️', // thunderstorm with heavy rain
    210: '🌩️', // light thunderstorm
    211: '🌩️', // thunderstorm
    212: '🌩️', // heavy thunderstorm
    221: '🌩️', // ragged thunderstorm
    230: '⛈️', // thunderstorm with light drizzle
    231: '⛈️', // thunderstorm with drizzle
    232: '⛈️', // thunderstorm with heavy drizzle
    300: '🌧️', // light intensity drizzle
    301: '🌧️', // drizzle
    302: '🌧️', // heavy intensity drizzle
    310: '🌧️', // light intensity drizzle rain
    311: '🌧️', // drizzle rain
    312: '🌧️', // heavy intensity drizzle rain
    313: '🌧️', // shower rain and drizzle
    314: '🌧️', // heavy shower rain and drizzle
    321: '🌧️', // shower drizzle
    500: '🌧️', // light rain
    501: '🌧️', // moderate rain
    502: '🌧️', // heavy intensity rain
    503: '🌧️', // very heavy rain
    504: '🌧️', // extreme rain
    511: '🌨️', // freezing rain
    520: '🌧️', // light intensity shower rain
    521: '🌧️', // shower rain
    522: '🌧️', // heavy intensity shower rain
    531: '🌧️', // ragged shower rain
    600: '🌨️', // light snow
    601: '🌨️', // snow
    602: '🌨️', // heavy snow
    611: '🌨️', // sleet
    612: '🌨️', // light shower sleet
    613: '🌨️', // shower sleet
    615: '🌨️', // light rain and snow
    616: '🌨️', // rain and snow
    620: '🌨️', // light shower snow
    621: '🌨️', // shower snow
    622: '🌨️', // heavy shower snow
    701: '🌫️', // mist
    711: '🌫️', // smoke
    721: '🌫️', // haze
    731: '🌫️', // sand/dust whirls
    741: '🌫️', // fog
    751: '🌫️', // sand
    761: '🌫️', // dust
    762: '🌫️', // volcanic ash
    771: '🌫️', // squalls
    781: '🌪️', // tornado
    800: '☀️', // clear sky
    801: '🌤️', // few clouds
    802: '⛅', // scattered clouds
    803: '☁️', // broken clouds
    804: '☁️', // overcast clouds
  };

  return icons[code] || '❓';
}