/**
 * Location Preference Service
 * Stores and retrieves user's location preference
 */

import StorageService from '../storage/StorageService';
import type { Coordinates } from '../../types';

export type LocationSource = 'gps' | 'manual' | 'none';

export interface LocationPreference {
  source: LocationSource;
  coordinates?: Coordinates;
  cityName?: string;
  displayName?: string;
  country?: string;
  setupCompleted: boolean;
}

class LocationPreferenceServiceClass {
  private static instance: LocationPreferenceServiceClass;
  private readonly STORAGE_KEY = '@salaty:location_preference';
  private storageService: typeof StorageService;

  private constructor() {
    this.storageService = StorageService;
  }

  public static getInstance(): LocationPreferenceServiceClass {
    if (!LocationPreferenceServiceClass.instance) {
      LocationPreferenceServiceClass.instance =
        new LocationPreferenceServiceClass();
    }
    return LocationPreferenceServiceClass.instance;
  }

  /**
   * Get user's location preference
   */
  public async getLocationPreference(): Promise<LocationPreference> {
    try {
      const stored = await this.storageService.getItem<string>(
        this.STORAGE_KEY,
      );

      if (stored) {
        return JSON.parse(stored);
      }

      // Default: not set up yet
      return {
        source: 'none',
        setupCompleted: false,
      };
    } catch (error) {
      console.error('Error loading location preference:', error);
      return {
        source: 'none',
        setupCompleted: false,
      };
    }
  }

  /**
   * Save GPS location preference
   */
  public async setGPSPreference(coordinates: Coordinates): Promise<void> {
    const preference: LocationPreference = {
      source: 'gps',
      coordinates,
      setupCompleted: true,
    };

    await this.storageService.setItem(
      this.STORAGE_KEY,
      JSON.stringify(preference),
    );
  }

  /**
   * Save manual location preference
   */
  public async setManualLocation(
    coordinates: Coordinates,
    cityName: string,
    displayName: string,
    country?: string,
  ): Promise<void> {
    const preference: LocationPreference = {
      source: 'manual',
      coordinates,
      cityName,
      displayName,
      country,
      setupCompleted: true,
    };

    await this.storageService.setItem(
      this.STORAGE_KEY,
      JSON.stringify(preference),
    );
  }

  /**
   * Check if location setup is completed
   */
  public async isSetupCompleted(): Promise<boolean> {
    const preference = await this.getLocationPreference();
    return preference.setupCompleted;
  }

  /**
   * Clear location preference (for resetting)
   */
  public async clearPreference(): Promise<void> {
    await this.storageService.removeItem(this.STORAGE_KEY);
  }

  /**
   * Get stored coordinates (from either GPS or manual)
   */
  public async getStoredCoordinates(): Promise<Coordinates | null> {
    const preference = await this.getLocationPreference();
    return preference.coordinates || null;
  }
}

export const LocationPreferenceService =
  LocationPreferenceServiceClass.getInstance();
