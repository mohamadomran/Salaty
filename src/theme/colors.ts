/**
 * Sophisticated Purple & Gold Color Palette for Salaty
 * Royal, spiritual aesthetic with muted tones and Islamic gold accents
 * OLED-optimized dark mode with true black backgrounds
 */

export const lightColors = {
  // Primary - Muted Royal Purple
  primary: '#6B4E9B',
  onPrimary: '#FFFFFF',
  primaryContainer: '#E8DFF5',
  onPrimaryContainer: '#2A1944',

  // Secondary - Muted Gold/Brass
  secondary: '#C9A961',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#F5EDD9',
  onSecondaryContainer: '#3D2F1A',

  // Tertiary - Dusty Purple
  tertiary: '#8B7BA8',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#EDE8F3',
  onTertiaryContainer: '#3A2D4F',

  // Error / Destructive
  error: '#C07B7B',
  onError: '#FFFFFF',
  errorContainer: '#F5E5E5',
  onErrorContainer: '#5C2F2F',

  // Background
  background: '#FAFAFA',
  onBackground: '#1A0F2A',

  // Surface / Card
  surface: '#FFFFFF',
  onSurface: '#1A0F2A',
  surfaceVariant: '#F3EFF7',
  onSurfaceVariant: '#4A3570',

  // Outline / Border
  outline: 'rgba(107, 78, 155, 0.12)',
  outlineVariant: 'rgba(107, 78, 155, 0.06)',

  // Other surfaces
  surfaceDisabled: 'rgba(107, 78, 155, 0.12)',
  onSurfaceDisabled: 'rgba(107, 78, 155, 0.38)',
  backdrop: 'rgba(42, 25, 68, 0.5)',

  // Elevation overlays
  elevation: {
    level0: 'transparent',
    level1: '#FCFCFC',
    level2: '#F9F9F9',
    level3: '#F6F6F6',
    level4: '#F3F3F3',
    level5: '#F0F0F0',
  },
};

export const darkColors = {
  // Primary - Light Muted Purple for dark mode
  primary: '#C4B1E0',
  onPrimary: '#3A2459',
  primaryContainer: '#4F3872',
  onPrimaryContainer: '#E8DFF5',

  // Secondary - Warm Gold for dark mode
  secondary: '#D4B876',
  onSecondary: '#3A2E18',
  secondaryContainer: '#54462C',
  onSecondaryContainer: '#F5EDD9',

  // Tertiary - Light Dusty Purple
  tertiary: '#B5A8C7',
  onTertiary: '#2D2435',
  tertiaryContainer: '#3F3549',
  onTertiaryContainer: '#EDE8F3',

  // Error / Destructive
  error: '#D89999',
  onError: '#5C2F2F',
  errorContainer: '#7A4545',
  onErrorContainer: '#F5E5E5',

  // Background - True Black for OLED
  background: '#000000',
  onBackground: '#FFFFFF',

  // Surface / Card - Elevated Dark Gray
  surface: '#1A1A1A',
  onSurface: '#FFFFFF',
  surfaceVariant: '#2D2435',
  onSurfaceVariant: '#E0D0F0',

  // Outline / Border
  outline: 'rgba(196, 177, 224, 0.15)',
  outlineVariant: 'rgba(196, 177, 224, 0.08)',

  // Other surfaces
  surfaceDisabled: 'rgba(196, 177, 224, 0.12)',
  onSurfaceDisabled: 'rgba(196, 177, 224, 0.38)',
  backdrop: 'rgba(0, 0, 0, 0.8)',

  // Elevation overlays for OLED
  elevation: {
    level0: 'transparent',
    level1: '#1A1A1A',
    level2: '#242424',
    level3: '#2D2D2D',
    level4: '#333333',
    level5: '#383838',
  },
};

// Expressive color extensions for special states and Islamic elements
export const expressiveColors = {
  // Prayer time indicators - Updated for purple theme
  prayerActive: '#9B59D6', // Medium purple for current prayer
  prayerUpcoming: '#D4B876', // Gold for next prayer
  prayerCompleted: '#7BA897', // Muted sage green for done
  prayerMissed: '#C07B7B', // Muted rose for missed

  // Qibla compass
  qiblaDirection: '#E6C86E', // Bright gold for Qibla arrow
  compassBackground: 'rgba(107, 78, 155, 0.05)',

  // Navigation colors
  navigationActive: '#C9A961', // Gold for active tab
  navigationInactive: '#8B7BA8', // Muted purple for inactive
  navigationBackgroundLight: '#FFFFFF',
  navigationBackgroundDark: '#1A1A1A',

  // Islamic design elements
  geometricPattern: 'rgba(107, 78, 155, 0.03)', // Subtle pattern overlay
  goldAccent: '#C9A961', // Primary gold accent
  goldShimmer: '#E6C86E', // Brighter gold for highlights

  // Success states
  success: '#7BA897',
  onSuccess: '#FFFFFF',
  successContainer: '#E5F1ED',
  onSuccessContainer: '#2D4F42',

  // Warning states
  warning: '#D4A855',
  onWarning: '#3A2E18',
  warningContainer: '#F5EDD9',
  onWarningContainer: '#54462C',

  // Additional semantic colors
  muted: '#EDE8F3',
  mutedForeground: '#8B7BA8',
  accent: '#E8DFF5',
  accentForeground: '#2A1944',
  input: 'transparent',
  inputBackground: '#F3EFF7',
  switchBackground: '#C4B1E0',
  ring: '#B5A8C7',
};

// Additional dark mode expressive colors
export const darkExpressiveColors = {
  // Navigation for dark mode
  navigationBackgroundLight: '#FFFFFF',
  navigationBackgroundDark: '#1A1A1A',

  // Dark mode adjustments
  geometricPattern: 'rgba(196, 177, 224, 0.05)',
  compassBackground: 'rgba(196, 177, 224, 0.08)',

  // Prayer colors - lighter for dark mode
  prayerCompleted: '#A5D4BF', // Lighter sage green for better contrast

  // Success states - lighter for dark mode
  success: '#A5D4BF', // Lighter sage green
  successContainer: '#2D4F42',

  // Semantic adjustments
  muted: '#2D2435',
  mutedForeground: '#D0C0E0',
  accent: '#4F3872',
  accentForeground: '#FFFFFF',
  input: '#2D2435',
  inputBackground: '#1A1A1A',
  switchBackground: '#4F3872',
  ring: '#6B4E9B',
};
