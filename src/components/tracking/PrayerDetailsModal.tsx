/**
 * Prayer Details Modal
 * Modal for marking prayer status and adding notes
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Portal,
  Dialog,
  Text,
  Button,
  TextInput,
  SegmentedButtons,
  useTheme,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { PrayerStatus, PrayerName, PrayerTimes } from '../../types';
import type { ExpressiveTheme } from '../../theme';
import { getPrayerActions } from '../../utils/prayerTimeLogic';
import { useLanguage } from '../../contexts';
import { getPrayerName } from '../../constants/prayerNames';

interface PrayerDetailsModalProps {
  visible: boolean;
  onDismiss: () => void;
  prayerName: PrayerName;
  prayerTime: string;
  currentStatus: PrayerStatus;
  prayerTimes?: PrayerTimes; // For time-based logic
  onConfirm: (status: PrayerStatus) => void;
}

export function PrayerDetailsModal({
  visible,
  onDismiss,
  prayerName,
  prayerTime,
  currentStatus,
  prayerTimes,
  onConfirm,
}: PrayerDetailsModalProps) {
  const theme = useTheme<ExpressiveTheme>();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [selectedStatus, setSelectedStatus] = useState<PrayerStatus>(currentStatus);

  // Get available actions based on prayer time
  const prayerActions = prayerTimes ? 
    getPrayerActions(prayerName, prayerTimes, currentStatus) : null;

  // Update local state when props change
  useEffect(() => {
    setSelectedStatus(currentStatus);
  }, [currentStatus, visible]);

  const handleConfirm = () => {
    onConfirm(selectedStatus);
    onDismiss();
  };

  const handleCancel = () => {
    // Reset to current values
    setSelectedStatus(currentStatus);
    onDismiss();
  };

  const getStatusLabel = (status: PrayerStatus): string => {
    switch (status) {
      case PrayerStatus.COMPLETED:
        return t('status.prayed');
      case PrayerStatus.MISSED:
        return t('status.missed');
      case PrayerStatus.DELAYED:
        return t('status.delayed');
      case PrayerStatus.QADA:
        return t('status.addToQada');
      case PrayerStatus.PENDING:
      default:
        return t('status.pending');
    }
  };

  const getStatusIcon = (status: PrayerStatus): string => {
    switch (status) {
      case PrayerStatus.COMPLETED:
        return 'check-circle';
      case PrayerStatus.MISSED:
        return 'close-circle';
      case PrayerStatus.DELAYED:
        return 'clock-alert-outline';
      case PrayerStatus.QADA:
        return 'plus-circle-outline';
      case PrayerStatus.PENDING:
      default:
        return 'circle-outline';
    }
  };

  return (
    <Portal>
      <Dialog
        testID="prayer-details-modal"
        visible={visible}
        onDismiss={handleCancel}
        style={styles.dialog}
      >
        <Dialog.Title testID="prayer-title-text" style={styles.title}>
          {getPrayerName(prayerName, language)}
        </Dialog.Title>

        <Dialog.Content>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Prayer Time */}
            <View style={styles.timeContainer}>
              <Text testID="prayer-time-text" variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {t('prayerDetails.time', { time: prayerTime })}
              </Text>
            </View>

            {/* Status Selection */}
            <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              {t('prayerDetails.status')}
            </Text>
            
            {/* Time-based message */}
            {prayerActions && (
              <Text variant="bodySmall" style={[styles.timeMessage, { color: theme.colors.primary }]}>
                {prayerActions.nextActionText}
              </Text>
            )}
            
            <SegmentedButtons
              value={selectedStatus}
              onValueChange={(value) => setSelectedStatus(value as PrayerStatus)}
              buttons={
                // Filter buttons based on available actions
                prayerActions
                  ? prayerActions.availableStatuses.map(status => ({
                      value: status,
                      label: getStatusLabel(status),
                      icon: getStatusIcon(status),
                    }))
                  : [
                    {
                      value: PrayerStatus.COMPLETED,
                      label: getStatusLabel(PrayerStatus.COMPLETED),
                      icon: getStatusIcon(PrayerStatus.COMPLETED),
                    },
                    {
                      value: PrayerStatus.DELAYED,
                      label: getStatusLabel(PrayerStatus.DELAYED),
                      icon: getStatusIcon(PrayerStatus.DELAYED),
                    },
                    {
                      value: PrayerStatus.MISSED,
                      label: getStatusLabel(PrayerStatus.MISSED),
                      icon: getStatusIcon(PrayerStatus.MISSED),
                    },
                  ]
              }
              style={styles.segmentedButtons}
            />

            {/* Qada Hint (if qada selected) */}
            {selectedStatus === PrayerStatus.QADA && (
              <View style={styles.qadaHint}>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {t('prayerDetails.qadaHint')}
                </Text>
              </View>
            )}


          </ScrollView>
        </Dialog.Content>

        <Dialog.Actions>
          <Button testID="close-modal-button" onPress={handleCancel}>{t('common.cancel')}</Button>
          <Button
            testID="save-notes-button"
            onPress={handleConfirm}
            mode="contained"
            style={styles.confirmButton}
          >
            {t('common.confirm')}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialog: {
    borderRadius: 28,
    maxHeight: '80%',
  },
  title: {
    textAlign: 'center',
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  timeContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
  },
  timeMessage: {
    textAlign: 'center',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  qadaHint: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },

  confirmButton: {
    marginLeft: 8,
  },
});
