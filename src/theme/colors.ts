/**
 * Material Design 3 Expressive Color Palette for Salaty
 * Inspired by Islamic aesthetics with teal/green theme
 */

export const lightColors = {
  // Primary - Teal (Islamic theme)
  primary: '#006A6A',
  onPrimary: '#FFFFFF',
  primaryContainer: '#6FF7F7',
  onPrimaryContainer: '#002020',

  // Secondary
  secondary: '#4A6363',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#CCE8E8',
  onSecondaryContainer: '#051F1F',

  // Tertiary - Blue accent
  tertiary: '#4C5F7C',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#D4E3FF',
  onTertiaryContainer: '#071E35',

  // Error
  error: '#BA1A1A',
  onError: '#FFFFFF',
  errorContainer: '#FFDAD6',
  onErrorContainer: '#410002',

  // Background
  background: '#FAFDFD',
  onBackground: '#191C1C',

  // Surface
  surface: '#FAFDFD',
  onSurface: '#191C1C',
  surfaceVariant: '#DAE5E4',
  onSurfaceVariant: '#3F4948',

  // Outline
  outline: '#6F7978',
  outlineVariant: '#BEC9C8',

  // Other surfaces
  surfaceDisabled: 'rgba(25, 28, 28, 0.12)',
  onSurfaceDisabled: 'rgba(25, 28, 28, 0.38)',
  backdrop: 'rgba(63, 73, 72, 0.4)',

  // Elevation overlays
  elevation: {
    level0: 'transparent',
    level1: '#F0F8F8',
    level2: '#EBF4F4',
    level3: '#E5F1F1',
    level4: '#E3EFEF',
    level5: '#E0EDED',
  },
};

export const darkColors = {
  // Primary
  primary: '#4CDADA',
  onPrimary: '#003737',
  primaryContainer: '#004F4F',
  onPrimaryContainer: '#6FF7F7',

  // Secondary
  secondary: '#B0CCCC',
  onSecondary: '#1B3434',
  secondaryContainer: '#324B4B',
  onSecondaryContainer: '#CCE8E8',

  // Tertiary
  tertiary: '#B3C8EA',
  onTertiary: '#1D314B',
  tertiaryContainer: '#344863',
  onTertiaryContainer: '#D4E3FF',

  // Error
  error: '#FFB4AB',
  onError: '#690005',
  errorContainer: '#93000A',
  onErrorContainer: '#FFDAD6',

  // Background
  background: '#191C1C',
  onBackground: '#E0E3E3',

  // Surface
  surface: '#191C1C',
  onSurface: '#E0E3E3',
  surfaceVariant: '#3F4948',
  onSurfaceVariant: '#BEC9C8',

  // Outline
  outline: '#889392',
  outlineVariant: '#3F4948',

  // Other surfaces
  surfaceDisabled: 'rgba(224, 227, 227, 0.12)',
  onSurfaceDisabled: 'rgba(224, 227, 227, 0.38)',
  backdrop: 'rgba(63, 73, 72, 0.4)',

  // Elevation overlays
  elevation: {
    level0: 'transparent',
    level1: '#1E2525',
    level2: '#232B2B',
    level3: '#273030',
    level4: '#283232',
    level5: '#2B3535',
  },
};

// Expressive color extensions for special states
export const expressiveColors = {
  // Prayer time indicators
  prayerActive: '#00C853', // Green for current prayer
  prayerUpcoming: '#FFA726', // Orange for upcoming
  prayerCompleted: '#4CDADA', // Teal for completed
  prayerMissed: '#FF5252', // Red for missed

  // Qibla compass
  qiblaDirection: '#FFD700', // Gold for Qibla arrow
  compassBackground: 'rgba(0, 106, 106, 0.05)',

  // Success states
  success: '#00C853',
  onSuccess: '#FFFFFF',
  successContainer: '#B9F6CA',
  onSuccessContainer: '#002106',

  // Warning states
  warning: '#F57C00',
  onWarning: '#FFFFFF',
  warningContainer: '#FFE0B2',
  onWarningContainer: '#1F0E00',
};
