// src/services/settings.ts
interface Settings {
  viewMode: 'work-week' | 'week' | 'month';
  familyName: string;
  location: string;
  timezone: string;
  theme: 'light' | 'dark' | 'system';
}

const defaultSettings: Settings = {
  viewMode: 'work-week',
  familyName: '',
  location: '',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  theme: 'system'
};

const STORAGE_KEY = 'family-dashboard-settings';

export function getSettings(): Settings {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
}

export function saveSettings(settings: Partial<Settings>): void {
  const current = getSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function resetSettings(): void {
  localStorage.removeItem(STORAGE_KEY);
} 