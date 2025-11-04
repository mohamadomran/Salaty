/**
 * Material Design 3 Expressive Shape System
 * Enhanced rounded corners and morphing capabilities
 */

export interface ShapeConfig {
  corner: {
    none: number;
    extraSmall: number;
    extraSmallTop: number;
    small: number;
    medium: number;
    large: number;
    largeEnd: number;
    largeTop: number;
    extraLarge: number;
    extraLargeTop: number;
    full: number;
  };
}

// M3 Expressive uses more pronounced rounded corners
export const shapes: ShapeConfig = {
  corner: {
    none: 0,
    extraSmall: 8, // Increased from M3 standard (4)
    extraSmallTop: 8,
    small: 12, // Increased from M3 standard (8)
    medium: 16, // Increased from M3 standard (12)
    large: 24, // Increased from M3 standard (16)
    largeEnd: 24,
    largeTop: 24,
    extraLarge: 32, // Increased from M3 standard (28)
    extraLargeTop: 32,
    full: 9999, // Fully rounded (pill shape)
  },
};

// Shape presets for different component types
export const componentShapes = {
  // Cards
  card: shapes.corner.medium,
  cardElevated: shapes.corner.large,

  // Buttons
  button: shapes.corner.full, // Pill-shaped for expressiveness
  fab: shapes.corner.large,
  extendedFab: shapes.corner.large,

  // Input fields
  textField: shapes.corner.small,
  textFieldOutlined: shapes.corner.extraSmall,

  // Dialogs and sheets
  dialog: shapes.corner.extraLarge,
  bottomSheet: shapes.corner.extraLargeTop,

  // Chips and badges
  chip: shapes.corner.small,
  badge: shapes.corner.full,

  // Navigation
  navigationBar: shapes.corner.none,
  navigationRail: shapes.corner.none,

  // Special Islamic components
  prayerCard: shapes.corner.large, // Prominent cards for prayers
  qiblaCompass: shapes.corner.full, // Circular
  prayerCheckbox: shapes.corner.medium, // Softer checkboxes
};

// Animation configurations for shape morphing
export const shapeAnimations = {
  duration: 250, // ms
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)', // Material standard easing

  // Expressive spring animation
  spring: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
};
