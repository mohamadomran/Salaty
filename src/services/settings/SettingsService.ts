/**
 * Settings Service
 * Manages user preferences and app settings
 */

import StorageService from '../storage/StorageService';
import { AppSettings, CalculationMethodInfo, Madhab, TimeFormat, ThemeMode } from '@types';

class SettingsServiceClass {
  private static instance: SettingsServiceClass;
  private storageService: typeof StorageService;
  private readonly SETTINGS_KEY = '@salaty:app_settings';

  private constructor() {
    this.storageService = StorageService;
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): SettingsServiceClass {
    if (!SettingsServiceClass.instance) {
      SettingsServiceClass.instance = new SettingsServiceClass();
    }
    return SettingsServiceClass.instance;
  }

  /**
   * Get current app settings
   */
  public async getSettings(): Promise<AppSettings> {
    const stored = await this.storageService.getItem(this.SETTINGS_KEY);

    if (stored) {
      return JSON.parse(stored);
    }

    // Return default settings
    return this.getDefaultSettings();
  }

  /**
   * Update app settings
   */
  public async updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    const current = await this.getSettings();
    const updated = { ...current, ...settings };

    await this.storageService.setItem(this.SETTINGS_KEY, JSON.stringify(updated));
    return updated;
  }

  /**
   * Update calculation method
   */
  public async setCalculationMethod(method: AppSettings['calculationMethod']): Promise<void> {
    await this.updateSettings({ calculationMethod: method });
  }

  /**
   * Update madhab
   */
  public async setMadhab(madhab: Madhab): Promise<void> {
    await this.updateSettings({ madhab });
  }

  /**
   * Update time format
   */
  public async setTimeFormat(format: TimeFormat): Promise<void> {
    await this.updateSettings({ timeFormat: format });
  }

  /**
   * Toggle sunrise/sunset display
   */
  public async toggleSunriseSunset(show: boolean): Promise<void> {
    await this.updateSettings({ showSunriseSunset: show });
  }

  /**
   * Update theme mode
   */
  public async setThemeMode(mode: ThemeMode): Promise<void> {
    await this.updateSettings({ themeMode: mode });
  }

  /**
   * Update notification settings
   */
  public async updateNotificationSettings(settings: {
    enabled?: boolean;
    sound?: boolean;
    reminderMinutes?: number;
  }): Promise<void> {
    const updates: Partial<AppSettings> = {};

    if (settings.enabled !== undefined) {
      updates.notificationsEnabled = settings.enabled;
    }
    if (settings.sound !== undefined) {
      updates.notificationSound = settings.sound;
    }
    if (settings.reminderMinutes !== undefined) {
      updates.reminderMinutes = settings.reminderMinutes;
    }

    await this.updateSettings(updates);
  }

  /**
   * Reset settings to default
   */
  public async resetToDefaults(): Promise<AppSettings> {
    const defaults = this.getDefaultSettings();
    await this.storageService.setItem(this.SETTINGS_KEY, JSON.stringify(defaults));
    return defaults;
  }

  /**
   * Get all available calculation methods with descriptions
   */
  public getCalculationMethods(): CalculationMethodInfo[] {
    return [
      {
        id: 'UmmAlQura',
        name: 'Umm Al-Qura, Makkah',
        description: 'Used in Saudi Arabia',
        region: 'Saudi Arabia',
      },
      {
        id: 'MuslimWorldLeague',
        name: 'Muslim World League',
        description: 'Standard method',
        region: 'Global',
      },
      {
        id: 'Egyptian',
        name: 'Egyptian General Authority',
        description: 'Used in Egypt and Middle East',
        region: 'Egypt',
      },
      {
        id: 'Karachi',
        name: 'University of Islamic Sciences, Karachi',
        description: 'Used in Pakistan',
        region: 'Pakistan',
      },
      {
        id: 'Dubai',
        name: 'Gulf Region',
        description: 'Used in UAE and Gulf countries',
        region: 'UAE',
      },
      {
        id: 'MoonsightingCommittee',
        name: 'Moonsighting Committee Worldwide',
        description: 'Based on actual moon sighting',
        region: 'Global',
      },
      {
        id: 'NorthAmerica',
        name: 'ISNA',
        description: 'Islamic Society of North America',
        region: 'North America',
      },
      {
        id: 'Kuwait',
        name: 'Kuwait',
        description: 'Used in Kuwait',
        region: 'Kuwait',
      },
      {
        id: 'Qatar',
        name: 'Qatar',
        description: 'Used in Qatar',
        region: 'Qatar',
      },
      {
        id: 'Singapore',
        name: 'Singapore',
        description: 'Used in Singapore and Malaysia',
        region: 'Singapore',
      },
    ];
  }

  /**
   * Get default settings
   */
  private getDefaultSettings(): AppSettings {
    return {
      // Prayer Calculation
      calculationMethod: 'UmmAlQura',
      madhab: 'shafi',

      // Display
      timeFormat: '12h',
      showSunriseSunset: true,

      // Notifications
      notificationsEnabled: true,
      notificationSound: true,
      reminderMinutes: 15,

      // App
      themeMode: 'auto',
      language: 'en',

      // Advanced
      highLatitudeRule: 'middleOfNight',

      // Version
      version: '1.0.0',
    };
  }
}

export const SettingsService = SettingsServiceClass.getInstance();
