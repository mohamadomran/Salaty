/**
 * AlAdhan API Service
 * Integrates with AlAdhan prayer times API as fallback/verification
 */

import {
  AlAdhanTimingsResponse,
  AlAdhanCalendarResponse,
  AlAdhanTimingsParams,
  AlAdhanMethod,
  AlAdhanSchool,
  PrayerTimes,
  Coordinates,
  CalculationMethod,
  CalculationMethodInfo,
  ApiCalculationMethodsResponse,
  ApiMethodData,
} from '../../types';

class AlAdhanServiceClass {
  private static instance: AlAdhanServiceClass;
  private readonly BASE_URL = 'https://api.aladhan.com/v1';
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): AlAdhanServiceClass {
    if (!AlAdhanServiceClass.instance) {
      AlAdhanServiceClass.instance = new AlAdhanServiceClass();
    }
    return AlAdhanServiceClass.instance;
  }

  /**
   * Get Hijri date for a specific Gregorian date and location
   */
  public async getHijriDate(
    coordinates: Coordinates,
    date: Date = new Date(),
  ): Promise<{
    hijriDate?: PrayerTimes['hijriDate'];
    locationName?: string;
  }> {
    // Format date as DD-MM-YYYY (AlAdhan API format)
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const dateStr = `${day}-${month}-${year}`;

    // Build URL without trailing slash (API requires no trailing slash)
    const urlStr = `${this.BASE_URL}/timings/${dateStr}?latitude=${coordinates.latitude}&longitude=${coordinates.longitude}`;

    console.log('🔍 AlAdhan API URL:', urlStr);

    try {
      const response = await fetch(urlStr);

      if (!response.ok) {
        throw new Error(`AlAdhan API error: ${response.status}`);
      }

      const data: AlAdhanTimingsResponse = await response.json();

      if (data.code !== 200) {
        throw new Error(`AlAdhan API returned code ${data.code}`);
      }

      const result: {
        hijriDate?: PrayerTimes['hijriDate'];
        locationName?: string;
      } = {};

      if (data.data.date?.hijri) {
        result.hijriDate = {
          day: data.data.date.hijri.day,
          month: data.data.date.hijri.month,
          year: data.data.date.hijri.year,
          weekday: data.data.date.hijri.weekday,
          format: data.data.date.hijri.format,
          date: data.data.date.hijri.date,
        };
      }

      return result;
    } catch (error) {
      console.error('AlAdhan API error fetching Hijri date:', error);
      throw error;
    }
  }

  /**
   * Get prayer times for a specific date and location
   */
  public async getPrayerTimes(
    params: AlAdhanTimingsParams,
  ): Promise<PrayerTimes> {
    const date = params.date || new Date();

    // Format date as DD-MM-YYYY (AlAdhan API format)
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const dateStr = `${day}-${month}-${year}`;

    // Build cache key and check cache first
    const cacheParams = {
      latitude: params.latitude,
      longitude: params.longitude,
      method: params.method,
      school: params.school,
      latitudeAdjustmentMethod: params.latitudeAdjustmentMethod,
      tune: params.tune,
      date: dateStr,
    };
    
    const cacheKey = this.generateCacheKey('timings', cacheParams);
    const cachedData = this.getCachedData(cacheKey);
    
    if (cachedData) {
      console.log('📦 Using cached prayer times for', dateStr);
      return cachedData;
    }

    // Build URL string manually to avoid trailing slash
    const queryParams = new URLSearchParams({
      latitude: String(params.latitude),
      longitude: String(params.longitude),
    });

    if (params.method !== undefined) {
      queryParams.append('method', String(params.method));
    }

    if (params.school !== undefined) {
      queryParams.append('school', String(params.school));
    }

    if (params.latitudeAdjustmentMethod !== undefined) {
      queryParams.append(
        'latitudeAdjustmentMethod',
        String(params.latitudeAdjustmentMethod),
      );
    }

    if (params.tune) {
      queryParams.append('tune', params.tune);
    }

    const urlStr = `${this.BASE_URL}/timings/${dateStr}?${queryParams.toString()}`;

    try {
      console.log('🌐 Fetching prayer times from API for', dateStr);
      const response = await fetch(urlStr);

      if (!response.ok) {
        throw new Error(`AlAdhan API error: ${response.status}`);
      }

      const data: AlAdhanTimingsResponse = await response.json();

      if (data.code !== 200) {
        throw new Error(`AlAdhan API returned code ${data.code}`);
      }

      const result = this.convertToPrayerTimes(data, date);
      
      // Cache the result for 5 minutes
      this.setCachedData(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error('AlAdhan API error:', error);
      throw error;
    }
  }

  /**
   * Get monthly prayer times calendar
   */
  public async getMonthlyCalendar(
    coordinates: Coordinates,
    date: Date = new Date(),
    method: AlAdhanMethod = AlAdhanMethod.MAKKAH,
    school: AlAdhanSchool = AlAdhanSchool.SHAFI,
  ): Promise<PrayerTimes[]> {
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const url = new URL(`${this.BASE_URL}/calendar/${year}/${month}`);
    url.searchParams.append('latitude', String(coordinates.latitude));
    url.searchParams.append('longitude', String(coordinates.longitude));
    url.searchParams.append('method', String(method));
    url.searchParams.append('school', String(school));

    try {
      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`AlAdhan API error: ${response.status}`);
      }

      const result: AlAdhanCalendarResponse = await response.json();

      if (result.code !== 200) {
        throw new Error(`AlAdhan API returned code ${result.code}`);
      }

      return result.data.map(dayData => {
        const dayDate = new Date(dayData.date.gregorian.date);
        return this.convertTimingsToPrayerTimes(dayData.timings, dayDate);
      });
    } catch (error) {
      console.error('AlAdhan calendar API error:', error);
      throw error;
    }
  }

  /**
   * Map our CalculationMethod to AlAdhan method ID
   */
  public mapCalculationMethod(method: CalculationMethod): AlAdhanMethod {
    const mapping: Record<CalculationMethod, AlAdhanMethod> = {
      // Original methods
      MuslimWorldLeague: AlAdhanMethod.MWL,
      Egyptian: AlAdhanMethod.EGYPTIAN,
      Karachi: AlAdhanMethod.KARACHI,
      UmmAlQura: AlAdhanMethod.MAKKAH,
      Dubai: AlAdhanMethod.DUBAI,
      MoonsightingCommittee: AlAdhanMethod.MOONSIGHTING,
      NorthAmerica: AlAdhanMethod.ISNA,
      Kuwait: AlAdhanMethod.KUWAIT,
      Qatar: AlAdhanMethod.QATAR,
      Singapore: AlAdhanMethod.SINGAPORE,
      // New methods from API
      Jafari: AlAdhanMethod.JAFARI,
      Tehran: AlAdhanMethod.TEHRAN,
      France: AlAdhanMethod.FRANCE,
      Turkey: AlAdhanMethod.TURKEY,
      Russia: AlAdhanMethod.RUSSIA,
      Jakim: AlAdhanMethod.JAKIM,
      Tunisia: AlAdhanMethod.TUNISIA,
      Algeria: AlAdhanMethod.ALGERIA,
      Kemenag: AlAdhanMethod.KEMENAG,
      Morocco: AlAdhanMethod.MOROCCO,
      Portugal: AlAdhanMethod.PORTUGAL,
      Jordan: AlAdhanMethod.JORDAN,
      Gulf: AlAdhanMethod.GULF,
      Custom: AlAdhanMethod.MAKKAH, // Default to Makkah for custom
    };

    return mapping[method] || AlAdhanMethod.MAKKAH;
  }

  /**
   * Get all available calculation methods from API
   * Returns full method details with params and location
   */
  public async getCalculationMethods(): Promise<CalculationMethodInfo[]> {
    const url = `${this.BASE_URL}/methods`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`AlAdhan API error: ${response.status}`);
    }

    const data: ApiCalculationMethodsResponse = await response.json();

    if (data.code !== 200) {
      throw new Error(`AlAdhan API returned code ${data.code}`);
    }

    // Transform API response to our format
    return Object.entries(data.data).map(([key, methodData]) => ({
      id: key, // API key like "MWL", "EGYPT", etc.
      apiId: methodData.id, // Numeric ID
      name: methodData.name,
      params: methodData.params || {},
      location: methodData.location,
    }));
  }

  // ========== Cache Helper Methods ==========

  /**
   * Get cached data or return null if expired/not found
   */
  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Set data in cache with TTL
   */
  private setCachedData(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Generate cache key for requests
   */
  private generateCacheKey(endpoint: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    return `${endpoint}?${sortedParams}`;
  }

  // ========== Private Helper Methods ==========

  /**
   * Convert AlAdhan response to our PrayerTimes format
   */
  private convertToPrayerTimes(
    response: AlAdhanTimingsResponse,
    date: Date,
  ): PrayerTimes {
    const prayerTimes = this.convertTimingsToPrayerTimes(
      response.data.timings,
      date,
    );

    // Add Hijri date if available
    if (response.data.date?.hijri) {
      prayerTimes.hijriDate = {
        day: response.data.date.hijri.day,
        month: response.data.date.hijri.month,
        year: response.data.date.hijri.year,
        weekday: response.data.date.hijri.weekday,
        format: response.data.date.hijri.format,
        date: response.data.date.hijri.date,
      };
    }

    return prayerTimes;
  }

  /**
   * Convert AlAdhan timings to PrayerTimes
   */
  private convertTimingsToPrayerTimes(
    timings: AlAdhanTimingsResponse['data']['timings'],
    date: Date,
  ): PrayerTimes {
    return {
      fajr: this.parseTime(timings.Fajr, date),
      dhuhr: this.parseTime(timings.Dhuhr, date),
      asr: this.parseTime(timings.Asr, date),
      maghrib: this.parseTime(timings.Maghrib, date),
      isha: this.parseTime(timings.Isha, date),
      sunrise: this.parseTime(timings.Sunrise, date),
      sunset: this.parseTime(timings.Sunset, date),
      date: date,
    };
  }

  /**
   * Parse time string (HH:MM) to Date object
   */
  private parseTime(timeStr: string, date: Date): Date {
    // Remove timezone info if present (e.g., "05:23 (EEST)")
    const cleanTime = timeStr.split(' ')[0];
    const [hours, minutes] = cleanTime.split(':').map(Number);

    const result = new Date(date);
    result.setHours(hours, minutes, 0, 0);

    return result;
  }
}

export const AlAdhanService = AlAdhanServiceClass.getInstance();
