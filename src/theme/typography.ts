/**
 * Material Design 3 Expressive Typography
 * Enhanced font weights for emphasis and expressiveness
 */

import type { MD3TypescaleKey } from 'react-native-paper/lib/typescript/types';

export interface TypographyConfig {
  [key: string]: {
    fontFamily?: string;
    fontSize: number;
    lineHeight: number;
    fontWeight: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
    letterSpacing?: number;
  };
}

// M3 Expressive uses bolder weights for emphasis
export const typography: TypographyConfig = {
  displayLarge: {
    fontSize: 57,
    lineHeight: 64,
    fontWeight: '700', // Bold for M3 Expressive
    letterSpacing: -0.25,
  },
  displayMedium: {
    fontSize: 45,
    lineHeight: 52,
    fontWeight: '700',
    letterSpacing: 0,
  },
  displaySmall: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '600',
    letterSpacing: 0,
  },

  headlineLarge: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '600',
    letterSpacing: 0,
  },
  headlineMedium: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '600',
    letterSpacing: 0,
  },
  headlineSmall: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600',
    letterSpacing: 0,
  },

  titleLarge: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600', // Emphasized for M3 Expressive
    letterSpacing: 0,
  },
  titleMedium: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    letterSpacing: 0.15,
  },
  titleSmall: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    letterSpacing: 0.1,
  },

  labelLarge: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600', // Bold labels for M3 Expressive
    letterSpacing: 0.1,
  },
  labelMedium: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  labelSmall: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: 0.5,
  },

  bodyLarge: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  bodyMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    letterSpacing: 0.25,
  },
  bodySmall: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    letterSpacing: 0.4,
  },
};

// Custom typography for Islamic app
export const islamicTypography = {
  // For prayer names in Arabic
  arabicLarge: {
    fontSize: 32,
    lineHeight: 48,
    fontWeight: '700',
    letterSpacing: 0,
  },
  arabicMedium: {
    fontSize: 24,
    lineHeight: 36,
    fontWeight: '600',
    letterSpacing: 0,
  },
  arabicSmall: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '500',
    letterSpacing: 0,
  },

  // For prayer times (large, clear numbers)
  prayerTime: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
    letterSpacing: -0.5,
    fontFamily: 'monospace', // Better for time display
  },

  // For countdown timers
  countdown: {
    fontSize: 48,
    lineHeight: 56,
    fontWeight: '700',
    letterSpacing: -1,
    fontFamily: 'monospace',
  },
};
