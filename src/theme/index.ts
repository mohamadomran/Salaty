/**
 * Material Design 3 Expressive Theme Configuration
 * Main theme file that combines colors, typography, and shapes
 */

import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';
import { lightColors, darkColors, expressiveColors } from './colors';
import { typography } from './typography';
import { shapes, componentShapes, shapeAnimations } from './shapes';

// Extend the MD3Theme type to include our custom properties
export interface ExpressiveTheme extends MD3Theme {
  expressiveColors: typeof expressiveColors;
  shapes: typeof shapes;
  componentShapes: typeof componentShapes;
  shapeAnimations: typeof shapeAnimations;
  islamicTypography: typeof import('./typography').islamicTypography;
}

// Light theme with M3 Expressive enhancements
export const lightTheme: ExpressiveTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...lightColors,
  },
  roundness: 16, // Default roundness for components

  // Custom expressive properties
  expressiveColors,
  shapes,
  componentShapes,
  shapeAnimations,
  islamicTypography: require('./typography').islamicTypography,
};

// Dark theme with M3 Expressive enhancements
export const darkTheme: ExpressiveTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...darkColors,
  },
  roundness: 16,

  // Custom expressive properties
  expressiveColors,
  shapes,
  componentShapes,
  shapeAnimations,
  islamicTypography: require('./typography').islamicTypography,
};

// Export individual components for easy access
export { lightColors, darkColors, expressiveColors } from './colors';
export { typography } from './typography';
export { shapes, componentShapes, shapeAnimations } from './shapes';

// Hook for using theme in components
export { useTheme } from 'react-native-paper';

// Re-export theme type
export type { ExpressiveTheme };
