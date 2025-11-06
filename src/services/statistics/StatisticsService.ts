/**
 * Statistics Service
 * Optimized analytics service for large prayer tracking datasets
 */

import { TrackingService } from '../tracking';
import {
  PrayerStats,
  PrayerName,
  DailyPrayerRecord,
  PrayerStatus,
} from '../../types';

interface AnalyticsCache {
  timeRange: string;
  data: any;
  timestamp: number;
  ttl: number;
}

interface OptimizedPrayerAnalytics {
  name: PrayerName;
  total: number;
  completed: number;
  missed: number;
  delayed: number;
  completionRate: number;
  averageCompletionTime?: string;
  bestDay?: string;
  worstDay?: string;
  trends: {
    daily: Array<{ date: string; completionRate: number }>;
    weekly: Array<{ week: string; completionRate: number }>;
    monthly: Array<{ month: string; completionRate: number }>;
  };
}

interface PerformanceMetrics {
  totalRecords: number;
  processingTime: number;
  memoryUsage?: number;
  cacheHitRate: number;
}

class StatisticsServiceClass {
  private static instance: StatisticsServiceClass;
  private cache = new Map<string, AnalyticsCache>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private performanceMetrics: PerformanceMetrics = {
    totalRecords: 0,
    processingTime: 0,
    cacheHitRate: 0,
  };

  private constructor() {}

  public static getInstance(): StatisticsServiceClass {
    if (!StatisticsServiceClass.instance) {
      StatisticsServiceClass.instance = new StatisticsServiceClass();
    }
    return StatisticsServiceClass.instance;
  }

  /**
   * Get optimized prayer statistics with caching and pagination
   */
  public async getOptimizedStats(
    startDate: Date,
    endDate: Date = new Date(),
    options: {
      includeTrends?: boolean;
      batchSize?: number;
      useCache?: boolean;
    } = {},
  ): Promise<{
    stats: PrayerStats;
    analytics: OptimizedPrayerAnalytics[];
    performance: PerformanceMetrics;
  }> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey(startDate, endDate, options);

    // Check cache first
    if (options.useCache !== false) {
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        this.performanceMetrics.cacheHitRate++;
        return {
          ...cached.data,
          performance: {
            ...this.performanceMetrics,
            processingTime: Date.now() - startTime,
          },
        };
      }
    }

    try {
      // Process data in batches for large datasets
      const batchSize = options.batchSize || 100;
      const stats = await this.processBatchedStats(startDate, endDate, batchSize);

      // Generate optimized analytics
      const analytics = await this.generateOptimizedAnalytics(
        startDate,
        endDate,
        stats,
        options.includeTrends,
      );

      const result = {
        stats,
        analytics,
        performance: {
          ...this.performanceMetrics,
          processingTime: Date.now() - startTime,
        },
      };

      // Cache the result
      if (options.useCache !== false) {
        this.setCachedData(cacheKey, result);
      }

      return result;
    } catch (error) {
      console.error('Failed to get optimized stats:', error);
      throw error;
    }
  }

  /**
   * Process statistics in batches to handle large datasets
   */
  private async processBatchedStats(
    startDate: Date,
    endDate: Date,
    batchSize: number,
  ): Promise<PrayerStats> {
    const allRecords = await TrackingService.exportRecords();
    const dateKeys = this.getDateRange(startDate, endDate);
    
    // Initialize counters
    const aggregatedStats = {
      totalPrayers: 0,
      completedPrayers: 0,
      missedPrayers: 0,
      delayedPrayers: 0,
      currentStreak: 0,
      longestStreak: 0,
      perPrayerStats: {
        fajr: { completed: 0, missed: 0, delayed: 0, completionRate: 0 },
        dhuhr: { completed: 0, missed: 0, delayed: 0, completionRate: 0 },
        asr: { completed: 0, missed: 0, delayed: 0, completionRate: 0 },
        maghrib: { completed: 0, missed: 0, delayed: 0, completionRate: 0 },
        isha: { completed: 0, missed: 0, delayed: 0, completionRate: 0 },
      },
    };

    // Process in batches
    for (let i = 0; i < dateKeys.length; i += batchSize) {
      const batch = dateKeys.slice(i, i + batchSize);
      
      batch.forEach(dateKey => {
        const record = allRecords[dateKey];
        if (!record) return;

        Object.entries(record.prayers).forEach(([prayerName, prayer]) => {
          const name = prayerName as keyof typeof aggregatedStats.perPrayerStats;
          aggregatedStats.totalPrayers++;

          if (prayer.status === PrayerStatus.COMPLETED) {
            aggregatedStats.completedPrayers++;
            aggregatedStats.perPrayerStats[name].completed++;
          } else if (prayer.status === PrayerStatus.MISSED) {
            aggregatedStats.missedPrayers++;
            aggregatedStats.perPrayerStats[name].missed++;
          } else if (prayer.status === PrayerStatus.DELAYED) {
            aggregatedStats.delayedPrayers++;
            aggregatedStats.perPrayerStats[name].delayed++;
          }
        });
      });

      // Yield control to prevent blocking UI
      if (i % (batchSize * 5) === 0) {
        await new Promise(resolve => setTimeout(resolve as any, 0));
      }
    }

    // Calculate completion rates
    const completionRate =
      aggregatedStats.totalPrayers > 0
        ? (aggregatedStats.completedPrayers / aggregatedStats.totalPrayers) * 100
        : 0;

    Object.keys(aggregatedStats.perPrayerStats).forEach(key => {
      const prayerName = key as keyof typeof aggregatedStats.perPrayerStats;
      const stats = aggregatedStats.perPrayerStats[prayerName];
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
      ...aggregatedStats,
      completionRate,
      currentStreak,
      longestStreak,
    };
  }

  /**
   * Generate optimized analytics with trends
   */
  private async generateOptimizedAnalytics(
    startDate: Date,
    endDate: Date,
    stats: PrayerStats,
    includeTrends: boolean = true,
  ): Promise<OptimizedPrayerAnalytics[]> {
    const analytics: OptimizedPrayerAnalytics[] = [];

    (Object.keys(stats.perPrayerStats) as PrayerName[]).forEach(prayerName => {
      const prayerStats = stats.perPrayerStats[prayerName];
      
      const baseAnalytics: OptimizedPrayerAnalytics = {
        name: prayerName,
        total: prayerStats.completed + prayerStats.missed + prayerStats.delayed,
        completed: prayerStats.completed,
        missed: prayerStats.missed,
        delayed: prayerStats.delayed,
        completionRate: prayerStats.completionRate,
        trends: {
          daily: [],
          weekly: [],
          monthly: [],
        },
      };

      // Add trends if requested
      if (includeTrends) {
        baseAnalytics.trends = this.calculateTrends(prayerName, startDate, endDate);
      }

      analytics.push(baseAnalytics);
    });

    return analytics;
  }

  /**
   * Calculate trends for a specific prayer
   */
  private calculateTrends(
    prayerName: PrayerName,
    startDate: Date,
    endDate: Date,
  ): OptimizedPrayerAnalytics['trends'] {
    // For now, return empty trends - this would be implemented with actual data processing
    return {
      daily: [],
      weekly: [],
      monthly: [],
    };
  }

  /**
   * Calculate streaks efficiently
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

  /**
   * Get performance metrics
   */
  public getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Clear cache
   */
  public clearCache(): void {
    this.cache.clear();
    console.log('🗑️ Statistics cache cleared');
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): {
    size: number;
    hitRate: number;
    oldestEntry?: Date;
    newestEntry?: Date;
  } {
    const now = Date.now();
    let oldestTimestamp = now;
    let newestTimestamp = 0;

    this.cache.forEach(entry => {
      oldestTimestamp = Math.min(oldestTimestamp, entry.timestamp);
      newestTimestamp = Math.max(newestTimestamp, entry.timestamp);
    });

    return {
      size: this.cache.size,
      hitRate: this.performanceMetrics.cacheHitRate,
      oldestEntry: this.cache.size > 0 ? new Date(oldestTimestamp) : undefined,
      newestEntry: this.cache.size > 0 ? new Date(newestTimestamp) : undefined,
    };
  }

  // ========== Helper Methods ==========

  private generateCacheKey(
    startDate: Date,
    endDate: Date,
    options: any,
  ): string {
    const optionsStr = JSON.stringify(options);
    return `${this.formatDateKey(startDate)}_${this.formatDateKey(endDate)}_${optionsStr}`;
  }

  private getCachedData(key: string): AnalyticsCache | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, {
      timeRange: key,
      data,
      timestamp: Date.now(),
      ttl: this.DEFAULT_TTL,
    });
  }

  private formatDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private getDateRange(startDate: Date, endDate: Date): string[] {
    const dates: string[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      dates.push(this.formatDateKey(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }
}

export const StatisticsService = StatisticsServiceClass.getInstance();