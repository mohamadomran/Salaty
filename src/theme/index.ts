/**
 * Material Design 3 Expressive Theme Configuration
 * Main theme file that combines colors, typography, and shapes
 */

import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';
import {
  lightColors,
  darkColors,
  expressiveColors,
  darkExpressiveColors,
} from './colors';
import {
  enhancedLightColors,
  enhancedDarkColors,
  enhancedExpressiveColors,
  enhancedDarkExpressiveColors,
} from './enhancedColors';
import { typography } from './typography';
import { shapes, componentShapes, shapeAnimations } from './shapes';

// Spacing scale for consistent spacing throughout the app
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  navigationEdge: 16, // Equal spacing for navigation from all edges
  navigationPadding: 10,
};

// Elevation scale for consistent shadows and depth
export const elevation = {
  none: 0,
  low: 2,
  medium: 4,
  high: 8,
  navigation: 12,
  dialog: 16,
};

// Extend the MD3Theme type to include our custom properties
export interface ExpressiveTheme extends MD3Theme {
  expressiveColors: typeof expressiveColors;
  shapes: typeof shapes;
  componentShapes: typeof componentShapes;
  shapeAnimations: typeof shapeAnimations;
  islamicTypography: typeof import('./typography').islamicTypography;
  spacing: typeof spacing;
  elevation: typeof elevation;
}

// Light theme with enhanced Islamic teal & gold design
export const lightTheme: ExpressiveTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...enhancedLightColors,
  },
  roundness: 16, // More refined rounded corners for premium feel

  // Custom expressive properties
  expressiveColors: enhancedExpressiveColors,
  shapes,
  componentShapes,
  shapeAnimations,
  islamicTypography: require('./typography').islamicTypography,
  spacing,
  elevation,
};

// Dark theme with OLED-optimized Islamic teal & gold design
export const darkTheme: ExpressiveTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...enhancedDarkColors,
  },
  roundness: 16, // More refined rounded corners for premium feel

  // Custom expressive properties with dark mode overrides
  expressiveColors: enhancedDarkExpressiveColors,
  shapes,
  componentShapes,
  shapeAnimations,
  islamicTypography: require('./typography').islamicTypography,
  spacing,
  elevation,
};

// Export individual components for easy access
export {
  lightColors,
  darkColors,
  expressiveColors,
  darkExpressiveColors,
} from './colors';
export {
  enhancedLightColors,
  enhancedDarkColors,
  enhancedExpressiveColors,
  enhancedDarkExpressiveColors,
} from './enhancedColors';
export { typography } from './typography';
export { shapes, componentShapes, shapeAnimations } from './shapes';

// Hook for using theme in components
export { useTheme } from 'react-native-paper';

// Enhanced theme system
export { 
  enhancedThemeManager, 
  useEnhancedTheme, 
  themeUtils,
  type EnhancedThemeConfig,
  type ContrastMode,
  type ThemeTransition,
} from './enhancedTheme';


