/**
 * Qada Screen - Makeup Prayer Tracking
 * Track and manage قضاء (qada) debt for missed prayers
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  Card,
  Divider,
  List,
  IconButton,
  useTheme,
  ProgressBar,
  Button,
} from 'react-native-paper';
import { TrackingService } from '../services/tracking';
import { QadaDebt, QadaPrayerRecord } from '../types';
import type { ExpressiveTheme } from '../theme';

export default function QadaScreen() {
  const theme = useTheme<ExpressiveTheme>();
  const [qadaDebt, setQadaDebt] = useState<QadaDebt | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadQadaDebt = useCallback(async () => {
    try {
      setLoading(true);
      const debt = await TrackingService.getQadaDebt();
      setQadaDebt(debt);
    } catch (error) {
      console.error('Error loading qada debt:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadQadaDebt();
  }, [loadQadaDebt]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadQadaDebt();
  };

  const handleCompleteQada = async (qadaId: string) => {
    try {
      const updatedDebt = await TrackingService.completeQada(qadaId);
      setQadaDebt(updatedDebt);
    } catch (error) {
      console.error('Error completing qada:', error);
    }
  };

  const handleClearCompleted = async () => {
    try {
      const updatedDebt = await TrackingService.clearCompletedQadas();
      setQadaDebt(updatedDebt);
    } catch (error) {
      console.error('Error clearing completed qadas:', error);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getPrayerIcon = (prayerName: string): string => {
    const icons: Record<string, string> = {
      fajr: 'weather-sunset-up',
      dhuhr: 'weather-sunny',
      asr: 'weather-sunset-down',
      maghrib: 'weather-sunset',
      isha: 'weather-night',
    };
    return icons[prayerName] || 'clock-outline';
  };

  const renderQadaList = (
    prayerName: string,
    qadas: QadaPrayerRecord[],
  ) => {
    const pending = qadas.filter(q => !q.isCompleted);
    const completed = qadas.filter(q => q.isCompleted);

    if (pending.length === 0 && completed.length === 0) {
      return null;
    }

    return (
      <Card key={prayerName} style={styles.prayerCard} mode="elevated">
        <Card.Content>
          <View style={styles.prayerHeader}>
            <View style={styles.prayerTitleContainer}>
              <List.Icon icon={getPrayerIcon(prayerName)} color={theme.colors.primary} />
              <Text variant="titleMedium" style={styles.prayerTitle}>
                {prayerName.charAt(0).toUpperCase() + prayerName.slice(1)}
              </Text>
            </View>
            <View style={styles.badge}>
              <Text variant="labelLarge" style={{ color: theme.colors.primary }}>
                {pending.length}
              </Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          {/* Pending Qadas */}
          {pending.map((qada, index) => (
            <View key={qada.id}>
              <View style={styles.qadaItem}>
                <View style={styles.qadaInfo}>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                    Missed on {formatDate(qada.originalDate)}
                  </Text>
                  {qada.notes && (
                    <Text
                      variant="bodySmall"
                      style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}
                    >
                      {qada.notes}
                    </Text>
                  )}
                </View>
                <IconButton
                  icon="check-circle-outline"
                  iconColor={theme.expressiveColors.prayerCompleted}
                  size={28}
                  onPress={() => handleCompleteQada(qada.id)}
                />
              </View>
              {index < pending.length - 1 && <Divider style={styles.itemDivider} />}
            </View>
          ))}

          {/* Completed Qadas (collapsed) */}
          {completed.length > 0 && (
            <>
              {pending.length > 0 && <Divider style={styles.divider} />}
              <Text
                variant="bodySmall"
                style={{
                  color: theme.colors.onSurfaceVariant,
                  fontStyle: 'italic',
                  marginTop: 8,
                }}
              >
                {completed.length} completed qada(s)
              </Text>
            </>
          )}
        </Card.Content>
      </Card>
    );
  };

  if (loading && !qadaDebt) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
        <View style={styles.content}>
          <Text variant="bodyLarge" style={styles.loadingText}>
            Loading qada debt...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const totalPrayers = qadaDebt
    ? Object.values(qadaDebt.prayers).reduce((sum, arr) => sum + arr.length, 0)
    : 0;
  const completedPrayers = qadaDebt
    ? Object.values(qadaDebt.prayers).reduce(
        (sum, arr) => sum + arr.filter(q => q.isCompleted).length,
        0,
      )
    : 0;
  const progress = totalPrayers > 0 ? completedPrayers / totalPrayers : 0;

  return (
    <SafeAreaView
      testID="qada-screen"
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
            Qada Prayers (قضاء)
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Track and complete missed prayers
          </Text>
        </View>

        {/* Summary Card */}
        <Card testID="qada-summary-card" style={styles.summaryCard} mode="elevated">
          <Card.Content>
            <View style={styles.summaryRow}>
              <Text variant="titleLarge" style={{ color: theme.colors.primary }}>
                {qadaDebt?.totalPending || 0}
              </Text>
              <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
                Pending Prayers
              </Text>
            </View>

            {totalPrayers > 0 && (
              <>
                <Divider style={styles.divider} />
                <View style={styles.progressContainer}>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Progress: {completedPrayers} / {totalPrayers}
                  </Text>
                  <ProgressBar
                    progress={progress}
                    color={theme.expressiveColors.prayerCompleted}
                    style={styles.progressBar}
                  />
                </View>
                {completedPrayers > 0 && (
                  <Button
                    mode="text"
                    onPress={handleClearCompleted}
                    style={styles.clearButton}
                  >
                    Clear Completed
                  </Button>
                )}
              </>
            )}
          </Card.Content>
        </Card>

        {/* Qada Lists by Prayer */}
        {qadaDebt && qadaDebt.totalPending > 0 ? (
          <View style={styles.qadaLists}>
            {renderQadaList('fajr', qadaDebt.prayers.fajr)}
            {renderQadaList('dhuhr', qadaDebt.prayers.dhuhr)}
            {renderQadaList('asr', qadaDebt.prayers.asr)}
            {renderQadaList('maghrib', qadaDebt.prayers.maghrib)}
            {renderQadaList('isha', qadaDebt.prayers.isha)}
          </View>
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <View style={styles.emptyContainer}>
                <List.Icon
                  icon="check-circle"
                  color={theme.expressiveColors.prayerCompleted}
                  style={styles.emptyIcon}
                />
                <Text variant="titleMedium" style={styles.emptyTitle}>
                  No Pending Qada Prayers
                </Text>
                <Text
                  variant="bodyMedium"
                  style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}
                >
                  Alhamdulillah! You have no missed prayers to make up.
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
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
    paddingBottom: 32,
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
  subtitle: {
    color: '#4A6363',
  },
  summaryCard: {
    marginBottom: 24,
    borderRadius: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    marginTop: 8,
    height: 8,
    borderRadius: 4,
  },
  clearButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  qadaLists: {
    gap: 16,
  },
  prayerCard: {
    borderRadius: 20,
  },
  prayerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  prayerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  prayerTitle: {
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  badge: {
    backgroundColor: 'rgba(0, 106, 106, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    minWidth: 32,
    alignItems: 'center',
  },
  divider: {
    marginVertical: 12,
  },
  itemDivider: {
    marginVertical: 8,
  },
  qadaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  qadaInfo: {
    flex: 1,
  },
  emptyCard: {
    borderRadius: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  emptyTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
  },
});
