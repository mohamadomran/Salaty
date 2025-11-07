/**
 * Notification Preferences Service
 * CRUD operations for notification preferences (global + per-prayer settings)
 */

import StorageService, { STORAGE_KEYS } from '../storage/StorageService';
import {
  NotificationPreferences,
  GlobalNotificationSettings,
  PrayerNotificationSettings,
  DEFAULT_NOTIFICATION_PREFERENCES,
  ReminderInterval,
  NotificationSoundType,
  NotificationPriority,
} from '../../types/notifications';
import { PrayerName } from '../../types/prayer';

class NotificationPreferencesService {
  /**
   * Get all notification preferences
   * Returns default if not set
   */
  async getPreferences(): Promise<NotificationPreferences> {
    try {
      const preferences = await StorageService.getItem<NotificationPreferences>(
        STORAGE_KEYS.NOTIFICATION_PREFERENCES
      );

      if (!preferences) {
        // Return defaults if no preferences saved
        await this.savePreferences(DEFAULT_NOTIFICATION_PREFERENCES);
        return DEFAULT_NOTIFICATION_PREFERENCES;
      }

      // Merge with defaults to ensure all fields exist (for migration)
      return this.mergeWithDefaults(preferences);
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      return DEFAULT_NOTIFICATION_PREFERENCES;
    }
  }

  /**
   * Save notification preferences
   */
  async savePreferences(preferences: NotificationPreferences): Promise<void> {
    try {
      await StorageService.setItem(STORAGE_KEYS.NOTIFICATION_PREFERENCES, preferences);
      console.log('Notification preferences saved successfully');
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      throw error;
    }
  }

  /**
   * Get global notification settings
   */
  async getGlobalSettings(): Promise<GlobalNotificationSettings> {
    try {
      const preferences = await this.getPreferences();
      return preferences.global;
    } catch (error) {
      console.error('Error getting global settings:', error);
      return DEFAULT_NOTIFICATION_PREFERENCES.global;
    }
  }

  /**
   * Update global notification settings
   */
  async updateGlobalSettings(
    settings: Partial<GlobalNotificationSettings>
  ): Promise<NotificationPreferences> {
    try {
      const preferences = await this.getPreferences();

      preferences.global = {
        ...preferences.global,
        ...settings,
      };

      await this.savePreferences(preferences);
      return preferences;
    } catch (error) {
      console.error('Error updating global settings:', error);
      throw error;
    }
  }

  /**
   * Get per-prayer settings for a specific prayer
   */
  async getPrayerSettings(prayerName: PrayerName): Promise<PrayerNotificationSettings> {
    try {
      const preferences = await this.getPreferences();
      return preferences.perPrayer[prayerName];
    } catch (error) {
      console.error(`Error getting ${prayerName} settings:`, error);
      return DEFAULT_NOTIFICATION_PREFERENCES.perPrayer[prayerName];
    }
  }

  /**
   * Update per-prayer settings for a specific prayer
   */
  async updatePrayerSettings(
    prayerName: PrayerName,
    settings: Partial<PrayerNotificationSettings>
  ): Promise<NotificationPreferences> {
    try {
      const preferences = await this.getPreferences();

      preferences.perPrayer[prayerName] = {
        ...preferences.perPrayer[prayerName],
        ...settings,
      };

      await this.savePreferences(preferences);
      return preferences;
    } catch (error) {
      console.error(`Error updating ${prayerName} settings:`, error);
      throw error;
    }
  }

  /**
   * Get all per-prayer settings
   */
  async getAllPrayerSettings(): Promise<Record<PrayerName, PrayerNotificationSettings>> {
    try {
      const preferences = await this.getPreferences();
      return preferences.perPrayer;
    } catch (error) {
      console.error('Error getting all prayer settings:', error);
      return DEFAULT_NOTIFICATION_PREFERENCES.perPrayer;
    }
  }

  /**
   * Enable/disable notifications globally
   */
  async toggleNotifications(enabled: boolean): Promise<NotificationPreferences> {
    return await this.updateGlobalSettings({ enabled });
  }

  /**
   * Enable/disable notifications for a specific prayer
   */
  async togglePrayerNotifications(
    prayerName: PrayerName,
    enabled: boolean
  ): Promise<NotificationPreferences> {
    return await this.updatePrayerSettings(prayerName, { enabled });
  }

  /**
   * Update reminder intervals for a prayer
   */
  async updateReminderIntervals(
    prayerName: PrayerName,
    intervals: ReminderInterval[]
  ): Promise<NotificationPreferences> {
    return await this.updatePrayerSettings(prayerName, {
      reminderMinutes: intervals,
      preReminderEnabled: intervals.length > 0,
    });
  }

  /**
   * Update at-time notification sound for a prayer
   */
  async updateAtTimeSound(
    prayerName: PrayerName,
    sound: NotificationSoundType
  ): Promise<NotificationPreferences> {
    return await this.updatePrayerSettings(prayerName, { atTimeSound: sound });
  }

  /**
   * Enable/disable missed prayer alerts for a prayer
   */
  async toggleMissedAlerts(
    prayerName: PrayerName,
    enabled: boolean
  ): Promise<NotificationPreferences> {
    return await this.updatePrayerSettings(prayerName, { missedAlertEnabled: enabled });
  }

  /**
   * Update DND (Do Not Disturb) settings
   */
  async updateDNDSettings(
    enabled: boolean,
    startTime?: string,
    endTime?: string
  ): Promise<NotificationPreferences> {
    const dndSettings: any = { enabled };

    if (startTime) dndSettings.startTime = startTime;
    if (endTime) dndSettings.endTime = endTime;

    return await this.updateGlobalSettings({
      dnd: {
        ...(await this.getGlobalSettings()).dnd,
        ...dndSettings,
      },
    });
  }

  /**
   * Update notification priority
   */
  async updatePriority(priority: NotificationPriority): Promise<NotificationPreferences> {
    return await this.updateGlobalSettings({ priority });
  }

  /**
   * Enable/disable vibration
   */
  async toggleVibration(enabled: boolean): Promise<NotificationPreferences> {
    return await this.updateGlobalSettings({ vibrationEnabled: enabled });
  }

  /**
   * Enable/disable smart notifications
   */
  async toggleSmartNotifications(enabled: boolean): Promise<NotificationPreferences> {
    return await this.updateGlobalSettings({ smartNotifications: enabled });
  }

  /**
   * Reset preferences to defaults
   */
  async resetToDefaults(): Promise<NotificationPreferences> {
    try {
      await this.savePreferences(DEFAULT_NOTIFICATION_PREFERENCES);
      return DEFAULT_NOTIFICATION_PREFERENCES;
    } catch (error) {
      console.error('Error resetting to defaults:', error);
      throw error;
    }
  }

  /**
   * Reset a specific prayer's settings to defaults
   */
  async resetPrayerToDefaults(prayerName: PrayerName): Promise<NotificationPreferences> {
    try {
      const defaultPrayerSettings = DEFAULT_NOTIFICATION_PREFERENCES.perPrayer[prayerName];
      return await this.updatePrayerSettings(prayerName, defaultPrayerSettings);
    } catch (error) {
      console.error(`Error resetting ${prayerName} to defaults:`, error);
      throw error;
    }
  }

  /**
   * Export preferences (for backup/import)
   */
  async exportPreferences(): Promise<string> {
    try {
      const preferences = await this.getPreferences();
      return JSON.stringify(preferences, null, 2);
    } catch (error) {
      console.error('Error exporting preferences:', error);
      throw error;
    }
  }

  /**
   * Import preferences (from backup/export)
   */
  async importPreferences(jsonString: string): Promise<NotificationPreferences> {
    try {
      const preferences = JSON.parse(jsonString) as NotificationPreferences;

      // Validate and merge with defaults
      const validPreferences = this.mergeWithDefaults(preferences);

      await this.savePreferences(validPreferences);
      return validPreferences;
    } catch (error) {
      console.error('Error importing preferences:', error);
      throw error;
    }
  }

  /**
   * Check if notifications are enabled (global + prayer-specific)
   */
  async areNotificationsEnabled(prayerName?: PrayerName): Promise<boolean> {
    try {
      const preferences = await this.getPreferences();

      // Check global setting
      if (!preferences.global.enabled) {
        return false;
      }

      // If prayer specified, check prayer-specific setting
      if (prayerName) {
        return preferences.perPrayer[prayerName].enabled;
      }

      return true;
    } catch (error) {
      console.error('Error checking if notifications enabled:', error);
      return false;
    }
  }

  /**
   * Get enabled reminder intervals for a prayer
   */
  async getEnabledReminders(prayerName: PrayerName): Promise<ReminderInterval[]> {
    try {
      const settings = await this.getPrayerSettings(prayerName);

      if (!settings.enabled || !settings.preReminderEnabled) {
        return [];
      }

      return settings.reminderMinutes;
    } catch (error) {
      console.error(`Error getting enabled reminders for ${prayerName}:`, error);
      return [];
    }
  }

  /**
   * Check if currently in DND mode
   */
  async isInDNDMode(): Promise<boolean> {
    try {
      const global = await this.getGlobalSettings();

      if (!global.dnd.enabled) {
        return false;
      }

      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      const startTime = global.dnd.startTime;
      const endTime = global.dnd.endTime;

      // Handle overnight DND (e.g., 22:00 to 06:00)
      if (startTime > endTime) {
        return currentTime >= startTime || currentTime < endTime;
      }

      // Normal DND (e.g., 12:00 to 14:00)
      return currentTime >= startTime && currentTime < endTime;
    } catch (error) {
      console.error('Error checking DND mode:', error);
      return false;
    }
  }

  /**
   * Merge preferences with defaults (for migration/validation)
   */
  private mergeWithDefaults(preferences: NotificationPreferences): NotificationPreferences {
    return {
      global: {
        ...DEFAULT_NOTIFICATION_PREFERENCES.global,
        ...preferences.global,
        dnd: {
          ...DEFAULT_NOTIFICATION_PREFERENCES.global.dnd,
          ...preferences.global.dnd,
        },
      },
      perPrayer: {
        fajr: {
          ...DEFAULT_NOTIFICATION_PREFERENCES.perPrayer.fajr,
          ...preferences.perPrayer.fajr,
        },
        dhuhr: {
          ...DEFAULT_NOTIFICATION_PREFERENCES.perPrayer.dhuhr,
          ...preferences.perPrayer.dhuhr,
        },
        asr: {
          ...DEFAULT_NOTIFICATION_PREFERENCES.perPrayer.asr,
          ...preferences.perPrayer.asr,
        },
        maghrib: {
          ...DEFAULT_NOTIFICATION_PREFERENCES.perPrayer.maghrib,
          ...preferences.perPrayer.maghrib,
        },
        isha: {
          ...DEFAULT_NOTIFICATION_PREFERENCES.perPrayer.isha,
          ...preferences.perPrayer.isha,
        },
      },
    };
  }
}

export default new NotificationPreferencesService();
