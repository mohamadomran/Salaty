/**
 * Notification Lifecycle Hook
 * Handles notification initialization, scheduling, and updates
 */

import { useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import {
  NotificationPermissions,
  NotificationChannels,
  NotificationScheduler,
  NotificationPreferencesService,
  NotificationBackgroundTask,
  setupNotificationHandlers,
} from '../services/notifications';

interface UseNotificationsOptions {
  /**
   * Whether to initialize notifications on mount
   * Default: true
   */
  autoInitialize?: boolean;

  /**
   * Number of days ahead to schedule notifications
   * Default: 7
   */
  daysAhead?: number;

  /**
   * Whether to reschedule on app foreground
   * Default: true
   */
  rescheduleOnForeground?: boolean;
}

interface UseNotificationsReturn {
  /**
   * Initialize notification system
   */
  initialize: () => Promise<void>;

  /**
   * Reschedule all notifications
   */
  reschedule: () => Promise<void>;

  /**
   * Check if notifications are initialized
   */
  isInitialized: boolean;
}

/**
 * Hook to manage notification lifecycle
 *
 * Features:
 * - Auto-initialization on app start
 * - Permission request flow
 * - Channel creation (Android)
 * - Initial notification scheduling
 * - App state change handling
 * - Automatic rescheduling when app comes to foreground
 *
 * @example
 * ```tsx
 * function App() {
 *   const { initialize, isInitialized } = useNotifications({
 *     autoInitialize: true,
 *     daysAhead: 7,
 *   });
 *
 *   // Manual initialization
 *   useEffect(() => {
 *     if (!isInitialized) {
 *       initialize();
 *     }
 *   }, []);
 * }
 * ```
 */
export function useNotifications(
  options: UseNotificationsOptions = {}
): UseNotificationsReturn {
  const {
    autoInitialize = true,
    daysAhead = 7,
    rescheduleOnForeground = true,
  } = options;

  const appState = useRef<AppStateStatus>(AppState.currentState);
  const isInitialized = useRef(false);
  const lastScheduleDate = useRef<string | null>(null);

  /**
   * Initialize notification system
   * 1. Setup notification handlers
   * 2. Request permissions
   * 3. Create channels (Android)
   * 4. Schedule initial notifications
   * 5. Start background task (optional)
   */
  const initialize = useCallback(async () => {
    if (isInitialized.current) {
      console.log('[useNotifications] Already initialized, skipping');
      return;
    }

    try {
      console.log('[useNotifications] Starting initialization...');

      // Step 1: Setup notification event handlers
      setupNotificationHandlers();
      console.log('[useNotifications] Notification handlers setup');

      // Step 2: Request permissions
      const permissionStatus = await NotificationPermissions.requestPermissions();
      console.log('[useNotifications] Permission status:', permissionStatus);

      if (permissionStatus !== 'granted') {
        console.warn('[useNotifications] Notification permission not granted');
        // Don't block initialization - user can grant later
      }

      // Step 3: Create notification channels (Android)
      await NotificationChannels.createAllChannels();
      console.log('[useNotifications] Notification channels created');

      // Step 4: Schedule notifications
      await scheduleNotifications();

      // Step 5: Start background task (optional - for advanced scenarios)
      // Note: Background task is primarily for ensuring daily reschedule
      // For most users, the app foreground check is sufficient
      // Uncomment if you need guaranteed background execution:
      // await NotificationBackgroundTask.start();
      // console.log('[useNotifications] Background task started');

      isInitialized.current = true;
      console.log('[useNotifications] Initialization complete ✅');
    } catch (error) {
      console.error('[useNotifications] Initialization error:', error);
      // Don't throw - allow app to continue even if notifications fail
    }
  }, [daysAhead]);

  /**
   * Schedule notifications for upcoming days
   */
  const scheduleNotifications = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Avoid rescheduling multiple times per day
      if (lastScheduleDate.current === today) {
        console.log('[useNotifications] Already scheduled for today');
        return;
      }

      console.log(`[useNotifications] Scheduling notifications for ${daysAhead} days...`);
      await NotificationScheduler.scheduleAllNotifications(daysAhead);

      lastScheduleDate.current = today;
      console.log('[useNotifications] Notifications scheduled successfully');
    } catch (error) {
      console.error('[useNotifications] Scheduling error:', error);
    }
  }, [daysAhead]);

  /**
   * Reschedule all notifications
   * Used when settings change or user requests refresh
   */
  const reschedule = useCallback(async () => {
    console.log('[useNotifications] Rescheduling notifications...');
    lastScheduleDate.current = null; // Force reschedule
    await scheduleNotifications();
  }, [scheduleNotifications]);

  /**
   * Handle app state changes
   * Reschedule notifications when app comes to foreground
   */
  const handleAppStateChange = useCallback(
    async (nextAppState: AppStateStatus) => {
      if (
        rescheduleOnForeground &&
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('[useNotifications] App came to foreground, checking notifications...');

        // Check if we need to reschedule (new day or preferences changed)
        const today = new Date().toISOString().split('T')[0];
        if (lastScheduleDate.current !== today) {
          await scheduleNotifications();
        }
      }

      appState.current = nextAppState;
    },
    [rescheduleOnForeground, scheduleNotifications]
  );

  /**
   * Auto-initialize on mount
   */
  useEffect(() => {
    if (autoInitialize) {
      initialize();
    }
  }, [autoInitialize, initialize]);

  /**
   * Listen to app state changes
   */
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [handleAppStateChange]);

  return {
    initialize,
    reschedule,
    isInitialized: isInitialized.current,
  };
}

/**
 * Hook to listen for prayer time updates and reschedule notifications
 *
 * Use this when:
 * - Location changes
 * - Calculation method changes
 * - Madhab settings change
 *
 * @example
 * ```tsx
 * function SettingsScreen() {
 *   const { rescheduleOnPrayerTimeChange } = usePrayerTimeNotifications();
 *
 *   const handleLocationChange = async (newLocation) => {
 *     await LocationService.updateLocation(newLocation);
 *     await rescheduleOnPrayerTimeChange();
 *   };
 * }
 * ```
 */
export function usePrayerTimeNotifications() {
  const rescheduleOnPrayerTimeChange = useCallback(async () => {
    console.log('[usePrayerTimeNotifications] Prayer times changed, rescheduling...');

    try {
      // Cancel all existing notifications
      await NotificationScheduler.cancelAll();

      // Reschedule with new prayer times
      await NotificationScheduler.scheduleAllNotifications(7);

      console.log('[usePrayerTimeNotifications] Rescheduling complete');
    } catch (error) {
      console.error('[usePrayerTimeNotifications] Rescheduling error:', error);
    }
  }, []);

  return {
    rescheduleOnPrayerTimeChange,
  };
}

/**
 * Hook to listen for notification preference changes and reschedule
 *
 * Use this in notification settings UI
 *
 * @example
 * ```tsx
 * function NotificationSettingsScreen() {
 *   const { rescheduleOnPreferenceChange } = useNotificationPreferences();
 *
 *   const handleToggleNotifications = async (enabled: boolean) => {
 *     await NotificationPreferencesService.toggleNotifications(enabled);
 *     await rescheduleOnPreferenceChange();
 *   };
 * }
 * ```
 */
export function useNotificationPreferences() {
  const rescheduleOnPreferenceChange = useCallback(async () => {
    console.log('[useNotificationPreferences] Preferences changed, rescheduling...');

    try {
      // Get current preferences
      const preferences = await NotificationPreferencesService.getPreferences();

      if (!preferences.global.enabled) {
        // If notifications disabled, cancel all
        console.log('[useNotificationPreferences] Notifications disabled, canceling all');
        await NotificationScheduler.cancelAll();
      } else {
        // If enabled, reschedule with new preferences
        console.log('[useNotificationPreferences] Rescheduling with new preferences');
        await NotificationScheduler.scheduleAllNotifications(7);
      }

      console.log('[useNotificationPreferences] Preference update complete');
    } catch (error) {
      console.error('[useNotificationPreferences] Preference update error:', error);
    }
  }, []);

  return {
    rescheduleOnPreferenceChange,
  };
}
