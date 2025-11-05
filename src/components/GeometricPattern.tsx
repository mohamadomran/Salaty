/**
 * Geometric Pattern Component
 * Subtle Islamic geometric pattern overlay for cards and surfaces
 * Features an 8-pointed star lattice pattern
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Path,
  G,
  Defs,
  Pattern as SvgPattern,
  Rect,
} from 'react-native-svg';
import { useTheme } from 'react-native-paper';
import type { ExpressiveTheme } from '../theme';

interface GeometricPatternProps {
  /** Custom opacity (overrides theme default) */
  opacity?: number;
  /** Additional styles for the container */
  style?: any;
}

export function GeometricPattern({ opacity, style }: GeometricPatternProps) {
  const theme = useTheme<ExpressiveTheme>();

  // Use theme-based opacity if not provided
  const patternOpacity = opacity ?? (theme.dark ? 0.05 : 0.03);
  const patternColor = theme.colors.primary;

  return (
    <View style={[styles.container, style]} pointerEvents="none">
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          {/* 8-pointed star pattern unit */}
          <SvgPattern
            id="islamicPattern"
            x="0"
            y="0"
            width="100"
            height="100"
            patternUnits="userSpaceOnUse"
          >
            {/* Central 8-pointed star */}
            <Path
              d="M 50 20 L 56 36 L 72 30 L 64 44 L 80 50 L 64 56 L 72 70 L 56 64 L 50 80 L 44 64 L 28 70 L 36 56 L 20 50 L 36 44 L 28 30 L 44 36 Z"
              fill={patternColor}
              opacity={patternOpacity}
            />

            {/* Corner accents - smaller 4-pointed stars */}
            <Path
              d="M 0 0 L 4 10 L 10 0 L 10 10 Z"
              fill={patternColor}
              opacity={patternOpacity * 0.5}
            />
            <Path
              d="M 90 0 L 96 10 L 100 0 L 100 10 Z"
              fill={patternColor}
              opacity={patternOpacity * 0.5}
            />
            <Path
              d="M 0 90 L 4 100 L 10 90 L 10 100 Z"
              fill={patternColor}
              opacity={patternOpacity * 0.5}
            />
            <Path
              d="M 90 90 L 96 100 L 100 90 L 100 100 Z"
              fill={patternColor}
              opacity={patternOpacity * 0.5}
            />
          </SvgPattern>
        </Defs>

        {/* Apply pattern to full area */}
        <Rect width="100%" height="100%" fill="url(#islamicPattern)" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
});
