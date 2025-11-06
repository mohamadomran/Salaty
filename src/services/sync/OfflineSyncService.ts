/**
 * Offline Sync Service
 * Manages offline data synchronization when connection is restored
 */

import { NetworkService } from '../network';
import { PrayerService } from '../prayer';
import { TrackingService } from '../tracking';
import { SettingsService } from '../settings';
import { PrayerCacheService } from '../cache';
import StorageService from '../storage/StorageService';
import { Coordinates, CalculationMethod } from '../../types';

interface SyncTask {
  id: string;
  type: 'prayer_times' | 'tracking_data' | 'settings';
  priority: 'high' | 'medium' | 'low';
  createdAt: number;
  retryCount: number;
  maxRetries: number;
  data: any;
}

interface SyncStatus {
  isOnline: boolean;
  lastSyncAt?: number;
  pendingTasks: number;
  failedTasks: number;
  lastSyncResult?: 'success' | 'partial' | 'failed';
}

class OfflineSyncServiceClass {
  private static instance: OfflineSyncServiceClass;
  private readonly SYNC_TASKS_KEY = '@salaty:sync_tasks';
  private readonly SYNC_STATUS_KEY = '@salaty:sync_status';
  private syncTasks: Map<string, SyncTask> = new Map();
  private isInitialized = false;
  private syncInProgress = false;
  private networkListener: (() => void) | null = null;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): OfflineSyncServiceClass {
    if (!OfflineSyncServiceClass.instance) {
      OfflineSyncServiceClass.instance = new OfflineSyncServiceClass();
    }
    return OfflineSyncServiceClass.instance;
  }

  /**
   * Initialize the sync service
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await this.loadSyncTasks();
      await this.setupNetworkListener();
      await this.cleanupExpiredTasks();
      
      this.isInitialized = true;
      console.log('🔄 Offline sync service initialized');
      
      // Trigger sync if online
      if (NetworkService.isOnline()) {
        await this.triggerSync();
      }
    } catch (error) {
      console.error('Failed to initialize offline sync service:', error);
      this.isInitialized = true;
    }
  }

  /**
   * Load sync tasks from storage
   */
  private async loadSyncTasks(): Promise<void> {
    try {
      const stored = await StorageService.getItem<string>(this.SYNC_TASKS_KEY);
      if (stored) {
        const tasks = JSON.parse(stored) as SyncTask[];
        tasks.forEach(task => {
          this.syncTasks.set(task.id, task);
        });
      }
    } catch (error) {
      console.error('Failed to load sync tasks:', error);
    }
  }

  /**
   * Save sync tasks to storage
   */
  private async saveSyncTasks(): Promise<void> {
    try {
      const tasks = Array.from(this.syncTasks.values());
      await StorageService.setItem(
        this.SYNC_TASKS_KEY,
        JSON.stringify(tasks),
      );
    } catch (error) {
      console.error('Failed to save sync tasks:', error);
    }
  }

  /**
   * Setup network status listener
   */
  private async setupNetworkListener(): Promise<void> {
    this.networkListener = NetworkService.addListener((networkInfo) => {
      if (networkInfo.status === 'online') {
        console.log('🌐 Network restored, triggering sync');
        this.triggerSync();
      } else {
        console.log('📵 Network lost, entering offline mode');
      }
    });
  }

  /**
   * Add a sync task
   */
  public async addSyncTask(
    type: SyncTask['type'],
    data: any,
    priority: SyncTask['priority'] = 'medium',
  ): Promise<void> {
    const task: SyncTask = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      type,
      priority,
      createdAt: Date.now(),
      retryCount: 0,
      maxRetries: type === 'tracking_data' ? 5 : 3,
      data,
    };

    this.syncTasks.set(task.id, task);
    await this.saveSyncTasks();

    console.log(`📝 Added sync task: ${task.type} (${task.priority})`);
  }

  /**
   * Trigger sync process
   */
  public async triggerSync(): Promise<void> {
    if (this.syncInProgress || !NetworkService.isOnline()) {
      return;
    }

    this.syncInProgress = true;
    console.log('🔄 Starting sync process');

    try {
      const tasks = Array.from(this.syncTasks.values())
        .sort((a, b) => {
          // Sort by priority first, then by creation time
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
          if (priorityDiff !== 0) return priorityDiff;
          return a.createdAt - b.createdAt;
        });

      let successCount = 0;
      let failedCount = 0;

      for (const task of tasks) {
        try {
          const success = await this.processSyncTask(task);
          if (success) {
            this.syncTasks.delete(task.id);
            successCount++;
          } else {
            task.retryCount++;
            if (task.retryCount >= task.maxRetries) {
              this.syncTasks.delete(task.id);
              failedCount++;
              console.warn(`❌ Sync task failed after ${task.maxRetries} retries:`, task.id);
            }
          }
        } catch (error) {
          console.error(`❌ Error processing sync task ${task.id}:`, error);
          task.retryCount++;
          if (task.retryCount >= task.maxRetries) {
            this.syncTasks.delete(task.id);
            failedCount++;
          }
        }
      }

      await this.saveSyncTasks();
      await this.updateSyncStatus(successCount, failedCount);

      console.log(`✅ Sync completed: ${successCount} success, ${failedCount} failed`);
    } catch (error) {
      console.error('❌ Sync process failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Process individual sync task
   */
  private async processSyncTask(task: SyncTask): Promise<boolean> {
    switch (task.type) {
      case 'prayer_times':
        return await this.syncPrayerTimes(task.data);
      
      case 'tracking_data':
        return await this.syncTrackingData(task.data);
      
      case 'settings':
        return await this.syncSettings(task.data);
      
      default:
        console.warn(`Unknown sync task type: ${task.type}`);
        return false;
    }
  }

  /**
   * Sync prayer times
   */
  private async syncPrayerTimes(data: {
    coordinates: Coordinates;
    date: Date;
    method: CalculationMethod;
  }): Promise<boolean> {
    try {
      await PrayerService.getPrayerTimes(
        data.coordinates,
        data.date,
        data.method,
      );
      return true;
    } catch (error) {
      console.error('Failed to sync prayer times:', error);
      return false;
    }
  }

  /**
   * Sync tracking data
   */
  private async syncTrackingData(data: any): Promise<boolean> {
    try {
      // For tracking data, we mainly need to ensure it's saved locally
      // The actual sync would involve uploading to a server when that's implemented
      // For now, we'll just validate the data format
      if (data.dailyRecords || data.qadaDebt) {
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to sync tracking data:', error);
      return false;
    }
  }

  /**
   * Sync settings
   */
  private async syncSettings(data: any): Promise<boolean> {
    try {
      // Similar to tracking data, settings sync would involve server upload
      // For now, we'll validate the data format
      if (data.calculationMethod || data.location) {
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to sync settings:', error);
      return false;
    }
  }

  /**
   * Update sync status
   */
  private async updateSyncStatus(successCount: number, failedCount: number): Promise<void> {
    try {
      const status: SyncStatus = {
        isOnline: NetworkService.isOnline(),
        lastSyncAt: Date.now(),
        pendingTasks: this.syncTasks.size,
        failedTasks: failedCount,
        lastSyncResult: failedCount === 0 ? 'success' : successCount > 0 ? 'partial' : 'failed',
      };

      await StorageService.setItem(
        this.SYNC_STATUS_KEY,
        JSON.stringify(status),
      );
    } catch (error) {
      console.error('Failed to update sync status:', error);
    }
  }

  /**
   * Get sync status
   */
  public async getSyncStatus(): Promise<SyncStatus> {
    try {
      const stored = await StorageService.getItem<string>(this.SYNC_STATUS_KEY);
      if (stored) {
        const status = JSON.parse(stored) as SyncStatus;
        status.isOnline = NetworkService.isOnline();
        status.pendingTasks = this.syncTasks.size;
        return status;
      }
    } catch (error) {
      console.error('Failed to get sync status:', error);
    }

    return {
      isOnline: NetworkService.isOnline(),
      pendingTasks: this.syncTasks.size,
      failedTasks: 0,
    };
  }

  /**
   * Cleanup expired tasks
   */
  private async cleanupExpiredTasks(): Promise<void> {
    const now = Date.now();
    const expiredTasks: string[] = [];

    this.syncTasks.forEach((task, id) => {
      // Remove tasks older than 7 days
      if (now - task.createdAt > 7 * 24 * 60 * 60 * 1000) {
        expiredTasks.push(id);
      }
    });

    expiredTasks.forEach(id => this.syncTasks.delete(id));

    if (expiredTasks.length > 0) {
      await this.saveSyncTasks();
      console.log(`🧹 Cleaned up ${expiredTasks.length} expired sync tasks`);
    }
  }

  /**
   * Pre-cache prayer times for offline use
   */
  public async preCacheForOffline(
    coordinates: Coordinates,
    days: number = 30,
  ): Promise<void> {
    try {
      const settings = await SettingsService.getSettings();
      await PrayerService.preCacheUpcomingPrayerTimes(
        coordinates,
        days,
        settings.calculationMethod,
        settings.madhab,
      );
      
      console.log(`📦 Pre-cached ${days} days of prayer times for offline use`);
    } catch (error) {
      console.error('Failed to pre-cache prayer times:', error);
    }
  }

  /**
   * Clear all sync tasks
   */
  public async clearSyncTasks(): Promise<void> {
    this.syncTasks.clear();
    await StorageService.removeItem(this.SYNC_TASKS_KEY);
    console.log('🗑️ Cleared all sync tasks');
  }

  /**
   * Cleanup and destroy service
   */
  public async destroy(): Promise<void> {
    if (this.networkListener) {
      this.networkListener();
      this.networkListener = null;
    }
    
    await this.saveSyncTasks();
    this.isInitialized = false;
    console.log('🔄 Offline sync service destroyed');
  }
}

export const OfflineSyncService = OfflineSyncServiceClass.getInstance();