/**
 * Prayer Tracking Service
 * Manages prayer completion tracking, statistics, and custom prayers
 */

import StorageService from '../storage/StorageService';
import {
  DailyPrayerRecord,
  PrayerRecord,
  PrayerStatus,
  CustomPrayerRecord,
  CustomPrayerType,
  PrayerStats,
  PrayerTypeStats,
  TrackingPreferences,
  QadaDebt,
  QadaPrayerRecord,
} from '../../types';
import { OfflineSyncService } from '../sync';
import { NetworkService } from '../network';

class TrackingServiceClass {
  private static instance: TrackingServiceClass;
  private storageService: typeof StorageService;

  // Storage keys
  private readonly DAILY_RECORDS_KEY = '@salaty:daily_records';
  private readonly PREFERENCES_KEY = '@salaty:tracking_preferences';
  private readonly CUSTOM_PRAYERS_KEY = '@salaty:custom_prayers';
  private readonly QADA_DEBT_KEY = '@salaty:qada_debt';

  private constructor() {
    this.storageService = StorageService;
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): TrackingServiceClass {
    if (!TrackingServiceClass.instance) {
      TrackingServiceClass.instance = new TrackingServiceClass();
    }
    return TrackingServiceClass.instance;
  }

  /**
   * Get or create daily prayer record for a specific date
   */
  public async getDailyRecord(
    date: Date = new Date(),
  ): Promise<DailyPrayerRecord> {
    const dateKey = this.formatDateKey(date);
    const allRecords = await this.getAllRecords();

    const existingRecord = allRecords[dateKey];
    if (existingRecord) {
      return existingRecord;
    }

    // Create new record with all prayers pending
    const newRecord: DailyPrayerRecord = {
      date: dateKey,
      prayers: {
        fajr: this.createPrayerRecord('fajr'),
        dhuhr: this.createPrayerRecord('dhuhr'),
        asr: this.createPrayerRecord('asr'),
        maghrib: this.createPrayerRecord('maghrib'),
        isha: this.createPrayerRecord('isha'),
      },
      customPrayers: [],
      updatedAt: new Date(),
    };

    return newRecord;
  }

  /**
   * Update prayer status
   */
  public async updatePrayerStatus(
    prayerName: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha',
    status: PrayerStatus,
    date: Date = new Date(),
    notes?: string,
  ): Promise<DailyPrayerRecord> {
    const dateKey = this.formatDateKey(date);
    const allRecords = await this.getAllRecords();
    const dailyRecord = await this.getDailyRecord(date);

    // Handle QADA status by adding to qada debt
    if (status === PrayerStatus.QADA) {
      await this.addToQadaDebt(prayerName, date, notes);
      
      // Mark the original prayer as missed for record keeping
      dailyRecord.prayers[prayerName] = {
        prayerName,
        status: PrayerStatus.MISSED,
        notes,
        wasDelayed: false,
      };
    } else {
      // Update the specific prayer normally
      dailyRecord.prayers[prayerName] = {
        prayerName,
        status,
        completedAt:
          status === PrayerStatus.COMPLETED || status === PrayerStatus.DELAYED
            ? new Date()
            : undefined,
        notes,
        wasDelayed: status === PrayerStatus.DELAYED,
      };
    }
    
    dailyRecord.updatedAt = new Date();

    // Save updated record
    allRecords[dateKey] = dailyRecord;
    await this.storageService.setItem(
      this.DAILY_RECORDS_KEY,
      JSON.stringify(allRecords),
    );

    // Queue for sync if offline
    if (NetworkService.isOffline()) {
      await OfflineSyncService.addSyncTask('tracking_data', {
        type: 'prayer_status_update',
        dateKey,
        prayerName,
        status,
        notes,
        updatedAt: dailyRecord.updatedAt,
      }, 'high');
    }

    return dailyRecord;
  }

  /**
   * Add or update custom prayer
   */
  public async updateCustomPrayer(
    customPrayer: CustomPrayerRecord,
    date: Date = new Date(),
  ): Promise<DailyPrayerRecord> {
    const dateKey = this.formatDateKey(date);
    const allRecords = await this.getAllRecords();
    const dailyRecord = await this.getDailyRecord(date);

    if (!dailyRecord.customPrayers) {
      dailyRecord.customPrayers = [];
    }

    // Find existing or add new
    const existingIndex = dailyRecord.customPrayers.findIndex(
      p => p.id === customPrayer.id,
    );
    if (existingIndex >= 0) {
      dailyRecord.customPrayers[existingIndex] = customPrayer;
    } else {
      dailyRecord.customPrayers.push(customPrayer);
    }

    dailyRecord.updatedAt = new Date();

    // Save updated record
    allRecords[dateKey] = dailyRecord;
    await this.storageService.setItem(
      this.DAILY_RECORDS_KEY,
      JSON.stringify(allRecords),
    );

    // Queue for sync if offline
    if (NetworkService.isOffline()) {
      await OfflineSyncService.addSyncTask('tracking_data', {
        type: 'custom_prayer_update',
        dateKey,
        customPrayer,
        updatedAt: dailyRecord.updatedAt,
      }, 'medium');
    }

    return dailyRecord;
  }

  /**
   * Delete custom prayer
   */
  public async deleteCustomPrayer(
    prayerId: string,
    date: Date = new Date(),
  ): Promise<DailyPrayerRecord> {
    const dateKey = this.formatDateKey(date);
    const allRecords = await this.getAllRecords();
    const dailyRecord = await this.getDailyRecord(date);

    if (dailyRecord.customPrayers) {
      dailyRecord.customPrayers = dailyRecord.customPrayers.filter(
        p => p.id !== prayerId,
      );
      dailyRecord.updatedAt = new Date();

      allRecords[dateKey] = dailyRecord;
      await this.storageService.setItem(
        this.DAILY_RECORDS_KEY,
        JSON.stringify(allRecords),
      );
    }

    return dailyRecord;
  }

  /**
   * Get prayer statistics for a time period
   */
  public async getStats(
    startDate: Date,
    endDate: Date = new Date(),
  ): Promise<PrayerStats> {
    const allRecords = await this.getAllRecords();
    const dateKeys = this.getDateRange(startDate, endDate);

    // Initialize counters
    let totalPrayers = 0;
    let completedPrayers = 0;
    let missedPrayers = 0;
    let delayedPrayers = 0;

    const perPrayerStats: PrayerStats['perPrayerStats'] = {
      fajr: { completed: 0, missed: 0, delayed: 0, completionRate: 0 },
      dhuhr: { completed: 0, missed: 0, delayed: 0, completionRate: 0 },
      asr: { completed: 0, missed: 0, delayed: 0, completionRate: 0 },
      maghrib: { completed: 0, missed: 0, delayed: 0, completionRate: 0 },
      isha: { completed: 0, missed: 0, delayed: 0, completionRate: 0 },
    };

    // Calculate stats for each day
    dateKeys.forEach(dateKey => {
      const record = allRecords[dateKey];
      if (!record) return;

      Object.entries(record.prayers).forEach(([prayerName, prayer]) => {
        const name = prayerName as keyof typeof record.prayers;
        totalPrayers++;

        if (prayer.status === PrayerStatus.COMPLETED) {
          completedPrayers++;
          perPrayerStats[name].completed++;
        } else if (prayer.status === PrayerStatus.MISSED) {
          missedPrayers++;
          perPrayerStats[name].missed++;
        } else if (prayer.status === PrayerStatus.DELAYED) {
          delayedPrayers++;
          perPrayerStats[name].delayed++;
        }
      });
    });

    // Calculate completion rates
    const completionRate =
      totalPrayers > 0 ? (completedPrayers / totalPrayers) * 100 : 0;
    Object.keys(perPrayerStats).forEach(key => {
      const prayerName = key as keyof typeof perPrayerStats;
      const stats = perPrayerStats[prayerName];
      const total = stats.completed + stats.missed + stats.delayed;
      stats.completionRate = total > 0 ? (stats.completed / total) * 100 : 0;
    });

    // Calculate streaks
    const { currentStreak, longestStreak } = this.calculateStreaks(
      allRecords,
      dateKeys,
    );

    return {
      period: 'custom',
      startDate: this.formatDateKey(startDate),
      endDate: this.formatDateKey(endDate),
      totalPrayers,
      completedPrayers,
      missedPrayers,
      delayedPrayers,
      completionRate,
      currentStreak,
      longestStreak,
      perPrayerStats,
    };
  }

  /**
   * Get tracking preferences
   */
  public async getPreferences(): Promise<TrackingPreferences> {
    const stored = await this.storageService.getItem<string>(this.PREFERENCES_KEY);

    if (stored) {
      return JSON.parse(stored) as TrackingPreferences;
    }

    // Default preferences
    const defaultPreferences: TrackingPreferences = {
      autoMarkMissed: true,
      markAsDelayedThreshold: 30, // 30 minutes
      enableCustomPrayers: true,
      defaultCustomPrayers: [
        CustomPrayerType.SUNNAH_FAJR,
        CustomPrayerType.WITR,
      ],
      notifications: {
        enabled: true,
        beforeMinutes: 15,
        athanEnabled: true,
        vibrationEnabled: true,
        reminderForMissed: true,
      },
    };

    await this.setPreferences(defaultPreferences);
    return defaultPreferences;
  }

  /**
   * Update tracking preferences
   */
  public async setPreferences(preferences: TrackingPreferences): Promise<void> {
    await this.storageService.setItem(
      this.PREFERENCES_KEY,
      JSON.stringify(preferences),
    );
  }

  /**
   * Export all prayer records (for backup)
   */
  public async exportRecords(): Promise<Record<string, DailyPrayerRecord>> {
    return this.getAllRecords();
  }

  /**
   * Import prayer records (from backup)
   */
  public async importRecords(
    records: Record<string, DailyPrayerRecord>,
  ): Promise<void> {
    await this.storageService.setItem(
      this.DAILY_RECORDS_KEY,
      JSON.stringify(records),
    );
  }

  /**
   * Clear all tracking data
   */
  public async clearAllData(): Promise<void> {
    await this.storageService.removeItem(this.DAILY_RECORDS_KEY);
  }

  // ========== Private Helper Methods ==========

  /**
   * Get all daily records from storage
   */
  private async getAllRecords(): Promise<Record<string, DailyPrayerRecord>> {
    const stored = await this.storageService.getItem<string>(this.DAILY_RECORDS_KEY);
    return stored ? JSON.parse(stored) as Record<string, DailyPrayerRecord> : {};
  }

  /**
   * Create an initial prayer record
   */
  private createPrayerRecord(
    prayerName: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha',
  ): PrayerRecord {
    return {
      prayerName,
      status: PrayerStatus.PENDING,
    };
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
   * Get array of date keys between start and end date
   */
  private getDateRange(startDate: Date, endDate: Date): string[] {
    const dates: string[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      dates.push(this.formatDateKey(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }

  /**
   * Calculate current and longest prayer streaks
   */
  private calculateStreaks(
    allRecords: Record<string, DailyPrayerRecord>,
    dateKeys: string[],
  ): { currentStreak: number; longestStreak: number } {
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Sort dates in reverse (most recent first)
    const sortedDates = [...dateKeys].sort().reverse();

    for (const dateKey of sortedDates) {
      const record = allRecords[dateKey];

      if (!record) {
        if (tempStreak > 0 && currentStreak === 0) {
          break; // End current streak calculation
        }
        continue;
      }

      // Check if all prayers are completed
      const allCompleted = Object.values(record.prayers).every(
        prayer =>
          prayer.status === PrayerStatus.COMPLETED ||
          prayer.status === PrayerStatus.DELAYED,
      );

      if (allCompleted) {
        tempStreak++;
        if (currentStreak === 0) {
          currentStreak = tempStreak;
        }
      } else {
        if (currentStreak === 0) {
          currentStreak = 0; // Set current streak to 0 if not all completed
        }
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
        tempStreak = 0;
      }
    }

    // Check if final streak is the longest
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }

    return { currentStreak, longestStreak };
  }

  // ========== Qada (Makeup Prayer) Management ==========

  /**
   * Get current qada debt
   */
  public async getQadaDebt(): Promise<QadaDebt> {
    const stored = await this.storageService.getItem<string>(this.QADA_DEBT_KEY);

    if (stored) {
      return JSON.parse(stored) as QadaDebt;
    }

    // Initialize empty qada debt
    const emptyDebt: QadaDebt = {
      prayers: {
        fajr: [],
        dhuhr: [],
        asr: [],
        maghrib: [],
        isha: [],
      },
      totalPending: 0,
      lastUpdated: new Date(),
    };

    await this.storageService.setItem(
      this.QADA_DEBT_KEY,
      JSON.stringify(emptyDebt),
    );

    return emptyDebt;
  }

  /**
   * Add a missed prayer to qada debt
   */
  public async addToQadaDebt(
    prayerName: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha',
    date: Date,
    notes?: string,
  ): Promise<QadaDebt> {
    const debt = await this.getQadaDebt();

    // Create new qada record
    const qadaRecord: QadaPrayerRecord = {
      id: `${prayerName}_${date.getTime()}_${Date.now()}`,
      prayerName,
      originalDate: this.formatDateKey(date),
      missedAt: new Date(),
      isCompleted: false,
      notes,
    };

    // Add to appropriate prayer array
    debt.prayers[prayerName].push(qadaRecord);
    debt.totalPending++;
    debt.lastUpdated = new Date();

    // Save updated debt
    await this.storageService.setItem(
      this.QADA_DEBT_KEY,
      JSON.stringify(debt),
    );

    // Queue for sync if offline
    if (NetworkService.isOffline()) {
      await OfflineSyncService.addSyncTask('tracking_data', {
        type: 'qada_debt_update',
        qadaRecord,
        operation: 'add',
        updatedAt: debt.lastUpdated,
      }, 'medium');
    }

    return debt;
  }

  /**
   * Mark a qada prayer as completed
   */
  public async completeQada(qadaId: string): Promise<QadaDebt> {
    const debt = await this.getQadaDebt();

    // Find and update the qada record
    let found = false;
    Object.keys(debt.prayers).forEach(prayerName => {
      const name = prayerName as keyof typeof debt.prayers;
      const qadaIndex = debt.prayers[name].findIndex(q => q.id === qadaId);

      if (qadaIndex >= 0) {
        debt.prayers[name][qadaIndex].isCompleted = true;
        debt.prayers[name][qadaIndex].completedAt = new Date();
        debt.totalPending--;
        found = true;
      }
    });

    if (found) {
      debt.lastUpdated = new Date();
      await this.storageService.setItem(
        this.QADA_DEBT_KEY,
        JSON.stringify(debt),
      );
    }

    return debt;
  }

  /**
   * Remove a qada prayer from the debt list
   */
  public async removeQada(qadaId: string): Promise<QadaDebt> {
    const debt = await this.getQadaDebt();

    // Find and remove the qada record
    let found = false;
    Object.keys(debt.prayers).forEach(prayerName => {
      const name = prayerName as keyof typeof debt.prayers;
      const originalLength = debt.prayers[name].length;
      debt.prayers[name] = debt.prayers[name].filter(q => q.id !== qadaId);

      if (debt.prayers[name].length < originalLength) {
        found = true;
        // Only decrease totalPending if it was not yet completed
        const wasCompleted = debt.prayers[name].find(q => q.id === qadaId)
          ?.isCompleted;
        if (!wasCompleted) {
          debt.totalPending--;
        }
      }
    });

    if (found) {
      debt.lastUpdated = new Date();
      await this.storageService.setItem(
        this.QADA_DEBT_KEY,
        JSON.stringify(debt),
      );
    }

    return debt;
  }

  /**
   * Get all pending (incomplete) qada prayers
   */
  public async getPendingQadas(): Promise<QadaPrayerRecord[]> {
    const debt = await this.getQadaDebt();
    const allPending: QadaPrayerRecord[] = [];

    Object.values(debt.prayers).forEach(prayerArray => {
      const pending = prayerArray.filter(q => !q.isCompleted);
      allPending.push(...pending);
    });

    // Sort by missedAt date (oldest first)
    return allPending.sort(
      (a, b) => new Date(a.missedAt).getTime() - new Date(b.missedAt).getTime(),
    );
  }

  /**
   * Get pending qadas for a specific prayer
   */
  public async getPendingQadasForPrayer(
    prayerName: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha',
  ): Promise<QadaPrayerRecord[]> {
    const debt = await this.getQadaDebt();
    return debt.prayers[prayerName].filter(q => !q.isCompleted);
  }

  /**
   * Clear all completed qada prayers from storage
   */
  public async clearCompletedQadas(): Promise<QadaDebt> {
    const debt = await this.getQadaDebt();

    // Remove completed qadas from each prayer array
    Object.keys(debt.prayers).forEach(prayerName => {
      const name = prayerName as keyof typeof debt.prayers;
      debt.prayers[name] = debt.prayers[name].filter(q => !q.isCompleted);
    });

    debt.lastUpdated = new Date();
    await this.storageService.setItem(
      this.QADA_DEBT_KEY,
      JSON.stringify(debt),
    );

    return debt;
  }

  // ========== Offline Support Methods ==========

  /**
   * Initialize offline tracking capabilities
   */
  public async initializeOfflineTracking(): Promise<void> {
    try {
      // Initialize offline sync service
      await OfflineSyncService.initialize();
      
      // Clean up any expired cache entries
      // Note: This would be implemented if we add caching to tracking service
      
      console.log('📱 Offline tracking initialized');
    } catch (error) {
      console.error('Failed to initialize offline tracking:', error);
    }
  }

  /**
   * Get offline status
   */
  public getOfflineStatus(): {
    isOffline: boolean;
    hasPendingSync: boolean;
    lastSyncAt?: number;
  } {
    return {
      isOffline: NetworkService.isOffline(),
      hasPendingSync: false, // This would be populated from sync service
    };
  }

  /**
   * Force sync of tracking data
   */
  public async forceSyncTrackingData(): Promise<void> {
    try {
      // Add current tracking data to sync queue
      const allRecords = await this.getAllRecords();
      const qadaDebt = await this.getQadaDebt();
      
      await OfflineSyncService.addSyncTask('tracking_data', {
        type: 'full_sync',
        dailyRecords: allRecords,
        qadaDebt: qadaDebt,
        syncedAt: Date.now(),
      }, 'low');
      
      // Trigger sync if online
      if (NetworkService.isOnline()) {
        await OfflineSyncService.triggerSync();
      }
    } catch (error) {
      console.error('Failed to force sync tracking data:', error);
    }
  }

  /**
   * Get tracking data for backup/export
   */
  public async getTrackingDataForBackup(): Promise<{
    dailyRecords: Record<string, DailyPrayerRecord>;
    qadaDebt: QadaDebt;
    exportedAt: string;
  }> {
    const dailyRecords = await this.getAllRecords();
    const qadaDebt = await this.getQadaDebt();
    
    return {
      dailyRecords,
      qadaDebt,
      exportedAt: new Date().toISOString(),
    };
  }
}

export const TrackingService = TrackingServiceClass.getInstance();
