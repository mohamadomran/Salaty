/**
 * Prayer Tracking Types
 * Types for prayer completion tracking, custom prayers, and statistics
 */

/**
 * Status of a single prayer
 */
export enum PrayerStatus {
  PENDING = 'pending',      // Prayer time has not arrived yet
  COMPLETED = 'completed',  // Prayer was performed on time
  MISSED = 'missed',        // Prayer was missed
  DELAYED = 'delayed',      // Prayer was performed but delayed
}

/**
 * Individual prayer record
 */
export interface PrayerRecord {
  prayerName: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
  status: PrayerStatus;
  completedAt?: Date;       // When the prayer was marked as completed
  notes?: string;           // Optional notes for this prayer
  wasDelayed?: boolean;     // True if prayer was done after its time window
}

/**
 * Daily prayer tracking record
 */
export interface DailyPrayerRecord {
  date: string;             // ISO date string (YYYY-MM-DD)
  prayers: {
    fajr: PrayerRecord;
    dhuhr: PrayerRecord;
    asr: PrayerRecord;
    maghrib: PrayerRecord;
    isha: PrayerRecord;
  };
  customPrayers?: CustomPrayerRecord[];  // Optional custom prayers for the day
  dailyNotes?: string;                    // General notes for the day
  updatedAt: Date;                        // Last update timestamp
}

/**
 * Custom prayer types
 */
export enum CustomPrayerType {
  TARAWEEH = 'taraweeh',     // During Ramadan
  QIYAM = 'qiyam',           // Night prayer
  WITR = 'witr',             // After Isha
  DUHA = 'duha',             // Forenoon prayer
  TAHAJJUD = 'tahajjud',     // Late night prayer
  SUNNAH_FAJR = 'sunnah_fajr',
  SUNNAH_DHUHR = 'sunnah_dhuhr',
  SUNNAH_MAGHRIB = 'sunnah_maghrib',
  SUNNAH_ISHA = 'sunnah_isha',
  OTHER = 'other',
}

/**
 * Custom prayer record
 */
export interface CustomPrayerRecord {
  id: string;               // Unique identifier
  type: CustomPrayerType;
  name: string;             // Display name
  completed: boolean;
  completedAt?: Date;
  rakaat?: number;          // Number of rakaat performed
  notes?: string;
}

/**
 * Prayer statistics for a time period
 */
export interface PrayerStats {
  period: 'week' | 'month' | 'year' | 'custom';
  startDate: string;        // ISO date string
  endDate: string;          // ISO date string
  totalPrayers: number;     // Total obligatory prayers in period
  completedPrayers: number;
  missedPrayers: number;
  delayedPrayers: number;
  completionRate: number;   // Percentage (0-100)
  currentStreak: number;    // Current streak of consecutive days with all prayers
  longestStreak: number;    // Longest streak achieved
  perPrayerStats: {
    fajr: PrayerTypeStats;
    dhuhr: PrayerTypeStats;
    asr: PrayerTypeStats;
    maghrib: PrayerTypeStats;
    isha: PrayerTypeStats;
  };
}

/**
 * Statistics for a specific prayer type
 */
export interface PrayerTypeStats {
  completed: number;
  missed: number;
  delayed: number;
  completionRate: number;   // Percentage (0-100)
}

/**
 * Notification preferences for prayer reminders
 */
export interface NotificationPreferences {
  enabled: boolean;
  beforeMinutes: number;    // Minutes before prayer time
  athanEnabled: boolean;    // Play athan sound
  vibrationEnabled: boolean;
  customSound?: string;     // Custom notification sound
  reminderForMissed: boolean;  // Remind about missed prayers
}

/**
 * Tracking preferences
 */
export interface TrackingPreferences {
  autoMarkMissed: boolean;  // Automatically mark prayers as missed after time window
  markAsDelayedThreshold: number;  // Minutes after prayer time to mark as delayed
  enableCustomPrayers: boolean;
  defaultCustomPrayers: CustomPrayerType[];  // Default custom prayers to show
  notifications: NotificationPreferences;
}
