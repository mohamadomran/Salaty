/**
 * Settings Service
 * Manages user preferences and app settings
 */

import StorageService from '../storage/StorageService';
import {
  AppSettings,
  CalculationMethodInfo,
  Madhab,
  TimeFormat,
  ThemeMode,
} from '../../types';

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
    const stored = await this.storageService.getItem<string>(this.SETTINGS_KEY);

    if (stored) {
      return JSON.parse(stored);
    }

    // Return default settings
    return this.getDefaultSettings();
  }

  /**
   * Update app settings
   */
  public async updateSettings(
    settings: Partial<AppSettings>,
  ): Promise<AppSettings> {
    const current = await this.getSettings();
    const updated = { ...current, ...settings };

    await this.storageService.setItem(
      this.SETTINGS_KEY,
      JSON.stringify(updated),
    );
    return updated;
  }

  /**
   * Update calculation method
   */
  public async setCalculationMethod(
    method: AppSettings['calculationMethod'],
  ): Promise<void> {
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
   * Update language
   */
  public async setLanguage(language: string): Promise<void> {
    await this.updateSettings({ language });
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
    await this.storageService.setItem(
      this.SETTINGS_KEY,
      JSON.stringify(defaults),
    );
    return defaults;
  }

  /**
   * Import settings from external source
   */
  public async importSettings(settings: AppSettings): Promise<AppSettings> {
    // Validate and merge with defaults to ensure all fields are present
    const defaults = this.getDefaultSettings();
    const validated: AppSettings = {
      ...defaults,
      ...settings,
      // Keep current version
      version: defaults.version,
    };

    await this.storageService.setItem(
      this.SETTINGS_KEY,
      JSON.stringify(validated),
    );
    return validated;
  }

  /**
   * Export current settings
   */
  public async exportSettings(): Promise<AppSettings> {
    return await this.getSettings();
  }

  /**
   * NOTE: getCalculationMethods() has been removed.
   * Use the useCalculationMethods() hook instead, which fetches
   * methods dynamically from the AlAdhan API with caching.
   */

  /**
   * Complete onboarding
   */
  public async completeOnboarding(): Promise<void> {
    await this.updateSettings({ onboardingCompleted: true });
  }

  /**
   * Check if onboarding is completed
   */
  public async isOnboardingCompleted(): Promise<boolean> {
    const settings = await this.getSettings();
    return settings.onboardingCompleted;
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
      onboardingCompleted: false,

      // Advanced
      highLatitudeRule: 'middleOfNight',

      // Version
      version: '1.0.0',
    };
  }
}

export const SettingsService = SettingsServiceClass.getInstance();
