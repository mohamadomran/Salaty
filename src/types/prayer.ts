/**
 * Prayer-related type definitions
 */

export type PrayerName = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export type CustomPrayerType =
  | 'taraweeh'
  | 'qiyam'
  | 'witr'
  | 'sunnah_fajr'
  | 'sunnah_dhuhr_before'
  | 'sunnah_dhuhr_after'
  | 'sunnah_maghrib'
  | 'sunnah_isha'
  | 'custom';

export interface PrayerTime {
  name: PrayerName;
  time: Date;
  arabicName: string;
}

export interface HijriDate {
  day: string;
  month: {
    number: number;
    en: string;
    ar: string;
  };
  year: string;
  weekday: {
    en: string;
    ar: string;
  };
  format: string; // e.g., "DD-MM-YYYY"
  date: string; // e.g., "14-05-1446"
}

export interface PrayerTimes {
  fajr: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
  sunrise?: Date;
  sunset?: Date;
  date: Date;
  hijriDate?: HijriDate;
  locationName?: string;
}

export interface CustomPrayer {
  id: string;
  name: string;
  type: CustomPrayerType;
  arabicName?: string;
  isRecurring: boolean;
  description?: string;
}

export interface PrayerTracking {
  id: string;
  prayerName: PrayerName | string; // string for custom prayers
  date: string; // ISO date string
  completed: boolean;
  completedAt?: Date;
  note?: string;
  isCustom: boolean;
}

export interface PrayerStatistics {
  totalPrayers: number;
  completedPrayers: number;
  missedPrayers: number;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
}

// Calculation methods from AlAdhan API
export type CalculationMethod =
  | 'MuslimWorldLeague'
  | 'Egyptian'
  | 'Karachi'
  | 'UmmAlQura'
  | 'Dubai'
  | 'MoonsightingCommittee'
  | 'NorthAmerica'
  | 'Kuwait'
  | 'Qatar'
  | 'Singapore'
  | 'Jafari'
  | 'Tehran'
  | 'France'
  | 'Turkey'
  | 'Russia'
  | 'Jakim'
  | 'Tunisia'
  | 'Algeria'
  | 'Kemenag'
  | 'Morocco'
  | 'Portugal'
  | 'Jordan'
  | 'Gulf'
  | 'Custom';

export interface CalculationMethodInfo {
  id: string; // AlAdhan API key (e.g., "MWL", "EGYPT", "JAFARI")
  apiId: number; // AlAdhan numeric ID
  name: string;
  params: Record<string, any>; // API params (Fajr angle, Isha angle, etc.)
  location?: {
    latitude: number;
    longitude: number;
  };
}

// API response type for calculation methods (raw API structure)
export interface ApiMethodData {
  id: number; // Numeric method ID
  name: string;
  params: Record<string, any>;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface ApiCalculationMethodsResponse {
  code: number;
  status: string;
  data: Record<string, ApiMethodData>; // Key is method code (e.g., "MWL", "EGYPT")
}

// NOTE: CALCULATION_METHODS array removed - will be fetched dynamically from API
// Use useCalculationMethods() hook instead

export const PRAYER_NAMES: Record<
  PrayerName,
  { english: string; arabic: string }
> = {
  fajr: { english: 'Fajr', arabic: 'الفجر' },
  dhuhr: { english: 'Dhuhr', arabic: 'الظهر' },
  asr: { english: 'Asr', arabic: 'العصر' },
  maghrib: { english: 'Maghrib', arabic: 'المغرب' },
  isha: { english: 'Isha', arabic: 'العشاء' },
};
