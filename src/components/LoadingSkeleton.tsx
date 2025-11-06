/**
 * Loading Skeleton Component
 * Animated placeholder for loading states
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from 'react-native-paper';

interface LoadingSkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const theme = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.colors.surfaceVariant,
          opacity,
        },
        style,
      ]}
    />
  );
};

interface SkeletonCardProps {
  variant?: 'settings' | 'prayer' | 'list';
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ variant = 'settings' }) => {
  const theme = useTheme();

  if (variant === 'settings') {
    return (
      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <LoadingSkeleton width={40} height={40} borderRadius={20} />
          <LoadingSkeleton width={150} height={20} style={styles.cardTitleMargin} />
        </View>

        {/* Content */}
        <View style={styles.cardContent}>
          <LoadingSkeleton width="100%" height={16} style={styles.contentMargin} />
          <LoadingSkeleton width="80%" height={16} style={styles.contentMarginLarge} />
          <LoadingSkeleton width="100%" height={48} borderRadius={8} />
        </View>
      </View>
    );
  }

  if (variant === 'prayer') {
    return (
      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.prayerRow}>
          <LoadingSkeleton width={60} height={60} borderRadius={12} />
          <View style={styles.prayerContent}>
            <LoadingSkeleton width="40%" height={20} style={styles.contentMargin} />
            <LoadingSkeleton width="60%" height={16} />
          </View>
        </View>
      </View>
    );
  }

  // list variant
  return (
    <View style={styles.listItem}>
      <LoadingSkeleton width={24} height={24} borderRadius={12} />
      <View style={styles.listContent}>
        <LoadingSkeleton width="70%" height={16} style={styles.contentMarginSmall} />
        <LoadingSkeleton width="50%" height={14} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitleMargin: {
    marginLeft: 12,
  },
  cardContent: {
    paddingTop: 8,
  },
  prayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  contentMargin: {
    marginBottom: 8,
  },
  contentMarginLarge: {
    marginBottom: 16,
  },
  prayerContent: {
    flex: 1,
    marginLeft: 16,
  },
  listContent: {
    flex: 1,
    marginLeft: 16,
  },
  contentMarginSmall: {
    marginBottom: 6,
  },
});
