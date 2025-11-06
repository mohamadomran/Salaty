/**
 * Prayer Cache Service
 * Provides persistent caching for prayer times with offline support
 */

import StorageService from '../storage/StorageService';
import { PrayerTimes, Coordinates, CalculationMethod } from '../../types';

interface CachedPrayerTimes {
  prayerTimes: PrayerTimes;
  coordinates: Coordinates;
  method: CalculationMethod;
  cachedAt: number;
  expiresAt: number;
}

interface CacheEntry {
  data: CachedPrayerTimes;
  timestamp: number;
}

class PrayerCacheServiceClass {
  private static instance: PrayerCacheServiceClass;
  private readonly CACHE_KEY = '@salaty:prayer_times_cache';
  private readonly CACHE_VERSION_KEY = '@salaty:prayer_cache_version';
  private readonly CACHE_VERSION = '1.0';
  private readonly DEFAULT_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
  private memoryCache = new Map<string, CacheEntry>();
  private cacheInitialized = false;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): PrayerCacheServiceClass {
    if (!PrayerCacheServiceClass.instance) {
      PrayerCacheServiceClass.instance = new PrayerCacheServiceClass();
    }
    return PrayerCacheServiceClass.instance;
  }

  /**
   * Initialize cache by loading from storage
   */
  private async initializeCache(): Promise<void> {
    if (this.cacheInitialized) return;

    try {
      const cached = await StorageService.getItem<string>(this.CACHE_KEY);
      if (cached) {
        const cacheData = JSON.parse(cached) as Record<string, CacheEntry>;

        // Load valid entries into memory cache and deserialize dates
        Object.entries(cacheData).forEach(([key, entry]) => {
          if (this.isValidEntry(entry)) {
            // Deserialize date strings back to Date objects
            entry.data.prayerTimes = this.deserializePrayerTimes(entry.data.prayerTimes);
            this.memoryCache.set(key, entry);
          }
        });
      }

      this.cacheInitialized = true;
      console.log('📦 Prayer cache initialized with', this.memoryCache.size, 'entries');
    } catch (error) {
      console.error('Failed to initialize prayer cache:', error);
      this.cacheInitialized = true;
    }
  }

  /**
   * Generate cache key for prayer times
   */
  private generateCacheKey(
    coordinates: Coordinates,
    date: Date,
    method: CalculationMethod,
  ): string {
    const dateStr = this.formatDateKey(date);
    const coordsKey = `${coordinates.latitude.toFixed(4)},${coordinates.longitude.toFixed(4)}`;
    return `${dateStr}_${coordsKey}_${method}`;
  }

  /**
   * Format date as YYYY-MM-DD
   */
  private formatDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Deserialize prayer times by converting date strings to Date objects
   */
  private deserializePrayerTimes(prayerTimes: any): PrayerTimes {
    return {
      fajr: new Date(prayerTimes.fajr),
      dhuhr: new Date(prayerTimes.dhuhr),
      asr: new Date(prayerTimes.asr),
      maghrib: new Date(prayerTimes.maghrib),
      isha: new Date(prayerTimes.isha),
      sunrise: prayerTimes.sunrise ? new Date(prayerTimes.sunrise) : undefined,
      sunset: prayerTimes.sunset ? new Date(prayerTimes.sunset) : undefined,
      date: new Date(prayerTimes.date),
      hijriDate: prayerTimes.hijriDate,
      locationName: prayerTimes.locationName,
    };
  }

  /**
   * Check if cache entry is still valid
   */
  private isValidEntry(entry: CacheEntry): boolean {
    return Date.now() < entry.data.expiresAt;
  }

  /**
   * Save cache to persistent storage
   */
  private async saveCache(): Promise<void> {
    try {
      const cacheData: Record<string, CacheEntry> = {};
      this.memoryCache.forEach((entry, key) => {
        cacheData[key] = entry;
      });

      await StorageService.setItem(
        this.CACHE_KEY,
        JSON.stringify(cacheData),
      );

      // Save cache version for migration purposes
      await StorageService.setItem(this.CACHE_VERSION_KEY, this.CACHE_VERSION);
    } catch (error) {
      console.error('Failed to save prayer cache:', error);
    }
  }

  /**
   * Get cached prayer times
   */
  public async getCachedPrayerTimes(
    coordinates: Coordinates,
    date: Date,
    method: CalculationMethod,
  ): Promise<PrayerTimes | null> {
    await this.initializeCache();

    const cacheKey = this.generateCacheKey(coordinates, date, method);
    const entry = this.memoryCache.get(cacheKey);

    if (!entry) {
      return null;
    }

    // Check if entry is still valid
    if (!this.isValidEntry(entry)) {
      this.memoryCache.delete(cacheKey);
      await this.saveCache();
      return null;
    }

    console.log('📦 Using cached prayer times for', this.formatDateKey(date));

    // Ensure dates are properly deserialized
    const prayerTimes = entry.data.prayerTimes;

    // Check if dates need to be deserialized (they might be strings if not yet deserialized)
    if (typeof prayerTimes.fajr === 'string') {
      return this.deserializePrayerTimes(prayerTimes);
    }

    return prayerTimes;
  }

  /**
   * Cache prayer times for offline use
   */
  public async cachePrayerTimes(
    coordinates: Coordinates,
    date: Date,
    method: CalculationMethod,
    prayerTimes: PrayerTimes,
    ttl: number = this.DEFAULT_TTL,
  ): Promise<void> {
    await this.initializeCache();

    const cacheKey = this.generateCacheKey(coordinates, date, method);
    const now = Date.now();

    const cacheEntry: CacheEntry = {
      data: {
        prayerTimes,
        coordinates,
        method,
        cachedAt: now,
        expiresAt: now + ttl,
      },
      timestamp: now,
    };

    this.memoryCache.set(cacheKey, cacheEntry);
    await this.saveCache();

    console.log('💾 Cached prayer times for', this.formatDateKey(date));
  }

  /**
   * Cache multiple prayer times (batch operation)
   */
  public async cachePrayerTimesBatch(
    entries: Array<{
      coordinates: Coordinates;
      date: Date;
      method: CalculationMethod;
      prayerTimes: PrayerTimes;
    }>,
    ttl: number = this.DEFAULT_TTL,
  ): Promise<void> {
    await this.initializeCache();

    const now = Date.now();

    entries.forEach(({ coordinates, date, method, prayerTimes }) => {
      const cacheKey = this.generateCacheKey(coordinates, date, method);
      const cacheEntry: CacheEntry = {
        data: {
          prayerTimes,
          coordinates,
          method,
          cachedAt: now,
          expiresAt: now + ttl,
        },
        timestamp: now,
      };
      this.memoryCache.set(cacheKey, cacheEntry);
    });

    await this.saveCache();
    console.log(`💾 Cached ${entries.length} prayer times entries`);
  }

  /**
   * Get cached prayer times for a date range
   */
  public async getCachedPrayerTimesRange(
    coordinates: Coordinates,
    startDate: Date,
    endDate: Date,
    method: CalculationMethod,
  ): Promise<PrayerTimes[]> {
    await this.initializeCache();

    const results: PrayerTimes[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const cached = await this.getCachedPrayerTimes(coordinates, currentDate, method);
      if (cached) {
        results.push(cached);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return results;
  }

  /**
   * Check if prayer times are cached for a specific date
   */
  public async isCached(
    coordinates: Coordinates,
    date: Date,
    method: CalculationMethod,
  ): Promise<boolean> {
    await this.initializeCache();

    const cacheKey = this.generateCacheKey(coordinates, date, method);
    const entry = this.memoryCache.get(cacheKey);

    return entry ? this.isValidEntry(entry) : false;
  }

  /**
   * Clear expired cache entries
   */
  public async clearExpiredEntries(): Promise<void> {
    await this.initializeCache();

    const now = Date.now();
    const expiredKeys: string[] = [];

    this.memoryCache.forEach((entry, key) => {
      if (now >= entry.data.expiresAt) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => this.memoryCache.delete(key));

    if (expiredKeys.length > 0) {
      await this.saveCache();
      console.log(`🧹 Cleared ${expiredKeys.length} expired cache entries`);
    }
  }

  /**
   * Clear all cache entries
   */
  public async clearCache(): Promise<void> {
    this.memoryCache.clear();
    await StorageService.removeItem(this.CACHE_KEY);
    console.log('🗑️ Cleared all prayer cache entries');
  }

  /**
   * Get cache statistics
   */
  public async getCacheStats(): Promise<{
    totalEntries: number;
    validEntries: number;
    expiredEntries: number;
    oldestEntry?: Date;
    newestEntry?: Date;
  }> {
    await this.initializeCache();

    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;
    let oldestTimestamp = now;
    let newestTimestamp = 0;

    this.memoryCache.forEach((entry) => {
      if (this.isValidEntry(entry)) {
        validEntries++;
        oldestTimestamp = Math.min(oldestTimestamp, entry.timestamp);
        newestTimestamp = Math.max(newestTimestamp, entry.timestamp);
      } else {
        expiredEntries++;
      }
    });

    return {
      totalEntries: this.memoryCache.size,
      validEntries,
      expiredEntries,
      oldestEntry: validEntries > 0 ? new Date(oldestTimestamp) : undefined,
      newestEntry: validEntries > 0 ? new Date(newestTimestamp) : undefined,
    };
  }

  /**
   * Pre-cache prayer times for upcoming days
   */
  public async preCacheUpcomingPrayerTimes(
    coordinates: Coordinates,
    method: CalculationMethod,
    days: number = 7,
    fetchFunction: (date: Date) => Promise<PrayerTimes>,
  ): Promise<void> {
    await this.initializeCache();

    const entries = [];
    const currentDate = new Date();

    for (let i = 0; i < days; i++) {
      const targetDate = new Date(currentDate);
      targetDate.setDate(currentDate.getDate() + i);

      // Check if already cached
      const isAlreadyCached = await this.isCached(coordinates, targetDate, method);
      if (!isAlreadyCached) {
        try {
          const prayerTimes = await fetchFunction(targetDate);
          entries.push({
            coordinates,
            date: targetDate,
            method,
            prayerTimes,
          });
        } catch (error) {
          console.warn(`Failed to fetch prayer times for ${this.formatDateKey(targetDate)}:`, error);
        }
      }
    }

    if (entries.length > 0) {
      await this.cachePrayerTimesBatch(entries);
      console.log(`🚀 Pre-cached ${entries.length} upcoming prayer times`);
    }
  }
}

export const PrayerCacheService = PrayerCacheServiceClass.getInstance();