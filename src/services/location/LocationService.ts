/**
 * Location Service
 * Handles location requests and permissions for iOS and Android
 */

import { Platform, PermissionsAndroid } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import type {
  Coordinates,
  LocationData,
  LocationPermissionStatus,
} from '@types';

class LocationService {
  private cachedLocation: LocationData | null = null;
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes
  private lastFetchTime = 0;

  /**
   * Check if location permission is granted
   */
  async checkPermission(): Promise<LocationPermissionStatus> {
    if (Platform.OS === 'ios') {
      return this.checkIOSPermission();
    } else {
      return this.checkAndroidPermission();
    }
  }

  /**
   * Request location permission
   */
  async requestPermission(): Promise<LocationPermissionStatus> {
    if (Platform.OS === 'ios') {
      return this.requestIOSPermission();
    } else {
      return this.requestAndroidPermission();
    }
  }

  /**
   * Get current location
   * Uses cached location if available and fresh
   */
  async getCurrentLocation(
    forceRefresh = false
  ): Promise<LocationData | null> {
    // Check cache first
    const now = Date.now();
    if (
      !forceRefresh &&
      this.cachedLocation &&
      now - this.lastFetchTime < this.cacheTimeout
    ) {
      return this.cachedLocation;
    }

    // Check permission
    const permission = await this.checkPermission();
    if (!permission.granted) {
      // Try to request permission
      const requestResult = await this.requestPermission();
      if (!requestResult.granted) {
        throw new Error('Location permission denied');
      }
    }

    // Get location
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude ?? undefined,
            heading: position.coords.heading ?? undefined,
            speed: position.coords.speed ?? undefined,
            timestamp: position.timestamp,
          };

          this.cachedLocation = locationData;
          this.lastFetchTime = Date.now();
          resolve(locationData);
        },
        error => {
          console.error('Location error:', error);
          reject(new Error(`Location error: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    });
  }

  /**
   * Get simple coordinates
   */
  async getCoordinates(forceRefresh = false): Promise<Coordinates | null> {
    const location = await this.getCurrentLocation(forceRefresh);
    if (!location) return null;

    return {
      latitude: location.latitude,
      longitude: location.longitude,
    };
  }

  /**
   * Clear cached location
   */
  clearCache(): void {
    this.cachedLocation = null;
    this.lastFetchTime = 0;
  }

  /**
   * iOS permission check
   */
  private async checkIOSPermission(): Promise<LocationPermissionStatus> {
    return new Promise(resolve => {
      Geolocation.requestAuthorization('whenInUse')
        .then(status => {
          const granted = status === 'granted';
          resolve({
            granted,
            canAskAgain: status !== 'disabled',
            status: status as any,
          });
        })
        .catch(error => {
          console.error('iOS permission check error:', error);
          resolve({
            granted: false,
            canAskAgain: true,
            status: 'denied',
          });
        });
    });
  }

  /**
   * iOS permission request
   */
  private async requestIOSPermission(): Promise<LocationPermissionStatus> {
    return new Promise(resolve => {
      Geolocation.requestAuthorization('whenInUse')
        .then(status => {
          const granted = status === 'granted';
          resolve({
            granted,
            canAskAgain: status !== 'disabled',
            status: status as any,
          });
        })
        .catch(error => {
          console.error('iOS permission request error:', error);
          resolve({
            granted: false,
            canAskAgain: true,
            status: 'denied',
          });
        });
    });
  }

  /**
   * Android permission check
   */
  private async checkAndroidPermission(): Promise<LocationPermissionStatus> {
    try {
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );

      return {
        granted,
        canAskAgain: true,
        status: granted ? 'granted' : 'denied',
      };
    } catch (error) {
      console.error('Permission check error:', error);
      return {
        granted: false,
        canAskAgain: true,
        status: 'denied',
      };
    }
  }

  /**
   * Android permission request
   */
  private async requestAndroidPermission(): Promise<LocationPermissionStatus> {
    try {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'Salaty needs access to your location to calculate prayer times',
          buttonPositive: 'Allow',
          buttonNegative: 'Deny',
        }
      );

      const granted = result === PermissionsAndroid.RESULTS.GRANTED;

      return {
        granted,
        canAskAgain: result !== PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN,
        status: granted ? 'granted' : result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN ? 'blocked' : 'denied',
      };
    } catch (error) {
      console.error('Permission request error:', error);
      return {
        granted: false,
        canAskAgain: true,
        status: 'denied',
      };
    }
  }

  /**
   * Watch location changes (for future features)
   */
  watchLocation(
    callback: (location: LocationData) => void,
    errorCallback?: (error: Error) => void
  ): number {
    return Geolocation.watchPosition(
      position => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude ?? undefined,
          heading: position.coords.heading ?? undefined,
          speed: position.coords.speed ?? undefined,
          timestamp: position.timestamp,
        };
        callback(locationData);
      },
      error => {
        console.error('Watch location error:', error);
        errorCallback?.(new Error(`Location error: ${error.message}`));
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 100, // Update every 100 meters
        interval: 10000, // Update every 10 seconds
        fastestInterval: 5000,
      }
    );
  }

  /**
   * Stop watching location
   */
  clearWatch(watchId: number): void {
    Geolocation.clearWatch(watchId);
  }
}

export default new LocationService();
