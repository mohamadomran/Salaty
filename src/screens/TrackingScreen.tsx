/**
 * Tracking Screen - Prayer Tracking
 * Track daily prayers with checkboxes, notes, and statistics
 */

import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, SectionList, RefreshControl } from 'react-native';
import { Text, Card, Divider, FAB, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import {
  PrayerCheckbox,
  StatsCard,
  PrayerDetailsModal,
  SunnahCheckbox,
  CalendarView,
} from '../components/tracking';
import { ScreenContainer, PageHeader, cardStyles } from '../components';
import { TrackingService } from '../services/tracking';
import { PrayerService } from '../services/prayer';
import { useAppContext, useLanguage } from '../contexts';
import { usePrayerReactiveUpdates } from '../hooks/useReactiveUpdates';
import {
  PrayerStatus,
  CustomPrayerRecord,
  CustomPrayerType,
  PrayerName,
} from '../types';
import type { ExpressiveTheme } from '../theme';
import { getPrayerTimeStatus, PrayerTimeStatus } from '../utils/prayerTimeLogic';

export default function TrackingScreen() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const theme = useTheme<ExpressiveTheme>();
  const { state, updatePrayerStatus, subscribe } = useAppContext();
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPrayer, setSelectedPrayer] = useState<{
    name: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
    time: string;
    status: PrayerStatus;
  } | null>(null);

  // Handle modal dismissal with proper cleanup timing
  const handleDismissModal = useCallback(() => {
    setModalVisible(false);
    // Clear selected prayer after animation completes
    setTimeout(() => {
      setSelectedPrayer(null);
    }, 300);
  }, []);

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
    };

    console.log('Setting selectedPrayer:', prayer);
    setSelectedPrayer(prayer);
    setModalVisible(true);
    console.log('Modal should be visible now');
  };

  const handleConfirmModal = async (status: PrayerStatus) => {
    if (!selectedPrayer) return;

    try {
      await updatePrayerStatus(
        selectedPrayer.name,
        status,
        new Date(),
      );
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

  const formatTime = (date: Date | undefined): string => {
    if (!state.settings || !date) return '';
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

  // Organize prayers into sections based on time status
  const prayerSections = useMemo(() => {
    if (!state.prayerTimes || !state.dailyRecord) return [];

    const prayers: PrayerName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    const currentPrayer: any[] = [];
    const upcomingPrayers: any[] = [];
    const completedPrayers: any[] = [];

    prayers.forEach((prayer) => {
      const timeStatus = getPrayerTimeStatus(prayer, state.prayerTimes!, new Date());
      const prayerRecord = state.dailyRecord!.prayers[prayer];

      const prayerData = {
        name: prayer,
        time: formatTime(state.prayerTimes![prayer]),
        status: prayerRecord.status,
      };

      if (timeStatus === PrayerTimeStatus.CURRENT) {
        currentPrayer.push(prayerData);
      } else if (timeStatus === PrayerTimeStatus.FUTURE) {
        upcomingPrayers.push(prayerData);
      } else {
        // Past prayers or completed
        completedPrayers.push(prayerData);
      }
    });

    const sections = [];
    if (currentPrayer.length > 0) {
      sections.push({ title: t('prayers.currentPrayer'), data: currentPrayer, type: 'current' });
    }
    if (upcomingPrayers.length > 0) {
      sections.push({ title: t('prayers.upcomingPrayers'), data: upcomingPrayers, type: 'upcoming' });
    }
    if (completedPrayers.length > 0) {
      sections.push({ title: t('prayers.completedPrayers'), data: completedPrayers, type: 'completed' });
    }

    return sections;
  }, [state.prayerTimes, state.dailyRecord, formatTime]);

  // Render section header
  const renderSectionHeader = useCallback(
    ({ section }: any) => (
      <View style={styles.sectionHeader}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          {section.title}
        </Text>
        <Text variant="bodySmall" style={styles.sectionCount}>
          {section.data.length} {section.data.length === 1 ? 'prayer' : 'prayers'}
        </Text>
      </View>
    ),
    [],
  );

  // Render prayer item with sunnah prayers
  const renderPrayerItem = useCallback(
    ({ item, section }: any) => (
      <View>
        <PrayerCheckbox
          prayerName={item.name}
          prayerTime={item.time}
          status={item.status}
          prayerTimes={state.prayerTimes!}
          onPress={() => handleOpenModal(item.name)}
          variant={section.type}
        />

        {/* Sunnah prayers based on prayer name */}
        {item.name === 'fajr' && (
          <SunnahCheckbox
            label="2 Sunnah before"
            completed={isSunnahCompleted(CustomPrayerType.SUNNAH_FAJR)}
            onToggle={() =>
              handleToggleSunnah(CustomPrayerType.SUNNAH_FAJR, '2 Sunnah before Fajr', 2)
            }
          />
        )}

        {item.name === 'dhuhr' && (
          <>
            <SunnahCheckbox
              label="2 Sunnah before"
              completed={
                !!state.dailyRecord?.customPrayers?.find(
                  (p: any) =>
                    p.type === CustomPrayerType.SUNNAH_DHUHR && p.name.includes('before'),
                )?.completed
              }
              onToggle={() =>
                handleToggleSunnah(CustomPrayerType.SUNNAH_DHUHR, '2 Sunnah before Dhuhr', 2)
              }
            />
            <SunnahCheckbox
              label="2 Sunnah after"
              completed={
                !!state.dailyRecord?.customPrayers?.find(
                  (p: any) =>
                    p.type === CustomPrayerType.SUNNAH_DHUHR && p.name.includes('after'),
                )?.completed
              }
              onToggle={() =>
                handleToggleSunnah(CustomPrayerType.SUNNAH_DHUHR, '2 Sunnah after Dhuhr', 2)
              }
            />
          </>
        )}

        {item.name === 'asr' && (
          <SunnahCheckbox
            label="2 Sunnah before"
            completed={isSunnahCompleted(CustomPrayerType.SUNNAH_ASR)}
            onToggle={() =>
              handleToggleSunnah(CustomPrayerType.SUNNAH_ASR, '2 Sunnah before Asr', 2)
            }
          />
        )}

        {item.name === 'maghrib' && (
          <SunnahCheckbox
            label="2 Sunnah after"
            completed={isSunnahCompleted(CustomPrayerType.SUNNAH_MAGHRIB)}
            onToggle={() =>
              handleToggleSunnah(CustomPrayerType.SUNNAH_MAGHRIB, '2 Sunnah after Maghrib', 2)
            }
          />
        )}

        {item.name === 'isha' && (
          <>
            <SunnahCheckbox
              label="2 Sunnah after"
              completed={isSunnahCompleted(CustomPrayerType.SUNNAH_ISHA)}
              onToggle={() =>
                handleToggleSunnah(CustomPrayerType.SUNNAH_ISHA, '2 Sunnah after Isha', 2)
              }
            />
            <SunnahCheckbox
              label="Witr"
              completed={isSunnahCompleted(CustomPrayerType.WITR)}
              onToggle={() => handleToggleSunnah(CustomPrayerType.WITR, 'Witr', 3)}
            />
          </>
        )}
      </View>
    ),
    [
      state.prayerTimes,
      state.dailyRecord,
      handleOpenModal,
      isSunnahCompleted,
      handleToggleSunnah,
    ],
  );

  if (state.isLoading && !state.dailyRecord) {
    return (
      <ScreenContainer testID="tracking-screen" showScrollView={false}>
        <View style={styles.content}>
          <Text variant="bodyLarge" style={styles.loadingText}>
            Loading tracking data...
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      testID="tracking-screen"
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
      <PageHeader
        title={t('tracking.title')}
        subtitle={new Date().toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      />

      {/* Stats Card */}
      <StatsCard
        title={t('tracking.todaysProgress')}
        stats={[
          {
            label: t('status.completed'),
            value: todayStats.completed,
            color: theme.expressiveColors.prayerCompleted,
          },
          {
            label: t('tracking.completionRate'),
            value: `${completionRate}%`,
            color: theme.colors.primary,
          },
          {
            label: t('status.missed'),
            value: todayStats.missed,
            color: theme.expressiveColors.prayerMissed,
          },
        ]}
      />

      {/* Calendar Card */}
      <Card style={cardStyles.card} mode="elevated">
        <Card.Content>
          <Text variant="titleMedium" style={cardStyles.cardTitle}>
            Monthly Overview
          </Text>
          <Divider style={cardStyles.cardDivider} />
          <CalendarView />
        </Card.Content>
      </Card>

      {/* Prayer Checklist Card */}
      <Card style={cardStyles.card} mode="elevated">
        <Card.Content>
          <Text variant="titleMedium" style={cardStyles.cardTitle}>
            Prayer Checklist
          </Text>
          <Divider style={cardStyles.cardDivider} />

          {state.dailyRecord && state.prayerTimes && (
            <SectionList
              sections={prayerSections}
              keyExtractor={(item) => item.name}
              renderItem={renderPrayerItem}
              renderSectionHeader={renderSectionHeader}
              ItemSeparatorComponent={() => <Divider style={styles.itemDivider} />}
              stickySectionHeadersEnabled={false}
              scrollEnabled={false}
            />
          )}
        </Card.Content>
      </Card>

      {/* Info Card */}
      <Card style={cardStyles.compactCard}>
        <Card.Content>
          <Text variant="bodyMedium" style={styles.infoText}>
            Tap a prayer to mark its status and add notes.
          </Text>
        </Card.Content>
      </Card>

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
        onDismiss={handleDismissModal}
        prayerName={selectedPrayer?.name || 'fajr'}
        prayerTime={selectedPrayer?.time || ''}
        currentStatus={selectedPrayer?.status || PrayerStatus.PENDING}
        prayerTimes={state.prayerTimes || undefined}
        onConfirm={handleConfirmModal}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    color: '#006A6A',
  },

  checklistContainer: {
    gap: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginTop: 8,
  },
  sectionTitle: {
    fontWeight: '700',
    color: '#006A6A',
  },
  sectionCount: {
    color: '#4A6363',
  },
  itemDivider: {
    marginVertical: 4,
  },
  infoCard: {
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
