/**
 * Loading Skeleton Component
 * Provides skeleton loading states for better UX during data fetching
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  style?: any;
  variant?: 'rectangular' | 'circular' | 'text';
}

/**
 * Individual skeleton element
 */
export function Skeleton({
  width = '100%',
  height = 20,
  style,
  variant = 'rectangular',
}: SkeletonProps) {
  const theme = useTheme();

  const skeletonStyle = [
    styles.skeleton,
    {
      width,
      height,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius:
        variant === 'circular' ? height / 2 : variant === 'rectangular' ? 8 : 4,
    },
    style,
  ];

  return <View style={skeletonStyle} />;
}

/**
 * Prayer card skeleton
 */
export function PrayerCardSkeleton() {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.cardHeader}>
        <Skeleton width={120} height={24} />
        <Skeleton width={80} height={16} />
      </View>

      <View style={styles.cardContent}>
        {[1, 2, 3, 4, 5].map(index => (
          <View key={index} style={styles.prayerRow}>
            <View style={styles.prayerInfo}>
              <Skeleton width={24} height={24} variant="circular" />
              <View style={styles.prayerText}>
                <Skeleton width={60} height={18} />
                <Skeleton width={40} height={14} />
              </View>
            </View>
            <Skeleton width={60} height={20} />
          </View>
        ))}
      </View>
    </View>
  );
}

/**
 * Stats card skeleton
 */
export function StatsCardSkeleton() {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Skeleton width={150} height={24} style={styles.cardTitle} />

      <View style={styles.statsContainer}>
        {[1, 2, 3].map(index => (
          <View key={index} style={styles.statItem}>
            <Skeleton width={40} height={32} />
            <Skeleton width={60} height={14} />
          </View>
        ))}
      </View>
    </View>
  );
}

/**
 * Location card skeleton
 */
export function LocationCardSkeleton() {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.cardHeader}>
        <Skeleton width={24} height={24} variant="circular" />
        <Skeleton width={140} height={20} />
      </View>

      <View style={styles.locationContent}>
        <Skeleton width={200} height={16} style={styles.locationText} />
        <Skeleton width={180} height={16} style={styles.locationText} />
        <Skeleton width={120} height={32} style={styles.buttonSkeleton} />
      </View>
    </View>
  );
}

/**
 * Next prayer card skeleton
 */
export function NextPrayerSkeleton() {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.card,
        styles.nextPrayerCard,
        { backgroundColor: theme.colors.surfaceVariant },
      ]}
    >
      <Skeleton width={100} height={16} style={styles.nextPrayerLabel} />
      <Skeleton width={120} height={40} style={styles.nextPrayerName} />
      <Skeleton width={80} height={32} style={styles.nextPrayerTime} />
      <Skeleton width={140} height={20} style={styles.countdown} />
    </View>
  );
}

/**
 * Full home screen skeleton
 */
export function HomeScreenSkeleton() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Skeleton width={100} height={40} />
        <Skeleton width={160} height={20} />
      </View>

      {/* Location Card */}
      <LocationCardSkeleton />

      {/* Next Prayer Card */}
      <NextPrayerSkeleton />

      {/* Prayer Times Card */}
      <PrayerCardSkeleton />

      {/* Settings Info Card */}
      <View style={styles.settingsCard}>
        <Skeleton width={180} height={20} />
        <View style={styles.settingsItems}>
          {[1, 2, 3, 4].map(index => (
            <Skeleton
              key={index}
              width={200}
              height={14}
              style={styles.settingsItem}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

/**
 * Tracking screen skeleton
 */
export function TrackingScreenSkeleton() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Skeleton width={150} height={32} />
        <Skeleton width={200} height={18} />
      </View>

      {/* Stats Card */}
      <StatsCardSkeleton />

      {/* Prayer Checklist Card */}
      <View style={[styles.card, styles.checklistCard]}>
        <Skeleton width={140} height={20} style={styles.cardTitle} />

        {[1, 2, 3, 4, 5].map(index => (
          <View key={index} style={styles.checklistItem}>
            <Skeleton width={24} height={24} variant="circular" />
            <View style={styles.checklistContent}>
              <Skeleton width={80} height={18} />
              <Skeleton width={60} height={14} />
            </View>
            <Skeleton width={60} height={20} />
          </View>
        ))}
      </View>
    </View>
  );
}

/**
 * Animated shimmer effect for skeletons
 */
export function Shimmer({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.shimmerContainer}>
      {children}
      <View style={styles.shimmerOverlay} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  skeleton: {
    opacity: 0.7,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  cardContent: {
    gap: 12,
  },
  cardTitle: {
    marginBottom: 12,
  },
  prayerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  prayerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  prayerText: {
    gap: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  locationContent: {
    gap: 8,
  },
  locationText: {
    marginBottom: 4,
  },
  buttonSkeleton: {
    marginTop: 8,
    borderRadius: 100,
  },
  nextPrayerCard: {
    borderRadius: 24,
  },
  nextPrayerLabel: {
    marginBottom: 8,
  },
  nextPrayerName: {
    marginBottom: 8,
  },
  nextPrayerTime: {
    marginBottom: 8,
  },
  countdown: {
    marginTop: 8,
  },
  settingsCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  settingsItems: {
    marginTop: 12,
    gap: 4,
  },
  settingsItem: {
    marginBottom: 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  checklistCard: {
    borderRadius: 24,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  checklistContent: {
    flex: 1,
    marginLeft: 12,
    gap: 4,
  },
  shimmerContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    // Animation would be added here for actual shimmer effect
  },
});

export default Skeleton;
