/**
 * Prayer Service
 * Calculates prayer times using the Adhan library
 */

import {
  Coordinates as AdhanCoordinates,
  CalculationMethod as AdhanCalculationMethod,
  PrayerTimes as AdhanPrayerTimes,
  Prayer as AdhanPrayer,
  Madhab,
  HighLatitudeRule,
} from 'adhan';
import type {
  Coordinates,
  PrayerTimes,
  CalculationMethod,
  PrayerName,
} from '@types';
import { SettingsService } from '../settings/SettingsService';

class PrayerService {
  /**
   * Get prayer times for a specific date and location
   * Uses settings from SettingsService by default
   */
  async getPrayerTimes(
    coordinates: Coordinates,
    date: Date = new Date(),
    method?: CalculationMethod,
    madhab?: 'shafi' | 'hanafi'
  ): Promise<PrayerTimes> {
    // Load settings if method or madhab not provided
    if (!method || !madhab) {
      const settings = await SettingsService.getSettings();
      method = method || settings.calculationMethod;
      madhab = madhab || settings.madhab;
    }
    // Convert our coordinates to Adhan format
    const adhanCoords = new AdhanCoordinates(
      coordinates.latitude,
      coordinates.longitude
    );

    // Get calculation parameters
    const params = this.getCalculationParams(method);

    // Set madhab (affects Asr calculation)
    params.madhab = madhab === 'hanafi' ? Madhab.Hanafi : Madhab.Shafi;

    // Calculate prayer times
    const prayerTimes = new AdhanPrayerTimes(adhanCoords, date, params);

    return {
      fajr: prayerTimes.fajr,
      dhuhr: prayerTimes.dhuhr,
      asr: prayerTimes.asr,
      maghrib: prayerTimes.maghrib,
      isha: prayerTimes.isha,
      sunrise: prayerTimes.sunrise,
      sunset: prayerTimes.sunset,
      date: date,
    };
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
    coordinates: Coordinates
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
  getTimeUntilNextPrayer(prayerTimes: PrayerTimes): number {
    const nextPrayer = this.getNextPrayer(prayerTimes);
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
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
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
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } else {
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    }
  }

  /**
   * Get calculation parameters for a method
   */
  private getCalculationParams(method: CalculationMethod): any {
    switch (method) {
      case 'MuslimWorldLeague':
        return AdhanCalculationMethod.MuslimWorldLeague();
      case 'Egyptian':
        return AdhanCalculationMethod.Egyptian();
      case 'Karachi':
        return AdhanCalculationMethod.Karachi();
      case 'UmmAlQura':
        return AdhanCalculationMethod.UmmAlQura();
      case 'Dubai':
        return AdhanCalculationMethod.Dubai();
      case 'MoonsightingCommittee':
        return AdhanCalculationMethod.MoonsightingCommittee();
      case 'NorthAmerica':
        return AdhanCalculationMethod.NorthAmerica();
      case 'Kuwait':
        return AdhanCalculationMethod.Kuwait();
      case 'Qatar':
        return AdhanCalculationMethod.Qatar();
      case 'Singapore':
        return AdhanCalculationMethod.Singapore();
      default:
        return AdhanCalculationMethod.MuslimWorldLeague();
    }
  }

  /**
   * Check if it's time for a specific prayer
   * (within 15 minutes before or after)
   */
  isPrayerTime(
    prayerName: PrayerName,
    prayerTimes: PrayerTimes,
    windowMinutes = 15
  ): boolean {
    const now = new Date();
    const prayerTime = prayerTimes[prayerName];

    const timeDiff = Math.abs(now.getTime() - prayerTime.getTime());
    const minutesDiff = timeDiff / (1000 * 60);

    return minutesDiff <= windowMinutes;
  }

  /**
   * Get Qibla direction from coordinates
   */
  getQiblaDirection(coordinates: Coordinates): number {
    const adhanCoords = new AdhanCoordinates(
      coordinates.latitude,
      coordinates.longitude
    );
    return adhanCoords.qibla();
  }
}

export default new PrayerService();
