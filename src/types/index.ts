export interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
  sunrise: string;
  sunset: string;
  forecast: ForecastItem[];
  threeHourForecast: ForecastItem[];
  dailyForecast: ForecastItem[];
}

export interface ForecastItem {
  time: string;
  temperature: number;
  condition: string;
  icon: string;
} 