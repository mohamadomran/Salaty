/**
 * Prayer Grid Component
 * Displays all prayer times in a grid layout
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type { PrayerName, PrayerTimes } from '../../types';
import type { ExpressiveTheme } from '../../theme';

interface PrayerGridProps {
  prayerTimes: PrayerTimes;
  currentPrayer: PrayerName | null;
  nextPrayer: {
    name: PrayerName;
    time: Date;
  } | null;
  formatTime: (date: Date) => string;
  onPrayerPress: (prayerName: PrayerName, time: Date) => void;
  prayerNames: Record<string, { english: string; arabic: string; icon: string; color: string }>;
}

export const PrayerGrid: React.FC<PrayerGridProps> = React.memo(({ 
  prayerTimes,
  currentPrayer,
  nextPrayer,
  formatTime,
  onPrayerPress,
  prayerNames
}) => {
  const theme = useTheme<ExpressiveTheme>();

  return (
    <View style={styles.prayerGrid}>
      {Object.entries(prayerNames).map(([key, prayer]) => {
        const prayerKey = key as PrayerName;
        const time = prayerTimes[prayerKey];
        const isCurrent = currentPrayer === prayerKey;
        const isNext = nextPrayer?.name === prayerKey;

        return (
          <TouchableOpacity
            key={key}
            onPress={() => onPrayerPress(prayerKey, time)}
            activeOpacity={0.7}
            style={[
              styles.prayerCard,
              {
                backgroundColor: isCurrent
                  ? theme.colors.primaryContainer
                  : isNext
                  ? theme.colors.secondaryContainer
                  : theme.colors.surfaceVariant,
              },
            ]}
          >
            <View style={styles.prayerCardWrapper}>
              <View style={styles.prayerCardContent}>
              {/* Icon */}
              <View
                style={[
                  styles.prayerIconContainer,
                  {
                    backgroundColor: isCurrent || isNext
                      ? theme.colors.surface
                      : prayer.color + '20',
                  }
                ]}
              >
                <MaterialCommunityIcons
                  name={prayer.icon as any}
                  size={24}
                  color={isCurrent || isNext ? theme.colors.primary : prayer.color}
                />
              </View>

              {/* Prayer Info */}
              <View style={styles.prayerInfo}>
                <Text
                  variant="titleMedium"
                  style={{
                    fontWeight: '600',
                    color: isCurrent || isNext
                      ? theme.colors.onPrimaryContainer
                      : theme.colors.onSurface,
                  }}
                >
                  {prayer.english}
                </Text>
                <Text
                  variant="bodySmall"
                  style={{
                    color: isCurrent || isNext
                      ? theme.colors.onPrimaryContainer
                      : theme.colors.onSurfaceVariant,
                    opacity: 0.7,
                    marginTop: 2,
                  }}
                >
                  {prayer.arabic}
                </Text>
              </View>

              {/* Status Badge */}
              {(isCurrent || isNext) && (
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: isCurrent
                        ? theme.colors.primary
                        : theme.colors.secondary,
                    }
                  ]}
                >
                  <Text
                    variant="labelSmall"
                    style={{
                      color: isCurrent
                        ? theme.colors.onPrimary
                        : theme.colors.onSecondary,
                      fontWeight: '700',
                    }}
                  >
                    {isCurrent ? 'NOW' : 'NEXT'}
                  </Text>
                </View>
              )}

              {/* Time */}
              <Text
                variant="titleLarge"
                style={{
                  fontWeight: '700',
                  color: isCurrent || isNext
                    ? theme.colors.onPrimaryContainer
                    : theme.colors.onSurface,
                }}
              >
                {formatTime(time)}
              </Text>
            </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
});

PrayerGrid.displayName = 'PrayerGrid';

const styles = StyleSheet.create({
  prayerGrid: {
    gap: 12,
    marginBottom: 24,
  },
  prayerCard: {
    borderRadius: 20,
  },
  prayerCardWrapper: {
    overflow: 'hidden',
    borderRadius: 20,
  },
  prayerCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    position: 'relative',
  },
  prayerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prayerInfo: {
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
    alignSelf: 'center',
  },
});