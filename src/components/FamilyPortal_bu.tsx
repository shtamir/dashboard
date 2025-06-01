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
import type { CalendarEvent } from '@types';

// ─────────────────────────────────────────────────────────────────────────
const FamilyPortal = () => {
  
    // Core state
  const [currentTime, setCurrentTime] = useState(new Date());
  const [language, setLanguage] = useState('en');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  //const [events, setEvents] = useState<CalendarEvent[]>([]);

  // Settings state
  const [settings, setSettings] = useState({
    weatherUnit: 'celsius',
    refreshInterval: 5,
    password: '1234',
    passwordProtected: true,
    showHourlyForecast: true,
    compactMode: false,
    weekViewMode: 'fullWeek' // 'fullWeek', 'upcomingWeek', 'workWeek', 'weekendFocus', 'next3Days', 'todayOnly'
  });
  
  // Data state
  // const [calendarEvents, setCalendarEvents] = useState([]);
  const [messages, setMessages] = useState([]);
  const [todos, setTodos] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [photos, setPhotos] = useState([]);
  
  // Data state (events + window info)
  const [calendar, setCalendar] = useState<{
    events: CalendarEvent[];
    rangeStart: Date;
    days: number;
  } | null>(null);

  // UI state
  const [passwordInput, setPasswordInput] = useState('');

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
      enterPassword: 'Enter Password',
      wrongPassword: 'Incorrect password',
      language: 'Language',
      temperatureUnit: 'Temperature Unit',
      celsius: 'Celsius',
      fahrenheit: 'Fahrenheit',
      refreshInterval: 'Refresh Interval',
      minutes: 'minutes',
      saveSettings: 'Save Settings',
      cancel: 'Cancel',
      loading: 'Loading...',
      hoursForecast: '3 Hours Forecast',
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
      dailyPhoto: 'Daily Photo'
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
      enterPassword: 'הזן סיסמה',
      wrongPassword: 'סיסמה שגויה',
      language: 'שפה',
      temperatureUnit: 'יחידת טמפרטורה',
      celsius: 'צלזיוס',
      fahrenheit: 'פרנהייט',
      refreshInterval: 'מרווח רענון',
      minutes: 'דקות',
      saveSettings: 'שמור הגדרות',
      cancel: 'ביטול',
      loading: 'טוען...',
      hoursForecast: 'תחזית 3 שעות',
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
      dailyPhoto: 'תמונה יומית'
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
      // ignore – user hasn’t granted access yet /
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
    console.log('🚀 useEffect fired - about to call fetchCalendarEvents');   // ①
    fetchCalendarEvents()
      .then((evts) => {
        console.log('✔ got', evts.length, 'events from fetch'); 
        console.log('🔄 updating with', evts.length, 'items');
        setCalendarEvents(evts); 
      })
      .catch(console.error);
  
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);


  const loadMockData = () => {
    // Mock calendar events with days (0 = Sunday, 1 = Monday, etc.)
    setCalendarEvents([
      { id: 1, title: 'Math', time: '10:00', day: 0, person: 'Kids', color: 'bg-blue-500' },
      { id: 2, title: 'Lunch', time: '12:00', day: 0, person: 'Everyone', color: 'bg-green-500' },
      { id: 3, title: 'Karate', time: '17:30', day: 0, person: 'Kids', color: 'bg-red-500' },
      { id: 4, title: 'Yulia Out', time: '19:15', day: 0, person: 'Yulia', color: 'bg-purple-500' },
      { id: 5, title: 'Grandma', time: '17:00', day: 2, person: 'Everyone', color: 'bg-pink-500' },
      { id: 6, title: 'Krav Maga', time: '18:00', day: 3, person: 'Dad', color: 'bg-orange-500' },
      { id: 7, title: 'Horses', time: '17:30', day: 4, person: 'Kids', color: 'bg-teal-500' },
      { id: 8, title: 'Basketball', time: '11:30', day: 5, person: 'Kids', color: 'bg-indigo-500' },
      { id: 9, title: 'Grandpa Birthday', time: 'All day', day: 6, person: 'Everyone', color: 'bg-yellow-500' }
    ]);

    // Mock messages
    setMessages([
      { id: 1, text: "Don't forget to take out the trash", from: 'Mom', priority: 'high' },
      { id: 2, text: 'Family dinner at 6pm tonight', from: 'Dad', priority: 'medium' },
      { id: 3, text: 'Borrowed your charger, thanks!', from: 'Sister', priority: 'low' }
    ]);

    // Mock todos
    setTodos([
      { id: 1, text: 'Throw out garbage', completed: false },
      { id: 2, text: 'Pay bills', completed: false },
      { id: 3, text: 'Activate RoboRock', completed: false }
    ]);

    // Mock weather data
    setWeatherData({
      current: {
        temp: 24,
        condition: 'sunny',
        icon: '☀️',
        location: 'Tel Aviv'
      },
      hourly: [
        { time: '9:00', temp: 24, condition: '☀️' },
        { time: '12:00', temp: 26, condition: '🌤️' },
        { time: '15:00', temp: 25, condition: '⛅' },
        { time: '18:00', temp: 23, condition: '☀️' },
        { time: '21:00', temp: 21, condition: '🌙' },
        { time: '00:00', temp: 19, condition: '🌙' },
        { time: '03:00', temp: 18, condition: '🌙' },
        { time: '06:00', temp: 20, condition: '🌅' }
      ],
      daily: [
        { day: 0, high: 24, low: 18, condition: '☀️', name: 'Sunday' },
        { day: 1, high: 22, low: 17, condition: '⛅', name: 'Monday' },
        { day: 2, high: 23, low: 18, condition: '⛅', name: 'Tuesday' },
        { day: 3, high: 26, low: 20, condition: '☀️', name: 'Wednesday' },
        { day: 4, high: 24, low: 19, condition: '☀️', name: 'Thursday' },
        { day: 5, high: 25, low: 18, condition: '☁️', name: 'Friday' },
        { day: 6, high: 27, low: 20, condition: '☀️', name: 'Saturday' }
      ],
      sunrise: '6:30 AM',
      sunset: '7:45 PM'
    });

    // Mock daily photo
    setPhotos([
      { id: 1, url: '/api/placeholder/300/200', caption: 'Family Vacation' },
      { id: 2, url: '/api/placeholder/300/200', caption: 'Birthday Party' },
      { id: 3, url: '/api/placeholder/300/200', caption: 'Weekend Trip' }
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
    setIsAuthenticated(false);
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

  const toggleTodo = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const getDayName = (dayIndex) => {
    const days = {
      en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      he: ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
    };
    return days[language][dayIndex];
  };

  const getDateForDay = (dayIndex) => {
    const today = new Date();
    const currentDay = today.getDay();
    const diff = dayIndex - currentDay;
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + diff);
    return targetDate.toLocaleDateString(language === 'en' ? 'en-US' : 'he-IL', { 
      month: 'numeric', 
      day: 'numeric' 
    });
  };

  const getDaysToShow = () => {
    const today = new Date();
    const currentDayIndex = today.getDay();
    
    switch (settings.weekViewMode) {
      case 'fullWeek':
        return [0, 1, 2, 3, 4, 5, 6];
      
      case 'upcomingWeek':
        // Today + next 6 days
        const upcomingDays = [];
        for (let i = 0; i < 7; i++) {
          upcomingDays.push((currentDayIndex + i) % 7);
        }
        return upcomingDays;
      
      case 'workWeek':
        return [1, 2, 3, 4, 5]; // Monday to Friday
      
      case 'weekendFocus':
        return [5, 6, 0]; // Friday, Saturday, Sunday
      
      case 'next3Days':
        const next3Days = [];
        for (let i = 0; i < 3; i++) {
          next3Days.push((currentDayIndex + i) % 7);
        }
        return next3Days;
      
      case 'todayOnly':
        return [currentDayIndex];
      
      default:
        return [0, 1, 2, 3, 4, 5, 6];
    }
  };

  const getDateForViewMode = (dayIndex, viewModeIndex) => {
    const today = new Date();
    const currentDayIndex = today.getDay();
    
    switch (settings.weekViewMode) {
      case 'fullWeek':
        const diff = dayIndex - currentDayIndex;
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + diff);
        return targetDate.toLocaleDateString(language === 'en' ? 'en-US' : 'he-IL', { 
          month: 'numeric', 
          day: 'numeric' 
        });
      
      case 'upcomingWeek':
      case 'next3Days':
        const upcomingDate = new Date(today);
        upcomingDate.setDate(today.getDate() + viewModeIndex);
        return upcomingDate.toLocaleDateString(language === 'en' ? 'en-US' : 'he-IL', { 
          month: 'numeric', 
          day: 'numeric' 
        });
      
      case 'workWeek':
        // Calculate based on Monday = 0 for work week
        const mondayDate = new Date(today);
        const daysFromMonday = currentDayIndex === 0 ? 6 : currentDayIndex - 1; // Sunday = 6 days from Monday
        mondayDate.setDate(today.getDate() - daysFromMonday + viewModeIndex);
        return mondayDate.toLocaleDateString(language === 'en' ? 'en-US' : 'he-IL', { 
          month: 'numeric', 
          day: 'numeric' 
        });
      
      case 'weekendFocus':
        // Friday is the starting point
        const fridayDate = new Date(today);
        const daysFromFriday = currentDayIndex >= 5 ? currentDayIndex - 5 : currentDayIndex + 2;
        fridayDate.setDate(today.getDate() - daysFromFriday + viewModeIndex);
        return fridayDate.toLocaleDateString(language === 'en' ? 'en-US' : 'he-IL', { 
          month: 'numeric', 
          day: 'numeric' 
        });
      
      case 'todayOnly':
        return today.toLocaleDateString(language === 'en' ? 'en-US' : 'he-IL', { 
          month: 'numeric', 
          day: 'numeric' 
        });
      
      default:
        return getDateForDay(dayIndex);
    }
  };

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

    {/* DEBUG – remove later */}
<pre style={{fontSize: '10px', background: '#0008', color: '#0f0', maxHeight: 120, overflow: 'auto'}}>
  {JSON.stringify(calendarEvents /* or events */, null, 2)}
</pre>

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

      {/* 3 Hours Forecast */}
      {settings.showHourlyForecast && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold">{t.hoursForecast}</h2>
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
          
          <div className="grid grid-cols-8 gap-2">
            {weatherData?.hourly.slice(0, 8).map((hour, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
                <div className="text-sm font-semibold mb-1">{hour.time}</div>
                <div className="text-2xl mb-1">{hour.condition}</div>
                <div className="text-sm font-bold">
                  {hour.temp}°{settings.weatherUnit === 'celsius' ? 'C' : 'F'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Calendar */}
      <div className={`px-8 ${settings.compactMode ? 'py-2' : 'py-6'}`}>
        <div className={`grid gap-2 mb-${settings.compactMode ? '2' : '6'}`} style={{gridTemplateColumns: `repeat(${getDaysToShow().length}, minmax(0, 1fr))`}}>
          {/* Day Headers */}
          {getDaysToShow().map((dayIndex, viewIndex) => {
            const dayWeather = weatherData?.daily.find(day => day.day === dayIndex);
            const isToday = new Date().getDay() === dayIndex;
            
            return (
              <div key={`${dayIndex}-${viewIndex}`} className={`bg-white dark:bg-gray-800 rounded-t-2xl ${settings.compactMode ? 'p-3' : 'p-4'} border-4 ${isToday ? 'border-blue-500' : 'border-transparent'}`}>
                <div className="text-center">
                  <div className={`${settings.compactMode ? 'text-lg' : 'text-xl'} font-bold mb-2 ${isToday ? 'text-blue-600' : 'text-gray-800 dark:text-white'}`}>
                    {getDayName(dayIndex)}
                  </div>
                  <div className={`${settings.compactMode ? 'text-base' : 'text-lg'} mb-3 ${isToday ? 'text-blue-500' : 'text-gray-600 dark:text-gray-400'}`}>
                    {getDateForViewMode(dayIndex, viewIndex)}
                  </div>
                  
                  {/* Daily Weather */}
                  <div className={`flex items-center justify-center space-x-2 bg-gray-50 dark:bg-gray-700 rounded-lg ${settings.compactMode ? 'p-1' : 'p-2'}`}>
                    <span className={`${settings.compactMode ? 'text-xl' : 'text-2xl'}`}>{dayWeather?.condition || '?'}</span>
                    <div className="text-center">
                      <div className={`${settings.compactMode ? 'text-base' : 'text-lg'} font-bold text-gray-800 dark:text-white`}>
                        {dayWeather?.high || '?'}°
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {dayWeather?.low || '?'}°
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Calendar Events Grid */}
        <div className={`grid gap-2`} style={{gridTemplateColumns: `repeat(${getDaysToShow().length}, minmax(0, 1fr))`}}>
          {getDaysToShow().map((dayIndex, viewIndex) => {
            const dayEvents = calendarEvents.filter(event => event.day === dayIndex);
            const isToday = new Date().getDay() === dayIndex;
            
            return (
              <div key={`events-${dayIndex}-${viewIndex}`} className={`bg-white dark:bg-gray-800 rounded-b-2xl ${settings.compactMode ? 'p-3 min-h-80' : 'p-4 min-h-96'} border-4 border-t-0 ${isToday ? 'border-blue-500' : 'border-transparent'}`}>
                <div className="space-y-2">
                  {dayEvents.length > 0 ? dayEvents.map((event) => (
                    <div key={event.id} className={`${event.color} text-white ${settings.compactMode ? 'p-2' : 'p-3'} rounded-lg text-sm`}>
                      <div className="font-semibold">{event.time}</div>
                      <div className="font-medium">{event.title}</div>
                      <div className="text-xs opacity-90">{event.person}</div>
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
              {calendarEvents.slice(0, 4).map((event) => (
                <div key={event.id} className="flex items-start space-x-3">
                  <div className={`w-3 h-3 rounded-full ${event.color} mt-2 flex-shrink-0`}></div>
                  <div>
                    <div className={`font-medium text-gray-800 dark:text-white ${settings.compactMode ? 'text-sm' : ''}`}>
                      {event.title}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {getDayName(event.day)} @ {event.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className={`bg-white dark:bg-gray-800 rounded-2xl ${settings.compactMode ? 'p-4' : 'p-6'}`}>
            <h3 className={`${settings.compactMode ? 'text-lg' : 'text-xl'} font-bold text-gray-800 dark:text-white ${settings.compactMode ? 'mb-3' : 'mb-4'} flex items-center`}>
              <MessageSquare className="mr-3" size={20} />
              {t.messages}
            </h3>
            <div className={`space-y-${settings.compactMode ? '2' : '3'}`}>
              {messages.slice(0, 3).map((message) => (
                <div key={message.id} className={`${settings.compactMode ? 'p-2' : 'p-3'} bg-gray-50 dark:bg-gray-700 rounded-lg`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-medium text-gray-800 dark:text-white ${settings.compactMode ? 'text-sm' : 'text-sm'}`}>
                      {message.from}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      message.priority === 'high' ? 'bg-red-100 text-red-700' :
                      message.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {message.priority}
                    </span>
                  </div>
                  <div className={`text-gray-700 dark:text-gray-300 ${settings.compactMode ? 'text-sm' : 'text-sm'}`}>
                    {message.text}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Todo */}
          <div className={`bg-white dark:bg-gray-800 rounded-2xl ${settings.compactMode ? 'p-4' : 'p-6'}`}>
            <h3 className={`${settings.compactMode ? 'text-lg' : 'text-xl'} font-bold text-gray-800 dark:text-white ${settings.compactMode ? 'mb-3' : 'mb-4'} flex items-center`}>
              <CheckSquare className="mr-3" size={20} />
              {t.todos}
            </h3>
            <div className={`space-y-${settings.compactMode ? '2' : '3'}`}>
              {todos.map((todo) => (
                <div key={todo.id} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className={`${settings.compactMode ? 'text-sm' : 'text-sm'} ${todo.completed ? 'line-through text-gray-500' : 'text-gray-800 dark:text-white'}`}>
                    {todo.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Photo */}
          <div className={`bg-white dark:bg-gray-800 rounded-2xl ${settings.compactMode ? 'p-4' : 'p-6'}`}>
            <h3 className={`${settings.compactMode ? 'text-lg' : 'text-xl'} font-bold text-gray-800 dark:text-white ${settings.compactMode ? 'mb-3' : 'mb-4'} flex items-center`}>
              <Image className="mr-3" size={20} />
              {t.dailyPhoto}
            </h3>
            <div className={`bg-gray-100 dark:bg-gray-700 rounded-xl ${settings.compactMode ? 'h-36' : 'h-48'} flex items-center justify-center overflow-hidden`}>
              {photos.length > 0 ? (
                <img
                  src={photos[0].url}
                  alt={photos[0].caption}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <div className="text-gray-500 dark:text-gray-400 text-center">
                  <Image size={settings.compactMode ? 32 : 48} className="mx-auto mb-2 opacity-50" />
                  <div className={settings.compactMode ? 'text-sm' : ''}>No photo available</div>
                </div>
              )}
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
            </div>

            <div className="flex space-x-4 mt-8">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 px-6 py-4 text-lg text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-all"
              >
                {t.cancel}
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 px-6 py-4 text-lg bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              >
                {t.saveSettings}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyPortal;