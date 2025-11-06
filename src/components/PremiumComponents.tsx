/**
 * Enhanced UI Components for Salaty
 * Premium, cross-platform components with Islamic design elements
 */

import React from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type { ExpressiveTheme } from '../theme';

const { width: screenWidth } = Dimensions.get('window');

interface PremiumCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'prayer' | 'nextPrayer' | 'stats' | 'glass';
  elevation?: number;
  gradient?: boolean;
  icon?: string;
  title?: string;
  style?: any;
}

/**
 * Premium Card with gradient backgrounds and enhanced shadows
 */
export function PremiumCard({
  children,
  variant = 'default',
  elevation = 2,
  gradient = false,
  icon,
  title,
  style,
}: PremiumCardProps) {
  const theme = useTheme<ExpressiveTheme>();

  const getCardStyle = () => {
    switch (variant) {
      case 'prayer':
        return {
          backgroundColor: theme.colors.surface,
          borderRadius: 24,
          borderWidth: 1,
          borderColor: theme.colors.outline || 'rgba(0, 106, 106, 0.1)',
        };
      case 'nextPrayer':
        return {
          backgroundColor: theme.colors.primaryContainer,
          borderRadius: 28,
          borderWidth: 2,
          borderColor: theme.colors.primary,
        };
      case 'stats':
        return {
          backgroundColor: theme.colors.surface,
          borderRadius: 20,
          borderWidth: 0,
        };
      case 'glass':
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 24,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.2)',
        };
      default:
        return {
          backgroundColor: theme.colors.surface,
          borderRadius: 20,
          borderWidth: 0,
        };
    }
  };

  const getGradientColors = () => {
    if (!gradient) return null;

    switch (variant) {
      case 'prayer':
        return [theme.colors.surface, theme.colors.surfaceVariant];
      case 'nextPrayer':
        return [theme.colors.primary, theme.colors.primaryContainer];
      case 'stats':
        return [theme.colors.secondary, theme.colors.secondaryContainer];
      default:
        return [theme.colors.surface, theme.colors.surfaceVariant];
    }
  };

  const gradientColors = getGradientColors();

  return (
    <Animated.View
      style={[
        styles.card,
        getCardStyle(),
        {
          shadowColor: theme.colors.primary,
          shadowOffset: { width: 0, height: elevation * 2 },
          shadowOpacity: 0.15,
          shadowRadius: elevation * 3,
          elevation: elevation * 4,
        },
        style,
      ]}
    >
      {gradientColors ? (
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientContainer}
        >
          {icon && title && (
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons
                name={icon}
                size={24}
                color={theme.colors.primary}
              />
              <Text variant="titleMedium" style={styles.cardTitle}>
                {title}
              </Text>
            </View>
          )}
          {children}
        </LinearGradient>
      ) : (
        <>
          {icon && title && (
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons
                name={icon}
                size={24}
                color={theme.colors.primary}
              />
              <Text variant="titleMedium" style={styles.cardTitle}>
                {title}
              </Text>
            </View>
          )}
          {children}
        </>
      )}
    </Animated.View>
  );
}

interface PrayerTimeCardProps {
  prayerName: string;
  arabicName: string;
  time: string;
  status: 'current' | 'next' | 'completed' | 'upcoming';
  icon: string;
  onPress?: () => void;
}

/**
 * Enhanced Prayer Time Card with status indicators
 */
export function PrayerTimeCard({
  prayerName,
  arabicName,
  time,
  status,
  icon,
  onPress,
}: PrayerTimeCardProps) {
  const theme = useTheme<ExpressiveTheme>();
  const animatedValue = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (status === 'current') {
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [status, animatedValue]);

  const getStatusStyle = () => {
    switch (status) {
      case 'current':
        return {
          backgroundColor: theme.expressiveColors?.prayerActive || '#4CDADA',
          color: '#FFFFFF',
        };
      case 'next':
        return {
          backgroundColor: theme.expressiveColors?.prayerUpcoming || '#FFD700',
          color: '#000000',
        };
      case 'completed':
        return {
          backgroundColor: theme.expressiveColors?.prayerCompleted || '#5A9A5A',
          color: '#FFFFFF',
        };
      default:
        return {
          backgroundColor: theme.colors.surface,
          color: theme.colors.onSurface,
        };
    }
  };

  const statusStyle = getStatusStyle();

  return (
    <Animated.View
      style={[
        styles.prayerCard,
        {
          backgroundColor: statusStyle.backgroundColor,
          borderColor: theme.colors.outline,
          transform: [{ scale: animatedValue }],
        },
      ]}
    >
      <View style={styles.prayerCardContent}>
        <View style={styles.prayerInfo}>
          <MaterialCommunityIcons
            name={icon}
            size={28}
            color={statusStyle.color}
          />
          <View style={styles.prayerNames}>
            <Text
              variant="titleLarge"
              style={[styles.prayerEnglish, { color: statusStyle.color }]}
            >
              {prayerName}
            </Text>
            <Text
              variant="bodyMedium"
              style={[styles.prayerArabic, { color: statusStyle.color }]}
            >
              {arabicName}
            </Text>
          </View>
        </View>

        <View style={styles.prayerTimeContainer}>
          <Text
            variant="headlineMedium"
            style={[styles.prayerTime, { color: statusStyle.color }]}
          >
            {time}
          </Text>
          {status === 'current' && (
            <View style={[styles.statusBadge, { backgroundColor: '#FFFFFF' }]}>
              <Text
                style={[styles.statusText, { color: theme.colors.primary }]}
              >
                NOW
              </Text>
            </View>
          )}
          {status === 'next' && (
            <View style={[styles.statusBadge, { backgroundColor: '#000000' }]}>
              <Text style={[styles.statusText, { color: '#FFD700' }]}>
                NEXT
              </Text>
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

interface FloatingActionBarProps {
  children: React.ReactNode;
  position?: 'bottom' | 'top';
}

/**
 * Floating Action Bar with glassmorphism effect
 */
export function FloatingActionBar({
  children,
  position = 'bottom',
}: FloatingActionBarProps) {
  const theme = useTheme<ExpressiveTheme>();

  return (
    <View
      style={[
        styles.floatingBar,
        position === 'bottom' ? styles.bottomBar : styles.topBar,
        {
          backgroundColor: 'rgba(26, 26, 26, 0.8)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
        },
      ]}
    >
      {children}
    </View>
  );
}

interface IslamicPatternProps {
  children: React.ReactNode;
  opacity?: number;
}

/**
 * Islamic Geometric Pattern Background
 */
export function IslamicPattern({
  children,
  opacity = 0.05,
}: IslamicPatternProps) {
  return (
    <View style={styles.patternContainer}>
      {children}
      <View style={[styles.geometricPattern, { opacity }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
  },
  gradientContainer: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  cardTitle: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  prayerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    minHeight: 80,
  },
  prayerCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  prayerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  prayerNames: {
    gap: 2,
  },
  prayerEnglish: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  prayerArabic: {
    fontSize: 14,
    opacity: 0.8,
  },
  prayerTimeContainer: {
    alignItems: 'flex-end',
    gap: 8,
  },
  prayerTime: {
    fontWeight: '700',
    fontSize: 18,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 50,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  floatingBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  bottomBar: {
    bottom: 20,
  },
  topBar: {
    top: 50, // Account for status bar
  },
  patternContainer: {
    flex: 1,
    position: 'relative',
  },
  geometricPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // Note: backgroundImage not supported in React Native StyleSheet
    // This would need to be implemented differently or removed
    backgroundColor: 'transparent',
  },
});
