/**
 * Notification Types
 * Comprehensive type definitions for prayer notification system
 */

import { PrayerName } from './prayer';

/**
 * Notification trigger types
 */
export type NotificationTriggerType =
  | 'pre_prayer'      // Reminder before prayer time
  | 'at_time'         // At exact prayer time
  | 'missed_prayer';  // Reminder for missed prayer

/**
 * Pre-prayer reminder intervals (minutes before prayer)
 */
export type ReminderInterval = 5 | 10 | 15 | 20 | 30;

/**
 * Notification sound types
 */
export type NotificationSoundType =
  | 'system'          // System default sound
  | 'adhan_mecca'     // Adhan from Mecca
  | 'adhan_medina'    // Adhan from Medina
  | 'adhan_egypt'     // Adhan from Egypt
  | 'simple_beep'     // Simple notification beep
  | 'silent';         // No sound

/**
 * Priority levels for notifications
 */
export type NotificationPriority = 'high' | 'default' | 'low';

/**
 * Per-prayer notification settings
 */
export interface PrayerNotificationSettings {
  /** Is this prayer notification enabled */
  enabled: boolean;

  /** Pre-prayer reminders enabled */
  preReminderEnabled: boolean;

  /** Minutes before prayer to send reminder */
  reminderMinutes: ReminderInterval[];

  /** At-time notification enabled */
  atTimeEnabled: boolean;

  /** At-time notification sound */
  atTimeSound: NotificationSoundType;

  /** Missed prayer alert enabled */
  missedAlertEnabled: boolean;

  /** Minutes after prayer time to send missed alert */
  missedAlertDelay: number;

  /** Custom notification title (optional) */
  customTitle?: string;

  /** Custom notification message (optional) */
  customMessage?: string;
}

/**
 * Global notification settings
 */
export interface GlobalNotificationSettings {
  /** Master toggle for all notifications */
  enabled: boolean;

  /** Notification sound for pre-prayer reminders */
  prePrayerSound: NotificationSoundType;

  /** Notification sound for missed prayers */
  missedPrayerSound: NotificationSoundType;

  /** Show prayer time in notification */
  showPrayerTime: boolean;

  /** Show countdown in notification */
  showCountdown: boolean;

  /** Vibration enabled */
  vibrationEnabled: boolean;

  /** Notification priority */
  priority: NotificationPriority;

  /** Do Not Disturb mode settings */
  dnd: {
    enabled: boolean;
    startTime: string; // HH:mm format
    endTime: string;   // HH:mm format
  };

  /** Smart notifications (adjust based on prayer completion patterns) */
  smartNotifications: boolean;
}

/**
 * Complete notification preferences
 */
export interface NotificationPreferences {
  /** Global settings */
  global: GlobalNotificationSettings;

  /** Per-prayer settings */
  perPrayer: Record<PrayerName, PrayerNotificationSettings>;
}

/**
 * Scheduled notification data
 */
export interface ScheduledNotification {
  /** Unique notification ID */
  id: string;

  /** Prayer name this notification is for */
  prayerName: PrayerName;

  /** Trigger type */
  triggerType: NotificationTriggerType;

  /** Scheduled trigger time */
  scheduledTime: Date;

  /** Prayer time (for reference) */
  prayerTime: Date;

  /** Date this notification is for (ISO date string) */
  date: string;

  /** Notification title */
  title: string;

  /** Notification body */
  body: string;

  /** Sound to play */
  sound: NotificationSoundType;

  /** Is notification active */
  active: boolean;

  /** Created timestamp */
  createdAt: Date;

  /** Updated timestamp */
  updatedAt: Date;
}

/**
 * Notification delivery log (for debugging and analytics)
 */
export interface NotificationLog {
  /** Log entry ID */
  id: string;

  /** Notification ID that was delivered */
  notificationId: string;

  /** Prayer name */
  prayerName: PrayerName;

  /** Trigger type */
  triggerType: NotificationTriggerType;

  /** Scheduled time */
  scheduledTime: Date;

  /** Actual delivery time */
  deliveredAt: Date;

  /** Was delivered successfully */
  success: boolean;

  /** Error message if failed */
  error?: string;

  /** User interacted with notification */
  interacted: boolean;

  /** Interaction timestamp */
  interactedAt?: Date;
}

/**
 * Notification permission status
 */
export type NotificationPermissionStatus =
  | 'granted'
  | 'denied'
  | 'not_determined'
  | 'provisional'; // iOS only

/**
 * Notification channel for Android
 */
export interface NotificationChannel {
  /** Channel ID */
  id: string;

  /** Channel name */
  name: string;

  /** Channel description */
  description: string;

  /** Importance level (maps to priority) */
  importance: 'high' | 'default' | 'low' | 'min';

  /** Sound enabled */
  sound?: string;

  /** Vibration pattern */
  vibration?: boolean;
}

/**
 * Background task registration info
 */
export interface BackgroundTaskInfo {
  /** Task ID */
  taskId: string;

  /** Task name */
  taskName: string;

  /** Is task registered */
  registered: boolean;

  /** Last run timestamp */
  lastRun?: Date;

  /** Next scheduled run */
  nextRun?: Date;

  /** Task status */
  status: 'idle' | 'running' | 'failed';

  /** Error if failed */
  error?: string;
}

/**
 * Notification statistics (privacy-first, local only)
 */
export interface NotificationStats {
  /** Total notifications sent */
  totalSent: number;

  /** Total notifications interacted with */
  totalInteracted: number;

  /** Per-prayer stats */
  perPrayer: Record<PrayerName, {
    sent: number;
    interacted: number;
    lastSent?: Date;
  }>;

  /** Per-trigger-type stats */
  perTriggerType: Record<NotificationTriggerType, {
    sent: number;
    interacted: number;
  }>;

  /** Last reset date */
  lastReset?: Date;
}

/**
 * Default notification preferences
 */
export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  global: {
    enabled: false, // Disabled by default until user grants permission
    prePrayerSound: 'simple_beep',
    missedPrayerSound: 'simple_beep',
    showPrayerTime: true,
    showCountdown: true,
    vibrationEnabled: true,
    priority: 'high',
    dnd: {
      enabled: false,
      startTime: '22:00',
      endTime: '06:00',
    },
    smartNotifications: false,
  },
  perPrayer: {
    fajr: {
      enabled: true,
      preReminderEnabled: true,
      reminderMinutes: [15],
      atTimeEnabled: true,
      atTimeSound: 'adhan_mecca',
      missedAlertEnabled: true,
      missedAlertDelay: 30,
    },
    dhuhr: {
      enabled: true,
      preReminderEnabled: true,
      reminderMinutes: [15],
      atTimeEnabled: true,
      atTimeSound: 'adhan_mecca',
      missedAlertEnabled: true,
      missedAlertDelay: 30,
    },
    asr: {
      enabled: true,
      preReminderEnabled: true,
      reminderMinutes: [15],
      atTimeEnabled: true,
      atTimeSound: 'adhan_mecca',
      missedAlertEnabled: true,
      missedAlertDelay: 30,
    },
    maghrib: {
      enabled: true,
      preReminderEnabled: true,
      reminderMinutes: [10],
      atTimeEnabled: true,
      atTimeSound: 'adhan_mecca',
      missedAlertEnabled: true,
      missedAlertDelay: 20,
    },
    isha: {
      enabled: true,
      preReminderEnabled: true,
      reminderMinutes: [15],
      atTimeEnabled: true,
      atTimeSound: 'adhan_mecca',
      missedAlertEnabled: true,
      missedAlertDelay: 30,
    },
  },
};

/**
 * Android notification channel IDs
 */
export const NOTIFICATION_CHANNELS = {
  PRE_PRAYER: 'pre_prayer_reminders',
  AT_TIME: 'at_time_notifications',
  MISSED_PRAYER: 'missed_prayer_alerts',
  GENERAL: 'general_notifications',
} as const;
