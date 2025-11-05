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

// Calculation methods from Adhan library
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
  | 'Singapore';

export interface CalculationMethodInfo {
  id: CalculationMethod;
  name: string;
  description: string;
  region: string;
}

export const CALCULATION_METHODS: CalculationMethodInfo[] = [
  {
    id: 'MuslimWorldLeague',
    name: 'Muslim World League',
    description: 'Fajr: 18°, Isha: 17°',
    region: 'Europe, Far East, America',
  },
  {
    id: 'Egyptian',
    name: 'Egyptian General Authority',
    description: 'Fajr: 19.5°, Isha: 17.5°',
    region: 'Africa, Syria, Iraq, Lebanon, Malaysia',
  },
  {
    id: 'Karachi',
    name: 'University of Islamic Sciences, Karachi',
    description: 'Fajr: 18°, Isha: 18°',
    region: 'Pakistan, Bangladesh, India, Afghanistan',
  },
  {
    id: 'UmmAlQura',
    name: 'Umm Al-Qura University, Makkah',
    description: 'Fajr: 18.5°, Isha: 90 min after Maghrib',
    region: 'Saudi Arabia',
  },
  {
    id: 'Dubai',
    name: 'Dubai',
    description: 'Fajr: 18.2°, Isha: 18.2°',
    region: 'UAE',
  },
  {
    id: 'MoonsightingCommittee',
    name: 'Moonsighting Committee Worldwide',
    description: 'Conservative timings',
    region: 'Global (safer approach)',
  },
  {
    id: 'NorthAmerica',
    name: 'Islamic Society of North America',
    description: 'Fajr: 15°, Isha: 15°',
    region: 'North America',
  },
  {
    id: 'Kuwait',
    name: 'Kuwait',
    description: 'Fajr: 18°, Isha: 17.5°',
    region: 'Kuwait',
  },
  {
    id: 'Qatar',
    name: 'Qatar',
    description: 'Fajr: 18°, Isha: 90 min after Maghrib',
    region: 'Qatar',
  },
  {
    id: 'Singapore',
    name: 'Singapore',
    description: 'Fajr: 20°, Isha: 18°',
    region: 'Singapore',
  },
];

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
