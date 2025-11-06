/**
 * Statistics Screen - Advanced Prayer Analytics
 * Comprehensive prayer tracking analytics with charts and insights
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  Card,
  Button,
  useTheme,
  SegmentedButtons,
  FAB,
  Portal,
  Modal,
  List,
  Divider,
} from 'react-native-paper';
import { StatisticsService } from '../services/statistics';
import { useAppContext } from '../contexts';
import { useReactiveUpdates } from '../hooks/useReactiveUpdates';
import { PrayerStatus, PrayerName } from '../types';
import type { ExpressiveTheme } from '../theme';
import { StatsCard } from '../components/tracking';

const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 375;

type TimeRange = 'week' | 'month' | 'quarter' | 'year' | 'all';
type StatCategory = 'overview' | 'prayers' | 'streaks' | 'trends';

interface PrayerAnalytics {
  name: PrayerName;
  total: number;
  completed: number;
  missed: number;
  delayed: number;
  completionRate: number;
  averageCompletionTime?: string;
  bestDay?: string;
  worstDay?: string;
}

interface StreakData {
  current: number;
  longest: number;
  thisMonth: number;
  lastMonth: number;
}

interface TrendData {
  daily: Array<{ date: string; completed: number; total: number }>;
  weekly: Array<{ week: string; completionRate: number }>;
  monthly: Array<{ month: string; completionRate: number }>;
}

export default function StatisticsScreen() {
  const theme = useTheme<ExpressiveTheme>();
  const { state } = useAppContext();
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [category, setCategory] = useState<StatCategory>('overview');
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<PrayerAnalytics[]>([]);
  const [streaks, setStreaks] = useState<StreakData | null>(null);
  const [trends, setTrends] = useState<TrendData | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedPrayer, setSelectedPrayer] = useState<PrayerAnalytics | null>(null);

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
      
      // Generate trend data
      setTrends(await generateTrendData(startDate, endDate));
      
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
      case 'quarter':
        start.setMonth(endDate.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(endDate.getFullYear() - 1);
        break;
      case 'all':
        start.setFullYear(2020); // Or app launch date
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

  const generateTrendData = async (startDate: Date, endDate: Date): Promise<TrendData> => {
    // Generate daily, weekly, and monthly trend data
    const daily = [];
    const weekly = [];
    const monthly = [];
    
    // This would involve more complex data processing
    // For now, return placeholder data
    return {
      daily: [],
      weekly: [],
      monthly: [],
    };
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

  const renderOverview = () => (
    <View style={styles.overviewContainer}>
      {/* Summary Cards */}
      <StatsCard
        title="Overall Performance"
        stats={[
          { label: 'Total Prayers', value: analytics.reduce((sum, a) => sum + a.total, 0) },
          { label: 'Completed', value: analytics.reduce((sum, a) => sum + a.completed, 0), color: theme.expressiveColors.prayerCompleted },
          { label: 'Missed', value: analytics.reduce((sum, a) => sum + a.missed, 0), color: theme.expressiveColors.prayerMissed },
          { label: 'Delayed', value: analytics.reduce((sum, a) => sum + a.delayed, 0), color: theme.expressiveColors.prayerUpcoming },
        ]}
      />

      {streaks && (
        <StatsCard
          title="Prayer Streaks"
          stats={[
            { label: 'Current Streak', value: `${streaks.current} days`, color: theme.colors.primary },
            { label: 'Longest Streak', value: `${streaks.longest} days` },
            { label: 'This Month', value: `${streaks.thisMonth} days` },
            { label: 'Last Month', value: `${streaks.lastMonth} days` },
          ]}
        />
      )}

      {/* Performance by Prayer */}
      <Card style={styles.prayerPerformanceCard} mode="elevated">
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>
            Performance by Prayer
          </Text>
          <View style={styles.prayerList}>
            {analytics.map((prayer) => (
              <View key={prayer.name} style={styles.prayerStatRow}>
                <View style={styles.prayerInfo}>
                  <Text variant="bodyLarge" style={styles.prayerName}>
                    {getPrayerDisplayName(prayer.name)}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {prayer.completed}/{prayer.total} prayers
                  </Text>
                </View>
                <View style={styles.prayerMetrics}>
                  <Text
                    variant="titleMedium"
                    style={{ color: getStatusColor(PrayerStatus.COMPLETED) }}
                  >
                    {prayer.completionRate.toFixed(1)}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>
    </View>
  );

  const renderPrayers = () => (
    <View style={styles.prayersContainer}>
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
                <Text variant="bodySmall">Completed</Text>
              </View>
              <View style={styles.statBox}>
                <Text variant="titleMedium" style={{ color: getStatusColor(PrayerStatus.MISSED) }}>
                  {prayer.missed}
                </Text>
                <Text variant="bodySmall">Missed</Text>
              </View>
              <View style={styles.statBox}>
                <Text variant="titleMedium" style={{ color: getStatusColor(PrayerStatus.DELAYED) }}>
                  {prayer.delayed}
                </Text>
                <Text variant="bodySmall">Delayed</Text>
              </View>
              <View style={styles.statBox}>
                <Text variant="titleMedium" style={{ color: theme.colors.primary }}>
                  {prayer.total}
                </Text>
                <Text variant="bodySmall">Total</Text>
              </View>
            </View>
            
            <Button
              mode="text"
              onPress={() => {
                setSelectedPrayer(prayer);
                setShowDetails(true);
              }}
              style={styles.detailsButton}
            >
              View Details
            </Button>
          </Card.Content>
        </Card>
      ))}
    </View>
  );

  const renderStreaks = () => (
    <View style={styles.streaksContainer}>
      {streaks && (
        <>
          <StatsCard
            title="Streak Analysis"
            stats={[
              { label: 'Current Streak', value: `${streaks.current} days`, color: theme.colors.primary },
              { label: 'Longest Streak', value: `${streaks.longest} days` },
              { label: 'This Month', value: `${streaks.thisMonth} days` },
              { label: 'Last Month', value: `${streaks.lastMonth} days` },
            ]}
          />
          
          <Card style={styles.streakInsightsCard} mode="elevated">
            <Card.Content>
              <Text variant="titleMedium" style={styles.cardTitle}>
                Streak Insights
              </Text>
              <Text variant="bodyMedium" style={styles.insightText}>
                {streaks.current > 0
                  ? `Great job! You've maintained a ${streaks.current}-day prayer streak. Keep it up!`
                  : 'Start your prayer streak today by completing all prayers.'}
              </Text>
              {streaks.thisMonth > streaks.lastMonth && (
                <Text variant="bodyMedium" style={[styles.insightText, styles.positiveInsight]}>
                  Your consistency has improved this month! 🎉
                </Text>
              )}
            </Card.Content>
          </Card>
        </>
      )}
    </View>
  );

  const renderTrends = () => (
    <View style={styles.trendsContainer}>
      <Card style={styles.trendsCard} mode="elevated">
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>
            Prayer Trends
          </Text>
          <Text variant="bodyMedium" style={styles.comingSoonText}>
            Advanced trend analysis with charts and graphs coming soon!
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
            This will include daily/weekly/monthly completion rates, best performing times, and predictive insights.
          </Text>
        </Card.Content>
      </Card>
    </View>
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
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Prayer Analytics
        </Text>
        
        {/* Time Range Selector */}
        <SegmentedButtons
          value={timeRange}
          onValueChange={setTimeRange}
          buttons={[
            { value: 'week', label: 'Week' },
            { value: 'month', label: 'Month' },
            { value: 'quarter', label: 'Quarter' },
            { value: 'year', label: 'Year' },
            { value: 'all', label: 'All' },
          ]}
          style={styles.timeRangeSelector}
        />
      </View>

      {/* Category Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categorySelector}
        contentContainerStyle={styles.categoryContainer}
      >
        {(['overview', 'prayers', 'streaks', 'trends'] as StatCategory[]).map((cat) => (
          <Button
            key={cat}
            mode={category === cat ? 'contained' : 'outlined'}
            onPress={() => setCategory(cat)}
            style={styles.categoryButton}
            compact
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </Button>
        ))}
      </ScrollView>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {category === 'overview' && renderOverview()}
        {category === 'prayers' && renderPrayers()}
        {category === 'streaks' && renderStreaks()}
        {category === 'trends' && renderTrends()}
      </ScrollView>

      {/* Prayer Details Modal */}
      <Portal>
        <Modal
          visible={showDetails}
          onDismiss={() => setShowDetails(false)}
          contentContainerStyle={styles.modalContainer}
        >
          {selectedPrayer && (
            <Card style={styles.modalCard}>
              <Card.Content>
                <Text variant="titleLarge" style={styles.modalTitle}>
                  {getPrayerDisplayName(selectedPrayer.name)} Details
                </Text>
                
                <View style={styles.detailStats}>
                  <View style={styles.detailRow}>
                    <Text variant="bodyMedium">Total Prayers:</Text>
                    <Text variant="bodyMedium">{selectedPrayer.total}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text variant="bodyMedium">Completion Rate:</Text>
                    <Text variant="bodyMedium">{selectedPrayer.completionRate.toFixed(1)}%</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text variant="bodyMedium">Best Performance:</Text>
                    <Text variant="bodyMedium">{selectedPrayer.bestDay || 'N/A'}</Text>
                  </View>
                </View>
                
                <Button
                  mode="contained"
                  onPress={() => setShowDetails(false)}
                  style={styles.modalButton}
                >
                  Close
                </Button>
              </Card.Content>
            </Card>
          )}
        </Modal>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  timeRangeSelector: {
    marginTop: 8,
  },
  categorySelector: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  categoryContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  categoryButton: {
    marginRight: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  overviewContainer: {
    gap: 16,
  },
  prayersContainer: {
    gap: 16,
  },
  streaksContainer: {
    gap: 16,
  },
  trendsContainer: {
    gap: 16,
  },
  prayerPerformanceCard: {
    marginTop: 16,
  },
  cardTitle: {
    marginBottom: 16,
    fontWeight: '600',
  },
  prayerList: {
    gap: 12,
  },
  prayerStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  prayerInfo: {
    flex: 1,
  },
  prayerName: {
    fontWeight: '600',
  },
  prayerMetrics: {
    alignItems: 'flex-end',
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
  detailsButton: {
    alignSelf: 'flex-start',
  },
  streakInsightsCard: {
    marginTop: 16,
  },
  insightText: {
    lineHeight: 22,
  },
  positiveInsight: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  trendsCard: {
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  comingSoonText: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
  modalContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
    justifyContent: 'center',
  },
  modalCard: {
    borderRadius: 16,
  },
  modalTitle: {
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  detailStats: {
    gap: 12,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalButton: {
    marginTop: 8,
  },
});