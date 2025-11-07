/**
 * Notification Channels Service
 * Manages Android notification channels for different notification types
 * iOS doesn't require channels - this service is Android-specific
 */

import { Platform } from 'react-native';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { NOTIFICATION_CHANNELS, NotificationChannel } from '../../types/notifications';

class NotificationChannelsService {
  /**
   * Create all notification channels
   * Should be called when app launches or when notifications are first enabled
   */
  async createAllChannels(): Promise<void> {
    // Skip on iOS - channels are Android-only
    if (Platform.OS !== 'android') {
      return;
    }

    try {
      await Promise.all([
        this.createPrePrayerChannel(),
        this.createAtTimeChannel(),
        this.createMissedPrayerChannel(),
        this.createGeneralChannel(),
      ]);

      console.log('All notification channels created successfully');
    } catch (error) {
      console.error('Error creating notification channels:', error);
      throw error;
    }
  }

  /**
   * Create pre-prayer reminder channel
   * High priority - users want to be reminded before prayer time
   */
  private async createPrePrayerChannel(): Promise<void> {
    await notifee.createChannel({
      id: NOTIFICATION_CHANNELS.PRE_PRAYER,
      name: 'Pre-Prayer Reminders',
      description: 'Notifications before prayer time (5-30 minutes)',
      importance: AndroidImportance.HIGH,
      sound: 'default',
      vibration: true,
      vibrationPattern: [300, 500],
      lights: true,
      lightColor: '#006A6A', // Teal color
    });
  }

  /**
   * Create at-time notification channel
   * High priority with custom sound - this is the main adhan notification
   */
  private async createAtTimeChannel(): Promise<void> {
    await notifee.createChannel({
      id: NOTIFICATION_CHANNELS.AT_TIME,
      name: 'Prayer Time Notifications',
      description: 'Notifications at exact prayer time with Adhan',
      importance: AndroidImportance.HIGH,
      sound: 'default', // Will be customizable per-prayer in the future
      vibration: true,
      vibrationPattern: [500, 500, 500, 500], // Pattern: [on, off, on, off] in milliseconds
      lights: true,
      lightColor: '#006A6A',
    });
  }

  /**
   * Create missed prayer alert channel
   * Default priority - gentle reminder for missed prayers
   */
  private async createMissedPrayerChannel(): Promise<void> {
    await notifee.createChannel({
      id: NOTIFICATION_CHANNELS.MISSED_PRAYER,
      name: 'Missed Prayer Alerts',
      description: 'Reminders for prayers you haven\'t marked as complete',
      importance: AndroidImportance.DEFAULT,
      sound: 'default',
      vibration: true,
      vibrationPattern: [300, 300],
      lights: true,
      lightColor: '#D32F2F', // Red color for missed prayers
    });
  }

  /**
   * Create general notifications channel
   * Low priority for app updates, tips, etc.
   */
  private async createGeneralChannel(): Promise<void> {
    await notifee.createChannel({
      id: NOTIFICATION_CHANNELS.GENERAL,
      name: 'General Notifications',
      description: 'App updates, tips, and general information',
      importance: AndroidImportance.LOW,
      sound: 'default',
      vibration: false,
      lights: false,
    });
  }

  /**
   * Update channel settings
   * Note: On Android, users can override channel settings in system settings
   */
  async updateChannel(channelId: string, settings: Partial<NotificationChannel>): Promise<void> {
    if (Platform.OS !== 'android') {
      return;
    }

    try {
      const existingChannel = await notifee.getChannel(channelId);

      if (!existingChannel) {
        console.warn(`Channel ${channelId} does not exist`);
        return;
      }

      // Create updated channel (Android will merge with existing)
      await notifee.createChannel({
        id: channelId,
        name: settings.name || existingChannel.name || 'Notification',
        description: settings.description || existingChannel.description,
        importance: this.mapImportanceLevel(settings.importance),
        sound: settings.sound || existingChannel.sound,
        vibration: settings.vibration !== undefined ? settings.vibration : existingChannel.vibration,
      });

      console.log(`Channel ${channelId} updated successfully`);
    } catch (error) {
      console.error(`Error updating channel ${channelId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a notification channel
   * Warning: This will remove all notifications in this channel
   */
  async deleteChannel(channelId: string): Promise<void> {
    if (Platform.OS !== 'android') {
      return;
    }

    try {
      await notifee.deleteChannel(channelId);
      console.log(`Channel ${channelId} deleted successfully`);
    } catch (error) {
      console.error(`Error deleting channel ${channelId}:`, error);
      throw error;
    }
  }

  /**
   * Get channel information
   */
  async getChannel(channelId: string): Promise<any> {
    if (Platform.OS !== 'android') {
      return null;
    }

    try {
      return await notifee.getChannel(channelId);
    } catch (error) {
      console.error(`Error getting channel ${channelId}:`, error);
      return null;
    }
  }

  /**
   * Get all channels
   */
  async getAllChannels(): Promise<any[]> {
    if (Platform.OS !== 'android') {
      return [];
    }

    try {
      return await notifee.getChannels();
    } catch (error) {
      console.error('Error getting all channels:', error);
      return [];
    }
  }

  /**
   * Check if a channel exists
   */
  async channelExists(channelId: string): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true; // iOS doesn't have channels
    }

    try {
      const channel = await notifee.getChannel(channelId);
      return channel !== null;
    } catch (error) {
      console.error(`Error checking channel existence ${channelId}:`, error);
      return false;
    }
  }

  /**
   * Ensure required channels exist
   * Creates missing channels if they don't exist
   */
  async ensureChannelsExist(): Promise<void> {
    if (Platform.OS !== 'android') {
      return;
    }

    try {
      const requiredChannels = [
        NOTIFICATION_CHANNELS.PRE_PRAYER,
        NOTIFICATION_CHANNELS.AT_TIME,
        NOTIFICATION_CHANNELS.MISSED_PRAYER,
        NOTIFICATION_CHANNELS.GENERAL,
      ];

      for (const channelId of requiredChannels) {
        const exists = await this.channelExists(channelId);
        if (!exists) {
          console.log(`Channel ${channelId} missing, creating...`);
          await this.createAllChannels();
          break; // createAllChannels creates all channels, so we can break
        }
      }
    } catch (error) {
      console.error('Error ensuring channels exist:', error);
      throw error;
    }
  }

  /**
   * Open channel settings for user to customize
   */
  async openChannelSettings(channelId: string): Promise<void> {
    if (Platform.OS !== 'android') {
      return;
    }

    try {
      await notifee.openNotificationSettings(channelId);
    } catch (error) {
      console.error(`Error opening channel settings ${channelId}:`, error);
      throw error;
    }
  }

  /**
   * Map our importance level to Android importance
   */
  private mapImportanceLevel(importance?: 'high' | 'default' | 'low' | 'min'): AndroidImportance {
    switch (importance) {
      case 'high':
        return AndroidImportance.HIGH;
      case 'default':
        return AndroidImportance.DEFAULT;
      case 'low':
        return AndroidImportance.LOW;
      case 'min':
        return AndroidImportance.MIN;
      default:
        return AndroidImportance.DEFAULT;
    }
  }

  /**
   * Reset all channels to defaults
   * Useful for troubleshooting or after major updates
   */
  async resetAllChannels(): Promise<void> {
    if (Platform.OS !== 'android') {
      return;
    }

    try {
      // Delete all existing channels
      const channels = await this.getAllChannels();
      for (const channel of channels) {
        await this.deleteChannel(channel.id);
      }

      // Recreate with defaults
      await this.createAllChannels();

      console.log('All channels reset successfully');
    } catch (error) {
      console.error('Error resetting channels:', error);
      throw error;
    }
  }
}

export default new NotificationChannelsService();
