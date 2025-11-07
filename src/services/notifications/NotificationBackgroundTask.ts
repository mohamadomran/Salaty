/**
 * Notification Background Task Service
 * Handles background execution of notification scheduling
 * Uses react-native-background-actions for iOS/Android compatibility
 */

import BackgroundService from 'react-native-background-actions';
import notifee, { EventType } from '@notifee/react-native';
import { NotificationScheduler } from './NotificationScheduler';
import { NotificationPreferencesService } from './NotificationPreferencesService';
import { PrayerTimeService } from '../PrayerTimeService';

/**
 * Background task options
 */
const backgroundOptions = {
  taskName: 'Salaty Notification Scheduler',
  taskTitle: 'Prayer Notifications',
  taskDesc: 'Keeping your prayer reminders up to date',
  taskIcon: {
    name: 'ic_launcher',
    type: 'mipmap',
  },
  color: '#006A6A',
  linkingURI: 'salaty://notifications',
  parameters: {
    delay: 60000, // Check every 60 seconds
  },
};

/**
 * Background task function
 * Runs periodically to ensure notifications are scheduled
 */
const backgroundTask = async (taskDataArguments: any) => {
  const { delay } = taskDataArguments;

  await new Promise(async (resolve) => {
    // This is an infinite loop that runs until the task is stopped
    for (let i = 0; BackgroundService.isRunning(); i++) {
      try {
        // Check if we need to reschedule
        const needsReschedule = await checkIfRescheduleNeeded();

        if (needsReschedule) {
          console.log('[BackgroundTask] Rescheduling notifications...');
          await NotificationScheduler.scheduleAllNotifications(7);
          console.log('[BackgroundTask] Rescheduling complete');
        }

        // Update notification to show task is running
        await BackgroundService.updateNotification({
          taskDesc: `Last check: ${new Date().toLocaleTimeString()}`,
        });

        // Wait for the specified delay
        await new Promise((resolve) => setTimeout(resolve, delay));
      } catch (error) {
        console.error('[BackgroundTask] Error:', error);
      }
    }
  });
};

/**
 * Check if notifications need to be rescheduled
 *
 * Reasons to reschedule:
 * 1. New day started (midnight passed)
 * 2. No notifications scheduled for upcoming days
 * 3. Location changed significantly
 * 4. Prayer time calculation changed
 */
async function checkIfRescheduleNeeded(): Promise<boolean> {
  try {
    // Check if notifications are enabled
    const preferences = await NotificationPreferencesService.getPreferences();
    if (!preferences.global.enabled) {
      console.log('[BackgroundTask] Notifications disabled, skipping reschedule');
      return false;
    }

    // Get notification status
    const status = await NotificationScheduler.getNotificationStatus();

    // If no notifications scheduled, reschedule
    if (!status.nextNotification) {
      console.log('[BackgroundTask] No notifications scheduled, needs reschedule');
      return true;
    }

    // Check if we crossed midnight (new day)
    const lastScheduleDate = await getLastScheduleDate();
    const currentDate = new Date().toISOString().split('T')[0];

    if (lastScheduleDate !== currentDate) {
      console.log('[BackgroundTask] New day detected, needs reschedule');
      await setLastScheduleDate(currentDate);
      return true;
    }

    // Check if we're running low on scheduled notifications (less than 2 days ahead)
    const nextNotificationTime = new Date(status.nextNotification.scheduledTime);
    const hoursUntilNext = (nextNotificationTime.getTime() - Date.now()) / (1000 * 60 * 60);

    if (hoursUntilNext > 48) {
      // More than 2 days ahead, no need to reschedule yet
      return false;
    }

    console.log('[BackgroundTask] Running low on scheduled notifications, needs reschedule');
    return true;
  } catch (error) {
    console.error('[BackgroundTask] Error checking reschedule:', error);
    return false;
  }
}

/**
 * Get last schedule date from storage
 */
async function getLastScheduleDate(): Promise<string | null> {
  try {
    const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
    return await AsyncStorage.getItem('@salaty:last_schedule_date');
  } catch (error) {
    return null;
  }
}

/**
 * Set last schedule date in storage
 */
async function setLastScheduleDate(date: string): Promise<void> {
  try {
    const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
    await AsyncStorage.setItem('@salaty:last_schedule_date', date);
  } catch (error) {
    console.error('[BackgroundTask] Error saving schedule date:', error);
  }
}

/**
 * Notification Background Task Service
 */
class NotificationBackgroundTaskService {
  /**
   * Start the background task
   * Should be called when notifications are enabled
   */
  static async start(): Promise<void> {
    try {
      if (BackgroundService.isRunning()) {
        console.log('[BackgroundTask] Already running, skipping start');
        return;
      }

      console.log('[BackgroundTask] Starting background service...');
      await BackgroundService.start(backgroundTask, backgroundOptions);
      console.log('[BackgroundTask] Background service started');
    } catch (error) {
      console.error('[BackgroundTask] Error starting service:', error);
      throw error;
    }
  }

  /**
   * Stop the background task
   * Should be called when notifications are disabled
   */
  static async stop(): Promise<void> {
    try {
      if (!BackgroundService.isRunning()) {
        console.log('[BackgroundTask] Not running, skipping stop');
        return;
      }

      console.log('[BackgroundTask] Stopping background service...');
      await BackgroundService.stop();
      console.log('[BackgroundTask] Background service stopped');
    } catch (error) {
      console.error('[BackgroundTask] Error stopping service:', error);
      throw error;
    }
  }

  /**
   * Check if background task is running
   */
  static isRunning(): boolean {
    return BackgroundService.isRunning();
  }

  /**
   * Update notification shown for background task
   */
  static async updateTaskNotification(message: string): Promise<void> {
    try {
      if (!BackgroundService.isRunning()) {
        return;
      }

      await BackgroundService.updateNotification({
        taskDesc: message,
      });
    } catch (error) {
      console.error('[BackgroundTask] Error updating notification:', error);
    }
  }
}

/**
 * Setup foreground notification handlers
 * Handles notification taps and actions
 */
export function setupNotificationHandlers(): void {
  // Handle foreground notifications
  notifee.onForegroundEvent(({ type, detail }) => {
    console.log('[NotificationHandler] Foreground event:', type, detail);

    switch (type) {
      case EventType.DISMISSED:
        console.log('[NotificationHandler] Notification dismissed:', detail.notification?.id);
        break;

      case EventType.PRESS:
        console.log('[NotificationHandler] Notification pressed:', detail.notification?.id);
        // Handle navigation based on notification data
        handleNotificationPress(detail.notification?.data);
        break;

      case EventType.ACTION_PRESS:
        console.log('[NotificationHandler] Action pressed:', detail.pressAction?.id);
        handleNotificationAction(detail.pressAction?.id, detail.notification?.data);
        break;
    }
  });

  // Handle background notifications (Android)
  notifee.onBackgroundEvent(async ({ type, detail }) => {
    console.log('[NotificationHandler] Background event:', type, detail);

    switch (type) {
      case EventType.PRESS:
        console.log('[NotificationHandler] Background press:', detail.notification?.id);
        handleNotificationPress(detail.notification?.data);
        break;

      case EventType.ACTION_PRESS:
        console.log('[NotificationHandler] Background action:', detail.pressAction?.id);
        handleNotificationAction(detail.pressAction?.id, detail.notification?.data);
        break;
    }
  });
}

/**
 * Handle notification press
 * Navigate to relevant screen based on notification type
 */
function handleNotificationPress(data?: Record<string, any>): void {
  if (!data) return;

  const { triggerType, prayerName } = data;

  console.log('[NotificationHandler] Handling press for:', triggerType, prayerName);

  // TODO: Navigate to appropriate screen
  // This will be implemented when we add navigation integration
  // For now, just log the action
}

/**
 * Handle notification action
 * Process quick actions from notification (e.g., "Mark as Prayed")
 */
function handleNotificationAction(actionId?: string, data?: Record<string, any>): void {
  if (!actionId || !data) return;

  console.log('[NotificationHandler] Handling action:', actionId, data);

  switch (actionId) {
    case 'mark_prayed':
      // TODO: Mark prayer as completed
      console.log('[NotificationHandler] Mark prayer as prayed:', data.prayerName);
      break;

    case 'snooze':
      // TODO: Snooze notification for X minutes
      console.log('[NotificationHandler] Snooze notification:', data.prayerName);
      break;

    case 'dismiss':
      console.log('[NotificationHandler] Dismiss notification:', data.prayerName);
      break;
  }
}

export default NotificationBackgroundTaskService;
