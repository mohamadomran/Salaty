/**
 * Location Service
 * Handles location requests and permissions for iOS and Android
 */

import { Platform, PermissionsAndroid } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { LocationError } from './LocationError';
import type {
  Coordinates,
  LocationData,
  LocationPermissionStatus,
} from '../../types';

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
  async getCurrentLocation(forceRefresh = false): Promise<LocationData | null> {
    try {
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
          throw new LocationError(
            'Location permission denied',
            'PERMISSION_DENIED',
            permission.canAskAgain,
          );
        }
      }

      // Get location with enhanced error handling
      return await this.getCurrentLocationFromGPS();
    } catch (error) {
      throw this.handleLocationError(error as Error);
    }
  }

  /**
   * Get location from GPS with proper error handling
   */
  private async getCurrentLocationFromGPS(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(
          new LocationError('Location request timed out', 'TIMEOUT', true),
        );
      }, 20000); // 20 second timeout

      Geolocation.getCurrentPosition(
        position => {
          clearTimeout(timeoutId);

          // Validate location data
          if (!this.isValidLocation(position)) {
            reject(
              new LocationError(
                'Invalid location data received',
                'INVALID_LOCATION',
                true,
              ),
            );
            return;
          }

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
          clearTimeout(timeoutId);
          console.error('GPS Location error:', error);
          reject(this.createLocationErrorFromGeolocationError(error));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        },
      );
    });
  }

  /**
   * Validate location data
   */
  private isValidLocation(position: any): boolean {
    if (!position || !position.coords) return false;

    const { latitude, longitude, accuracy } = position.coords;

    // Check if coordinates are valid
    if (typeof latitude !== 'number' || typeof longitude !== 'number')
      return false;
    if (latitude < -90 || latitude > 90) return false;
    if (longitude < -180 || longitude > 180) return false;

    // Check if accuracy is reasonable (not too high)
    if (accuracy && (accuracy < 0 || accuracy > 10000)) return false;

    return true;
  }

  /**
   * Create LocationError from Geolocation error
   */
  private createLocationErrorFromGeolocationError(error: any): LocationError {
    const code = error.code || error.PERMISSION_DENIED;
    const message = error.message || 'Unknown location error';

    switch (code) {
      case 1: // PERMISSION_DENIED
        return new LocationError(
          'Location permission denied by user',
          'PERMISSION_DENIED',
          false,
        );
      case 2: // POSITION_UNAVAILABLE
        return new LocationError(
          'Location information is unavailable',
          'POSITION_UNAVAILABLE',
          true,
        );
      case 3: // TIMEOUT
        return new LocationError('Location request timed out', 'TIMEOUT', true);
      default:
        return new LocationError(`Location error: ${message}`, 'UNKNOWN', true);
    }
  }

  /**
   * Handle and normalize location errors
   */
  private handleLocationError(error: Error): LocationError {
    if (error instanceof LocationError) {
      return error;
    }

    // Check for common error patterns
    const message = error.message.toLowerCase();

    if (message.includes('permission')) {
      return new LocationError(
        'Location permission required',
        'PERMISSION_DENIED',
        message.includes('can ask again'),
      );
    }

    if (message.includes('timeout')) {
      return new LocationError('Location request timed out', 'TIMEOUT', true);
    }

    if (message.includes('network') || message.includes('connection')) {
      return new LocationError(
        'Network error while getting location',
        'NETWORK_ERROR',
        true,
      );
    }

    return new LocationError(
      `Failed to get location: ${error.message}`,
      'UNKNOWN',
      true,
    );
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
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );

      return {
        granted,
        canAskAgain: true,
        status: granted ? 'granted' : 'denied',
      };
    } catch (error) {
      console.error('Android permission check error:', error);
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
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );

      return {
        granted: granted === PermissionsAndroid.RESULTS.GRANTED,
        canAskAgain: granted !== PermissionsAndroid.RESULTS.DENIED_FOREVER,
        status:
          granted === PermissionsAndroid.RESULTS.GRANTED ? 'granted' : 'denied',
      };
    } catch (error) {
      console.error('Android permission request error:', error);
      return {
        granted: false,
        canAskAgain: true,
        status: 'denied',
      };
    }
  }
}

export default new LocationService();
