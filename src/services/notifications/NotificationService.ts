/**
 * Notification Service
 * Core service for creating, displaying, and managing notifications
 */

import { Platform } from 'react-native';
import notifee, { TimestampTrigger, TriggerType, AndroidStyle } from '@notifee/react-native';
import {
  NOTIFICATION_CHANNELS,
  NotificationTriggerType,
  NotificationSoundType,
  ScheduledNotification,
} from '../../types/notifications';
import { PrayerName } from '../../types/prayer';
import NotificationChannels from './NotificationChannels';

class NotificationService {
  /**
   * Initialize notification service
   * Creates channels and ensures everything is ready
   */
  async initialize(): Promise<void> {
    try {
      // Create notification channels (Android only)
      await NotificationChannels.createAllChannels();

      console.log('Notification service initialized successfully');
    } catch (error) {
      console.error('Error initializing notification service:', error);
      throw error;
    }
  }

  /**
   * Display an immediate notification
   * For testing or instant notifications
   */
  async displayNotification(
    title: string,
    body: string,
    channelId: string = NOTIFICATION_CHANNELS.GENERAL,
    data?: Record<string, any>
  ): Promise<string> {
    try {
      const notificationId = await notifee.displayNotification({
        title,
        body,
        data,
        android: {
          channelId,
          smallIcon: 'ic_launcher', // Default app icon
          pressAction: {
            id: 'default',
          },
          // Add large icon for better visibility
          largeIcon: require('../../../assets/bootsplash/logo.png'),
        },
        ios: {
          sound: 'default',
          foregroundPresentationOptions: {
            alert: true,
            badge: true,
            sound: true,
          },
        },
      });

      console.log('Notification displayed:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error displaying notification:', error);
      throw error;
    }
  }

  /**
   * Schedule a notification for a future time
   */
  async scheduleNotification(
    id: string,
    title: string,
    body: string,
    triggerTime: Date,
    channelId: string,
    data?: Record<string, any>
  ): Promise<string> {
    try {
      // Ensure channels exist
      await NotificationChannels.ensureChannelsExist();

      // Create timestamp trigger
      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: triggerTime.getTime(),
      };

      // Schedule notification
      const notificationId = await notifee.createTriggerNotification(
        {
          id,
          title,
          body,
          data,
          android: {
            channelId,
            smallIcon: 'ic_launcher',
            pressAction: {
              id: 'default',
            },
            largeIcon: require('../../../assets/bootsplash/logo.png'),
            // Add expanded view for better UX
            style: {
              type: AndroidStyle.BIGTEXT,
              text: body,
            },
          },
          ios: {
            sound: 'default',
            categoryId: 'prayer-notification',
          },
        },
        trigger
      );

      console.log(`Notification scheduled: ${notificationId} at ${triggerTime.toISOString()}`);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  }

  /**
   * Schedule a prayer notification
   * Specialized method for prayer-related notifications
   */
  async schedulePrayerNotification(
    prayerName: PrayerName,
    triggerType: NotificationTriggerType,
    triggerTime: Date,
    prayerTime: Date,
    date: string,
    soundType: NotificationSoundType = 'simple_beep',
    customTitle?: string,
    customBody?: string
  ): Promise<ScheduledNotification> {
    try {
      // Generate notification ID
      const notificationId = this.generateNotificationId(prayerName, triggerType, date);

      // Determine channel based on trigger type
      const channelId = this.getChannelForTriggerType(triggerType);

      // Generate title and body
      const title = customTitle || this.generateTitle(prayerName, triggerType);
      const body = customBody || this.generateBody(prayerName, triggerType, prayerTime, triggerTime);

      // Schedule the notification
      await this.scheduleNotification(
        notificationId,
        title,
        body,
        triggerTime,
        channelId,
        {
          prayerName,
          triggerType,
          prayerTime: prayerTime.toISOString(),
          date,
        }
      );

      // Create scheduled notification record
      const scheduledNotification: ScheduledNotification = {
        id: notificationId,
        prayerName,
        triggerType,
        scheduledTime: triggerTime,
        prayerTime,
        date,
        title,
        body,
        sound: soundType,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return scheduledNotification;
    } catch (error) {
      console.error('Error scheduling prayer notification:', error);
      throw error;
    }
  }

  /**
   * Cancel a specific notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await notifee.cancelNotification(notificationId);
      console.log(`Notification cancelled: ${notificationId}`);
    } catch (error) {
      console.error(`Error cancelling notification ${notificationId}:`, error);
      throw error;
    }
  }

  /**
   * Cancel all notifications
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await notifee.cancelAllNotifications();
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
      throw error;
    }
  }

  /**
   * Cancel all notifications for a specific prayer
   */
  async cancelPrayerNotifications(prayerName: PrayerName, date: string): Promise<void> {
    try {
      const triggers: NotificationTriggerType[] = ['pre_prayer', 'at_time', 'missed_prayer'];

      for (const trigger of triggers) {
        const notificationId = this.generateNotificationId(prayerName, trigger, date);
        await this.cancelNotification(notificationId);
      }

      console.log(`All notifications cancelled for ${prayerName} on ${date}`);
    } catch (error) {
      console.error(`Error cancelling ${prayerName} notifications:`, error);
      throw error;
    }
  }

  /**
   * Get all scheduled (trigger) notifications
   */
  async getScheduledNotifications(): Promise<any[]> {
    try {
      return await notifee.getTriggerNotifications();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  /**
   * Get all displayed notifications
   */
  async getDisplayedNotifications(): Promise<any[]> {
    try {
      return await notifee.getDisplayedNotifications();
    } catch (error) {
      console.error('Error getting displayed notifications:', error);
      return [];
    }
  }

  /**
   * Clear all displayed notifications from notification tray
   */
  async clearDisplayedNotifications(): Promise<void> {
    try {
      await notifee.cancelDisplayedNotifications();
      console.log('Displayed notifications cleared');
    } catch (error) {
      console.error('Error clearing displayed notifications:', error);
      throw error;
    }
  }

  /**
   * Generate notification ID
   * Format: prayer_type_date (e.g., "fajr_pre_prayer_2025-01-07")
   */
  private generateNotificationId(
    prayerName: PrayerName,
    triggerType: NotificationTriggerType,
    date: string
  ): string {
    return `${prayerName}_${triggerType}_${date}`;
  }

  /**
   * Get channel ID for trigger type
   */
  private getChannelForTriggerType(triggerType: NotificationTriggerType): string {
    switch (triggerType) {
      case 'pre_prayer':
        return NOTIFICATION_CHANNELS.PRE_PRAYER;
      case 'at_time':
        return NOTIFICATION_CHANNELS.AT_TIME;
      case 'missed_prayer':
        return NOTIFICATION_CHANNELS.MISSED_PRAYER;
      default:
        return NOTIFICATION_CHANNELS.GENERAL;
    }
  }

  /**
   * Generate notification title
   */
  private generateTitle(prayerName: PrayerName, triggerType: NotificationTriggerType): string {
    const prayerDisplayName = prayerName.charAt(0).toUpperCase() + prayerName.slice(1);

    switch (triggerType) {
      case 'pre_prayer':
        return `${prayerDisplayName} Prayer Coming Soon`;
      case 'at_time':
        return `${prayerDisplayName} Prayer Time`;
      case 'missed_prayer':
        return `${prayerDisplayName} Prayer Missed`;
      default:
        return `${prayerDisplayName} Prayer`;
    }
  }

  /**
   * Generate notification body
   */
  private generateBody(
    prayerName: PrayerName,
    triggerType: NotificationTriggerType,
    prayerTime: Date,
    triggerTime: Date
  ): string {
    const prayerDisplayName = prayerName.charAt(0).toUpperCase() + prayerName.slice(1);
    const timeString = this.formatTime(prayerTime);

    switch (triggerType) {
      case 'pre_prayer': {
        const minutesBefore = Math.round((prayerTime.getTime() - triggerTime.getTime()) / 60000);
        return `${prayerDisplayName} prayer in ${minutesBefore} minutes at ${timeString}`;
      }
      case 'at_time':
        return `It's time for ${prayerDisplayName} prayer`;
      case 'missed_prayer':
        return `You haven't marked ${prayerDisplayName} prayer as completed`;
      default:
        return `${prayerDisplayName} prayer at ${timeString}`;
    }
  }

  /**
   * Format time for display
   */
  private formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  /**
   * Check if notification exists
   */
  async notificationExists(notificationId: string): Promise<boolean> {
    try {
      const scheduled = await this.getScheduledNotifications();
      return scheduled.some(n => n.notification.id === notificationId);
    } catch (error) {
      console.error('Error checking notification existence:', error);
      return false;
    }
  }

  /**
   * Get notification count
   */
  async getNotificationCount(): Promise<{ scheduled: number; displayed: number }> {
    try {
      const scheduled = await this.getScheduledNotifications();
      const displayed = await this.getDisplayedNotifications();

      return {
        scheduled: scheduled.length,
        displayed: displayed.length,
      };
    } catch (error) {
      console.error('Error getting notification count:', error);
      return { scheduled: 0, displayed: 0 };
    }
  }
}

export default new NotificationService();
