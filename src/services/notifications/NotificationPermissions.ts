/**
 * Notification Permissions Service
 * Handles notification permission requests and status checks for Android/iOS
 */

import { Platform, PermissionsAndroid, Linking, Alert } from 'react-native';
import notifee, { AuthorizationStatus } from '@notifee/react-native';
import StorageService, { STORAGE_KEYS } from '../storage/StorageService';
import { NotificationPermissionStatus } from '../../types/notifications';

class NotificationPermissionsService {
  /**
   * Request notification permissions
   * Handles both Android 13+ and iOS permission flows
   */
  async requestPermissions(): Promise<NotificationPermissionStatus> {
    try {
      if (Platform.OS === 'android') {
        return await this.requestAndroidPermissions();
      } else if (Platform.OS === 'ios') {
        return await this.requestIOSPermissions();
      }

      return 'not_determined';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      throw error;
    }
  }

  /**
   * Request Android notification permissions
   * Android 13+ requires POST_NOTIFICATIONS permission
   */
  private async requestAndroidPermissions(): Promise<NotificationPermissionStatus> {
    try {
      // Android 13 (API 33) and above requires runtime permission
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Prayer Notification Permission',
            message: 'Salaty needs notification permission to remind you of prayer times',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Deny',
            buttonPositive: 'Allow',
          }
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          await this.savePermissionStatus('granted');
          return 'granted';
        } else if (granted === PermissionsAndroid.RESULTS.DENIED) {
          await this.savePermissionStatus('denied');
          return 'denied';
        } else {
          await this.savePermissionStatus('not_determined');
          return 'not_determined';
        }
      }

      // Android 12 and below - permissions granted by default at install
      await this.savePermissionStatus('granted');
      return 'granted';
    } catch (error) {
      console.error('Error requesting Android permissions:', error);
      await this.savePermissionStatus('denied');
      return 'denied';
    }
  }

  /**
   * Request iOS notification permissions
   * Uses Notifee for iOS permission handling
   */
  private async requestIOSPermissions(): Promise<NotificationPermissionStatus> {
    try {
      const settings = await notifee.requestPermission({
        sound: true,
        badge: true,
        alert: true,
        criticalAlert: false,
      });

      const status = this.mapIOSAuthorizationStatus(settings.authorizationStatus);
      await this.savePermissionStatus(status);
      return status;
    } catch (error) {
      console.error('Error requesting iOS permissions:', error);
      await this.savePermissionStatus('denied');
      return 'denied';
    }
  }

  /**
   * Check current notification permission status
   * Does not request permissions, only checks status
   */
  async checkPermissionStatus(): Promise<NotificationPermissionStatus> {
    try {
      if (Platform.OS === 'android') {
        return await this.checkAndroidPermissionStatus();
      } else if (Platform.OS === 'ios') {
        return await this.checkIOSPermissionStatus();
      }

      return 'not_determined';
    } catch (error) {
      console.error('Error checking notification permissions:', error);
      return 'not_determined';
    }
  }

  /**
   * Check Android notification permission status
   */
  private async checkAndroidPermissionStatus(): Promise<NotificationPermissionStatus> {
    try {
      // Android 13+ requires POST_NOTIFICATIONS permission
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        return granted ? 'granted' : 'denied';
      }

      // Android 12 and below - check channel settings via Notifee
      const settings = await notifee.getNotificationSettings();

      if (settings.android.alarm === AuthorizationStatus.AUTHORIZED) {
        return 'granted';
      } else if (settings.android.alarm === AuthorizationStatus.DENIED) {
        return 'denied';
      }

      return 'not_determined';
    } catch (error) {
      console.error('Error checking Android permission status:', error);
      return 'not_determined';
    }
  }

  /**
   * Check iOS notification permission status
   */
  private async checkIOSPermissionStatus(): Promise<NotificationPermissionStatus> {
    try {
      const settings = await notifee.getNotificationSettings();
      return this.mapIOSAuthorizationStatus(settings.authorizationStatus);
    } catch (error) {
      console.error('Error checking iOS permission status:', error);
      return 'not_determined';
    }
  }

  /**
   * Map iOS authorization status to our internal status type
   */
  private mapIOSAuthorizationStatus(
    status: AuthorizationStatus
  ): NotificationPermissionStatus {
    switch (status) {
      case AuthorizationStatus.AUTHORIZED:
        return 'granted';
      case AuthorizationStatus.DENIED:
        return 'denied';
      case AuthorizationStatus.PROVISIONAL:
        return 'provisional';
      case AuthorizationStatus.NOT_DETERMINED:
      default:
        return 'not_determined';
    }
  }

  /**
   * Open app notification settings
   * Directs user to system settings to manually enable notifications
   */
  async openNotificationSettings(): Promise<void> {
    try {
      await notifee.openNotificationSettings();
    } catch (error) {
      console.error('Error opening notification settings:', error);
      // Fallback to app settings
      Linking.openSettings();
    }
  }

  /**
   * Show permission rationale dialog
   * Explains why notifications are needed before requesting
   */
  showPermissionRationale(
    onAccept: () => void,
    onDecline: () => void
  ): void {
    Alert.alert(
      'Enable Prayer Notifications',
      'Salaty would like to send you notifications to remind you of prayer times. Stay on track with your daily prayers.',
      [
        {
          text: 'Not Now',
          style: 'cancel',
          onPress: onDecline,
        },
        {
          text: 'Enable',
          onPress: onAccept,
        },
      ],
      { cancelable: true }
    );
  }

  /**
   * Show settings prompt when permissions are denied
   * Guides user to manually enable notifications in settings
   */
  showSettingsPrompt(): void {
    Alert.alert(
      'Notifications Disabled',
      'Prayer notifications are currently disabled. Would you like to enable them in settings?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Open Settings',
          onPress: () => this.openNotificationSettings(),
        },
      ],
      { cancelable: true }
    );
  }

  /**
   * Check if permissions should be requested
   * Returns true if we should ask for permissions (not already denied permanently)
   */
  async shouldRequestPermissions(): Promise<boolean> {
    const status = await this.checkPermissionStatus();

    // Don't request if already granted
    if (status === 'granted' || status === 'provisional') {
      return false;
    }

    // Check if user has permanently denied (only relevant on Android)
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const neverAskAgain = await this.hasUserPermanentlyDenied();
      if (neverAskAgain) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if user has permanently denied permissions (Android)
   * On Android, after denying twice, the system won't show the dialog again
   */
  private async hasUserPermanentlyDenied(): Promise<boolean> {
    try {
      // This is a heuristic - check if denied and rationale should not be shown
      const status = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );

      if (!status) {
        // Permission is denied, but we can't directly check "never ask again"
        // Store denial count in storage as workaround
        const denialCount = await this.getPermissionDenialCount();
        return denialCount >= 2;
      }

      return false;
    } catch (error) {
      console.error('Error checking permanent denial:', error);
      return false;
    }
  }

  /**
   * Increment permission denial count
   * Used to track how many times user has denied permissions
   */
  async incrementDenialCount(): Promise<void> {
    try {
      const count = await this.getPermissionDenialCount();
      await StorageService.setItem(
        STORAGE_KEYS.NOTIFICATION_PERMISSION_STATUS,
        { denialCount: count + 1, lastDenied: new Date().toISOString() }
      );
    } catch (error) {
      console.error('Error incrementing denial count:', error);
    }
  }

  /**
   * Get permission denial count
   */
  private async getPermissionDenialCount(): Promise<number> {
    try {
      const data = await StorageService.getItem<{
        denialCount: number;
        lastDenied: string;
      }>(STORAGE_KEYS.NOTIFICATION_PERMISSION_STATUS);

      return data?.denialCount || 0;
    } catch (error) {
      console.error('Error getting denial count:', error);
      return 0;
    }
  }

  /**
   * Save permission status to storage
   */
  private async savePermissionStatus(
    status: NotificationPermissionStatus
  ): Promise<void> {
    try {
      await StorageService.setItem(STORAGE_KEYS.NOTIFICATION_PERMISSION_STATUS, {
        status,
        lastChecked: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error saving permission status:', error);
    }
  }

  /**
   * Get saved permission status from storage
   */
  async getSavedPermissionStatus(): Promise<NotificationPermissionStatus | null> {
    try {
      const data = await StorageService.getItem<{
        status: NotificationPermissionStatus;
        lastChecked: string;
      }>(STORAGE_KEYS.NOTIFICATION_PERMISSION_STATUS);

      return data?.status || null;
    } catch (error) {
      console.error('Error getting saved permission status:', error);
      return null;
    }
  }

  /**
   * Reset permission denial tracking
   * Call this when user grants permissions from settings
   */
  async resetDenialTracking(): Promise<void> {
    try {
      await StorageService.removeItem(STORAGE_KEYS.NOTIFICATION_PERMISSION_STATUS);
    } catch (error) {
      console.error('Error resetting denial tracking:', error);
    }
  }
}

export default new NotificationPermissionsService();
