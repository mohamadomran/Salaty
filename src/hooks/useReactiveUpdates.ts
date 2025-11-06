/**
 * Reactive Updates Hook
 * Provides easy subscription to AppContext events for reactive UI updates
 */

import { useEffect } from 'react';
import { useAppContext, AppEventType } from '../contexts';

interface UseReactiveUpdatesOptions {
  onPrayerStatusChanged?: (data: any) => void;
  onLocationChanged?: (data: any) => void;
  onSettingsChanged?: (data: any) => void;
  onPrayerTimesUpdated?: (data: any) => void;
  onQadaDebtChanged?: (data: any) => void;
  onAppForegrounded?: (data: any) => void;
}

/**
 * Hook for subscribing to reactive updates from AppContext
 * Automatically handles subscription cleanup
 */
export const useReactiveUpdates = (options: UseReactiveUpdatesOptions = {}) => {
  const { subscribe } = useAppContext();

  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    // Subscribe to prayer status changes
    if (options.onPrayerStatusChanged) {
      const unsubscribe = subscribe(
        AppEventType.PRAYER_STATUS_CHANGED,
        options.onPrayerStatusChanged
      );
      unsubscribers.push(unsubscribe);
    }

    // Subscribe to location changes
    if (options.onLocationChanged) {
      const unsubscribe = subscribe(
        AppEventType.LOCATION_CHANGED,
        options.onLocationChanged
      );
      unsubscribers.push(unsubscribe);
    }

    // Subscribe to settings changes
    if (options.onSettingsChanged) {
      const unsubscribe = subscribe(
        AppEventType.SETTINGS_CHANGED,
        options.onSettingsChanged
      );
      unsubscribers.push(unsubscribe);
    }

    // Subscribe to prayer times updates
    if (options.onPrayerTimesUpdated) {
      const unsubscribe = subscribe(
        AppEventType.PRAYER_TIMES_UPDATED,
        options.onPrayerTimesUpdated
      );
      unsubscribers.push(unsubscribe);
    }

    // Subscribe to Qada debt changes
    if (options.onQadaDebtChanged) {
      const unsubscribe = subscribe(
        AppEventType.QADA_DEBT_CHANGED,
        options.onQadaDebtChanged
      );
      unsubscribers.push(unsubscribe);
    }

    // Subscribe to app foregrounded
    if (options.onAppForegrounded) {
      const unsubscribe = subscribe(
        AppEventType.APP_FOREGROUNDED,
        options.onAppForegrounded
      );
      unsubscribers.push(unsubscribe);
    }

    // Cleanup all subscriptions on unmount
    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [subscribe, options]);
};

/**
 * Hook for prayer-specific reactive updates
 * Simplifies common prayer tracking scenarios
 */
export const usePrayerReactiveUpdates = (onPrayerStatusChanged?: (data: any) => void) => {
  return useReactiveUpdates({
    onPrayerStatusChanged,
    onPrayerTimesUpdated: (data: any) => {
      console.log('Prayer times updated:', data);
    },
    onLocationChanged: (data: any) => {
      console.log('Location changed, prayer times may update:', data);
    },
  });
};

/**
 * Hook for settings-specific reactive updates
 * Simplifies settings management scenarios
 */
export const useSettingsReactiveUpdates = (onSettingsChanged?: (data: any) => void) => {
  return useReactiveUpdates({
    onSettingsChanged,
    onLocationChanged: (data: any) => {
      console.log('Location changed, settings may need refresh:', data);
    },
  });
};

/**
 * Hook for location-specific reactive updates
 * Simplifies location management scenarios
 */
export const useLocationReactiveUpdates = (onLocationChanged?: (data: any) => void) => {
  return useReactiveUpdates({
    onLocationChanged,
    onPrayerTimesUpdated: (data: any) => {
      console.log('Prayer times updated due to location change:', data);
    },
  });
};