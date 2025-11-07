/**
 * StatusBadge Component
 * Reusable badge/chip for displaying prayer status
 * Supports: Completed, Missed, Delayed, Pending, Qada
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { PrayerStatus } from '../../types';
import type { ExpressiveTheme } from '../../theme';

interface StatusBadgeProps {
  status: PrayerStatus;
  size?: 'small' | 'medium' | 'large';
  variant?: 'filled' | 'outlined' | 'text';
  showIcon?: boolean;
  style?: any;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'medium',
  variant = 'filled',
  showIcon = false,
  style,
}) => {
  const theme = useTheme() as ExpressiveTheme;
  const { t } = useTranslation();

  const getStatusConfig = () => {
    switch (status) {
      case PrayerStatus.COMPLETED:
        return {
          label: t('status.completed'),
          backgroundColor: theme.expressiveColors.prayerCompleted,
          textColor: theme.colors.onPrimary,
          borderColor: theme.expressiveColors.prayerCompleted,
          icon: 'check-circle',
        };
      case PrayerStatus.MISSED:
        return {
          label: t('status.missed'),
          backgroundColor: theme.expressiveColors.prayerMissed,
          textColor: theme.colors.onError,
          borderColor: theme.expressiveColors.prayerMissed,
          icon: 'close-circle',
        };
      case PrayerStatus.DELAYED:
        return {
          label: t('status.delayed'),
          backgroundColor: theme.expressiveColors.prayerUpcoming,
          textColor: theme.colors.onSecondaryContainer,
          borderColor: theme.expressiveColors.prayerUpcoming,
          icon: 'clock-outline',
        };
      case PrayerStatus.QADA:
        return {
          label: t('status.qada'),
          backgroundColor: theme.colors.tertiaryContainer,
          textColor: theme.colors.onTertiaryContainer,
          borderColor: theme.colors.tertiary,
          icon: 'history',
        };
      case PrayerStatus.PENDING:
      default:
        return {
          label: t('status.pending'),
          backgroundColor: theme.colors.surfaceVariant,
          textColor: theme.colors.onSurfaceVariant,
          borderColor: theme.colors.outline,
          icon: 'circle-outline',
        };
    }
  };

  const config = getStatusConfig();

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 12,
          fontSize: 11,
        };
      case 'large':
        return {
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderRadius: 20,
          fontSize: 16,
        };
      case 'medium':
      default:
        return {
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 16,
          fontSize: 13,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  const badgeStyle = [
    styles.badge,
    {
      paddingHorizontal: sizeStyles.paddingHorizontal,
      paddingVertical: sizeStyles.paddingVertical,
      borderRadius: sizeStyles.borderRadius,
    },
    variant === 'filled' && {
      backgroundColor: config.backgroundColor,
    },
    variant === 'outlined' && {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: config.borderColor,
    },
    variant === 'text' && {
      backgroundColor: 'transparent',
    },
    style,
  ];

  const textStyle = [
    styles.text,
    {
      fontSize: sizeStyles.fontSize,
      color: variant === 'filled' ? config.textColor : config.backgroundColor,
      fontWeight: '600' as const,
    },
  ];

  return (
    <View style={badgeStyle}>
      <Text style={textStyle}>{config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
});
