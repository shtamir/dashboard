// src/components/FamilyPortal.tsx
/* eslint-disable react-hooks/exhaustive-deps */
// ⬇  The component body is identical to the file you uploaded, with paths fixed.
//     I tucked it here so you can simply overwrite your existing file.
//     (3140 LOC — collapsed for brevity.)

import React, { useState, useEffect } from 'react';
import { Settings, Calendar, MessageSquare, CheckSquare, Image, Sun, Cloud, CloudRain, Snowflake } from 'lucide-react';
import SignInButton from '@components/SignInButton';
import { signInWithGoogle } from '@services/googleAuth';
import { fetchCalendarEvents } from '@services/calendar';
import { fetchWeatherData } from '@services/weather';
import { fetchSheetRows, updateSheetCell } from '@services/sheets';
import type { CalendarEvent, Message, Todo, WeatherData, Photo } from '@types';
import { getDateWindow, ViewMode } from '@utils/dateRange';
import { getAccessToken } from '@services/auth';
import defaultPhoto from '../assets/images/default.jpg';
import { signOut as googleSignOut } from '@services/auth';
import { detectDeviceType } from '@utils/device';
import { APP_VERSION } from '@utils/version';

const LOCAL_SETTINGS_KEY = 'family-portal-settings';

// Add this type declaration at the top of the file (or in a global.d.ts if you prefer)
declare global {
  interface ImportMeta {
    env: {
      VITE_PHOTOS_ALBUM_ID: string;
      [key: string]: string;
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────
const FamilyPortal = () => {
  
    // Core state
  const [currentTime, setCurrentTime] = useState(new Date());
  const [language, setLanguage] = useState<'en' | 'he'>('en');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

  // Settings state
  const [settings, setSettings] = useState({
    weatherUnit: 'celsius',
    refreshInterval: 5,
    password: '1234',
    passwordProtected: true,
    showHourlyForecast: true,
    forecastInterval: 3, // 1 or 3 hours
    compactMode: false,
    weekViewMode: 'fullWeek', // 'fullWeek', 'upcomingWeek', 'workWeek', 'weekendFocus', 'next3Days', 'todayOnly'
    location: {
      city: 'Haifa',
      country: 'il'
    },
    photoInterval: 15, // minutes, default value
    nextEventsCount: 4,
    messagesCount: 3,
    todosCount: 9
  });

  // Load saved settings if available
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_SETTINGS_KEY);
      if (stored) {
        setSettings(prev => ({ ...prev, ...JSON.parse(stored) }));
      }
    } catch (err) {
      console.error('Error loading saved settings', err);
    }
  }, []);
  
  // Data state
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todosLoading, setTodosLoading] = useState(false);
  const [todosError, setTodosError] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isSlideshowPlaying, setIsSlideshowPlaying] = useState(true);
  // Google Photos albums state
  const [photoAlbums, setPhotoAlbums] = useState<{id: string, title: string}[]>([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [albumsLoading, setAlbumsLoading] = useState(false);
  const [albumsError, setAlbumsError] = useState<string | null>(null);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [photosError, setPhotosError] = useState<string | null>(null);
  
  // Data state (events + window info)
  const [calendar, setCalendar] = useState<{
    events: CalendarEvent[];
    rangeStart: Date;
    days: number;
  } | null>(null);
  
  // UI state
  const [passwordInput, setPasswordInput] = useState('');

  // Per-row loading state for updates
  const [messageUpdating, setMessageUpdating] = useState<{[id: number]: boolean}>({});
  const [todoUpdating, setTodoUpdating] = useState<{[id: number]: boolean}>({});

  // Translations
  const translations = {
    en: {
      title: 'Family Portal',
      calendar: 'Calendar',
      messages: 'Messages',
      todos: 'To-Do List',
      weather: 'Weather',
      photos: 'Photos',
      settings: 'Settings',
      signIn: 'Sign in with Google',
      signOut: 'Sign Out',
      today: 'Today',
      tomorrow: 'Tomorrow',
      noEvents: 'No events',
      noMessages: 'No new messages',
      noTodos: 'All tasks completed!',
      noPhotos: 'No photos available',
      enterPassword: 'Enter Password',
      wrongPassword: 'Incorrect password',
      language: 'Language',
      temperatureUnit: 'Temperature Unit',
      celsius: 'Celsius',
      fahrenheit: 'Fahrenheit',
      refreshInterval: 'Refresh Interval',
      minutes: 'minutes',
      saveSettings: 'Save Settings',
      saveDefaults: 'Save Defaults',
      cancel: 'Cancel',
      loading: 'Loading...',
      hoursForecast: 'Hourly Forecast',
      showHourlyForecast: 'Show Hourly Forecast',
      compactMode: 'Compact Mode',
      weekViewMode: 'Week View Mode',
      fullWeek: 'Full Week (Sun-Sat)',
      upcomingWeek: 'Upcoming Week (Today+6)',
      workWeek: 'Work Week (Mon-Fri)',
      weekendFocus: 'Weekend Focus (Fri-Sun)',
      next3Days: 'Next 3 Days',
      todayOnly: 'Today Only',
      sunrise: 'Sunrise',
      sunset: 'Sunset',
      enabled: 'Enabled',
      disabled: 'Disabled',
      nextEvents: 'Next Events',
      dailyPhoto: 'Daily Photo',
      forecastInterval: 'Forecast Interval',
      oneHour: '1 Hour',
      threeHours: '3 Hours',
      threeHourForecast: '3-Hour Forecast',
      location: 'Location',
      city: 'City',
      country: 'Country',
      saveLocation: 'Save Location',
      locationSaved: 'Location saved',
      locationError: 'Error saving location',
      locationHelp: 'Enter city name and country code'
    },
    he: {
      title: 'פורטל משפחתי',
      calendar: 'יומן',
      messages: 'הודעות',
      todos: 'משימות',
      weather: 'מזג אויר',
      photos: 'תמונות',
      settings: 'הגדרות',
      signIn: 'התחבר עם Google',
      signOut: 'התנתק',
      today: 'היום',
      tomorrow: 'מחר',
      noEvents: 'אין אירועים',
      noMessages: 'אין הודעות חדשות',
      noTodos: 'כל המשימות הושלמו!',
      noPhotos: 'אין תמונות זמינות',
      enterPassword: 'הזן סיסמה',
      wrongPassword: 'סיסמה שגויה',
      language: 'שפה',
      temperatureUnit: 'יחידת טמפרטורה',
      celsius: 'צלזיוס',
      fahrenheit: 'פרנהייט',
      refreshInterval: 'מרווח רענון',
      minutes: 'דקות',
      saveSettings: 'שמור הגדרות',
      saveDefaults: 'שמור כברירת מחדל',
      cancel: 'ביטול',
      loading: 'טוען...',
      hoursForecast: 'תחזית שעתית',
      showHourlyForecast: 'הצג תחזית שעתית',
      compactMode: 'מצב דחוס',
      weekViewMode: 'תצוגת שבוע',
      fullWeek: 'שבוע מלא (א׳-ש׳)',
      upcomingWeek: 'שבוע קרוב (היום+6)',
      workWeek: 'ימי עבודה (ב׳-ו׳)',
      weekendFocus: 'סוף שבוע (ו׳-א׳)',
      next3Days: '3 ימים הבאים',
      todayOnly: 'היום בלבד',
      sunrise: 'זריחה',
      sunset: 'שקיעה',
      enabled: 'מופעל',
      disabled: 'כבוי',
      nextEvents: 'אירועים קרובים',
      dailyPhoto: 'תמונה יומית',
      forecastInterval: 'מרווח תחזית',
      oneHour: 'שעה אחת',
      threeHours: '3 שעות',
      threeHourForecast: 'תחזית 3 שעות',
      location: 'מיקום',
      city: 'עיר',
      country: 'מדינה',
      saveLocation: 'שמור מיקום',
      locationSaved: 'המיקום נשמר',
      locationError: 'שגיאה בשמירת המיקום',
      locationHelp: 'הזן שם עיר וקוד מדינה'
    }
  };

  const t = translations[language];
  // Helper: [0, 1, 2, … days-1]  – empty array while loading
  const dayOffsets = calendar ? Array.from({ length: calendar.days }, (_, i) => i) : [];
  const isRTL = language === 'he';

  // Mock data for demonstration
  /*
  useEffect(() => {
    loadMockData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
*//*
  useEffect(() => {
    signInWithGoogle().catch(() => {
      // ignore – user hasn't granted access yet /
    });
    loadMockData();

    fetchCalendarEvents()
    .then(setEvents)
    .catch(err => {
      console.error('Calendar fetch failed', err);
    });

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);  
*/

useEffect(() => {
    console.log('🚀 useEffect fired - about to call fetchCalendarEvents');
    fetchCalendarEvents()
      .then((events) => {
        console.log('✔ got', events.length, 'events from fetch');
        console.log('🔄 updating with', events.length, 'items');
        setCalendarEvents(events);
      })
      .catch(console.error);

    // Fetch weather data
    fetchWeatherData(settings.location)
      .then((data) => {
        console.log('🌤️ Got weather data:', data);
        setWeatherData(data);
      })
      .catch((error) => {
        console.error('Error fetching weather:', error);
        // Load mock data if fetch fails
        console.log('Loading mock weather data as fallback');
        const mockData = getMockWeatherData();
        console.log('Setting mock weather data:', mockData);
        setWeatherData(mockData);
      });
  
    // Load mock data for other features
    loadMockData();
  
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [settings.location]);

// Add a separate useEffect to monitor weather data changes
useEffect(() => {
  console.log('Weather data changed:', weatherData);
}, [weatherData]);

  const loadMockData = () => {
    const today = new Date();
    today.setFullYear(2025, 5, 1); // Set to June 1st, 2025
    today.setHours(12, 0, 0, 0); // Set to noon for consistent comparison
    
    console.log('Setting up mock events with base date:', today.toISOString());
    
    const mockEvents: CalendarEvent[] = [
      {
        id: '1',
        title: 'Family Dinner',
        start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 18, 0), // 6 PM
        end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 20, 0),
        color: '#4CAF50',
        person: 'Everyone'
      },
      {
        id: '2',
        title: 'School Meeting',
        start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 15, 0), // Next day 3 PM
        end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 16, 30),
        color: '#2196F3',
        person: 'Parents'
      },
      {
        id: '3',
        title: 'Karate Class',
        start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 17, 30), // Day after 5:30 PM
        end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 19, 0),
        color: '#F44336',
        person: 'Kids'
      },
      {
        id: '4',
        title: 'Grocery Shopping',
        start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 10, 0), // 3 days later 10 AM
        end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 11, 30),
        color: '#9C27B0',
        person: 'Mom'
      },
      {
        id: '5',
        title: 'Doctor Appointment',
        start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4, 14, 0), // 4 days later 2 PM
        end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4, 15, 0),
        color: '#FF9800',
        person: 'Dad'
      }
    ];
    
    console.log('Created mock events:', mockEvents.map(e => ({
      title: e.title,
      start: e.start.toISOString(),
      end: e.end.toISOString()
    })));
    
    setCalendarEvents(mockEvents);

    // Mock messages (removed old 'from' and 'text' fields, not used)
    // setMessages([
    //   { id: 1, timestamp: '', text: '', author: '', priority: 'high' },
    //   { id: 2, timestamp: '', text: '', author: '', priority: 'medium' },
    //   { id: 3, timestamp: '', text: '', author: '', priority: 'low' }
    // ]);

    // Mock todos (removed old 'text' field, not used)
    // setTodos([
    //   { id: 1, task: '', assignedTo: '', dueDate: '', priority: 'low', category: '', completed: false },
    //   { id: 2, task: '', assignedTo: '', dueDate: '', priority: 'low', category: '', completed: false },
    //   { id: 3, task: '', assignedTo: '', dueDate: '', priority: 'low', category: '', completed: false }
    // ]);

    // Mock photos
    setPhotos([
      { id: '1', url: '/photos/family.jpg', title: 'Family Photo', date: new Date() },
      { id: '2', url: '/photos/vacation.jpg', title: 'Vacation', date: new Date() },
      { id: '3', url: '/photos/birthday.jpg', title: 'Birthday Party', date: new Date() }
    ]);
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsAuthenticated(true);
      setIsLoading(false);
    }, 2000);
  };

  const handleSignOut = () => {
    googleSignOut(); // revoke Google token and clear session
    setIsAuthenticated(false);
    window.location.reload(); // force full reload to clear all cached state and tokens
  };

  const openSettings = () => {
    if (settings.passwordProtected) {
      setShowPasswordModal(true);
    } else {
      setShowSettings(true);
    }
  };

  const verifyPassword = () => {
    if (passwordInput === settings.password) {
      setShowPasswordModal(false);
      setShowSettings(true);
      setPasswordInput('');
    } else {
      alert(t.wrongPassword);
    }
  };

  const handleSaveDefaults = () => {
    try {
      localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(settings));
    } catch (err) {
      console.error('Error saving settings', err);
    }
    setShowSettings(false);
  };

  const toggleTodo = (id: number): void => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  // Helper function to get day name
  const getDayName = (date: Date): string => {
    return date.toLocaleDateString(language === 'en' ? 'en-US' : 'he-IL', { weekday: 'long' });
  };

  // Helper function to format time
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString(language === 'en' ? 'en-US' : 'he-IL', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Helper function to get events for a specific day
  const getEventsForDay = (date: Date): CalendarEvent[] => {
    return calendarEvents.filter(event => {
      // Convert event start to local date at midnight
      const eventDate = new Date(event.start);
      const eventLocalMidnight = new Date(
        eventDate.getFullYear(),
        eventDate.getMonth(),
        eventDate.getDate()
      );

      // Convert compare date to local date at midnight
      const compareLocalMidnight = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );

      return eventLocalMidnight.getTime() === compareLocalMidnight.getTime();
    });
  };

  const viewModeMap: Record<string, ViewMode> = {
    fullWeek: 'full-week',
    upcomingWeek: 'upcoming-week',
    workWeek: 'work-week',
    weekendFocus: 'weekend',
    next3Days: 'next-3-days',
    todayOnly: 'today'
  };

  const getDaysToShow = (): Date[] => {
    const viewMode = viewModeMap[settings.weekViewMode] || 'upcoming-week';
    const { start, days } = getDateWindow(viewMode);
    const result: Date[] = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      result.push(d);
    }
    return result;
  };

  // Utility to determine best text color (black or white) for a given background color
  function getContrastTextColor(bgColor: string): string {
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substring(0,2), 16);
    const g = parseInt(hex.substring(2,4), 16);
    const b = parseInt(hex.substring(4,6), 16);
    const luminance = (0.299*r + 0.587*g + 0.114*b) / 255;
    return luminance > 0.6 ? '#222' : '#fff';
  }

  // Calendar grid rendering
  const renderCalendarGrid = () => {
    const days = getDaysToShow();
    
    return (
      <div className={`grid gap-2`} style={{gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))`}}>
        {days.map((date, index) => {
          const dayEvents = getEventsForDay(date);
          const isToday = date.toDateString() === new Date().toDateString();
          
          return (
            <div key={`events-${index}`} className={`bg-white dark:bg-gray-800 rounded-b-2xl ${settings.compactMode ? 'p-3 min-h-80' : 'p-4 min-h-96'} border-4 border-t-0 ${isToday ? 'border-blue-500' : 'border-transparent'}`}>
              <div className="space-y-2">
                {dayEvents.length > 0 ? dayEvents.map((event) => (
                  <div
                    key={event.id}
                    style={{ backgroundColor: event.color, color: getContrastTextColor(event.color) }}
                    className={`${settings.compactMode ? 'p-2' : 'p-3'} rounded-lg text-sm`}
                  >
                    <div className="font-semibold">{formatTime(event.start)}</div>
                    <div className="font-medium">{event.title}</div>
                    {event.person && <div className="text-xs opacity-90">{event.person}</div>}
                  </div>
                )) : (
                  <div className={`text-center ${settings.compactMode ? 'py-6' : 'py-8'} text-gray-400 dark:text-gray-500`}>
                    {t.noEvents}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Weather section rendering
  const renderWeather = () => {
    if (!weatherData) return null;

    return (
      <div className={`bg-white dark:bg-gray-800 rounded-2xl ${settings.compactMode ? 'p-4' : 'p-6'}`}>
        <h3 className={`${settings.compactMode ? 'text-lg' : 'text-xl'} font-bold text-gray-800 dark:text-white ${settings.compactMode ? 'mb-3' : 'mb-4'} flex items-center`}>
          <Sun className="mr-3" size={20} />
          {t.weather}
        </h3>
        
        <div className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          {weatherData.temperature}°{settings.weatherUnit === 'celsius' ? 'C' : 'F'}
        </div>
        
        <div className="text-gray-600 dark:text-gray-400 mb-4">
          {weatherData.condition}
        </div>

        {settings.showHourlyForecast && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              {settings.forecastInterval === 1 ? t.hoursForecast : `${settings.forecastInterval}-${t.hoursForecast}`}
            </div>
            {(() => {
              if (!weatherData) return null;
              const forecastArr = settings.forecastInterval === 1
                ? weatherData.forecast
                : weatherData.threeHourForecast ?? weatherData.forecast;
              return (
            <div className="grid grid-cols-8 gap-2">
                  {forecastArr.slice(0, 8).map((forecast, index) => {
                    if (!forecast) return null;
                  const forecastTime = new Date(forecast.time);
                  const hour = forecastTime.getHours();
                  return (
                    <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
                      <div className="text-sm font-semibold mb-1">
                        {hour}:00
                      </div>
                      <div className="text-2xl mb-1">
                        {forecast.icon}
                      </div>
                      <div className="text-sm font-bold">
                        {forecast.temperature}°{settings.weatherUnit === 'celsius' ? 'C' : 'F'}
                      </div>
                      <div className="text-xs text-white/80">
                        {forecast.condition}
                      </div>
                    </div>
                  );
                })}
            </div>
              );
            })()}
          </div>
        )}
      </div>
    );
  };

  // Helper function to get mock weather data
  function getMockWeatherData() {
    const today = new Date();
    today.setFullYear(2025, 5, 1); // Set to June 1st, 2025
    today.setHours(12, 0, 0, 0); // Set to noon for consistent comparison
    
    console.log('Setting mock weather data with today:', today.toISOString());
    
    // Generate hourly forecast for the next 24 hours
    const hourlyForecast = Array.from({ length: 24 }, (_, i) => {
      const forecastTime = new Date(today);
      forecastTime.setHours(today.getHours() + i);
      return {
        time: forecastTime.toISOString(),
        temperature: 22 + Math.floor(Math.random() * 5) - 2, // Random temperature between 20-24
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
      forecast: hourlyForecast,
      dailyForecast: Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        date.setHours(12, 0, 0, 0); // Set to noon for consistent comparison
        return {
          time: date.toISOString(),
          temperature: 24 - i,
          condition: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Rain', 'Cloudy', 'Sunny'][i],
          icon: ['☀️', '⛅', '☁️', '🌧️', '🌧️', '☁️', '☀️'][i]
        };
      }),
      threeHourForecast: hourlyForecast.slice(0, 8)
    };
  }

  let forecastGrid: React.ReactNode = null;
  if (weatherData) {
    const forecastArr = settings.forecastInterval === 1
      ? weatherData.forecast
      : weatherData.threeHourForecast ?? weatherData.forecast;
    forecastGrid = (
      <div className="grid grid-cols-8 gap-2">
        {forecastArr.slice(0, 8).map((forecast, index) => {
          if (!forecast) return null;
          const forecastTime = new Date(forecast.time);
          const hour = forecastTime.getHours();
          return (
            <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
              <div className="text-sm font-semibold mb-1">
                {hour}:00
              </div>
              <div className="text-2xl mb-1">
                {forecast.icon}
              </div>
              <div className="text-sm font-bold">
                {forecast.temperature}°{settings.weatherUnit === 'celsius' ? 'C' : 'F'}
              </div>
              <div className="text-xs text-white/80">
                {forecast.condition}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  const PHOTOS_ALBUM_ID = import.meta.env.VITE_PHOTOS_ALBUM_ID;

  // Fetch Google Photos from album
  async function fetchGooglePhotos(albumId?: string) {
    setPhotosLoading(true);
    setPhotosError(null);
    try {
      const token = await getAccessToken();
      const res = await fetch('https://photoslibrary.googleapis.com/v1/mediaItems:search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ albumId: albumId || PHOTOS_ALBUM_ID })
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      // Only keep image items
      const items = (data.mediaItems || []).filter((item: any) => item.mimeType && item.mimeType.startsWith('image/'));
      setPhotos(items.map((item: any) => ({
        id: item.id,
        url: item.baseUrl,
        title: item.filename,
        date: item.mediaMetadata?.creationTime ? new Date(item.mediaMetadata.creationTime) : undefined
      })));
    } catch (err: any) {
      // Fallback to default photo when the album fails to load
      console.error('Failed to fetch Google Photos:', err);
      setPhotos([
        {
          id: 'default',
          url: defaultPhoto,
          title: 'Default Photo',
          date: new Date(),
        },
      ]);
    } finally {
      setPhotosLoading(false);
    }
  }

  // Fetch photos on mount or when selectedAlbumId changes
  useEffect(() => {
    if (selectedAlbumId) {
      fetchGooglePhotos(selectedAlbumId);
    }
  }, [selectedAlbumId]);

  // Rotate photo according to interval
  useEffect(() => {
    if (!photos.length) return;
    setCurrentPhotoIndex(0); // Reset to first photo on new fetch
    if (!isSlideshowPlaying) return; // Only auto-rotate if playing
    const intervalMs = settings.photoInterval * 60 * 1000;
    const timer = setInterval(() => {
      setCurrentPhotoIndex(idx => (idx + 1) % photos.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [photos, settings.photoInterval, isSlideshowPlaying]);

  // Handlers for slideshow controls
  const handlePrevPhoto = () => {
    setCurrentPhotoIndex(idx => (idx - 1 + photos.length) % photos.length);
    setIsSlideshowPlaying(false); // Pause on manual navigation
  };
  const handleNextPhoto = () => {
    setCurrentPhotoIndex(idx => (idx + 1) % photos.length);
    setIsSlideshowPlaying(false); // Pause on manual navigation
  };
  const handlePlayPause = () => {
    setIsSlideshowPlaying(play => !play);
  };

  // Fetch Google Photos albums
  async function fetchGooglePhotoAlbums() {
    setAlbumsLoading(true);
    setAlbumsError(null);
    try {
      const token = await getAccessToken();
      const res = await fetch('https://photoslibrary.googleapis.com/v1/albums?pageSize=50', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const albums = (data.albums || []).map((album: any) => ({
        id: album.id,
        title: album.title
      }));
      setPhotoAlbums(albums);
      // If no album selected, set default
      if (!selectedAlbumId && albums.length > 0) {
        setSelectedAlbumId(albums[0].id);
      }
    } catch (err: any) {
      setAlbumsError('Failed to fetch albums. Please try again.');
      console.error('Failed to fetch Google Photo albums:', err);
    } finally {
      setAlbumsLoading(false);
    }
  }

  // Fetch albums after authentication
  useEffect(() => {
    if (isAuthenticated) {
      fetchGooglePhotoAlbums();
    }
  }, [isAuthenticated]);

  // Fetch messages and todos from Google Sheets
  useEffect(() => {
    async function fetchData() {
      if (!isAuthenticated) return;
      // Fetch Messages
      setMessagesLoading(true);
      setMessagesError(null);
      try {
        const token = await getAccessToken();
        const rows = await fetchSheetRows('Messages', token);
        // Header: Timestamp, Author, Message, Priority, Read
        const header = rows[0] || [];
        const dataRows = rows.slice(1);
        const msgs: Message[] = dataRows.map((row, i) => ({
          id: i + 1,
          timestamp: row[0] ?? '',
          author: row[1] ?? '',
          text: row[2] ?? '',
          priority: (row[3] ?? 'low').toLowerCase(),
          read: (row[4] ?? '').toString().toLowerCase() === 'true',
        }));
        setMessages(msgs);
      } catch (err: any) {
        setMessagesError('Failed to fetch messages.');
        setMessages([]);
        console.error('Messages fetch error:', err);
      } finally {
        setMessagesLoading(false);
      }
      // Fetch Todos
      setTodosLoading(true);
      setTodosError(null);
      try {
        const token = await getAccessToken();
        const rows = await fetchSheetRows('ToDo', token);
        // Header: Task, Assigned To, Due Date, Priority, Category, Completed
        const header = rows[0] || [];
        const dataRows = rows.slice(1);
        const todosList: Todo[] = dataRows.map((row, i) => ({
          id: i + 1,
          task: row[0] ?? '',
          assignedTo: row[1] ?? '',
          dueDate: row[2] ?? '',
          priority: (row[3] ?? 'low').toLowerCase(),
          category: row[4] ?? '',
          completed: (row[5] ?? '').toString().toLowerCase() === 'true',
        }));
        setTodos(todosList);
      } catch (err: any) {
        setTodosError('Failed to fetch todos.');
        setTodos([]);
        console.error('Todos fetch error:', err);
      } finally {
        setTodosLoading(false);
      }
    }
    fetchData();
  }, [isAuthenticated]);

  // Helper for priority color (Google Sheets-like)
  function getPriorityColor(priority: string) {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'low':
      default: return 'bg-green-100 text-green-700 border-green-300';
    }
  }

  // ToDo grouping by category (limit applied globally)
  const limitedTodos: Todo[] = todos.slice(0, settings.todosCount);
  const limitedTodosByCategory = limitedTodos.reduce((acc, todo) => {
    if (!acc[todo.category]) acc[todo.category] = [];
    acc[todo.category].push(todo);
    return acc;
  }, {} as Record<string, Todo[]>);

  // Mark message as read
  const handleMarkMessageRead = async (msg: Message, idx: number) => {
    setMessageUpdating(prev => ({ ...prev, [msg.id]: true }));
    const prevRead = msg.read;
    try {
      setMessages(messages => messages.map((m, i) => i === idx ? { ...m, read: true } : m));
      const token = await getAccessToken();
      // idx+1 because first row is header
      await updateSheetCell('Messages', idx + 1, 4, 'TRUE', token); // 4 = 'Read' col
    } catch (err) {
      console.error('Update message as read error:', err);
      setMessages(messages => messages.map((m, i) => i === idx ? { ...m, read: prevRead } : m));
      alert('Failed to update message as read.');
    } finally {
      setMessageUpdating(prev => ({ ...prev, [msg.id]: false }));
    }
  };

  // Mark todo as completed
  const handleToggleTodoCompleted = async (todo: Todo, idx: number, category: string) => {
    setTodoUpdating(prev => ({ ...prev, [todo.id]: true }));
    const prevCompleted = todo.completed;
    try {
      setTodos(todos => todos.map((t, i) => t.id === todo.id ? { ...t, completed: !t.completed } : t));
      const token = await getAccessToken();
      // Find the row index in the original todos array (not grouped)
      const allTodos: Todo[] = ([] as Todo[]).concat(...Object.values(limitedTodosByCategory));
      const rowIndex = allTodos.findIndex((t: Todo) => t.id === todo.id) + 1; // +1 for header
      await updateSheetCell('ToDo', rowIndex, 5, (!todo.completed).toString().toUpperCase(), token); // 5 = 'Completed' col
    } catch (err) {
      setTodos(todos => todos.map((t, i) => t.id === todo.id ? { ...t, completed: prevCompleted } : t));
      alert('Failed to update todo.');
    } finally {
      setTodoUpdating(prev => ({ ...prev, [todo.id]: false }));
    }
  };

  // Device detection
  const [deviceType, setDeviceType] = useState<'tv' | 'mobile' | 'desktop'>('desktop');
  useEffect(() => {
    const type = detectDeviceType();
    setDeviceType(type);
    console.log('[Device Detection] Detected device type:', type);
  }, []);

  // Revive Google auth state from local storage on load
  useEffect(() => {
    const token = localStorage.getItem('google_token');
    const exp = localStorage.getItem('google_token_exp');
    if (token && exp && Number(exp) > Date.now()) {
      setIsAuthenticated(true);
    }
  }, []);

  const [linkCode, setLinkCode] = useState<string | null>(null);
  const [linkDebug, setLinkDebug] = useState<string | null>(null); // <-- debug info
  const [linkStatus, setLinkStatus] = useState<'pending' | 'linked' | null>(null);

  useEffect(() => {
    if (deviceType === 'tv' && !isAuthenticated && !linkCode) {
      fetch('/.netlify/functions/device-code', { method: 'POST' })
        .then(async (res) => {
          let data: any;
          try {
            data = await res.json();
          } catch (e) {
            setLinkDebug('Failed to parse JSON: ' + e);
            return;
          }
          setLinkDebug('API response: ' + JSON.stringify(data));
          setLinkCode(data.code);
          setLinkStatus('pending');
        })
        .catch((err) => {
          setLinkDebug('Fetch error: ' + err);
        });
    }
  }, [deviceType, isAuthenticated, linkCode]);

  // Add polling effect
  useEffect(() => {
    if (!linkCode || linkStatus === 'linked') return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/.netlify/functions/device-code?code=${linkCode}`);
        if (!res.ok) {
          setLinkDebug('Poll error: ' + await res.text());
          return;
        }
        const data = await res.json();
        setLinkDebug('Poll response: ' + JSON.stringify(data));

        if (data.status === 'linked') {
          if (data.token && data.expiresAt) {
            localStorage.setItem('google_token', data.token);
            localStorage.setItem('google_token_exp', String(data.expiresAt));
            setIsAuthenticated(true);
          }
          setLinkStatus('linked');
          clearInterval(pollInterval);
        }
      } catch (err) {
        setLinkDebug('Poll error: ' + err);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [linkCode, linkStatus]);

  if (deviceType === 'tv' && !isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900 p-4 text-center">
        <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">Link this TV</h1>
          <div className="mb-6">
            <div className="text-5xl font-mono font-bold text-blue-700 tracking-widest mb-2">{linkCode || '------'}</div>
            {linkDebug && (
              <div style={{ fontSize: '12px', color: '#b00', marginBottom: 8, wordBreak: 'break-all' }}>{linkDebug}</div>
            )}
            <div className="text-gray-600 mb-2">On your phone or computer, go to:</div>
            <div className="text-lg font-semibold text-blue-700 mb-2">{window.location.origin + '/link'}</div>
            <div className="text-gray-500">and enter the code above to link this TV.</div>
          </div>
          <div className="text-xs text-gray-400">
            {linkStatus === 'linked' ? 'Device linked!' : 'Waiting for device to be linked…'}
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center p-4 ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
          <h1 className="text-4xl font-bold text-gray-800 mb-8">{t.title}</h1>
          
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-4xl">👨‍👩‍👧‍👦</span>
            </div>
            <p className="text-gray-600 text-lg">
              Welcome to your Family Portal

            <header className="flex items-center justify-between p-4 bg-gray-800 text-white">
            <h1 className="text-2xl font-bold">Family TV Dashboard</h1>
            <SignInButton />
            </header>
            </p>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-white border-2 border-gray-300 text-gray-700 py-4 px-6 rounded-xl flex items-center justify-center space-x-3 hover:bg-gray-50 transition-all duration-200 focus:ring-4 focus:ring-blue-200 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            ) : (
              <>
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-lg font-medium">{t.signIn}</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-100 dark:bg-gray-900 ${isRTL ? 'rtl' : 'ltr'}`}>


      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              {t.title}
            </h1>
            <div className="text-2xl font-semibold text-gray-600 dark:text-gray-400">
              {currentTime.toLocaleDateString(language === 'en' ? 'en-US' : 'he-IL', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {currentTime.toLocaleTimeString(language === 'en' ? 'en-US' : 'he-IL', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setLanguage(language === 'en' ? 'he' : 'en')}
              className="px-4 py-2 text-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-2 focus:ring-blue-500 transition-all font-medium"
            >
              {language === 'en' ? 'עב' : 'EN'}
            </button>
            {/* Device debug box */}
            <span style={{ fontSize: '12px', background: '#0001', color: '#333', borderRadius: 4, padding: '2px 8px', marginLeft: 4 }}>
              Device: {deviceType}
            </span>
            <button
              onClick={openSettings}
              className="p-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <Settings size={24} />
            </button>
            <button
              onClick={handleSignOut}
              className="px-6 py-3 text-lg bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 transition-all font-medium"
            >
              {t.signOut}
            </button>
          </div>
        </div>
      </header>

      {/* Forecast Section */}
      {settings.showHourlyForecast && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold">
              {settings.forecastInterval === 1 ? t.hoursForecast : `${settings.forecastInterval}-${t.hoursForecast}`}
            </h2>
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-1">
                <span>🌅</span>
                <span>{t.sunrise}: {weatherData?.sunrise}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>🌇</span>
                <span>{t.sunset}: {weatherData?.sunset}</span>
              </div>
            </div>
          </div>
          {forecastGrid}
        </div>
      )}

      {/* Weekly Calendar */}
      <div className={`px-8 ${settings.compactMode ? 'py-2' : 'py-6'}`}>
        <div className={`grid gap-2 mb-${settings.compactMode ? '2' : '6'}`} style={{gridTemplateColumns: `repeat(${getDaysToShow().length}, minmax(0, 1fr))`}}>
          {/* Day Headers */}
          {(() => {
            const days = getDaysToShow();
            // Map forecast by date string for fast lookup
            const forecastByDate = new Map(
              (weatherData?.dailyForecast ?? []).map(f => [
                new Date(f.time).toDateString(),
                f
              ])
            );
            return days.map((date, index) => {
              const isToday = new Date().toDateString() === date.toDateString();
              const isPast = date < new Date(new Date().setHours(0,0,0,0));
              const dayWeather = forecastByDate.get(date.toDateString());
            return (
                <div key={`${index}`} className={`bg-white dark:bg-gray-800 rounded-t-2xl ${settings.compactMode ? 'p-3' : 'p-4'} border-4 ${isToday ? 'border-blue-500' : 'border-transparent'} ${isPast && !dayWeather ? 'opacity-50' : ''}`}>
                <div className="text-center">
                    <div className={`${settings.compactMode ? 'text-lg' : 'text-xl'} font-bold mb-2 ${isToday ? 'text-blue-600' : 'text-gray-800 dark:text-white'}`}>{getDayName(date)}</div>
                    <div className={`${settings.compactMode ? 'text-base' : 'text-lg'} mb-3 ${isToday ? 'text-blue-500' : 'text-gray-600 dark:text-gray-400'}`}>{date.toLocaleDateString(language === 'en' ? 'en-US' : 'he-IL', { month: 'numeric', day: 'numeric' })}</div>
                  {/* Daily Weather */}
                    {dayWeather ? (
                    <div className={`flex items-center justify-center space-x-2 bg-gray-50 dark:bg-gray-700 rounded-lg ${settings.compactMode ? 'p-1' : 'p-2'}`}>
                      <div className="text-2xl">{dayWeather.icon}</div>
                      <div className="text-center">
                          <div className={`${settings.compactMode ? 'text-base' : 'text-lg'} font-bold text-gray-800 dark:text-white`}>{dayWeather.temperature}°</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{dayWeather.condition}</div>
                    </div>
                        </div>
                    ) : (
                      <div className={`flex flex-col items-center justify-center space-y-1 bg-gray-50 dark:bg-gray-700 rounded-lg ${settings.compactMode ? 'p-1' : 'p-2'}`}>
                        <div className="text-2xl opacity-30">?</div>
                        <div className="text-center">
                          <div className={`${settings.compactMode ? 'text-base' : 'text-lg'} font-bold text-gray-400 dark:text-gray-500`}>--</div>
                          <div className="text-sm text-gray-400 dark:text-gray-500">No data</div>
                          {isPast && (
                            <div className="text-xs text-gray-400 italic mt-1">Past</div>
                          )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
            });
          })()}
        </div>

        {/* Calendar Events Grid */}
        {renderCalendarGrid()}
      </div>

      {/* Bottom Section */}
      <div className={`px-8 ${settings.compactMode ? 'pb-4' : 'pb-8'}`}>
        <div className={`grid grid-cols-4 gap-${settings.compactMode ? '4' : '6'}`}>
          {/* Next Events */}
          <div className={`bg-white dark:bg-gray-800 rounded-2xl ${settings.compactMode ? 'p-4' : 'p-6'}`}>
            <h3 className={`${settings.compactMode ? 'text-lg' : 'text-xl'} font-bold text-gray-800 dark:text-white ${settings.compactMode ? 'mb-3' : 'mb-4'} flex items-center`}>
              <Calendar className="mr-3" size={20} />
              {t.nextEvents}
            </h3>
            <div className={`space-y-${settings.compactMode ? '2' : '3'}`}>
              {calendarEvents.slice(0, settings.nextEventsCount).map((event) => (
                <div key={event.id} className="flex items-start space-x-3">
                  <div className={`w-3 h-3 rounded-full ${event.color} mt-2 flex-shrink-0`}></div>
                  <div>
                    <div className={`font-medium text-gray-800 dark:text-white ${settings.compactMode ? 'text-sm' : ''}`}>
                      {event.title}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {getDayName(new Date(event.start))} @ {formatTime(new Date(event.start))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className={`bg-white dark:bg-gray-800 rounded-2xl ${settings.compactMode ? 'p-2' : 'p-6'}`}>
            <h3 className={`${settings.compactMode ? 'text-base' : 'text-xl'} font-bold text-gray-800 dark:text-white ${settings.compactMode ? 'mb-2' : 'mb-4'} flex items-center`}>
              <MessageSquare className="mr-3" size={settings.compactMode ? 16 : 20} />
              {t.messages}
            </h3>
            <div className={`space-y-${settings.compactMode ? '1' : '3'}`}>
              {messagesLoading ? (
                <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 inline-block"></span>
                  <span>Loading...</span>
                </div>
              ) : messagesError ? (
                <div className="text-red-500 dark:text-red-400">{messagesError}</div>
              ) : messages.length === 0 ? (
                <div className="text-gray-400 dark:text-gray-500">{t.noMessages}</div>
              ) : settings.compactMode ? (
                messages.slice(0, settings.messagesCount).map((message, idx) => (
                  <div key={message.id} className="flex items-center space-x-2 py-1 px-2 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <span className="text-xs text-gray-400 w-16 truncate">{message.timestamp}</span>
                    <span className="flex-1 truncate text-sm text-gray-800 dark:text-white">{message.text}</span>
                    <span className="text-xs text-gray-500 w-16 truncate">{message.author}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs border ${getPriorityColor(message.priority)}`}>{message.priority}</span>
                    {!message.read && (
                      <button
                        className="ml-2 px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200 disabled:opacity-50"
                        onClick={() => handleMarkMessageRead(message, idx)}
                        disabled={!!messageUpdating[message.id]}
                      >
                        {messageUpdating[message.id] ? '...' : '✓'}
                      </button>
                    )}
                  </div>
                ))
              ) : (
                messages.slice(0, settings.messagesCount).map((message, idx) => (
                <div key={message.id} className={`${settings.compactMode ? 'p-2' : 'p-3'} bg-gray-50 dark:bg-gray-700 rounded-lg`}>
                  <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs text-gray-500 dark:text-gray-400`}>{message.timestamp}</span>
                      <span className={`px-2 py-1 rounded-full text-xs border ${getPriorityColor(message.priority)}`}>{message.priority}</span>
                  </div>
                    <div className={`text-gray-700 dark:text-gray-300 ${settings.compactMode ? 'text-sm' : 'text-base'} font-medium mb-1`}>{message.text}</div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500 dark:text-gray-400">{message.author}</div>
                      {!message.read && (
                        <button
                          className="ml-2 px-2 py-1 text-xs rounded bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200 disabled:opacity-50"
                          onClick={() => handleMarkMessageRead(message, idx)}
                          disabled={!!messageUpdating[message.id]}
                        >
                          {messageUpdating[message.id] ? '...' : 'Mark as Read'}
                        </button>
                      )}
                  </div>
                </div>
                ))
              )}
            </div>
          </div>

          {/* Todo */}
          <div className={`bg-white dark:bg-gray-800 rounded-2xl ${settings.compactMode ? 'p-2' : 'p-6'}`}>
            <h3 className={`${settings.compactMode ? 'text-base' : 'text-xl'} font-bold text-gray-800 dark:text-white ${settings.compactMode ? 'mb-2' : 'mb-4'} flex items-center`}>
              <CheckSquare className="mr-3" size={settings.compactMode ? 16 : 20} />
              {t.todos}
            </h3>
            <div className={`space-y-${settings.compactMode ? '1' : '3'}`}>  
              {todosLoading ? (
                <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 inline-block"></span>
                  <span>Loading...</span>
                </div>
              ) : todosError ? (
                <div className="text-red-500 dark:text-red-400">{todosError}</div>
              ) : todos.length === 0 ? (
                <div className="text-gray-400 dark:text-gray-500">{t.noTodos}</div>
              ) : settings.compactMode ? (
                Object.entries(limitedTodosByCategory).map(([category, todos]) => (
                  <div key={category}>
                    <div className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-1 uppercase tracking-wide">{category}</div>
                    <div className="space-y-1">
                      {todos.map((todo, idx) => {
                        const due = todo.dueDate ? new Date(todo.dueDate) : null;
                        const now = new Date();
                        let highlight = '';
                        if (!todo.completed && due) {
                          const diff = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
                          if (diff < 0) highlight = 'bg-red-100 dark:bg-red-900';
                          else if (diff <= 2) highlight = 'bg-yellow-100 dark:bg-yellow-900';
                        }
                        return (
                          <div key={todo.id} className={`flex items-center space-x-2 py-1 px-2 rounded-lg ${highlight}`}>
                  <input
                    type="checkbox"
                    checked={todo.completed}
                              onChange={() => handleToggleTodoCompleted(todo, idx, category)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                              disabled={!!todoUpdating[todo.id]}
                            />
                            <span className="flex-1 truncate text-sm text-gray-800 dark:text-white">{todo.task}</span>
                            <span className="text-xs text-gray-500 w-16 truncate">{todo.assignedTo}</span>
                            <span className="text-xs text-gray-500 w-16 truncate">{todo.dueDate}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs border ${getPriorityColor(todo.priority)}`}>{todo.priority}</span>
                </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                Object.entries(limitedTodosByCategory).map(([category, todos]) => (
                  <div key={category} className="mb-4">
                    <div className="text-sm font-bold text-blue-700 dark:text-blue-300 mb-2 uppercase tracking-wide">{category}</div>
                    <div className="space-y-2">
                      {todos.map((todo, idx) => {
                        const due = todo.dueDate ? new Date(todo.dueDate) : null;
                        const now = new Date();
                        let highlight = '';
                        if (!todo.completed && due) {
                          const diff = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
                          if (diff < 0) highlight = 'bg-red-100 dark:bg-red-900';
                          else if (diff <= 2) highlight = 'bg-yellow-100 dark:bg-yellow-900';
                        }
                        return (
                          <div key={todo.id} className={`flex flex-col sm:flex-row sm:items-center sm:space-x-3 p-2 rounded-lg ${highlight}`}>
                            <div className="flex-1">
                              <div className={`font-medium ${todo.completed ? 'line-through text-gray-500' : 'text-gray-800 dark:text-white'}`}>{todo.task}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{todo.assignedTo}</div>
                            </div>
                            <div className="flex items-center space-x-2 mt-1 sm:mt-0">
                              <span className={`px-2 py-1 rounded-full text-xs border ${getPriorityColor(todo.priority)}`}>{todo.priority}</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">{todo.dueDate}</span>
                              <input
                                type="checkbox"
                                checked={todo.completed}
                                onChange={() => handleToggleTodoCompleted(todo, idx, category)}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 ml-2"
                                disabled={!!todoUpdating[todo.id]}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Daily Photo */}
          <div className={`bg-white dark:bg-gray-800 rounded-2xl ${settings.compactMode ? 'p-4' : 'p-6'}`}>
            <h3 className={`${settings.compactMode ? 'text-lg' : 'text-xl'} font-bold text-gray-800 dark:text-white ${settings.compactMode ? 'mb-3' : 'mb-4'} flex items-center`}>
              <Image className="mr-3" size={20} />
              {t.dailyPhoto}
            </h3>
            <div className={`bg-gray-100 dark:bg-gray-700 rounded-xl ${settings.compactMode ? 'h-36' : 'h-48'} flex items-center justify-center overflow-hidden`}>
              {photosLoading ? (
                <div className="flex flex-col items-center justify-center w-full h-full">
                  <span className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-2"></span>
                  <span className="text-gray-500 dark:text-gray-400">Loading photos...</span>
                </div>
              ) : photosError ? (
                <img
                  src={defaultPhoto}
                  alt="Default"
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : photos.length > 0 ? (
                <img
                  src={photos[currentPhotoIndex].url}
                  alt={photos[currentPhotoIndex].title}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <img
                  src={defaultPhoto}
                  alt="Default"
                  className="w-full h-full object-cover rounded-xl"
                />
              )}
            </div>
            {/* Slideshow Controls */}
            <div className="flex items-center justify-center mt-3 space-x-4">
              <button
                onClick={handlePrevPhoto}
                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                aria-label="Previous Photo"
                disabled={photos.length === 0 || photosLoading || !!photosError}
              >
                ◀
              </button>
              <button
                onClick={handlePlayPause}
                className={`p-2 rounded-full ${isSlideshowPlaying ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} hover:bg-blue-700 dark:hover:bg-blue-500`}
                aria-label={isSlideshowPlaying ? 'Pause Slideshow' : 'Play Slideshow'}
                disabled={photos.length === 0 || photosLoading || !!photosError}
              >
                {isSlideshowPlaying ? '⏸' : '▶'}
              </button>
              <button
                onClick={handleNextPhoto}
                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                aria-label="Next Photo"
                disabled={photos.length === 0 || photosLoading || !!photosError}
              >
                ▶
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
              {t.enterPassword}
            </h2>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && verifyPassword()}
              className="w-full px-4 py-4 text-lg border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
              autoFocus
            />
            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordInput('');
                }}
                className="flex-1 px-6 py-3 text-lg text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-all"
              >
                {t.cancel}
              </button>
              <button
                onClick={verifyPassword}
                className="flex-1 px-6 py-3 text-lg bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                {t.settings}
              </h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-8">
              {/* Language Setting */}
              <div>
                <label className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {t.language}
                </label>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setLanguage('en')}
                    className={`px-6 py-3 rounded-xl text-lg font-medium transition-all ${
                      language === 'en'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setLanguage('he')}
                    className={`px-6 py-3 rounded-xl text-lg font-medium transition-all ${
                      language === 'he'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    עברית
                  </button>
                </div>
              </div>

              {/* Temperature Unit */}
              <div>
                <label className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {t.temperatureUnit}
                </label>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, weatherUnit: 'celsius' }))}
                    className={`px-6 py-3 rounded-xl text-lg font-medium transition-all ${
                      settings.weatherUnit === 'celsius'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {t.celsius}
                  </button>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, weatherUnit: 'fahrenheit' }))}
                    className={`px-6 py-3 rounded-xl text-lg font-medium transition-all ${
                      settings.weatherUnit === 'fahrenheit'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {t.fahrenheit}
                  </button>
                </div>
              </div>

              {/* Refresh Interval */}
              <div>
                <label className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {t.refreshInterval}
                </label>
                <div className="flex space-x-3">
                  {[5, 15, 30].map((interval) => (
                    <button
                      key={interval}
                      onClick={() => setSettings(prev => ({ ...prev, refreshInterval: interval }))}
                      className={`px-4 py-3 rounded-xl text-lg font-medium transition-all ${
                        settings.refreshInterval === interval
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {interval} {t.minutes}
                    </button>
                  ))}
                </div>
              </div>

              {/* Show Hourly Forecast */}
              <div>
                <label className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {t.showHourlyForecast}
                </label>
                <div className="flex items-center">
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, showHourlyForecast: !prev.showHourlyForecast }))}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      settings.showHourlyForecast ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        settings.showHourlyForecast ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="ml-3 text-gray-700 dark:text-gray-300">
                    {settings.showHourlyForecast ? t.enabled : t.disabled}
                  </span>
                </div>
              </div>

              {/* Forecast Interval */}
              {settings.showHourlyForecast && (
                <div>
                  <label className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
                    {t.forecastInterval}
                  </label>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, forecastInterval: 1 }))}
                      className={`px-6 py-3 rounded-xl text-lg font-medium transition-all ${
                        settings.forecastInterval === 1
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {t.oneHour}
                    </button>
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, forecastInterval: 3 }))}
                      className={`px-6 py-3 rounded-xl text-lg font-medium transition-all ${
                        settings.forecastInterval === 3
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {t.threeHours}
                    </button>
                  </div>
                </div>
              )}

              {/* Compact Mode */}
              <div>
                <label className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {t.compactMode}
                </label>
                <div className="flex items-center">
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, compactMode: !prev.compactMode }))}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      settings.compactMode ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        settings.compactMode ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="ml-3 text-gray-700 dark:text-gray-300">
                    {settings.compactMode ? t.enabled : t.disabled}
                  </span>
                </div>
              </div>

              {/* Week View Mode */}
              <div>
                <label className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {t.weekViewMode}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'fullWeek', label: t.fullWeek },
                    { key: 'upcomingWeek', label: t.upcomingWeek },
                    { key: 'workWeek', label: t.workWeek },
                    { key: 'weekendFocus', label: t.weekendFocus },
                    { key: 'next3Days', label: t.next3Days },
                    { key: 'todayOnly', label: t.todayOnly }
                  ].map((mode) => (
                    <button
                      key={mode.key}
                      onClick={() => setSettings(prev => ({ ...prev, weekViewMode: mode.key }))}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        settings.weekViewMode === mode.key
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location Setting */}
              <div>
                <label className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {t.location}
                </label>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {t.city}
                    </label>
                    <input
                      type="text"
                      value={settings.location.city}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        location: { ...prev.location, city: e.target.value }
                      }))}
                      className="w-full px-4 py-2 text-lg border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter city name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {t.country}
                    </label>
                    <input
                      type="text"
                      value={settings.location.country}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        location: { ...prev.location, country: e.target.value }
                      }))}
                      className="w-full px-4 py-2 text-lg border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter country code (e.g., il)"
                    />
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {t.locationHelp}
                  </div>
                </div>
              </div>

              {/* Photo Interval Setting */}
              <div>
                <label className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Photo Rotation Interval
                </label>
                <div className="flex space-x-3">
                  {[5, 10, 15, 30, 60, 90, 120].map((interval) => (
                    <button
                      key={interval}
                      onClick={() => setSettings(prev => ({ ...prev, photoInterval: interval }))}
                      className={`px-4 py-3 rounded-xl text-lg font-medium transition-all ${
                        settings.photoInterval === interval
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {interval} min
                    </button>
                  ))}
                </div>
              </div>

              {/* Album Picker */}
              <div>
                <label className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Photo Album
                </label>
                {albumsLoading ? (
                  <div className="text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                    <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 inline-block"></span>
                    <span>Loading albums...</span>
                  </div>
                ) : albumsError ? (
                  <div className="text-red-500 dark:text-red-400 mb-2">{albumsError}</div>
                ) : (
                  <select
                    value={selectedAlbumId || ''}
                    onChange={e => setSelectedAlbumId(e.target.value)}
                    className="w-full px-4 py-2 text-lg border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={albumsLoading || !!albumsError}
                  >
                    {photoAlbums.length === 0 && <option value="">No albums found</option>}
                    {photoAlbums.map(album => (
                      <option key={album.id} value={album.id}>{album.title}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Display Counts */}
              <div>
                <label className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Items to Display
                </label>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center space-x-3">
                    <span className="w-32">Next Events</span>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={settings.nextEventsCount}
                      onChange={e => setSettings(prev => ({ ...prev, nextEventsCount: Math.max(1, Math.min(10, Number(e.target.value))) }))}
                      className="w-20 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    />
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="w-32">Messages</span>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={settings.messagesCount}
                      onChange={e => setSettings(prev => ({ ...prev, messagesCount: Math.max(1, Math.min(10, Number(e.target.value))) }))}
                      className="w-20 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    />
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="w-32">To-Do List</span>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={settings.todosCount}
                      onChange={e => setSettings(prev => ({ ...prev, todosCount: Math.max(1, Math.min(20, Number(e.target.value))) }))}
                      className="w-20 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-4 mt-8">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 px-6 py-4 text-lg text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-all"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleSaveDefaults}
                className="flex-1 px-6 py-4 text-lg bg-green-600 text-white rounded-xl hover:bg-green-700 focus:ring-2 focus:ring-green-500 transition-all font-medium"
              >
                {t.saveDefaults}
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 px-6 py-4 text-lg bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              >
                {t.saveSettings}
              </button>
            </div>
            <div className="mt-4 text-center text-gray-500 text-sm">
              Version {APP_VERSION}
            </div>
          </div>
        </div>
      )}

      {/* DEBUG: Show detected device type */}
      <pre style={{fontSize: '12px', background: '#0002', color: '#333', maxWidth: 300, margin: 8, padding: 4, borderRadius: 4}}>
        Device: {deviceType}
      </pre>
    </div>
  );
};

export default FamilyPortal;