/**
 * Statistics Screen - Advanced Prayer Analytics
 * Comprehensive prayer tracking analytics with charts and insights
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import {
  Text,
  Card,
  useTheme,
  SegmentedButtons,
  Divider,
} from 'react-native-paper';
import { StatisticsService } from '../services/statistics';
import { useAppContext, useLanguage } from '../contexts';
import { useReactiveUpdates } from '../hooks/useReactiveUpdates';
import { getPrayerName } from '../constants';
import { PrayerStatus, PrayerName } from '../types';
import type { ExpressiveTheme } from '../theme';
import { StatsCard } from '../components/tracking';
import { PageHeader } from '../components';

type TimeRange = 'week' | 'month' | 'year';

interface PrayerAnalytics {
  name: PrayerName;
  total: number;
  completed: number;
  missed: number;
  delayed: number;
  completionRate: number;
}

interface StreakData {
  current: number;
  longest: number;
  thisMonth: number;
  lastMonth: number;
}

export default function StatisticsScreen() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const theme = useTheme<ExpressiveTheme>();
  const { state } = useAppContext();
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<PrayerAnalytics[]>([]);
  const [streaks, setStreaks] = useState<StreakData | null>(null);
  
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Subscribe to reactive updates
  useReactiveUpdates({
    onPrayerStatusChanged: (data: any) => {
      console.log('StatisticsScreen: Prayer status changed, refreshing analytics');
      loadAnalytics();
    },
  });

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      
      // Calculate date range based on selection
      const endDate = new Date();
      const startDate = getStartDate(timeRange, endDate);
      
      // Get comprehensive statistics
      const { stats, analytics, performance } = await StatisticsService.getOptimizedStats(
        startDate,
        endDate,
        { includeTrends: true, useCache: true }
      );
      const prayerAnalytics: PrayerAnalytics[] = [];
      
      // Process each prayer type
      (Object.keys(stats.perPrayerStats) as PrayerName[]).forEach(prayerName => {
        const prayerStats = stats.perPrayerStats[prayerName];
        prayerAnalytics.push({
          name: prayerName,
          total: prayerStats.completed + prayerStats.missed + prayerStats.delayed,
          completed: prayerStats.completed,
          missed: prayerStats.missed,
          delayed: prayerStats.delayed,
          completionRate: prayerStats.completionRate,
        });
      });
      
      setAnalytics(prayerAnalytics);
      
      // Calculate streaks
      setStreaks({
        current: stats.currentStreak,
        longest: stats.longestStreak,
        thisMonth: await calculateMonthlyStreak(new Date().getMonth(), new Date().getFullYear()),
        lastMonth: await calculateMonthlyStreak(new Date().getMonth() - 1, new Date().getFullYear()),
      });
      
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const getStartDate = (range: TimeRange, endDate: Date): Date => {
    const start = new Date(endDate);
    switch (range) {
      case 'week':
        start.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        start.setMonth(endDate.getMonth() - 1);
        break;
      case 'year':
        start.setFullYear(endDate.getFullYear() - 1);
        break;
    }
    return start;
  };

  const calculateMonthlyStreak = async (month: number, year: number): Promise<number> => {
    // Implementation for monthly streak calculation
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    const { stats } = await StatisticsService.getOptimizedStats(startDate, endDate);
    return stats.currentStreak;
  };

  const getPrayerIcon = (prayerName: PrayerName): string => {
    const icons: Record<PrayerName, string> = {
      fajr: 'weather-sunset-up',
      dhuhr: 'white-balance-sunny',
      asr: 'weather-partly-cloudy',
      maghrib: 'weather-sunset-down',
      isha: 'weather-night',
    };
    return icons[prayerName];
  };

  const getPrayerDisplayName = (prayerName: PrayerName): string => {
    return prayerName.charAt(0).toUpperCase() + prayerName.slice(1);
  };

  const getStatusColor = (status: PrayerStatus): string => {
    switch (status) {
      case PrayerStatus.COMPLETED:
        return theme.expressiveColors.prayerCompleted;
      case PrayerStatus.MISSED:
        return theme.expressiveColors.prayerMissed;
      case PrayerStatus.DELAYED:
        return theme.expressiveColors.prayerUpcoming;
      default:
        return theme.colors.outline;
    }
  };

  const renderContent = () => (
    <>
      {/* Summary Cards */}
      <StatsCard
        title={t('statistics.overallPerformance')}
        stats={[
          { label: t('statistics.totalPrayers'), value: analytics.reduce((sum, a) => sum + a.total, 0) },
          { label: t('status.completed'), value: analytics.reduce((sum, a) => sum + a.completed, 0), color: theme.expressiveColors.prayerCompleted },
          { label: t('status.missed'), value: analytics.reduce((sum, a) => sum + a.missed, 0), color: theme.expressiveColors.prayerMissed },
          { label: t('status.delayed'), value: analytics.reduce((sum, a) => sum + a.delayed, 0), color: theme.expressiveColors.prayerUpcoming },
        ]}
      />

      {/* Prayer Streaks */}
      {streaks && (
        <StatsCard
          title={t('statistics.prayerStreaks')}
          stats={[
            { label: t('statistics.currentStreak'), value: `${streaks.current} ${t('statistics.days')}`, color: theme.colors.primary },
            { label: t('statistics.longestStreak'), value: `${streaks.longest} ${t('statistics.days')}` },
            { label: t('statistics.thisMonth'), value: `${streaks.thisMonth} ${t('statistics.days')}` },
            { label: t('statistics.lastMonth'), value: `${streaks.lastMonth} ${t('statistics.days')}` },
          ]}
        />
      )}

      {/* Performance by Prayer */}
      {analytics.map((prayer) => (
        <Card key={prayer.name} style={styles.prayerDetailCard} mode="elevated">
          <Card.Content>
            <View style={styles.prayerHeader}>
              <View style={styles.prayerTitleRow}>
                <Text variant="titleLarge">{getPrayerDisplayName(prayer.name)}</Text>
                <Text
                  variant="headlineMedium"
                  style={{ color: getStatusColor(PrayerStatus.COMPLETED) }}
                >
                  {prayer.completionRate.toFixed(1)}%
                </Text>
              </View>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.prayerStatsGrid}>
              <View style={styles.statBox}>
                <Text variant="titleMedium" style={{ color: getStatusColor(PrayerStatus.COMPLETED) }}>
                  {prayer.completed}
                </Text>
                <Text variant="bodySmall">{t('status.completed')}</Text>
              </View>
              <View style={styles.statBox}>
                <Text variant="titleMedium" style={{ color: getStatusColor(PrayerStatus.MISSED) }}>
                  {prayer.missed}
                </Text>
                <Text variant="bodySmall">{t('status.missed')}</Text>
              </View>
              <View style={styles.statBox}>
                <Text variant="titleMedium" style={{ color: getStatusColor(PrayerStatus.DELAYED) }}>
                  {prayer.delayed}
                </Text>
                <Text variant="bodySmall">{t('status.delayed')}</Text>
              </View>
              <View style={styles.statBox}>
                <Text variant="titleMedium" style={{ color: theme.colors.primary }}>
                  {prayer.total}
                </Text>
                <Text variant="bodySmall">Total</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      ))}
    </>
  );

  if (loading) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text variant="bodyLarge">Loading analytics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <PageHeader
          title={t('statistics.title')}
          subtitle={t('statistics.subtitle')}
        />

        {/* Time Range Selector */}
        <SegmentedButtons
          value={timeRange}
          onValueChange={setTimeRange}
          buttons={[
            { value: 'week', label: 'Week' },
            { value: 'month', label: 'Month' },
            { value: 'year', label: 'Year' },
          ]}
          style={styles.timeRangeSelector}
        />

        {/* All Content */}
        <View style={styles.contentContainer}>
          {renderContent()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: ExpressiveTheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100, // Space for bottom navigation
  },
  timeRangeSelector: {
    marginBottom: 24,
  },
  contentContainer: {
    gap: 16,
  },
  prayerDetailCard: {
    marginBottom: 16,
  },
  prayerHeader: {
    marginBottom: 16,
  },
  prayerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    marginBottom: 16,
    backgroundColor: theme.colors.outline,
  },
  prayerStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
});