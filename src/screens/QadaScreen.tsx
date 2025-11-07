/**
 * Qada Screen - Makeup Prayer Tracking
 * Track and manage قضاء (qada) debt for missed prayers
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import {
  Text,
  Card,
  Divider,
  List,
  IconButton,
  useTheme,
  ProgressBar,
  Button,
  Portal,
  Modal,
  FAB,
} from 'react-native-paper';
import { TrackingService } from '../services/tracking';
import { useAppContext, useLanguage } from '../contexts';
import { useReactiveUpdates } from '../hooks/useReactiveUpdates';
import { getPrayerName } from '../constants';
import { QadaDebt, QadaPrayerRecord } from '../types';
import type { ExpressiveTheme } from '../theme';
import { PageHeader } from '../components';

export default function QadaScreen() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const theme = useTheme<ExpressiveTheme>();
  const { emit } = useAppContext();
  const [qadaDebt, setQadaDebt] = useState<QadaDebt | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPrayer, setSelectedPrayer] = useState<string | null>(null);
  const [showBulkActions, setShowBulkActions] = useState(false);

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

  // Subscribe to reactive updates
  useReactiveUpdates({
    onQadaDebtChanged: (data: any) => {
      console.log('QadaScreen: Qada debt changed:', data);
      loadQadaDebt();
    },
  });

  const handleRefresh = () => {
    setRefreshing(true);
    loadQadaDebt();
  };

  const handleCompleteQada = async (qadaId: string) => {
    try {
      const updatedDebt = await TrackingService.completeQada(qadaId);
      setQadaDebt(updatedDebt);
      
      // Emit event for reactive updates
      emit('QADA_DEBT_CHANGED' as any, {
        type: 'qada_completed',
        qadaId,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Error completing qada:', error);
    }
  };

  const handleClearCompleted = async () => {
    try {
      const updatedDebt = await TrackingService.clearCompletedQadas();
      setQadaDebt(updatedDebt);
      
      // Emit event for reactive updates
      emit('QADA_DEBT_CHANGED' as any, {
        type: 'completed_cleared',
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Error clearing completed qadas:', error);
    }
  };

  const handleBulkComplete = async (prayerName: string) => {
    try {
      const pendingQadas = await TrackingService.getPendingQadasForPrayer(prayerName as any);
      
      for (const qada of pendingQadas) {
        await TrackingService.completeQada(qada.id);
      }
      
      const updatedDebt = await TrackingService.getQadaDebt();
      setQadaDebt(updatedDebt);
      
      // Emit event for reactive updates
      emit('QADA_DEBT_CHANGED' as any, {
        type: 'bulk_completed',
        prayerName,
        count: pendingQadas.length,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Error bulk completing qadas:', error);
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
        <PageHeader
          title={t('qada.title')}
          subtitle={t('qada.subtitle')}
        />

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
                <View style={styles.actionButtons}>
                  {completedPrayers > 0 && (
                    <Button
                      mode="text"
                      onPress={handleClearCompleted}
                      style={styles.clearButton}
                    >
                      Clear Completed
                    </Button>
                  )}
                  <Button
                    mode="outlined"
                    onPress={() => setShowBulkActions(!showBulkActions)}
                    style={styles.bulkActionButton}
                  >
                    Bulk Actions
                  </Button>
                </View>
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

    {/* Bulk Actions Modal */}
    <Portal>
      <Modal
        visible={showBulkActions}
        onDismiss={() => setShowBulkActions(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Card style={styles.modalCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.modalTitle}>
              Bulk Actions
            </Text>
            <Text variant="bodyMedium" style={styles.modalSubtitle}>
              Complete all pending qadas for specific prayers
            </Text>
            
            <Divider style={styles.modalDivider} />
            
            {Object.entries(qadaDebt?.prayers || {}).map(([prayerName, qadas]) => {
              const pending = qadas.filter(q => !q.isCompleted);
              if (pending.length === 0) return null;
              
              return (
                <List.Item
                  key={prayerName}
                  title={getPrayerName(prayerName as any, language)}
                  description={`${pending.length} ${t('qada.pendingQadas', { count: pending.length })}`}
                  left={(props) => (
                    <List.Icon
                      {...props}
                      icon={getPrayerIcon(prayerName)}
                    />
                  )}
                  right={() => (
                    <Button
                      mode="text"
                      compact
                      onPress={() => handleBulkComplete(prayerName)}
                    >
                      {t('qada.completeAll')}
                    </Button>
                  )}
                />
              );
            })}
          </Card.Content>
        </Card>
      </Modal>
    </Portal>

    {/* Floating Action Button */}
    {qadaDebt && qadaDebt.totalPending > 0 && (
      <FAB
        icon="format-list-checks"
        style={styles.fab}
        onPress={() => setShowBulkActions(true)}
      />
    )}
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
    paddingBottom: 120, // Extra padding to clear bottom nav bar + FAB
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
    marginTop: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  bulkActionButton: {
    marginLeft: 8,
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
    fontStyle: 'italic',
  },
  modalContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
  },
  modalTitle: {
    marginBottom: 8,
    fontWeight: '600',
  },
  modalSubtitle: {
    marginBottom: 16,
    color: '#666',
  },
  modalDivider: {
    marginBottom: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 80, // Position above bottom nav bar
  },
});
