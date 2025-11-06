/**
 * Tracking Screen - Prayer Tracking
 * Track daily prayers with checkboxes, notes, and statistics
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Card, Divider, FAB, useTheme } from 'react-native-paper';
import {
  PrayerCheckbox,
  StatsCard,
  PrayerDetailsModal,
  SunnahCheckbox,
  CalendarView,
} from '../components/tracking';
import { TrackingService } from '../services/tracking';
import { PrayerService } from '../services/prayer';
import { LocationService } from '../services/location';
import { SettingsService } from '../services/settings';
import { useAppContext } from '../contexts';
import { usePrayerReactiveUpdates } from '../hooks/useReactiveUpdates';
import {
  PrayerStatus,
  CustomPrayerRecord,
  CustomPrayerType,
} from '../types';
import type { ExpressiveTheme } from '../theme';

export default function TrackingScreen() {
  const theme = useTheme<ExpressiveTheme>();
  const { state, updatePrayerStatus, subscribe } = useAppContext();
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPrayer, setSelectedPrayer] = useState<{
    name: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
    time: string;
    status: PrayerStatus;
    notes?: string;
  } | null>(null);

  // Subscribe to reactive updates
  usePrayerReactiveUpdates((data: any) => {
    console.log('TrackingScreen: Prayer status changed:', data);
    // Context state is already updated, this ensures UI reacts immediately
  });

  const handleRefresh = () => {
    setRefreshing(true);
    // Context will automatically refresh data
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleOpenModal = (
    prayerName: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha',
  ) => {
    console.log('handleOpenModal called for:', prayerName);
    console.log('dailyRecord:', !!state.dailyRecord, 'prayerTimes:', !!state.prayerTimes);

    if (!state.dailyRecord || !state.prayerTimes) {
      console.log('Returning early - missing data');
      return;
    }

    const prayer = {
      name: prayerName,
      time: formatTime(state.prayerTimes[prayerName]),
      status: state.dailyRecord.prayers[prayerName].status,
      notes: state.dailyRecord.prayers[prayerName].notes,
    };

    console.log('Setting selectedPrayer:', prayer);
    setSelectedPrayer(prayer);
    setModalVisible(true);
    console.log('Modal should be visible now');
  };

  const handleConfirmModal = async (
    status: PrayerStatus,
    notes?: string,
  ) => {
    if (!selectedPrayer) return;

    try {
      await updatePrayerStatus(
        selectedPrayer.name,
        status,
        new Date(),
      );
      
      // Update notes separately if provided
      if (notes) {
        await TrackingService.updatePrayerStatus(
          selectedPrayer.name,
          status,
          new Date(),
          notes,
        );
      }
    } catch (error) {
      console.error('Error updating prayer status:', error);
    }
  };

  const getSunnahPrayer = (type: CustomPrayerType): CustomPrayerRecord | undefined => {
    if (!state.dailyRecord?.customPrayers) return undefined;
    return state.dailyRecord.customPrayers.find((p: any) => p.type === type);
  };

  const isSunnahCompleted = (type: CustomPrayerType): boolean => {
    const prayer = getSunnahPrayer(type);
    return prayer?.completed || false;
  };

  const handleToggleSunnah = async (
    type: CustomPrayerType,
    name: string,
    rakaat: number,
  ) => {
    try {
      const existingPrayer = getSunnahPrayer(type);
      const now = new Date();

      const sunnahRecord: CustomPrayerRecord = {
        id: existingPrayer?.id || `${type}_${now.getTime()}`,
        type,
        name,
        rakaat,
        completed: !isSunnahCompleted(type),
        completedAt: !isSunnahCompleted(type) ? now : undefined,
      };

      await TrackingService.updateCustomPrayer(
        sunnahRecord,
        new Date(),
      );
    } catch (error) {
      console.error('Error toggling sunnah prayer:', error);
    }
  };

  const formatTime = (date: Date): string => {
    if (!state.settings) return '';
    return PrayerService.formatPrayerTimeSync(
      date,
      state.settings.timeFormat === '24h',
    );
  };

  // Memoize stats calculation
  const todayStats = useMemo(() => {
    if (!state.dailyRecord) {
      return {
        completed: 0,
        missed: 0,
        pending: 0,
      };
    }

    const prayers = Object.values(state.dailyRecord.prayers);
    const completed = prayers.filter(
      (p: any) =>
        p.status === PrayerStatus.COMPLETED ||
        p.status === PrayerStatus.DELAYED,
    ).length;
    const missed = prayers.filter((p: any) => p.status === PrayerStatus.MISSED).length;
    const pending = prayers.filter(
      (p: any) => p.status === PrayerStatus.PENDING,
    ).length;

    return { completed, missed, pending };
  }, [state.dailyRecord]);

  const completionRate = useMemo(() => {
    return state.dailyRecord ? Math.round((todayStats.completed / 5) * 100) : 0;
  }, [state.dailyRecord, todayStats.completed]);

  if (state.isLoading && !state.dailyRecord) {
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
      testID="tracking-screen"
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

        {/* Calendar Card */}
        <Card style={styles.calendarCard} mode="elevated">
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Monthly Overview
            </Text>
            <Divider style={styles.divider} />
            <CalendarView />
          </Card.Content>
        </Card>

        {/* Prayer Checklist Card */}
        <Card style={styles.checklistCard} mode="elevated">
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Prayer Checklist
            </Text>
            <Divider style={styles.divider} />

            {state.dailyRecord && state.prayerTimes && (
              <View style={styles.checklistContainer}>
                <PrayerCheckbox
                  prayerName="maghrib"
                  prayerTime={formatTime(state.prayerTimes.maghrib)}
                  status={state.dailyRecord.prayers.maghrib.status}
                  prayerTimes={state.prayerTimes}
                  onPress={() => handleOpenModal('maghrib')}
                />
                <SunnahCheckbox
                  label="2 Sunnah before"
                  completed={isSunnahCompleted(CustomPrayerType.SUNNAH_FAJR)}
                  onToggle={() =>
                    handleToggleSunnah(
                      CustomPrayerType.SUNNAH_FAJR,
                      '2 Sunnah before Fajr',
                      2,
                    )
                  }
                />
                <Divider style={styles.itemDivider} />

                <PrayerCheckbox
                  prayerName="isha"
                  prayerTime={formatTime(state.prayerTimes.isha)}
                  status={state.dailyRecord.prayers.isha.status}
                  prayerTimes={state.prayerTimes}
                  onPress={() => handleOpenModal('isha')}
                />
                <SunnahCheckbox
                  label="2 Sunnah before"
                  completed={
                    !!state.dailyRecord.customPrayers?.find(
                      (p: any) => p.type === CustomPrayerType.SUNNAH_DHUHR && p.name.includes('before'),
                    )?.completed
                  }
                  onToggle={() =>
                    handleToggleSunnah(
                      CustomPrayerType.SUNNAH_DHUHR,
                      '2 Sunnah before Dhuhr',
                      2,
                    )
                  }
                />
                <SunnahCheckbox
                  label="2 Sunnah after"
                  completed={
                    !!state.dailyRecord.customPrayers?.find(
                      (p: any) => p.type === CustomPrayerType.SUNNAH_DHUHR && p.name.includes('after'),
                    )?.completed
                  }
                  onToggle={() =>
                    handleToggleSunnah(
                      CustomPrayerType.SUNNAH_DHUHR,
                      '2 Sunnah after Dhuhr',
                      2,
                    )
                  }
                />
                <Divider style={styles.itemDivider} />

                <PrayerCheckbox
                  prayerName="asr"
                  prayerTime={formatTime(state.prayerTimes.asr)}
                  status={state.dailyRecord.prayers.asr.status}
                  prayerTimes={state.prayerTimes}
                  onPress={() => handleOpenModal('asr')}
                />
                <SunnahCheckbox
                  label="2 Sunnah before"
                  completed={isSunnahCompleted(CustomPrayerType.SUNNAH_ASR)}
                  onToggle={() =>
                    handleToggleSunnah(
                      CustomPrayerType.SUNNAH_ASR,
                      '2 Sunnah before Asr',
                      2,
                    )
                  }
                />
                <Divider style={styles.itemDivider} />

                <PrayerCheckbox
                  prayerName="maghrib"
                  prayerTime={formatTime(state.prayerTimes.maghrib)}
                  status={state.dailyRecord.prayers.maghrib.status}
                  prayerTimes={state.prayerTimes}
                  onPress={() => handleOpenModal('maghrib')}
                />
                <SunnahCheckbox
                  label="2 Sunnah after"
                  completed={isSunnahCompleted(CustomPrayerType.SUNNAH_MAGHRIB)}
                  onToggle={() =>
                    handleToggleSunnah(
                      CustomPrayerType.SUNNAH_MAGHRIB,
                      '2 Sunnah after Maghrib',
                      2,
                    )
                  }
                />
                <Divider style={styles.itemDivider} />

                <PrayerCheckbox
                  prayerName="isha"
                  prayerTime={formatTime(state.prayerTimes.isha)}
                  status={state.dailyRecord.prayers.isha.status}
                  prayerTimes={state.prayerTimes}
                  onPress={() => handleOpenModal('isha')}
                />
                <SunnahCheckbox
                  label="2 Sunnah after"
                  completed={isSunnahCompleted(CustomPrayerType.SUNNAH_ISHA)}
                  onToggle={() =>
                    handleToggleSunnah(
                      CustomPrayerType.SUNNAH_ISHA,
                      '2 Sunnah after Isha',
                      2,
                    )
                  }
                />
                <SunnahCheckbox
                  label="Witr"
                  completed={isSunnahCompleted(CustomPrayerType.WITR)}
                  onToggle={() =>
                    handleToggleSunnah(CustomPrayerType.WITR, 'Witr', 3)
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
              Tap a prayer to mark its status and add notes.
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

      {/* Prayer Details Modal */}
      <PrayerDetailsModal
        visible={modalVisible && !!selectedPrayer}
        onDismiss={() => setModalVisible(false)}
        prayerName={selectedPrayer?.name || 'fajr'}
        prayerTime={selectedPrayer?.time || ''}
        currentStatus={selectedPrayer?.status || PrayerStatus.PENDING}
        currentNotes={selectedPrayer?.notes}
        prayerTimes={state.prayerTimes || undefined}
        onConfirm={handleConfirmModal}
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
  calendarCard: {
    marginBottom: 16,
    borderRadius: 24,
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
