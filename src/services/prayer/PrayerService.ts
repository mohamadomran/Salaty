/**
 * Prayer Service
 * Calculates prayer times using the AlAdhan API
 */

import { Coordinates as AdhanCoordinates } from 'adhan';
import type {
  Coordinates,
  PrayerTimes,
  CalculationMethod,
  PrayerName,
} from '../../types';
import { SettingsService } from '../settings/SettingsService';
import { AlAdhanService } from '../api/AlAdhanService';
import { PrayerCacheService } from '../cache';

class PrayerService {
  /**
   * Get prayer times for a specific date and location with offline support
   * Uses settings from SettingsService by default
   */
  async getPrayerTimes(
    coordinates: Coordinates,
    date: Date = new Date(),
    method?: CalculationMethod,
    madhab?: 'shafi' | 'hanafi',
  ): Promise<PrayerTimes> {
    // Load settings if method or madhab not provided
    if (!method || !madhab) {
      const settings = await SettingsService.getSettings();
      method = method || settings.calculationMethod;
      madhab = madhab || settings.madhab;
    }

    // First, try to get from cache
    const cachedTimes = await PrayerCacheService.getCachedPrayerTimes(
      coordinates,
      date,
      method,
    );

    if (cachedTimes) {
      return cachedTimes;
    }

    // If not in cache, fetch from API
    try {
      // Map calculation method to AlAdhan API ID
      const alAdhanMethod = AlAdhanService.mapCalculationMethod(method);

      // Map madhab to AlAdhan school (0 = Shafi, 1 = Hanafi)
      const school = madhab === 'hanafi' ? 1 : 0;

      // Call AlAdhan API with the user's selected method and madhab
      const prayerTimes = await AlAdhanService.getPrayerTimes({
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        date: date,
        method: alAdhanMethod,
        school: school,
      });

      // Cache the result for offline use
      await PrayerCacheService.cachePrayerTimes(
        coordinates,
        date,
        method,
        prayerTimes,
      );

      return prayerTimes;
    } catch (error) {
      console.error('Failed to fetch prayer times from AlAdhan API:', error);
      
      // Try to return cached data even if expired as fallback
      const fallbackTimes = await this.getFallbackPrayerTimes(
        coordinates,
        date,
        method,
      );
      
      if (fallbackTimes) {
        console.log('⚠️ Using expired cached prayer times as fallback');
        return fallbackTimes;
      }
      
      throw new Error('Unable to calculate prayer times. Please check your connection.');
    }
  }

  /**
   * Get fallback prayer times from expired cache
   */
  private async getFallbackPrayerTimes(
    coordinates: Coordinates,
    date: Date,
    method: CalculationMethod,
  ): Promise<PrayerTimes | null> {
    try {
      // Get cache stats to find expired entries
      const stats = await PrayerCacheService.getCacheStats();
      
      // For now, we'll implement a simple fallback by checking nearby dates
      // In a more sophisticated implementation, we could use calculation libraries
      const nearbyDates = [];
      for (let i = 1; i <= 7; i++) {
        const beforeDate = new Date(date);
        beforeDate.setDate(date.getDate() - i);
        nearbyDates.push(beforeDate);
        
        const afterDate = new Date(date);
        afterDate.setDate(date.getDate() + i);
        nearbyDates.push(afterDate);
      }

      // Try to find cached times for nearby dates (this is a basic fallback)
      for (const nearbyDate of nearbyDates) {
        const cached = await PrayerCacheService.getCachedPrayerTimes(
          coordinates,
          nearbyDate,
          method,
        );
        if (cached) {
          // Create approximate times for the requested date based on nearby date
          // This is a very basic approximation - in practice, prayer times change gradually
          const dayDiff = (date.getTime() - nearbyDate.getTime()) / (1000 * 60 * 60 * 24);
          const minutesPerDay = 2; // Approximate daily shift in prayer times
          const timeAdjustment = dayDiff * minutesPerDay * 60 * 1000;

          return {
            fajr: new Date(cached.fajr.getTime() + timeAdjustment),
            dhuhr: new Date(cached.dhuhr.getTime() + timeAdjustment),
            asr: new Date(cached.asr.getTime() + timeAdjustment),
            maghrib: new Date(cached.maghrib.getTime() + timeAdjustment),
            isha: new Date(cached.isha.getTime() + timeAdjustment),
            sunrise: cached.sunrise ? new Date(cached.sunrise.getTime() + timeAdjustment) : undefined,
            sunset: cached.sunset ? new Date(cached.sunset.getTime() + timeAdjustment) : undefined,
            date: date,
          };
        }
      }

      return null;
    } catch (error) {
      console.error('Failed to get fallback prayer times:', error);
      return null;
    }
  }

  /**
   * Get current prayer
   */
  getCurrentPrayer(prayerTimes: PrayerTimes): PrayerName | null {
    const now = new Date();
    const times = prayerTimes;

    if (now < times.fajr) {
      return 'isha'; // Before Fajr, Isha is still current
    } else if (now >= times.fajr && now < times.dhuhr) {
      return 'fajr';
    } else if (now >= times.dhuhr && now < times.asr) {
      return 'dhuhr';
    } else if (now >= times.asr && now < times.maghrib) {
      return 'asr';
    } else if (now >= times.maghrib && now < times.isha) {
      return 'maghrib';
    } else {
      return 'isha';
    }
  }

  /**
   * Get next prayer
   */
  async getNextPrayer(
    prayerTimes: PrayerTimes,
    coordinates: Coordinates,
  ): Promise<{
    name: PrayerName;
    time: Date;
  } | null> {
    const now = new Date();
    const times = prayerTimes;

    if (now < times.fajr) {
      return { name: 'fajr', time: times.fajr };
    } else if (now < times.dhuhr) {
      return { name: 'dhuhr', time: times.dhuhr };
    } else if (now < times.asr) {
      return { name: 'asr', time: times.asr };
    } else if (now < times.maghrib) {
      return { name: 'maghrib', time: times.maghrib };
    } else if (now < times.isha) {
      return { name: 'isha', time: times.isha };
    } else {
      // After Isha, next prayer is Fajr tomorrow
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowTimes = await this.getPrayerTimes(coordinates, tomorrow);
      return { name: 'fajr', time: tomorrowTimes.fajr };
    }
  }

  /**
   * Get time until next prayer in milliseconds
   */
  async getTimeUntilNextPrayer(
    prayerTimes: PrayerTimes,
    coordinates: Coordinates,
  ): Promise<number> {
    const nextPrayer = await this.getNextPrayer(prayerTimes, coordinates);
    if (!nextPrayer) return 0;

    return nextPrayer.time.getTime() - new Date().getTime();
  }

  /**
   * Format time for display
   * Uses user's time format preference by default
   */
  async formatPrayerTime(time: Date, use24Hour?: boolean): Promise<string> {
    // Load user preference if not provided
    if (use24Hour === undefined) {
      const settings = await SettingsService.getSettings();
      use24Hour = settings.timeFormat === '24h';
    }

    const hours = time.getHours();
    const minutes = time.getMinutes();

    if (use24Hour) {
      return `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}`;
    } else {
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    }
  }

  /**
   * Format time for display (synchronous version for when settings are already loaded)
   */
  formatPrayerTimeSync(time: Date, use24Hour: boolean): string {
    const hours = time.getHours();
    const minutes = time.getMinutes();

    if (use24Hour) {
      return `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}`;
    } else {
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    }
  }

  /**
   * Check if it's time for a specific prayer
   * (within 15 minutes before or after)
   */
  isPrayerTime(
    prayerName: PrayerName,
    prayerTimes: PrayerTimes,
    windowMinutes = 15,
  ): boolean {
    const now = new Date();
    const prayerTime = prayerTimes[prayerName];

    const timeDiff = Math.abs(now.getTime() - prayerTime.getTime());
    const minutesDiff = timeDiff / (1000 * 60);

    return minutesDiff <= windowMinutes;
  }

  /**
   * Pre-cache prayer times for upcoming days
   */
  async preCacheUpcomingPrayerTimes(
    coordinates: Coordinates,
    days: number = 7,
    method?: CalculationMethod,
    madhab?: 'shafi' | 'hanafi',
  ): Promise<void> {
    // Load settings if method or madhab not provided
    if (!method || !madhab) {
      const settings = await SettingsService.getSettings();
      method = method || settings.calculationMethod;
      madhab = madhab || settings.madhab;
    }

    // Map calculation method to AlAdhan API ID
    const alAdhanMethod = AlAdhanService.mapCalculationMethod(method);
    const school = madhab === 'hanafi' ? 1 : 0;

    // Create fetch function for pre-caching
    const fetchFunction = async (date: Date): Promise<PrayerTimes> => {
      return await AlAdhanService.getPrayerTimes({
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        date: date,
        method: alAdhanMethod,
        school: school,
      });
    };

    await PrayerCacheService.preCacheUpcomingPrayerTimes(
      coordinates,
      method,
      days,
      fetchFunction,
    );
  }

  /**
   * Get cache statistics
   */
  async getCacheStats() {
    return await PrayerCacheService.getCacheStats();
  }

  /**
   * Clear expired cache entries
   */
  async clearExpiredCache(): Promise<void> {
    await PrayerCacheService.clearExpiredEntries();
  }

  /**
   * Clear all prayer cache
   */
  async clearCache(): Promise<void> {
    await PrayerCacheService.clearCache();
  }

  /**
   * Get Qibla direction from coordinates
   * Note: Still uses local adhan library for Qibla calculations
   */
  getQiblaDirection(coordinates: Coordinates): number {
    const adhanCoords = new AdhanCoordinates(
      coordinates.latitude,
      coordinates.longitude,
    );
    // @ts-ignore - qibla() exists on AdhanCoordinates but not in types
    return adhanCoords.qibla();
  }
}

export default new PrayerService();
