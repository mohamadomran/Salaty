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
import { PrayerStatus } from '../../types';
import type { ExpressiveTheme } from '../../theme';

interface PrayerDetailsModalProps {
  visible: boolean;
  onDismiss: () => void;
  prayerName: string;
  prayerTime: string;
  currentStatus: PrayerStatus;
  currentNotes?: string;
  onConfirm: (status: PrayerStatus, notes?: string) => void;
}

export function PrayerDetailsModal({
  visible,
  onDismiss,
  prayerName,
  prayerTime,
  currentStatus,
  currentNotes,
  onConfirm,
}: PrayerDetailsModalProps) {
  const theme = useTheme<ExpressiveTheme>();
  const [selectedStatus, setSelectedStatus] = useState<PrayerStatus>(currentStatus);
  const [notes, setNotes] = useState(currentNotes || '');

  // Update local state when props change
  useEffect(() => {
    setSelectedStatus(currentStatus);
    setNotes(currentNotes || '');
  }, [currentStatus, currentNotes, visible]);

  const handleConfirm = () => {
    onConfirm(selectedStatus, notes.trim() || undefined);
    onDismiss();
  };

  const handleCancel = () => {
    // Reset to current values
    setSelectedStatus(currentStatus);
    setNotes(currentNotes || '');
    onDismiss();
  };

  const getStatusLabel = (status: PrayerStatus): string => {
    switch (status) {
      case PrayerStatus.COMPLETED:
        return 'Prayed';
      case PrayerStatus.MISSED:
        return 'Missed';
      case PrayerStatus.DELAYED:
        return 'Delayed';
      case PrayerStatus.QADA:
        return 'Qada';
      case PrayerStatus.PENDING:
      default:
        return 'Pending';
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
        return 'restore';
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
          {prayerName} Prayer
        </Dialog.Title>

        <Dialog.Content>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Prayer Time */}
            <View style={styles.timeContainer}>
              <Text testID="prayer-time-text" variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Time: {prayerTime}
              </Text>
            </View>

            {/* Status Selection */}
            <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Status
            </Text>
            <SegmentedButtons
              value={selectedStatus}
              onValueChange={(value) => setSelectedStatus(value as PrayerStatus)}
              buttons={[
                {
                  value: PrayerStatus.COMPLETED,
                  label: 'Prayed',
                  icon: getStatusIcon(PrayerStatus.COMPLETED),
                  style: selectedStatus === PrayerStatus.COMPLETED
                    ? { backgroundColor: theme.expressiveColors.prayerCompleted + '20' }
                    : undefined,
                },
                {
                  value: PrayerStatus.DELAYED,
                  label: 'Delayed',
                  icon: getStatusIcon(PrayerStatus.DELAYED),
                  style: selectedStatus === PrayerStatus.DELAYED
                    ? { backgroundColor: theme.expressiveColors.prayerUpcoming + '20' }
                    : undefined,
                },
                {
                  value: PrayerStatus.MISSED,
                  label: 'Missed',
                  icon: getStatusIcon(PrayerStatus.MISSED),
                  style: selectedStatus === PrayerStatus.MISSED
                    ? { backgroundColor: theme.expressiveColors.prayerMissed + '20' }
                    : undefined,
                },
              ]}
              style={styles.segmentedButtons}
            />

            {/* Qada Button (if missed) */}
            {selectedStatus === PrayerStatus.MISSED && (
              <View style={styles.qadaHint}>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Tip: Missed prayers can be made up as Qada later from the Qada tab
                </Text>
              </View>
            )}

            {/* Notes Input */}
            <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Notes (Optional)
            </Text>
            <TextInput
              testID="prayer-notes-input"
              mode="outlined"
              value={notes}
              onChangeText={setNotes}
              placeholder="Add notes..."
              multiline
              numberOfLines={3}
              style={styles.notesInput}
            />
          </ScrollView>
        </Dialog.Content>

        <Dialog.Actions>
          <Button testID="close-modal-button" onPress={handleCancel}>Cancel</Button>
          <Button
            testID="save-notes-button"
            onPress={handleConfirm}
            mode="contained"
            style={styles.confirmButton}
          >
            Confirm
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
  segmentedButtons: {
    marginBottom: 16,
  },
  qadaHint: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  notesInput: {
    marginBottom: 8,
  },
  confirmButton: {
    marginLeft: 8,
  },
});
