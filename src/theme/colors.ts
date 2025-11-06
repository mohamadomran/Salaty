/**
 * Enhanced Islamic Color Palette for Salaty
 * Deep teal primary with gold accents - more spiritual and calming
 * Improved contrast and accessibility
 */

export const lightColors = {
  // Primary - Deep Islamic Teal
  primary: '#006A6A',
  onPrimary: '#FFFFFF',
  primaryContainer: '#B2E8E8',
  onPrimaryContainer: '#001F1F',

  // Secondary - Rich Islamic Gold
  secondary: '#B8860B',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#F8E4B1',
  onSecondaryContainer: '#2D1F00',

  // Tertiary - Soft Sage Green
  tertiary: '#5A7A7A',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#D1E7E7',
  onTertiaryContainer: '#0F2D2D',

  // Error - Warm Red
  error: '#BA1A1A',
  onError: '#FFFFFF',
  errorContainer: '#FFDAD6',
  onErrorContainer: '#410002',

  // Background - Warm White
  background: '#FFFBFE',
  onBackground: '#0D0F0F',

  // Surface - Pure White
  surface: '#FFFFFF',
  onSurface: '#0D0F0F',
  surfaceVariant: '#E5E5E5',
  onSurfaceVariant: '#2D2D2D',

  // Outline & Borders
  outline: '#5A5A5A',
  outlineVariant: '#CAC4D0',

  // Enhanced elevation system
  elevation: {
    level0: 'transparent',
    level1: '#FAFAFA',
    level2: '#F5F5F5',
    level3: '#F0F0F0',
    level4: '#ECECEC',
    level5: '#E8E8E8',
  },
};

export const darkColors = {
  // Primary - Light Teal for dark mode
  primary: '#4CDADA',
  onPrimary: '#003737',
  primaryContainer: '#004F4F',
  onPrimaryContainer: '#B2E8E8',

  // Secondary - Warm Gold
  secondary: '#FFD700',
  onSecondary: '#4A2C00',
  secondaryContainer: '#6B4E00',
  onSecondaryContainer: '#F8E4B1',

  // Tertiary - Light Sage
  tertiary: '#B0C7C7',
  onTertiary: '#1C2D2D',
  tertiaryContainer: '#2D4242',
  onTertiaryContainer: '#D1E7E7',

  // Error - Light Red
  error: '#FFB4AB',
  onError: '#690005',
  errorContainer: '#93000A',
  onErrorContainer: '#FFDAD6',

  // Background - True Black (OLED optimized)
  background: '#000000',
  onBackground: '#FFFFFF',

  // Surface - Dark Gray
  surface: '#1A1A1A',
  onSurface: '#FFFFFF',
  surfaceVariant: '#2F2F2F',
  onSurfaceVariant: '#F0F0F0',

  // Outline & Borders
  outline: '#B0B0B0',
  outlineVariant: '#49454F',

  // Dark elevation overlays
  elevation: {
    level0: 'transparent',
    level1: '#1A1A1A',
    level2: '#242424',
    level3: '#2D2D2D',
    level4: '#333333',
    level5: '#383838',
  },
};

// Enhanced expressive colors for Islamic elements
export const expressiveColors = {
  // Prayer states with better contrast
  prayerActive: '#4CDADA', // Bright teal for current prayer
  prayerUpcoming: '#FFD700', // Gold for next prayer
  prayerCompleted: '#5A9A5A', // Sage green for completed
  prayerMissed: '#E57373', // Soft red for missed
  prayerDelayed: '#FFB74D', // Orange for delayed

  // Qibla compass
  qiblaDirection: '#FFD700', // Gold for Qibla
  compassBackground: 'rgba(0, 106, 106, 0.1)',
  compassRose: '#4CDADA', // Teal for compass directions

  // Navigation
  navigationActive: '#FFD700', // Gold for active
  navigationInactive: '#5A7A7A', // Muted teal for inactive
  navigationBackgroundLight: '#FFFFFF',
  navigationBackgroundDark: '#1A1A1A',

  // Islamic design elements
  geometricPattern: 'rgba(0, 106, 106, 0.05)',
  goldAccent: '#FFD700', // Pure gold
  goldShimmer: '#FFED4E', // Bright gold shimmer
  islamicGreen: '#006A6A', // Traditional Islamic green
  deepTeal: '#004F4F',

  // Success states
  success: '#5A9A5A',
  onSuccess: '#FFFFFF',
  successContainer: '#D1E7E7',
  onSuccessContainer: '#0F2D2D',

  // Warning states
  warning: '#B8860B',
  onWarning: '#FFFFFF',
  warningContainer: '#F8E4B1',
  onWarningContainer: '#2D1F00',

  // Additional semantic colors
  muted: '#E5E5E5',
  mutedForeground: '#5A5A5A',
  accent: '#B2E8E8',
  accentForeground: '#001F1F',
  input: 'transparent',
  inputBackground: '#F5F5F5',
  switchBackground: '#4CDADA',
  ring: '#4CDADA',

  // Gradients for special elements
  gradients: {
    prayerCard: ['#FFFFFF', '#F8FBFB'],
    goldGradient: ['#FFD700', '#FFED4E'],
    tealGradient: ['#006A6A', '#4CDADA'],
    sunsetGradient: ['#FF6B6B', '#FFD700'],
  },
};

// Dark mode expressive colors
export const darkExpressiveColors = {
  ...expressiveColors,

  // Dark mode adjustments
  geometricPattern: 'rgba(76, 218, 218, 0.08)',
  compassBackground: 'rgba(0, 106, 106, 0.15)',
  prayerCompleted: '#A5D4BF', // Lighter sage for dark mode
  success: '#A5D4BF',
  successContainer: '#1C3A32',

  // Dark mode gradients
  gradients: {
    prayerCard: ['#1A1A1A', '#242424'],
    goldGradient: ['#FFD700', '#B8860B'],
    tealGradient: ['#4CDADA', '#006A6A'],
    sunsetGradient: ['#FF6B6B', '#B8860B'],
  },
};
