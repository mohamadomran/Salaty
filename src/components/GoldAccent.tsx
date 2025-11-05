/**
 * Gold Accent Component
 * Metallic gold accent with optional shimmer effect
 * Used for dividers, highlights, and premium elements
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { ExpressiveTheme } from '@theme';
import { LinearGradient } from 'expo-linear-gradient';

interface GoldAccentProps {
  /** Accent type */
  variant?: 'divider' | 'highlight' | 'badge';
  /** Enable shimmer gradient effect */
  shimmer?: boolean;
  /** Width (for divider) */
  width?: number | string;
  /** Height */
  height?: number;
  /** Additional styles */
  style?: any;
}

export function GoldAccent({
  variant = 'divider',
  shimmer = false,
  width,
  height,
  style,
}: GoldAccentProps) {
  const theme = useTheme<ExpressiveTheme>();

  // Determine dimensions based on variant
  const dimensions = {
    divider: { width: width ?? '100%', height: height ?? 1 },
    highlight: { width: width ?? 4, height: height ?? '100%' },
    badge: { width: width ?? 8, height: height ?? 8 },
  }[variant];

  // Gold colors
  const goldAccent = theme.expressiveColors.goldAccent;
  const goldShimmer = theme.expressiveColors.goldShimmer;

  if (shimmer) {
    return (
      <LinearGradient
        colors={[goldAccent, goldShimmer, goldAccent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.base,
          dimensions,
          variant === 'badge' && styles.badge,
          style,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.base,
        dimensions,
        { backgroundColor: goldAccent },
        variant === 'badge' && styles.badge,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    // Base styles
  },
  badge: {
    borderRadius: 9999, // Circular
  },
});
