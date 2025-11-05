/**
 * Geocoding Service
 * Converts city names to coordinates using multiple geocoding APIs with fallback
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

  // Primary: Nominatim (OpenStreetMap)
  private readonly NOMINATIM_URL = 'https://nominatim.openstreetmap.org';

  // Fallback: Geocoding API (Free tier, no key required)
  private readonly GEOCODING_API_URL = 'https://geocode.maps.co';

  private constructor() {}

  public static getInstance(): GeocodingServiceClass {
    if (!GeocodingServiceClass.instance) {
      GeocodingServiceClass.instance = new GeocodingServiceClass();
    }
    return GeocodingServiceClass.instance;
  }

  /**
   * Try Nominatim first, fallback to geocode.maps.co
   */
  private async searchWithFallback(query: string): Promise<any[]> {
    // Try Nominatim first
    try {
      console.log('Trying Nominatim geocoding...');
      const nominatimResults = await this.searchNominatim(query);
      if (nominatimResults.length > 0) {
        console.log('✓ Nominatim succeeded');
        return nominatimResults;
      }
    } catch (error) {
      console.warn('Nominatim failed, trying fallback:', error);
    }

    // Fallback to geocode.maps.co
    try {
      console.log('Trying geocode.maps.co fallback...');
      const fallbackResults = await this.searchGeocodeMaps(query);
      if (fallbackResults.length > 0) {
        console.log('✓ Fallback succeeded');
        return fallbackResults;
      }
    } catch (error) {
      console.error('All geocoding services failed:', error);
      throw new Error('Unable to search locations. Please try again later.');
    }

    return [];
  }

  /**
   * Search using Nominatim (OpenStreetMap)
   */
  private async searchNominatim(query: string): Promise<any[]> {
    const params = new URLSearchParams({
      q: query.trim(),
      format: 'json',
      limit: '5',
      addressdetails: '1',
    });

    const urlString = `${this.NOMINATIM_URL}/search?${params.toString()}`;

    const response = await fetch(urlString, {
      headers: {
        'User-Agent': 'Salaty-Prayer-App/1.0',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim error: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Search using geocode.maps.co (fallback)
   */
  private async searchGeocodeMaps(query: string): Promise<any[]> {
    const params = new URLSearchParams({
      q: query.trim(),
      format: 'json',
    });

    const urlString = `${this.GEOCODING_API_URL}/search?${params.toString()}`;

    const response = await fetch(urlString, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Geocode.maps.co error: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Search for locations by city name
   */
  public async searchLocation(query: string): Promise<GeocodingResult[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    try {
      const data = await this.searchWithFallback(query);

      if (!Array.isArray(data) || data.length === 0) {
        return [];
      }

      return data.map((item: any) => ({
        name: item.address?.city || item.address?.town || item.address?.village || item.name || item.display_name?.split(',')[0],
        displayName: item.display_name,
        coordinates: {
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
        },
        country: item.address?.country || item.display_name?.split(',').pop()?.trim() || '',
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
      // Try Nominatim first
      const params = new URLSearchParams({
        lat: String(coordinates.latitude),
        lon: String(coordinates.longitude),
        format: 'json',
        addressdetails: '1',
      });

      const urlString = `${this.NOMINATIM_URL}/reverse?${params.toString()}`;

      const response = await fetch(urlString, {
        headers: {
          'User-Agent': 'Salaty-Prayer-App/1.0',
          'Accept': 'application/json',
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
