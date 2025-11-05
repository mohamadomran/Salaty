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
} from '../../types';

class AlAdhanServiceClass {
  private static instance: AlAdhanServiceClass;
  private readonly BASE_URL = 'https://api.aladhan.com/v1';

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
   * Get prayer times for a specific date and location
   */
  public async getPrayerTimes(
    params: AlAdhanTimingsParams,
  ): Promise<PrayerTimes> {
    const date = params.date || new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    const url = new URL(`${this.BASE_URL}/timings/${day}-${month}-${year}`);
    url.searchParams.append('latitude', String(params.latitude));
    url.searchParams.append('longitude', String(params.longitude));

    if (params.method !== undefined) {
      url.searchParams.append('method', String(params.method));
    }

    if (params.school !== undefined) {
      url.searchParams.append('school', String(params.school));
    }

    if (params.latitudeAdjustmentMethod !== undefined) {
      url.searchParams.append(
        'latitudeAdjustmentMethod',
        String(params.latitudeAdjustmentMethod),
      );
    }

    if (params.tune) {
      url.searchParams.append('tune', params.tune);
    }

    try {
      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`AlAdhan API error: ${response.status}`);
      }

      const data: AlAdhanTimingsResponse = await response.json();

      if (data.code !== 200) {
        throw new Error(`AlAdhan API returned code ${data.code}`);
      }

      return this.convertToPrayerTimes(data, date);
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
    };

    return mapping[method] || AlAdhanMethod.MAKKAH;
  }

  /**
   * Get all available calculation methods from API
   */
  public async getCalculationMethods(): Promise<
    Array<{ id: number; name: string }>
  > {
    try {
      const url = `${this.BASE_URL}/methods`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`AlAdhan API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.code === 200 && data.data) {
        return Object.entries(data.data).map(
          ([id, methodData]: [string, any]) => ({
            id: parseInt(id),
            name: methodData.name,
          }),
        );
      }

      // Fallback to known methods
      return this.getDefaultMethods();
    } catch (error) {
      console.error('Error fetching calculation methods:', error);
      return this.getDefaultMethods();
    }
  }

  /**
   * Get default calculation methods (fallback)
   */
  private getDefaultMethods(): Array<{ id: number; name: string }> {
    return [
      { id: AlAdhanMethod.JAFARI, name: 'Shia Ithna-Ashari' },
      {
        id: AlAdhanMethod.KARACHI,
        name: 'University of Islamic Sciences, Karachi',
      },
      { id: AlAdhanMethod.ISNA, name: 'Islamic Society of North America' },
      { id: AlAdhanMethod.MWL, name: 'Muslim World League' },
      { id: AlAdhanMethod.MAKKAH, name: 'Umm Al-Qura University, Makkah' },
      {
        id: AlAdhanMethod.EGYPTIAN,
        name: 'Egyptian General Authority of Survey',
      },
      {
        id: AlAdhanMethod.TEHRAN,
        name: 'Institute of Geophysics, University of Tehran',
      },
      { id: AlAdhanMethod.DUBAI, name: 'Gulf Region' },
      { id: AlAdhanMethod.KUWAIT, name: 'Kuwait' },
      { id: AlAdhanMethod.QATAR, name: 'Qatar' },
      { id: AlAdhanMethod.SINGAPORE, name: 'Singapore' },
      {
        id: AlAdhanMethod.FRANCE,
        name: 'Union Organization islamic de France',
      },
      { id: AlAdhanMethod.TURKEY, name: 'Diyanet İşleri Başkanlığı, Turkey' },
      {
        id: AlAdhanMethod.RUSSIA,
        name: 'Spiritual Administration of Muslims of Russia',
      },
      {
        id: AlAdhanMethod.MOONSIGHTING,
        name: 'Moonsighting Committee Worldwide',
      },
    ];
  }

  // ========== Private Helper Methods ==========

  /**
   * Convert AlAdhan response to our PrayerTimes format
   */
  private convertToPrayerTimes(
    response: AlAdhanTimingsResponse,
    date: Date,
  ): PrayerTimes {
    return this.convertTimingsToPrayerTimes(response.data.timings, date);
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
