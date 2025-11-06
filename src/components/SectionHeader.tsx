/**
 * SectionHeader Component
 * Standardized section header for consistent styling across screens
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import type { ExpressiveTheme } from '../theme';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  rightComponent?: React.ReactNode;
  showDivider?: boolean;
  style?: any;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  rightComponent,
  showDivider = true,
  style,
}) => {
  const theme = useTheme<ExpressiveTheme>();

  return (
    <View style={[styles.container, style]}>
      <View style={styles.headerContent}>
        <View style={styles.textContainer}>
          <Text
            variant="titleLarge"
            style={[styles.title, { color: theme.colors.onSurface }]}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              variant="bodyMedium"
              style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
            >
              {subtitle}
            </Text>
          )}
        </View>
        {rightComponent && (
          <View style={styles.rightComponent}>
            {rightComponent}
          </View>
        )}
      </View>
      {showDivider && <View style={[styles.divider, { backgroundColor: theme.colors.outline }]} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
  },
  subtitle: {
    marginTop: 4,
    lineHeight: 20,
  },
  rightComponent: {
    alignItems: 'flex-end',
  },
  divider: {
    height: 1,
    opacity: 0.12,
  },
});