/**
 * Prayer Names Constants
 * Multilingual prayer names with icons
 */

import { PrayerName } from '../types';

export interface PrayerNameInfo {
  en: string;
  ar: string;
  icon: string;
  arabicFull: string; // Full Arabic name
}

export const PRAYER_NAMES: Record<PrayerName, PrayerNameInfo> = {
  fajr: {
    en: 'Fajr',
    ar: 'الفجر',
    arabicFull: 'صلاة الفجر',
    icon: 'weather-sunset-up',
  },
  dhuhr: {
    en: 'Dhuhr',
    ar: 'الظهر',
    arabicFull: 'صلاة الظهر',
    icon: 'white-balance-sunny',
  },
  asr: {
    en: 'Asr',
    ar: 'العصر',
    arabicFull: 'صلاة العصر',
    icon: 'weather-partly-cloudy',
  },
  maghrib: {
    en: 'Maghrib',
    ar: 'المغرب',
    arabicFull: 'صلاة المغرب',
    icon: 'weather-sunset',
  },
  isha: {
    en: 'Isha',
    ar: 'العشاء',
    arabicFull: 'صلاة العشاء',
    icon: 'weather-night',
  },
};

// Helper function to get prayer name based on current language
export const getPrayerName = (
  prayer: PrayerName,
  language: 'en' | 'ar' = 'en',
  full: boolean = false,
): string => {
  if (language === 'ar' && full) {
    return PRAYER_NAMES[prayer].arabicFull;
  }
  return PRAYER_NAMES[prayer][language];
};

// Helper function to get prayer icon
export const getPrayerIcon = (prayer: PrayerName): string => {
  return PRAYER_NAMES[prayer].icon;
};

// Helper to get display name with proper capitalization
export const getPrayerDisplayName = (
  prayer: PrayerName,
  language: 'en' | 'ar' = 'en',
): string => {
  const name = PRAYER_NAMES[prayer][language];
  return language === 'en' ? name.charAt(0).toUpperCase() + name.slice(1) : name;
};
