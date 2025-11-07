/**
 * Reminder Interval Selector
 * Component for selecting multiple reminder intervals before prayer time
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Modal, Portal, Checkbox, Button, Text, Divider, IconButton, Chip, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { ReminderInterval } from '../../types';

interface ReminderIntervalSelectorProps {
  visible: boolean;
  onDismiss: () => void;
  selectedIntervals: ReminderInterval[];
  onSelectIntervals: (intervals: ReminderInterval[]) => void;
  title?: string;
}

const INTERVAL_OPTIONS: ReminderInterval[] = [5, 10, 15, 20, 30];

export default function ReminderIntervalSelector({
  visible,
  onDismiss,
  selectedIntervals,
  onSelectIntervals,
  title = 'Select Reminder Times',
}: ReminderIntervalSelectorProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [tempSelection, setTempSelection] = useState<ReminderInterval[]>(selectedIntervals);

  const handleConfirm = () => {
    onSelectIntervals(tempSelection);
    onDismiss();
  };

  const handleCancel = () => {
    setTempSelection(selectedIntervals); // Reset to original selection
    onDismiss();
  };

  const handleToggleInterval = (interval: ReminderInterval) => {
    if (tempSelection.includes(interval)) {
      // Remove interval
      setTempSelection(tempSelection.filter((i) => i !== interval));
    } else {
      // Add interval and sort
      setTempSelection([...tempSelection, interval].sort((a, b) => a - b));
    }
  };

  const handleSelectAll = () => {
    setTempSelection([...INTERVAL_OPTIONS]);
  };

  const handleClearAll = () => {
    setTempSelection([]);
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleCancel}
        contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}
      >
        <View style={styles.header}>
          <Text variant="titleLarge" style={styles.title}>
            {title}
          </Text>
          <IconButton icon="close" onPress={handleCancel} />
        </View>

        <Divider />

        <View style={styles.content}>
          <Text variant="bodyMedium" style={styles.description}>
            Select when you want to be reminded before prayer time. You can choose multiple
            intervals.
          </Text>

          {/* Quick actions */}
          <View style={styles.quickActions}>
            <Chip
              mode="outlined"
              onPress={handleSelectAll}
              icon="check-all"
              style={styles.chip}
            >
              Select All
            </Chip>
            <Chip
              mode="outlined"
              onPress={handleClearAll}
              icon="close-circle-outline"
              style={styles.chip}
            >
              Clear All
            </Chip>
          </View>

          {/* Current selection preview */}
          {tempSelection.length > 0 && (
            <View style={styles.previewContainer}>
              <Text variant="bodySmall" style={styles.previewLabel}>
                Selected reminders:
              </Text>
              <View style={styles.previewChips}>
                {tempSelection.map((interval) => (
                  <Chip
                    key={interval}
                    mode="flat"
                    onClose={() => handleToggleInterval(interval)}
                    style={styles.selectedChip}
                  >
                    {interval} min before
                  </Chip>
                ))}
              </View>
            </View>
          )}

          <Divider style={styles.divider} />

          {/* Interval options */}
          <ScrollView style={styles.scrollView}>
            {INTERVAL_OPTIONS.map((interval) => {
              const isSelected = tempSelection.includes(interval);
              return (
                <View key={interval} style={styles.checkboxItem}>
                  <Checkbox.Item
                    label={`${interval} minutes before`}
                    status={isSelected ? 'checked' : 'unchecked'}
                    onPress={() => handleToggleInterval(interval)}
                    labelVariant="bodyLarge"
                    position="leading"
                    style={styles.checkbox}
                  />
                  <Text variant="bodySmall" style={styles.intervalDescription}>
                    {getIntervalDescription(interval)}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </View>

        <Divider />

        <View style={styles.footer}>
          <Button mode="outlined" onPress={handleCancel} style={styles.button}>
            {t('common.cancel')}
          </Button>
          <Button
            mode="contained"
            onPress={handleConfirm}
            style={styles.button}
            disabled={tempSelection.length === 0}
          >
            {t('common.confirm')} ({tempSelection.length})
          </Button>
        </View>
      </Modal>
    </Portal>
  );
}

/**
 * Get human-readable description for interval
 */
function getIntervalDescription(interval: ReminderInterval): string {
  switch (interval) {
    case 5:
      return 'Last-minute reminder';
    case 10:
      return 'Quick preparation time';
    case 15:
      return 'Standard reminder';
    case 20:
      return 'Early preparation';
    case 30:
      return 'Maximum advance notice';
    default:
      return '';
  }
}

const styles = StyleSheet.create({
  modalContainer: {
    marginHorizontal: 20,
    borderRadius: 16,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 24,
    paddingRight: 8,
    paddingVertical: 8,
  },
  title: {
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  description: {
    marginBottom: 16,
    opacity: 0.7,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    flex: 1,
  },
  previewContainer: {
    marginBottom: 16,
  },
  previewLabel: {
    marginBottom: 8,
    opacity: 0.7,
  },
  previewChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedChip: {
    marginRight: 4,
    marginBottom: 4,
  },
  divider: {
    marginVertical: 16,
  },
  scrollView: {
    maxHeight: 250,
  },
  checkboxItem: {
    marginBottom: 12,
  },
  checkbox: {
    paddingVertical: 4,
  },
  intervalDescription: {
    marginLeft: 56,
    marginTop: -8,
    opacity: 0.6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    padding: 16,
  },
  button: {
    minWidth: 100,
  },
});
