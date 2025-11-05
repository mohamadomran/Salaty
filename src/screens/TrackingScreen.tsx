/**
 * Tracking Screen - Prayer Tracking
 * Track daily prayers with checkboxes, notes, and statistics
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Card, Divider, FAB, useTheme } from 'react-native-paper';
import { PrayerCheckbox, StatsCard } from '../components/tracking';
import { TrackingService } from '../services/tracking';
import { PrayerService } from '../services/prayer';
import { LocationService } from '../services/location';
import { SettingsService } from '../services/settings';
import {
  DailyPrayerRecord,
  PrayerStatus,
  PrayerTimes,
  AppSettings,
} from '../types';
import type { ExpressiveTheme } from '../theme';

export default function TrackingScreen() {
  const theme = useTheme<ExpressiveTheme>();
  const [dailyRecord, setDailyRecord] = useState<DailyPrayerRecord | null>(
    null,
  );
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // Load user settings
      const userSettings = await SettingsService.getSettings();
      setSettings(userSettings);

      // Load today's tracking record
      const record = await TrackingService.getDailyRecord(new Date());
      setDailyRecord(record);

      // Load prayer times for displaying times (uses settings automatically)
      const location = await LocationService.getCurrentLocation();
      if (location) {
        const times = await PrayerService.getPrayerTimes(
          location.coordinates,
          new Date(),
        );
        setPrayerTimes(times);
      }
    } catch (error) {
      console.error('Error loading tracking data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handlePrayerStatusChange = async (
    prayerName: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha',
    newStatus: PrayerStatus,
  ) => {
    try {
      const updatedRecord = await TrackingService.updatePrayerStatus(
        prayerName,
        newStatus,
        new Date(),
      );
      setDailyRecord(updatedRecord);
    } catch (error) {
      console.error('Error updating prayer status:', error);
    }
  };

  const formatTime = (date: Date): string => {
    if (!settings) return '';
    return PrayerService.formatPrayerTimeSync(
      date,
      settings.timeFormat === '24h',
    );
  };

  // Memoize stats calculation
  const todayStats = useMemo(() => {
    if (!dailyRecord) {
      return {
        completed: 0,
        missed: 0,
        pending: 0,
      };
    }

    const prayers = Object.values(dailyRecord.prayers);
    const completed = prayers.filter(
      p =>
        p.status === PrayerStatus.COMPLETED ||
        p.status === PrayerStatus.DELAYED,
    ).length;
    const missed = prayers.filter(p => p.status === PrayerStatus.MISSED).length;
    const pending = prayers.filter(
      p => p.status === PrayerStatus.PENDING,
    ).length;

    return { completed, missed, pending };
  }, [dailyRecord]);

  const completionRate = useMemo(() => {
    return dailyRecord ? Math.round((todayStats.completed / 5) * 100) : 0;
  }, [dailyRecord, todayStats.completed]);

  if (loading && !dailyRecord) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
        <View style={styles.content}>
          <Text variant="bodyLarge" style={styles.loadingText}>
            Loading tracking data...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            Today's Prayers
          </Text>
          <Text variant="bodyMedium" style={styles.date}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>

        {/* Stats Card */}
        <StatsCard
          title="Today's Progress"
          stats={[
            {
              label: 'Completed',
              value: todayStats.completed,
              color: theme.expressiveColors.prayerCompleted,
            },
            {
              label: 'Rate',
              value: `${completionRate}%`,
              color: theme.colors.primary,
            },
            {
              label: 'Missed',
              value: todayStats.missed,
              color: theme.expressiveColors.prayerMissed,
            },
          ]}
        />

        {/* Prayer Checklist Card */}
        <Card style={styles.checklistCard} mode="elevated">
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Prayer Checklist
            </Text>
            <Divider style={styles.divider} />

            {dailyRecord && prayerTimes && (
              <View style={styles.checklistContainer}>
                <PrayerCheckbox
                  prayerName="Fajr"
                  prayerTime={formatTime(prayerTimes.fajr)}
                  status={dailyRecord.prayers.fajr.status}
                  onStatusChange={status =>
                    handlePrayerStatusChange('fajr', status)
                  }
                />
                <Divider style={styles.itemDivider} />

                <PrayerCheckbox
                  prayerName="Dhuhr"
                  prayerTime={formatTime(prayerTimes.dhuhr)}
                  status={dailyRecord.prayers.dhuhr.status}
                  onStatusChange={status =>
                    handlePrayerStatusChange('dhuhr', status)
                  }
                />
                <Divider style={styles.itemDivider} />

                <PrayerCheckbox
                  prayerName="Asr"
                  prayerTime={formatTime(prayerTimes.asr)}
                  status={dailyRecord.prayers.asr.status}
                  onStatusChange={status =>
                    handlePrayerStatusChange('asr', status)
                  }
                />
                <Divider style={styles.itemDivider} />

                <PrayerCheckbox
                  prayerName="Maghrib"
                  prayerTime={formatTime(prayerTimes.maghrib)}
                  status={dailyRecord.prayers.maghrib.status}
                  onStatusChange={status =>
                    handlePrayerStatusChange('maghrib', status)
                  }
                />
                <Divider style={styles.itemDivider} />

                <PrayerCheckbox
                  prayerName="Isha"
                  prayerTime={formatTime(prayerTimes.isha)}
                  status={dailyRecord.prayers.isha.status}
                  onStatusChange={status =>
                    handlePrayerStatusChange('isha', status)
                  }
                />
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Info Card */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <Text variant="bodyMedium" style={styles.infoText}>
              Tap a prayer to mark it as completed. Tap again to mark as missed,
              or tap once more to reset to pending.
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Floating Action Button for Statistics */}
      <FAB
        icon="chart-line"
        style={styles.fab}
        onPress={() => {
          // TODO: Navigate to statistics screen
          console.log('Navigate to statistics');
        }}
        color={theme.colors.onPrimary}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    color: '#006A6A',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontWeight: '700',
    color: '#006A6A',
    marginBottom: 4,
  },
  date: {
    color: '#4A6363',
  },
  checklistCard: {
    marginBottom: 16,
    borderRadius: 24,
  },
  cardTitle: {
    fontWeight: '700',
    marginBottom: 8,
  },
  divider: {
    marginBottom: 16,
  },
  checklistContainer: {
    gap: 4,
  },
  itemDivider: {
    marginVertical: 4,
  },
  infoCard: {
    borderRadius: 16,
    marginBottom: 80, // Space for FAB
  },
  infoText: {
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  flatListContent: {
    padding: 16,
    paddingBottom: 100,
  },
  bottomSpacing: {
    height: 80, // Space for FAB
  },
});
