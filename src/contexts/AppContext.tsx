/**
 * App State Context
 * Global state management for instant app-wide updates
 * Provides reactive updates for prayer status, location, and settings changes
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
  useRef,
} from 'react';
import { AppState as RNAppState, AppStateStatus } from 'react-native';
import { PrayerTimes, PrayerName, Coordinates, AppSettings, DailyPrayerRecord } from '../types';
import { PrayerService } from '../services/prayer';
import { SettingsService } from '../services/settings';
import { LocationPreferenceService } from '../services/location';
import { TrackingService } from '../services/tracking';

// Event types for global state updates
export enum AppEventType {
  PRAYER_STATUS_CHANGED = 'PRAYER_STATUS_CHANGED',
  LOCATION_CHANGED = 'LOCATION_CHANGED',
  SETTINGS_CHANGED = 'SETTINGS_CHANGED',
  PRAYER_TIMES_UPDATED = 'PRAYER_TIMES_UPDATED',
  QADA_DEBT_CHANGED = 'QADA_DEBT_CHANGED',
  APP_FOREGROUNDED = 'APP_FOREGROUNDED',
}

// Event data structure
interface AppEvent {
  type: AppEventType;
  data?: any;
  timestamp: number;
}

// Global state interface
interface AppState {
  prayerTimes: PrayerTimes | null;
  currentPrayer: PrayerName | null;
  nextPrayer: { name: PrayerName; time: Date } | null;
  location: Coordinates | null;
  locationName: string;
  settings: AppSettings | null;
  dailyRecord: DailyPrayerRecord | null;
  isLoading: boolean;
  lastUpdated: number;
}

// Context interface
interface AppContextType {
  state: AppState;
  updatePrayerStatus: (prayerName: PrayerName, status: string, date?: Date) => Promise<void>;
  updateLocation: (location: Coordinates, locationName: string) => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  refreshPrayerTimes: () => Promise<void>;
  refreshDailyRecord: () => Promise<void>;
  subscribe: (eventType: AppEventType, callback: (data?: any) => void) => () => void;
  emit: (eventType: AppEventType, data?: any) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    prayerTimes: null,
    currentPrayer: null,
    nextPrayer: null,
    location: null,
    locationName: '',
    settings: null,
    dailyRecord: null,
    isLoading: true,
    lastUpdated: Date.now(),
  });

  // Event listeners management
  const listeners = useRef<Map<AppEventType, Set<Function>>>(new Map());

  // Subscribe to events
  const subscribe = useCallback((eventType: AppEventType, callback: (data?: any) => void) => {
    if (!listeners.current.has(eventType)) {
      listeners.current.set(eventType, new Set());
    }
    listeners.current.get(eventType)!.add(callback);

    // Return unsubscribe function
    return () => {
      const eventListeners = listeners.current.get(eventType);
      if (eventListeners) {
        eventListeners.delete(callback);
        if (eventListeners.size === 0) {
          listeners.current.delete(eventType);
        }
      }
    };
  }, []);

  // Emit events to all subscribers
  const emit = useCallback((eventType: AppEventType, data?: any) => {
    const eventListeners = listeners.current.get(eventType);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${eventType}:`, error);
        }
      });
    }
  }, []);

  // Update prayer status with instant propagation
  const updatePrayerStatus = useCallback(async (
    prayerName: PrayerName, 
    status: string, 
    date: Date = new Date()
  ) => {
    try {
      // Update in tracking service
      await TrackingService.updatePrayerStatus(prayerName, status as any, date);

      // Update local state immediately
      setState(prevState => {
        if (!prevState.dailyRecord) return prevState;
        
        const updatedRecord = {
          ...prevState.dailyRecord,
          prayers: {
            ...prevState.dailyRecord.prayers,
            [prayerName]: {
              ...prevState.dailyRecord.prayers[prayerName],
              status: status as any,
              completedAt: (status === 'completed' || status === 'delayed') ? new Date() : undefined,
              wasDelayed: status === 'delayed',
            },
          },
          updatedAt: new Date(),
        };

        return {
          ...prevState,
          dailyRecord: updatedRecord,
          lastUpdated: Date.now(),
        };
      });

      // Emit event for instant UI updates across all screens
      emit(AppEventType.PRAYER_STATUS_CHANGED, {
        prayerName,
        status,
        date,
        timestamp: Date.now(),
      });

    } catch (error) {
      console.error('Error updating prayer status:', error);
      throw error;
    }
  }, [emit]);

  // Update location with instant propagation
  const updateLocation = useCallback(async (location: Coordinates, locationName: string) => {
    try {
      // Save to storage
      await LocationPreferenceService.setManualLocation(location, locationName, locationName);

      // Fetch new prayer times for updated location
      const newPrayerTimes = await PrayerService.getPrayerTimes(location, new Date());
      const currentPrayer = PrayerService.getCurrentPrayer(newPrayerTimes);
      const nextPrayer = await PrayerService.getNextPrayer(newPrayerTimes, location);

      // Update state immediately
      setState(prevState => ({
        ...prevState,
        location,
        locationName,
        prayerTimes: newPrayerTimes,
        currentPrayer,
        nextPrayer,
        lastUpdated: Date.now(),
      }));

      // Emit event for instant UI updates
      emit(AppEventType.LOCATION_CHANGED, {
        location,
        locationName,
        prayerTimes: newPrayerTimes,
        timestamp: Date.now(),
      });

    } catch (error) {
      console.error('Error updating location:', error);
      throw error;
    }
  }, [emit]);

  // Update settings with instant propagation
  const updateSettings = useCallback(async (newSettings: Partial<AppSettings>) => {
    try {
      // Get current settings and merge with new ones
      const currentSettings = state.settings || await SettingsService.getSettings();
      const updatedSettings = { ...currentSettings, ...newSettings };

      // Save to storage
      await SettingsService.updateSettings(updatedSettings);

      // Update state immediately
      setState(prevState => ({
        ...prevState,
        settings: updatedSettings,
        lastUpdated: Date.now(),
      }));

      // Emit event for instant UI updates
      emit(AppEventType.SETTINGS_CHANGED, {
        settings: updatedSettings,
        changedKeys: Object.keys(newSettings),
        timestamp: Date.now(),
      });

      // If location-related settings changed, refresh prayer times
      if (newSettings.calculationMethod || newSettings.madhab) {
        if (state.location) {
          await updateLocation(state.location, state.locationName);
        }
      }

    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  }, [state.settings, state.location, state.locationName, updateLocation, emit]);

  // Refresh prayer times
  const refreshPrayerTimes = useCallback(async () => {
    if (!state.location) return;

    try {
      const newPrayerTimes = await PrayerService.getPrayerTimes(state.location, new Date());
      const currentPrayer = PrayerService.getCurrentPrayer(newPrayerTimes);
      const nextPrayer = await PrayerService.getNextPrayer(newPrayerTimes, state.location);

      setState(prevState => ({
        ...prevState,
        prayerTimes: newPrayerTimes,
        currentPrayer,
        nextPrayer,
        lastUpdated: Date.now(),
      }));

      emit(AppEventType.PRAYER_TIMES_UPDATED, {
        prayerTimes: newPrayerTimes,
        currentPrayer,
        nextPrayer,
        timestamp: Date.now(),
      });

    } catch (error) {
      console.error('Error refreshing prayer times:', error);
    }
  }, [state.location, emit]);

  // Refresh daily record
  const refreshDailyRecord = useCallback(async () => {
    try {
      const dailyRecord = await TrackingService.getDailyRecord(new Date());
      
      setState(prevState => ({
        ...prevState,
        dailyRecord,
        lastUpdated: Date.now(),
      }));

    } catch (error) {
      console.error('Error refreshing daily record:', error);
    }
  }, []);

  // Initialize app state
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Load settings and location in parallel
        const [settings, locationPreference] = await Promise.all([
          SettingsService.getSettings(),
          LocationPreferenceService.getLocationPreference(),
        ]);

        // Load prayer times and daily record
        const prayerTimes = locationPreference.coordinates 
          ? await PrayerService.getPrayerTimes(locationPreference.coordinates, new Date())
          : null;

        const currentPrayer = prayerTimes ? PrayerService.getCurrentPrayer(prayerTimes) : null;
        const nextPrayer = prayerTimes && locationPreference.coordinates 
          ? await PrayerService.getNextPrayer(prayerTimes, locationPreference.coordinates)
          : null;

        const dailyRecord = await TrackingService.getDailyRecord(new Date());

        setState({
          prayerTimes,
          currentPrayer,
          nextPrayer,
          location: locationPreference.coordinates || null,
          locationName: locationPreference.cityName || locationPreference.displayName || '',
          settings,
          dailyRecord,
          isLoading: false,
          lastUpdated: Date.now(),
        });

      } catch (error) {
        console.error('Error initializing app state:', error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initializeApp();
  }, []);

  // Handle app state changes (foreground/background)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // App came to foreground, refresh data
        refreshPrayerTimes();
        refreshDailyRecord();
        
        emit(AppEventType.APP_FOREGROUNDED, {
          timestamp: Date.now(),
        });
      }
    };

    const subscription = RNAppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [refreshPrayerTimes, refreshDailyRecord, emit]);

  // Auto-refresh prayer times every minute
  useEffect(() => {
    const interval = setInterval(() => {
      refreshPrayerTimes();
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, [refreshPrayerTimes]);

  const contextValue: AppContextType = {
    state,
    updatePrayerStatus,
    updateLocation,
    updateSettings,
    refreshPrayerTimes,
    refreshDailyRecord,
    subscribe,
    emit,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};