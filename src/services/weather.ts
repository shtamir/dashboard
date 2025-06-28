// src/services/weather.ts
import type { WeatherData } from '@types';

// Remove any angle brackets or quotes from the API key
const API_KEY = (import.meta.env.VITE_OPENWEATHER_KEY || '').replace(/[<>'"]/g, '');

// Helper function to get the correct OpenWeather icon URL
function getWeatherIconUrl(iconCode: string): string {
  // OpenWeather icons are available in 4 sizes: 1x, 2x, 4x
  // We'll use 2x for better quality
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

// Helper function to group forecasts by day
function groupForecastsByDay(forecasts: any[], timezoneOffset: number) {
  const dailyForecasts = new Map();
  const baseDate = new Date();
  baseDate.setHours(12, 0, 0, 0); // Set to noon for consistent comparison
  
  forecasts.forEach(item => {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + Math.floor(dailyForecasts.size));
    date.setHours(12, 0, 0, 0);
    
    const dayKey = date.toISOString().split('T')[0]; // Get YYYY-MM-DD
    
    if (!dailyForecasts.has(dayKey)) {
      dailyForecasts.set(dayKey, {
        date,
        temps: [],
        conditions: [],
        weatherIds: [] // Store weather IDs instead of icons
      });
    }
    
    const dayData = dailyForecasts.get(dayKey);
    dayData.temps.push(item.main.temp);
    dayData.conditions.push(item.weather[0].description);
    dayData.weatherIds.push(item.weather[0].id);
  });
  
  const result = Array.from(dailyForecasts.values()).map(day => {
    const weatherId = day.weatherIds[Math.floor(day.weatherIds.length / 2)];
    const icon = getWeatherIcon(weatherId);
    
    return {
      time: day.date.toISOString(),
      temperature: Math.round(Math.max(...day.temps)),
      condition: day.conditions[Math.floor(day.conditions.length / 2)],
      icon: icon
    };
  });
  
  return result;
}

export async function fetchWeatherData(location: { city: string; country: string }): Promise<WeatherData> {
  if (!API_KEY) {
    return getMockWeatherData();
  }

  try {
    // Fetch current weather
    const currentResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${location.city},${location.country}&appid=${API_KEY}&units=metric`
    );
    
    if (!currentResponse.ok) {
      console.error(`Weather API error: ${currentResponse.status} ${currentResponse.statusText}`);
      return getMockWeatherData();
    }
    
    const currentData = await currentResponse.json();

    // Fetch 5-day forecast with 3-hour intervals
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${location.city},${location.country}&appid=${API_KEY}&units=metric`
    );
    
    if (!forecastResponse.ok) {
      console.error(`Forecast API error: ${forecastResponse.status} ${forecastResponse.statusText}`);
      return getMockWeatherData();
    }
    
    const forecastData = await forecastResponse.json();

    // Get sunrise and sunset times in local timezone
    const timezoneOffset = currentData.timezone * 1000; // Convert to milliseconds
    const sunrise = new Date((currentData.sys.sunrise + timezoneOffset) * 1000).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    const sunset = new Date((currentData.sys.sunset + timezoneOffset) * 1000).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });

    // Process 3-hour forecast data
    const hourlyForecast = forecastData.list.map((item: any) => {
      const forecastTime = new Date((item.dt + timezoneOffset) * 1000);
      return {
        time: forecastTime.toISOString(),
        temperature: Math.round(item.main.temp),
        condition: item.weather[0].description,
        icon: getWeatherIcon(item.weather[0].id)
      };
    });

    // Get current time
    const now = new Date();
    const currentHour = now.getHours();

    // Find the last standard 3-hour interval
    const lastInterval = Math.floor(currentHour / 3) * 3;

    // Generate hourly data by interpolating between 3-hour intervals
    const interpolatedForecast = [];
    
    // Always add current hour first
    interpolatedForecast.push({
      time: new Date(now.getFullYear(), now.getMonth(), now.getDate(), currentHour, 0, 0).toISOString(),
      temperature: Math.round(currentData.main.temp),
      condition: currentData.weather[0].description,
      icon: getWeatherIcon(currentData.weather[0].id)
    });

    // Generate next 24 hours of forecast
    for (let i = 1; i <= 24; i++) {
      const targetHour = (currentHour + i) % 24;
      const targetDate = new Date(now);
      if (currentHour + i >= 24) {
        targetDate.setDate(targetDate.getDate() + 1);
      }
      targetDate.setHours(targetHour, 0, 0, 0);

      // Find the two closest forecast points to interpolate between
      let beforePoint = null;
      let afterPoint = null;
      let minBeforeDiff = Infinity;
      let minAfterDiff = Infinity;

      hourlyForecast.forEach(forecast => {
        const forecastTime = new Date(forecast.time);
        const timeDiff = forecastTime.getTime() - targetDate.getTime();
        
        if (timeDiff <= 0 && Math.abs(timeDiff) < minBeforeDiff) {
          minBeforeDiff = Math.abs(timeDiff);
          beforePoint = forecast;
        } else if (timeDiff > 0 && timeDiff < minAfterDiff) {
          minAfterDiff = timeDiff;
          afterPoint = forecast;
        }
      });

      // If we have both points, interpolate
      if (beforePoint && afterPoint) {
        const beforeTime = new Date(beforePoint.time).getTime();
        const afterTime = new Date(afterPoint.time).getTime();
        const targetTime = targetDate.getTime();
        const totalDiff = afterTime - beforeTime;
        const targetDiff = targetTime - beforeTime;
        const ratio = targetDiff / totalDiff;

        const interpolatedTemp = Math.round(
          beforePoint.temperature + (afterPoint.temperature - beforePoint.temperature) * ratio
        );

        interpolatedForecast.push({
          time: targetDate.toISOString(),
          temperature: interpolatedTemp,
          condition: beforePoint.condition,
          icon: beforePoint.icon
        });
      } else if (beforePoint) {
        // If we only have a before point, use its values
        interpolatedForecast.push({
          time: targetDate.toISOString(),
          temperature: beforePoint.temperature,
          condition: beforePoint.condition,
          icon: beforePoint.icon
        });
      } else if (afterPoint) {
        // If we only have an after point, use its values
        interpolatedForecast.push({
          time: targetDate.toISOString(),
          temperature: afterPoint.temperature,
          condition: afterPoint.condition,
          icon: afterPoint.icon
        });
      }
    }

    // Filter the forecast to only include standard 3-hour intervals
    const threeHourForecast = interpolatedForecast.filter(forecast => {
      const hour = new Date(forecast.time).getHours();
      return hour % 3 === 0;
    });

      time: new Date(f.time).toLocaleTimeString(),
      temp: f.temperature
    })));

    // Process daily forecast data
    const dailyForecast = groupForecastsByDay(forecastData.list, timezoneOffset);

    return {
      temperature: Math.round(currentData.main.temp),
      condition: currentData.weather[0].description,
      icon: getWeatherIcon(currentData.weather[0].id),
      sunrise,
      sunset,
      forecast: interpolatedForecast,
      threeHourForecast,
      dailyForecast
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return getMockWeatherData();
  }
}

// Helper function to get mock weather data
function getMockWeatherData(): WeatherData {
  const today = new Date();
  const currentHour = today.getHours();
  today.setHours(currentHour, 0, 0, 0); // Set to current hour
  
  
  // Generate 24 hours of forecast data starting from current hour
  const forecast = Array.from({ length: 24 }, (_, i) => {
    const forecastTime = new Date(today);
    forecastTime.setHours(currentHour + i);
    return {
      time: forecastTime.toISOString(),
      temperature: 22 + Math.floor(Math.random() * 5) - 2,
      condition: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Rain'][Math.floor(Math.random() * 5)],
      icon: ['☀️', '⛅', '☁️', '🌧️', '🌧️'][Math.floor(Math.random() * 5)]
    };
  });
  
  return {
    temperature: 22,
    condition: 'Sunny',
    icon: '☀️',
    sunrise: '6:30 AM',
    sunset: '7:45 PM',
    forecast: forecast,
    dailyForecast: Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      date.setHours(12, 0, 0, 0);
      return {
        time: date.toISOString(),
        temperature: 24 - i,
        condition: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Rain', 'Cloudy', 'Sunny'][i],
        icon: ['☀️', '⛅', '☁️', '🌧️', '🌧️', '☁️', '☀️'][i]
      };
    })
  };
}

// Helper function to convert OpenWeather condition codes to emoji icons
function getWeatherIcon(code: number): string {
  
  // Handle string codes (just in case)
  if (typeof code === 'string') {
    code = parseInt(code);
  }
  
  if (isNaN(code)) {
    console.error('Invalid weather code:', code);
    return '❓';
  }
  
  if (code >= 200 && code < 300) return '⛈️';  // Thunderstorm
  if (code >= 300 && code < 400) return '🌧️';  // Drizzle
  if (code >= 500 && code < 600) return '🌧️';  // Rain
  if (code >= 600 && code < 700) return '❄️';  // Snow
  if (code >= 700 && code < 800) return '🌫️';  // Atmosphere (fog, mist)
  if (code === 800) return '☀️';               // Clear sky
  if (code === 801) return '🌤️';              // Few clouds
  if (code >= 802 && code < 900) return '☁️';  // Cloudy
  return '❓';                                  // Unknown
}