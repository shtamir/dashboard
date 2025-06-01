// src/components/FamilyPortal.tsx
/* eslint-disable react-hooks/exhaustive-deps */

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Calendar,
  MessageSquare,
  CheckSquare,
  Image
} from 'lucide-react';
import SignInButton from '@components/SignInButton';
import { fetchCalendarEvents } from '@services/calendar';
import type { CalendarEvent } from '@types';

// ─────────────────────────────────────────────────────────────────────────────
const FamilyPortal = () => {
  /* Core UI state */
  const [currentTime, setCurrentTime] = useState(new Date());
  const [language, setLanguage] = useState<'en' | 'he'>('en');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  /* Calendar window + events */
  const [calendar, setCalendar] = useState<{
    events: CalendarEvent[];
    rangeStart: Date;
    days: number;
  } | null>(null);

  /* Other data (still mock) */
  const [messages] = useState([]);
  const [todos] = useState([]);
  const [weatherData] = useState<any>(null);
  const [photos] = useState([]);

  /* Simple i18n */
  const t = {
    en: { title: 'Family Portal', noEvents: 'No events', signOut: 'Sign out' },
    he: { title: 'פורטל משפחתי', noEvents: 'אין אירועים', signOut: 'התנתק' }
  }[language];

  /* Fetch calendar once on mount */
  useEffect(() => {
    fetchCalendarEvents().then(setCalendar).catch(console.error);
    const tick = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  /* Demo sign-in (replace with GIS) */
  const demoSignIn = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsAuthenticated(true);
      setIsLoading(false);
    }, 1200);
  };

  // ───────────────────── LOGIN SCREEN ─────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900 p-4 text-center">
        <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full">
          <h1 className="text-4xl font-bold mb-8 text-gray-800">{t.title}</h1>
          <SignInButton />
          <button
            className="mt-6 w-full bg-indigo-600 text-white rounded-xl py-3 hover:bg-indigo-700"
            onClick={demoSignIn}
            disabled={isLoading}
          >
            {isLoading ? '…' : 'Demo sign-in'}
          </button>
        </div>
      </div>
    );
  }

  // ───────────────────── LOADING STATE ─────────────────────
  if (!calendar) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading…
      </div>
    );
  }

  const { events, rangeStart, days } = calendar;
  const dayOffsets = [...Array(days).keys()];
  const locale = language === 'en' ? 'en-US' : 'he-IL';

  // ───────────────────── MAIN DASHBOARD ─────────────────────
  return (
    <div className="min-h-screen bg-gray-100">
      {/* header bar */}
      <header className="p-4 bg-white shadow flex justify-between">
        <h1 className="text-2xl font-bold">{t.title}</h1>
        <button
          className="text-red-600 hover:underline"
          onClick={() => setIsAuthenticated(false)}
        >
          {t.signOut}
        </button>
      </header>

      {/* day labels */}
      <div
        className="grid gap-1 bg-gray-50 py-2 px-3"
        style={{ gridTemplateColumns: `repeat(${days}, 1fr)` }}
      >
        {dayOffsets.map((offset) => {
          const d = new Date(rangeStart.getTime() + offset * 864e5);
          return (
            <div key={offset} className="text-center font-semibold">
              {d.toLocaleDateString(locale, {
                weekday: 'short',
                day: '2-digit',
                month: '2-digit'
              })}
            </div>
          );
        })}
      </div>

      {/* event columns */}
      <div
        className="grid gap-1 px-3"
        style={{ gridTemplateColumns: `repeat(${days}, 1fr)` }}
      >
        {dayOffsets.map((offset) => {
          const dayEvents = events.filter((e) => e.day === offset);
          return (
            <div
              key={offset}
              className="bg-white rounded-lg p-2 min-h-40 space-y-1"
            >
              {dayEvents.length ? (
                dayEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className={`${ev.color} text-white rounded p-1 text-sm`}
                  >
                    <span className="font-medium">{ev.time}</span> – {ev.title}
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 text-sm py-4">
                  {t.noEvents}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FamilyPortal;
