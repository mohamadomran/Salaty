/**
 * Prayer Checkbox Component
 * Material Design 3 checkbox for tracking prayer completion
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, IconButton, useTheme } from 'react-native-paper';
import { PrayerStatus } from '../../types';
import { PrayerName, PrayerTimes } from '../../types';
import { ExpressiveTheme } from '../../theme';
import { getPrayerActions, PrayerTimeStatus } from '../../utils/prayerTimeLogic';

interface PrayerCheckboxProps {
  prayerName: PrayerName;
  prayerTime: string;
  status: PrayerStatus;
  prayerTimes?: PrayerTimes; // For time-based logic
  onPress: () => void; // Opens modal for detailed status change
  disabled?: boolean;
  variant?: 'current' | 'upcoming' | 'completed'; // Section type for styling
}

export function PrayerCheckbox({
  prayerName,
  prayerTime,
  status,
  prayerTimes,
  onPress,
  disabled = false,
  variant,
}: PrayerCheckboxProps) {
  const theme = useTheme() as ExpressiveTheme;

  // Get time-based actions if prayerTimes is available
  const prayerActions = prayerTimes ? 
    getPrayerActions(prayerName, prayerTimes, status) : null;

  // Determine if checkbox should be disabled based on time
  const isTimeDisabled = prayerActions ? !prayerActions.canMarkCompleted : false;
  const isActuallyDisabled = disabled || isTimeDisabled;

  const handlePress = () => {
    console.log('PrayerCheckbox pressed:', prayerName, 'disabled:', isActuallyDisabled);
    if (isActuallyDisabled) return;
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
      case PrayerStatus.QADA:
        return 'plus-circle-outline';
      case PrayerStatus.PENDING:
      default:
        return 'circle-outline';
    }
  };

  const getIconColor = () => {
    switch (status) {
      case PrayerStatus.COMPLETED:
        return theme.expressiveColors.prayerCompleted;
      case PrayerStatus.DELAYED:
        return theme.expressiveColors.prayerUpcoming;
      case PrayerStatus.MISSED:
        return theme.expressiveColors.prayerMissed;
      case PrayerStatus.QADA:
        return theme.colors.secondary;
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

  const getContainerStyle = () => {
    if (!variant) return {};

    switch (variant) {
      case 'current':
        return {
          backgroundColor: theme.expressiveColors.prayerActive + '10',
          borderLeftWidth: 3,
          borderLeftColor: theme.expressiveColors.prayerActive,
        };
      case 'upcoming':
        return {
          backgroundColor: theme.colors.surfaceVariant + '30',
        };
      case 'completed':
        return {
          backgroundColor: 'transparent',
          opacity: 0.7,
        };
      default:
        return {};
    }
  };

  return (
    <TouchableOpacity
      testID={`prayer-checkbox-${prayerName.toLowerCase()}`}
      style={[
        styles.container,
        getContainerStyle(),
        isActuallyDisabled && styles.disabled,
      ]}
      onPress={handlePress}
      disabled={isActuallyDisabled}
      activeOpacity={0.7}
    >
      <View style={styles.leftContent}>
        <IconButton
          testID={`${prayerName.toLowerCase()}-${status}-icon`}
          icon={getIcon()}
          iconColor={getIconColor()}
          size={32}
          onPress={handlePress}
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
       
        {/* Status badges */}
        {status === PrayerStatus.DELAYED && (
          <Text
            variant="labelSmall"
            style={[
              styles.badge,
              {
                backgroundColor:
                  theme.expressiveColors.prayerUpcoming + '20',
              },
            ]}
          >
            Delayed
          </Text>
        )}
        
        {status === PrayerStatus.QADA && (
          <Text
            variant="labelSmall"
            style={[
              styles.badge,
              {
                backgroundColor: theme.colors.secondaryContainer + '20',
                color: theme.colors.onSecondaryContainer,
              },
            ]}
          >
            Qada
          </Text>
        )}
       
       {/* Time-based status indicator */}
       {prayerActions && prayerActions.timeStatus === PrayerTimeStatus.FUTURE && (
         <Text
           variant="labelSmall"
           style={[
             styles.badge,
             {
               backgroundColor: theme.colors.surfaceVariant + '40',
               color: theme.colors.onSurfaceVariant,
             },
           ]}
         >
           {prayerActions.nextActionText}
         </Text>
       )}
       
       {prayerActions && prayerActions.timeStatus === PrayerTimeStatus.CURRENT && (
         <Text
           variant="labelSmall"
           style={[
             styles.badge,
             {
               backgroundColor: theme.colors.primary + '20',
               color: theme.colors.primary,
             },
           ]}
         >
           Now
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
