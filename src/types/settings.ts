/**
 * Settings Types
 * User preferences and app settings
 */

import { CalculationMethod } from './prayer';

/**
 * Madhab/School for Asr calculation
 */
export type Madhab = 'shafi' | 'hanafi';

/**
 * Time format preference
 */
export type TimeFormat = '12h' | '24h';

/**
 * Theme mode
 */
export type ThemeMode = 'light' | 'dark' | 'auto';

/**
 * App settings
 */
export interface AppSettings {
  // Prayer Calculation
  calculationMethod: CalculationMethod;
  madhab: Madhab;

  // Display
  timeFormat: TimeFormat;
  showSunriseSunset: boolean;

  // Notifications (future)
  notificationsEnabled: boolean;
  notificationSound: boolean;
  reminderMinutes: number;

  // App
  themeMode: ThemeMode;
  language: string;
  onboardingCompleted: boolean;

  // Advanced
  highLatitudeRule: 'middleOfNight' | 'oneSeventh' | 'angleBased';

  // Version
  version: string;
}

/**
 * Calculation method info
 */
export interface CalculationMethodInfo {
  id: CalculationMethod;
  name: string;
  description: string;
  region: string;
}
