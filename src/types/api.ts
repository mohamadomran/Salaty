/**
 * AlAdhan API Types
 * Types for prayer times API integration
 */

/**
 * AlAdhan API calculation methods
 * Maps to our internal CalculationMethod type
 */
export enum AlAdhanMethod {
  JAFARI = 0,           // Shia Ithna-Ashari, Leva Institute, Qum
  KARACHI = 1,          // University of Islamic Sciences, Karachi
  ISNA = 2,             // Islamic Society of North America
  MWL = 3,              // Muslim World League
  MAKKAH = 4,           // Umm Al-Qura University, Makkah
  EGYPTIAN = 5,         // Egyptian General Authority of Survey
  TEHRAN = 7,           // Institute of Geophysics, University of Tehran
  GULF = 8,             // Gulf Region
  DUBAI = 8,            // Gulf Region (Dubai) - Alias for GULF
  KUWAIT = 9,           // Kuwait
  QATAR = 10,           // Qatar
  SINGAPORE = 11,       // Singapore
  FRANCE = 12,          // Union Organization islamic de France
  TURKEY = 13,          // Diyanet İşleri Başkanlığı, Turkey
  RUSSIA = 14,          // Spiritual Administration of Muslims of Russia
  MOONSIGHTING = 15,    // Moonsighting Committee Worldwide
  JAKIM = 17,           // Jabatan Kemajuan Islam Malaysia
  TUNISIA = 18,         // Tunisia
  ALGERIA = 19,         // Algeria
  KEMENAG = 20,         // Kementerian Agama Republik Indonesia
  MOROCCO = 21,         // Morocco
  PORTUGAL = 22,        // Comunidade Islamica de Lisboa
  JORDAN = 23,          // Ministry of Awqaf, Islamic Affairs and Holy Places, Jordan
}

/**
 * School/Madhab for Asr calculation
 */
export enum AlAdhanSchool {
  SHAFI = 0,    // Shafi, Hanbali, Maliki
  HANAFI = 1,   // Hanafi
}

/**
 * Latitude adjustment methods for high latitudes
 */
export enum LatitudeAdjustmentMethod {
  MIDDLE_OF_NIGHT = 1,
  ONE_SEVENTH = 2,
  ANGLE_BASED = 3,
}

/**
 * AlAdhan API timings response
 */
export interface AlAdhanTimingsResponse {
  code: number;
  status: string;
  data: {
    timings: {
      Fajr: string;       // e.g., "05:23"
      Sunrise: string;
      Dhuhr: string;
      Asr: string;
      Sunset: string;
      Maghrib: string;
      Isha: string;
      Imsak: string;
      Midnight: string;
      Firstthird: string;
      Lastthird: string;
    };
    date: {
      readable: string;
      timestamp: string;
      hijri: {
        date: string;
        format: string;
        day: string;
        weekday: {
          en: string;
          ar: string;
        };
        month: {
          number: number;
          en: string;
          ar: string;
        };
        year: string;
        designation: {
          abbreviated: string;
          expanded: string;
        };
        holidays: string[];
      };
      gregorian: {
        date: string;
        format: string;
        day: string;
        weekday: {
          en: string;
        };
        month: {
          number: number;
          en: string;
        };
        year: string;
        designation: {
          abbreviated: string;
          expanded: string;
        };
      };
    };
    meta: {
      latitude: number;
      longitude: number;
      timezone: string;
      method: {
        id: number;
        name: string;
        params: {
          Fajr: number;
          Isha: number | string;
        };
      };
      latitudeAdjustmentMethod: string;
      midnightMode: string;
      school: string;
      offset: {
        Imsak: number;
        Fajr: number;
        Sunrise: number;
        Dhuhr: number;
        Asr: number;
        Maghrib: number;
        Sunset: number;
        Isha: number;
        Midnight: number;
      };
    };
  };
}

/**
 * AlAdhan API calendar response (monthly prayer times)
 */
export interface AlAdhanCalendarResponse {
  code: number;
  status: string;
  data: Array<AlAdhanTimingsResponse['data']>;
}

/**
 * AlAdhan API request parameters
 */
export interface AlAdhanTimingsParams {
  latitude: number;
  longitude: number;
  method?: AlAdhanMethod;
  school?: AlAdhanSchool;
  latitudeAdjustmentMethod?: LatitudeAdjustmentMethod;
  tune?: string;  // Comma-separated offsets in minutes for each prayer
  date?: Date;    // Defaults to today
}
