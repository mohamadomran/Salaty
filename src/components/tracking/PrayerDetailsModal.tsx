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
import { PrayerStatus, PrayerName, PrayerTimes } from '../../types';
import type { ExpressiveTheme } from '../../theme';
import { getPrayerActions } from '../../utils/prayerTimeLogic';

interface PrayerDetailsModalProps {
  visible: boolean;
  onDismiss: () => void;
  prayerName: PrayerName;
  prayerTime: string;
  currentStatus: PrayerStatus;
  currentNotes?: string;
  prayerTimes?: PrayerTimes; // For time-based logic
  onConfirm: (status: PrayerStatus, notes?: string) => void;
}

export function PrayerDetailsModal({
  visible,
  onDismiss,
  prayerName,
  prayerTime,
  currentStatus,
  currentNotes,
  prayerTimes,
  onConfirm,
}: PrayerDetailsModalProps) {
  const theme = useTheme<ExpressiveTheme>();
  const [selectedStatus, setSelectedStatus] = useState<PrayerStatus>(currentStatus);
  const [notes, setNotes] = useState(currentNotes || '');

  // Get available actions based on prayer time
  const prayerActions = prayerTimes ? 
    getPrayerActions(prayerName, prayerTimes, currentStatus) : null;

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
        return 'Add to Qada';
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
                       style: selectedStatus === status
                         ? { 
                             backgroundColor: 
                               status === PrayerStatus.COMPLETED ? theme.expressiveColors.prayerCompleted + '20' :
                               status === PrayerStatus.DELAYED ? theme.expressiveColors.prayerUpcoming + '20' :
                               status === PrayerStatus.MISSED ? theme.expressiveColors.prayerMissed + '20' :
                               status === PrayerStatus.QADA ? theme.colors.secondaryContainer + '20' :
                               theme.colors.surfaceVariant + '20'
                           }
                         : undefined,
                    }))
                  : [
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

            {/* Qada Hint (if qada selected) */}
            {selectedStatus === PrayerStatus.QADA && (
              <View style={styles.qadaHint}>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  This prayer will be added to your Qada list to be made up later
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
  notesInput: {
    marginBottom: 8,
  },
  confirmButton: {
    marginLeft: 8,
  },
});
