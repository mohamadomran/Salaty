/**
 * Notification Scheduler Service
 * Orchestrates scheduling of all prayer notifications
 * Handles rescheduling when settings/times change
 */

import { PrayerName, PrayerTimes } from '../../types/prayer';
import { ScheduledNotification, NotificationTriggerType, ReminderInterval } from '../../types/notifications';
import NotificationService from './NotificationService';
import NotificationPreferencesService from './NotificationPreferencesService';
import NotificationPermissions from './NotificationPermissions';
import { PrayerService } from '../prayer';
import { LocationPreferenceService } from '../location';
import StorageService, { STORAGE_KEYS } from '../storage/StorageService';

class NotificationSchedulerService {
  private isScheduling = false;

  /**
   * Schedule all notifications for today and upcoming days
   * @param daysAhead Number of days to schedule ahead (default: 7)
   */
  async scheduleAllNotifications(daysAhead: number = 7): Promise<void> {
    // Prevent concurrent scheduling
    if (this.isScheduling) {
      console.log('Scheduling already in progress, skipping...');
      return;
    }

    try {
      this.isScheduling = true;

      // Check if notifications are enabled and permitted
      const canSchedule = await this.canScheduleNotifications();
      if (!canSchedule) {
        console.log('Cannot schedule notifications - disabled or no permission');
        return;
      }

      console.log(`Scheduling notifications for next ${daysAhead} days...`);

      // Cancel all existing notifications first
      await NotificationService.cancelAllNotifications();

      const scheduledNotifications: ScheduledNotification[] = [];

      // Schedule for each day
      for (let dayOffset = 0; dayOffset < daysAhead; dayOffset++) {
        const date = this.getDateForOffset(dayOffset);
        const dateString = this.formatDate(date);

        // Get prayer times for this date
        const prayerTimes = await this.getPrayerTimesForDate(date);

        if (!prayerTimes) {
          console.warn(`No prayer times available for ${dateString}`);
          continue;
        }

        // Schedule notifications for each prayer
        const dayNotifications = await this.scheduleDayNotifications(
          prayerTimes,
          dateString
        );

        scheduledNotifications.push(...dayNotifications);
      }

      // Save scheduled notifications to storage
      await this.saveScheduledNotifications(scheduledNotifications);

      console.log(`Successfully scheduled ${scheduledNotifications.length} notifications`);
    } catch (error) {
      console.error('Error scheduling all notifications:', error);
      throw error;
    } finally {
      this.isScheduling = false;
    }
  }

  /**
   * Schedule notifications for a single day
   */
  private async scheduleDayNotifications(
    prayerTimes: PrayerTimes,
    dateString: string
  ): Promise<ScheduledNotification[]> {
    const scheduledNotifications: ScheduledNotification[] = [];
    const prayers: PrayerName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

    for (const prayerName of prayers) {
      const prayerTime = prayerTimes[prayerName];

      if (!prayerTime) {
        console.warn(`No time for ${prayerName} on ${dateString}`);
        continue;
      }

      // Schedule all notification types for this prayer
      const prayerNotifications = await this.schedulePrayerNotifications(
        prayerName,
        prayerTime,
        dateString
      );

      scheduledNotifications.push(...prayerNotifications);
    }

    return scheduledNotifications;
  }

  /**
   * Schedule all notification types for a single prayer
   */
  private async schedulePrayerNotifications(
    prayerName: PrayerName,
    prayerTime: Date,
    dateString: string
  ): Promise<ScheduledNotification[]> {
    const scheduledNotifications: ScheduledNotification[] = [];

    // Check if notifications are enabled for this prayer
    const isEnabled = await NotificationPreferencesService.areNotificationsEnabled(prayerName);
    if (!isEnabled) {
      return scheduledNotifications;
    }

    // Get prayer-specific settings
    const prayerSettings = await NotificationPreferencesService.getPrayerSettings(prayerName);

    // Skip if prayer time is in the past
    if (prayerTime < new Date()) {
      console.log(`Skipping ${prayerName} on ${dateString} - time has passed`);
      return scheduledNotifications;
    }

    // 1. Schedule pre-prayer reminders
    if (prayerSettings.preReminderEnabled && prayerSettings.reminderMinutes.length > 0) {
      const reminderNotifications = await this.schedulePrePrayerReminders(
        prayerName,
        prayerTime,
        dateString,
        prayerSettings.reminderMinutes
      );
      scheduledNotifications.push(...reminderNotifications);
    }

    // 2. Schedule at-time notification
    if (prayerSettings.atTimeEnabled) {
      const atTimeNotification = await this.scheduleAtTimeNotification(
        prayerName,
        prayerTime,
        dateString,
        prayerSettings.atTimeSound
      );
      if (atTimeNotification) {
        scheduledNotifications.push(atTimeNotification);
      }
    }

    // 3. Schedule missed prayer alert (if enabled)
    if (prayerSettings.missedAlertEnabled) {
      const missedNotification = await this.scheduleMissedPrayerAlert(
        prayerName,
        prayerTime,
        dateString,
        prayerSettings.missedAlertDelay
      );
      if (missedNotification) {
        scheduledNotifications.push(missedNotification);
      }
    }

    return scheduledNotifications;
  }

  /**
   * Schedule pre-prayer reminder notifications
   */
  private async schedulePrePrayerReminders(
    prayerName: PrayerName,
    prayerTime: Date,
    dateString: string,
    reminderMinutes: ReminderInterval[]
  ): Promise<ScheduledNotification[]> {
    const scheduledNotifications: ScheduledNotification[] = [];

    // Check if we're in DND mode
    const isInDND = await NotificationPreferencesService.isInDNDMode();
    if (isInDND) {
      console.log('DND mode active, skipping pre-prayer reminders');
      return scheduledNotifications;
    }

    for (const minutes of reminderMinutes) {
      const triggerTime = new Date(prayerTime.getTime() - minutes * 60000);

      // Skip if trigger time is in the past
      if (triggerTime < new Date()) {
        continue;
      }

      try {
        const notification = await NotificationService.schedulePrayerNotification(
          prayerName,
          'pre_prayer',
          triggerTime,
          prayerTime,
          dateString,
          'simple_beep' // Pre-prayer reminders use simple beep
        );

        scheduledNotifications.push(notification);
      } catch (error) {
        console.error(`Error scheduling pre-prayer reminder for ${prayerName}:`, error);
      }
    }

    return scheduledNotifications;
  }

  /**
   * Schedule at-time notification (exact prayer time with adhan)
   */
  private async scheduleAtTimeNotification(
    prayerName: PrayerName,
    prayerTime: Date,
    dateString: string,
    soundType: any
  ): Promise<ScheduledNotification | null> {
    // Check if we're in DND mode
    const isInDND = await NotificationPreferencesService.isInDNDMode();
    if (isInDND) {
      console.log('DND mode active, skipping at-time notification');
      return null;
    }

    // Skip if prayer time is in the past
    if (prayerTime < new Date()) {
      return null;
    }

    try {
      const notification = await NotificationService.schedulePrayerNotification(
        prayerName,
        'at_time',
        prayerTime,
        prayerTime,
        dateString,
        soundType
      );

      return notification;
    } catch (error) {
      console.error(`Error scheduling at-time notification for ${prayerName}:`, error);
      return null;
    }
  }

  /**
   * Schedule missed prayer alert
   * Triggers after prayer time + delay if prayer not marked complete
   */
  private async scheduleMissedPrayerAlert(
    prayerName: PrayerName,
    prayerTime: Date,
    dateString: string,
    delayMinutes: number
  ): Promise<ScheduledNotification | null> {
    const triggerTime = new Date(prayerTime.getTime() + delayMinutes * 60000);

    // Skip if trigger time is in the past
    if (triggerTime < new Date()) {
      return null;
    }

    try {
      const notification = await NotificationService.schedulePrayerNotification(
        prayerName,
        'missed_prayer',
        triggerTime,
        prayerTime,
        dateString,
        'simple_beep'
      );

      return notification;
    } catch (error) {
      console.error(`Error scheduling missed prayer alert for ${prayerName}:`, error);
      return null;
    }
  }

  /**
   * Reschedule all notifications
   * Called when settings change or prayer times update
   */
  async rescheduleAll(): Promise<void> {
    console.log('Rescheduling all notifications...');
    await this.scheduleAllNotifications();
  }

  /**
   * Reschedule notifications for a specific prayer
   */
  async reschedulePrayer(prayerName: PrayerName, date?: Date): Promise<void> {
    try {
      const targetDate = date || new Date();
      const dateString = this.formatDate(targetDate);

      // Cancel existing notifications for this prayer
      await NotificationService.cancelPrayerNotifications(prayerName, dateString);

      // Get prayer times for the date
      const prayerTimes = await PrayerTimeService.getPrayerTimesForDate(targetDate);

      if (!prayerTimes) {
        console.warn(`No prayer times available for ${dateString}`);
        return;
      }

      const prayerTime = prayerTimes[prayerName];

      if (!prayerTime) {
        console.warn(`No time for ${prayerName} on ${dateString}`);
        return;
      }

      // Schedule new notifications
      const notifications = await this.schedulePrayerNotifications(
        prayerName,
        prayerTime,
        dateString
      );

      console.log(`Rescheduled ${notifications.length} notifications for ${prayerName}`);
    } catch (error) {
      console.error(`Error rescheduling ${prayerName}:`, error);
      throw error;
    }
  }

  /**
   * Cancel all notifications
   */
  async cancelAll(): Promise<void> {
    try {
      await NotificationService.cancelAllNotifications();
      await this.clearScheduledNotifications();
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
      throw error;
    }
  }

  /**
   * Cancel notifications for a specific prayer
   */
  async cancelPrayer(prayerName: PrayerName, dateString: string): Promise<void> {
    try {
      await NotificationService.cancelPrayerNotifications(prayerName, dateString);
      console.log(`Cancelled notifications for ${prayerName} on ${dateString}`);
    } catch (error) {
      console.error(`Error cancelling ${prayerName} notifications:`, error);
      throw error;
    }
  }

  /**
   * Get scheduled notifications from storage
   */
  async getScheduledNotifications(): Promise<ScheduledNotification[]> {
    try {
      const notifications = await StorageService.getItem<ScheduledNotification[]>(
        STORAGE_KEYS.SCHEDULED_NOTIFICATIONS
      );

      return notifications || [];
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  /**
   * Save scheduled notifications to storage
   */
  private async saveScheduledNotifications(
    notifications: ScheduledNotification[]
  ): Promise<void> {
    try {
      await StorageService.setItem(
        STORAGE_KEYS.SCHEDULED_NOTIFICATIONS,
        notifications
      );
    } catch (error) {
      console.error('Error saving scheduled notifications:', error);
      throw error;
    }
  }

  /**
   * Clear scheduled notifications from storage
   */
  private async clearScheduledNotifications(): Promise<void> {
    try {
      await StorageService.removeItem(STORAGE_KEYS.SCHEDULED_NOTIFICATIONS);
    } catch (error) {
      console.error('Error clearing scheduled notifications:', error);
      throw error;
    }
  }

  /**
   * Check if notifications can be scheduled
   */
  private async canScheduleNotifications(): Promise<boolean> {
    try {
      // Check if globally enabled
      const preferences = await NotificationPreferencesService.getPreferences();
      if (!preferences.global.enabled) {
        return false;
      }

      // Check permission status
      const permissionStatus = await NotificationPermissions.checkPermissionStatus();
      if (permissionStatus !== 'granted' && permissionStatus !== 'provisional') {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking if can schedule:', error);
      return false;
    }
  }

  /**
   * Get date for offset from today
   */
  private getDateForOffset(dayOffset: number): Date {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    date.setHours(0, 0, 0, 0); // Start of day
    return date;
  }

  /**
   * Format date as YYYY-MM-DD
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Get notification status summary
   */
  async getNotificationStatus(): Promise<{
    enabled: boolean;
    permissionGranted: boolean;
    scheduledCount: number;
    nextNotification: ScheduledNotification | null;
  }> {
    try {
      const preferences = await NotificationPreferencesService.getPreferences();
      const permissionStatus = await NotificationPermissions.checkPermissionStatus();
      const scheduled = await this.getScheduledNotifications();

      // Find next notification
      const now = new Date();
      const upcoming = scheduled
        .filter(n => new Date(n.scheduledTime) > now)
        .sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime());

      return {
        enabled: preferences.global.enabled,
        permissionGranted: permissionStatus === 'granted' || permissionStatus === 'provisional',
        scheduledCount: upcoming.length,
        nextNotification: upcoming[0] || null,
      };
    } catch (error) {
      console.error('Error getting notification status:', error);
      return {
        enabled: false,
        permissionGranted: false,
        scheduledCount: 0,
        nextNotification: null,
      };
    }
  }

  /**
   * Get prayer times for a specific date
   * Fetches user location and calculates prayer times
   */
  private async getPrayerTimesForDate(date: Date): Promise<PrayerTimes | null> {
    try {
      // Get user's location preference
      const locationPref = await LocationPreferenceService.getLocationPreference();

      if (!locationPref || !locationPref.coordinates) {
        console.warn('No location set, cannot calculate prayer times');
        return null;
      }

      // Get prayer times using PrayerService
      const prayerTimes = await PrayerService.getPrayerTimes(
        locationPref.coordinates,
        date
      );

      return prayerTimes;
    } catch (error) {
      console.error('Error getting prayer times for date:', error);
      return null;
    }
  }
}

export default new NotificationSchedulerService();
