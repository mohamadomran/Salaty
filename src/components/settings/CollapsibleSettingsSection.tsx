/**
 * CollapsibleSettingsSection Component
 * An expandable/collapsible section for organizing settings
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
} from 'react-native';
import { Card, Text, Icon, useTheme } from 'react-native-paper';

// Note: LayoutAnimation works natively in React Native 0.82+ with New Architecture
// No need for setLayoutAnimationEnabledExperimental anymore

interface CollapsibleSettingsSectionProps {
  title: string;
  icon: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  onExpansionChange?: (expanded: boolean) => void;
  testID?: string;
}

export const CollapsibleSettingsSection: React.FC<
  CollapsibleSettingsSectionProps
> = ({
  title,
  icon,
  children,
  defaultExpanded = false,
  onExpansionChange,
testID,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const theme = useTheme();

  const toggleExpansion = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    onExpansionChange?.(newExpanded);
  };

  return (
    <Card testID={testID} style={styles.card} elevation={0}>
      <View style={styles.innerContainer}>
        <TouchableOpacity
          onPress={toggleExpansion}
          activeOpacity={0.7}
          style={[
            styles.headerContainer,
            { backgroundColor: theme.colors.primaryContainer },
          ]}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Icon source={icon} size={24} color={theme.colors.onPrimaryContainer} />
              <Text
                variant="titleMedium"
                style={[
                  styles.headerTitle,
                  { color: theme.colors.onPrimaryContainer },
                ]}
              >
                {title}
              </Text>
            </View>
            <Icon
              source={expanded ? 'chevron-up' : 'chevron-down'}
              size={24}
              color={theme.colors.onPrimaryContainer}
            />
          </View>
        </TouchableOpacity>

        {expanded && (
          <Card.Content style={styles.content}>{children}</Card.Content>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginBottom: 16,
  },
  innerContainer: {
    overflow: 'hidden',
    borderRadius: 16,
  },
  headerContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontWeight: '600',
  },
  content: {
    paddingTop: 16,
    paddingBottom: 16,
  },
});
