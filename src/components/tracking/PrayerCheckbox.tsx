/**
 * Prayer Checkbox Component
 * Material Design 3 checkbox for tracking prayer completion
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, IconButton, useTheme } from 'react-native-paper';
import { PrayerStatus } from '../../types';
import { lightTheme } from '../../theme';

interface PrayerCheckboxProps {
  prayerName: string;
  prayerTime: string;
  status: PrayerStatus;
  onPress: () => void; // Opens modal for detailed status change
  disabled?: boolean;
}

export function PrayerCheckbox({
  prayerName,
  prayerTime,
  status,
  onPress,
  disabled = false,
}: PrayerCheckboxProps) {
  const theme = useTheme();

  const handlePress = () => {
    console.log('PrayerCheckbox pressed:', prayerName, 'disabled:', disabled);
    if (disabled) return;
    onPress();
  };

  const getIcon = () => {
    switch (status) {
      case PrayerStatus.COMPLETED:
        return 'check-circle';
      case PrayerStatus.DELAYED:
        return 'check-circle-outline';
      case PrayerStatus.MISSED:
        return 'close-circle';
      case PrayerStatus.PENDING:
      default:
        return 'circle-outline';
    }
  };

  const getIconColor = () => {
    switch (status) {
      case PrayerStatus.COMPLETED:
        return lightTheme.colors.expressiveColors.prayerCompleted;
      case PrayerStatus.DELAYED:
        return lightTheme.colors.expressiveColors.prayerUpcoming;
      case PrayerStatus.MISSED:
        return lightTheme.colors.expressiveColors.prayerMissed;
      case PrayerStatus.PENDING:
      default:
        return theme.colors.outline;
    }
  };

  const getTextColor = () => {
    if (status === PrayerStatus.COMPLETED || status === PrayerStatus.DELAYED) {
      return theme.colors.onSurfaceVariant;
    }
    return theme.colors.onSurface;
  };

  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.disabled]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={styles.leftContent}>
        <IconButton
          icon={getIcon()}
          iconColor={getIconColor()}
          size={32}
          disabled={true}
          style={styles.checkbox}
        />
        <View style={styles.textContainer}>
          <Text
            variant="titleMedium"
            style={[
              styles.prayerName,
              { color: getTextColor() },
              (status === PrayerStatus.COMPLETED ||
                status === PrayerStatus.DELAYED) &&
                styles.completedText,
            ]}
          >
            {prayerName}
          </Text>
          <Text
            variant="bodySmall"
            style={[
              styles.prayerTime,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            {prayerTime}
          </Text>
        </View>
      </View>
      {status === PrayerStatus.DELAYED && (
        <Text
          variant="labelSmall"
          style={[
            styles.badge,
            {
              backgroundColor:
                lightTheme.colors.expressiveColors.prayerUpcoming + '20',
            },
          ]}
        >
          Delayed
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.6,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    margin: 0,
  },
  textContainer: {
    marginLeft: 8,
    flex: 1,
  },
  prayerName: {
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  prayerTime: {
    marginTop: 2,
  },
  completedText: {
    textDecorationLine: 'line-through',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
    overflow: 'hidden',
  },
});
