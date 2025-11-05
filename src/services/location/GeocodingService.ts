/**
 * Geocoding Service
 * Converts city names to coordinates using OpenStreetMap Nominatim API
 */

import type { Coordinates } from '../../types';

export interface GeocodingResult {
  name: string;
  displayName: string;
  coordinates: Coordinates;
  country: string;
  state?: string;
}

class GeocodingServiceClass {
  private static instance: GeocodingServiceClass;
  private readonly BASE_URL = 'https://nominatim.openstreetmap.org';

  private constructor() {}

  public static getInstance(): GeocodingServiceClass {
    if (!GeocodingServiceClass.instance) {
      GeocodingServiceClass.instance = new GeocodingServiceClass();
    }
    return GeocodingServiceClass.instance;
  }

  /**
   * Search for locations by city name
   */
  public async searchLocation(query: string): Promise<GeocodingResult[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    try {
      const url = new URL(`${this.BASE_URL}/search`);
      url.searchParams.append('q', query.trim());
      url.searchParams.append('format', 'json');
      url.searchParams.append('limit', '5');
      url.searchParams.append('addressdetails', '1');

      const response = await fetch(url.toString(), {
        headers: {
          'User-Agent': 'Salaty-Prayer-App/1.0',
        },
      });

      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
      }

      const data = await response.json();

      return data.map((item: any) => ({
        name: item.address?.city || item.address?.town || item.address?.village || item.name,
        displayName: item.display_name,
        coordinates: {
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
        },
        country: item.address?.country || '',
        state: item.address?.state,
      }));
    } catch (error) {
      console.error('Geocoding error:', error);
      throw error;
    }
  }

  /**
   * Get location details from coordinates (reverse geocoding)
   */
  public async reverseGeocode(
    coordinates: Coordinates,
  ): Promise<GeocodingResult | null> {
    try {
      const url = new URL(`${this.BASE_URL}/reverse`);
      url.searchParams.append('lat', String(coordinates.latitude));
      url.searchParams.append('lon', String(coordinates.longitude));
      url.searchParams.append('format', 'json');
      url.searchParams.append('addressdetails', '1');

      const response = await fetch(url.toString(), {
        headers: {
          'User-Agent': 'Salaty-Prayer-App/1.0',
        },
      });

      if (!response.ok) {
        throw new Error(`Reverse geocoding error: ${response.status}`);
      }

      const data = await response.json();

      return {
        name: data.address?.city || data.address?.town || data.address?.village || data.name,
        displayName: data.display_name,
        coordinates: {
          latitude: parseFloat(data.lat),
          longitude: parseFloat(data.lon),
        },
        country: data.address?.country || '',
        state: data.address?.state,
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  }
}

export const GeocodingService = GeocodingServiceClass.getInstance();
