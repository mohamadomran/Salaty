/**
 * Stats Card Component
 * Displays prayer tracking statistics
 */

import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import type { ExpressiveTheme } from '../../theme';

interface StatItem {
  label: string;
  value: number | string;
  color?: string;
}

interface StatsCardProps {
  title: string;
  stats: StatItem[];
  icon?: string;
}

export function StatsCard({ title, stats, icon }: StatsCardProps) {
  const theme = useTheme<ExpressiveTheme>();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Card style={styles.card} mode="elevated">
      <Card.Content>
        <View style={styles.header}>
          <Text variant="titleMedium" style={styles.title}>
            {title}
          </Text>
        </View>
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statItem}>
              <Text
                variant="titleLarge"
                style={[
                  styles.statValue,
                  { color: stat.color || theme.colors.primary },
                ]}
              >
                {stat.value}
              </Text>
              <Text
                variant="labelSmall"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                {stat.label}
              </Text>
            </View>
          ))}
        </View>
      </Card.Content>
    </Card>
  );
}

const createStyles = (theme: ExpressiveTheme) => StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 24,
    backgroundColor: theme.colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    minWidth: 80,
  },
  statValue: {
    fontWeight: '600',
    marginBottom: 2,
    fontSize: 24,
  },
});
