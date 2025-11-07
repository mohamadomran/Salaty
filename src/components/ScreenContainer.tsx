/**
 * ScreenContainer Component
 * Standardized container wrapper for all screens with consistent styling
 */

import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, RefreshControlProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';
import type { ExpressiveTheme } from '../theme';

interface ScreenContainerProps {
  children: React.ReactNode;
  showScrollView?: boolean;
  refreshControl?: React.ReactElement<RefreshControlProps> | null | undefined;
  contentContainerStyle?: any;
  style?: any;
  edges?: Array<'top' | 'bottom' | 'left' | 'right'>;
  paddingBottom?: number;
  testID?: string;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  showScrollView = true,
  refreshControl = null,
  contentContainerStyle,
  style,
  edges = ['top', 'left', 'right'],
  paddingBottom = 120,
  testID,
}) => {
  const theme = useTheme<ExpressiveTheme>();

  const defaultContentContainerStyle = {
    padding: 16,
    paddingBottom,
  };

  const contentStyle = [
    styles.content,
    { backgroundColor: theme.colors.background },
    style,
  ];

  const scrollContentStyle = [
    defaultContentContainerStyle,
    contentContainerStyle,
  ];

  const Content = () => (
    <View style={contentStyle}>
      {showScrollView ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl || undefined}
          contentContainerStyle={scrollContentStyle}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={scrollContentStyle}>
          {children}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView testID={testID} edges={edges} style={styles.container}>
      <Content />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});