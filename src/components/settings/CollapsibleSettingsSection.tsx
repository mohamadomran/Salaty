/**
 * CollapsibleSettingsSection Component
 * An expandable/collapsible section for organizing settings
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  Animated,
  Easing,
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

  // Animation refs
  const animatedHeight = useRef(new Animated.Value(defaultExpanded ? 1 : 0)).current;
  const chevronRotation = useRef(new Animated.Value(defaultExpanded ? 1 : 0)).current;
  const contentHeight = useRef<number>(0);

  const toggleExpansion = () => {
    const newExpanded = !expanded;

    // Configure layout animation for smooth content changes
    LayoutAnimation.configureNext(
      LayoutAnimation.create(
        300,
        LayoutAnimation.Types.easeInEaseOut,
        LayoutAnimation.Properties.opacity
      )
    );

    // Animate chevron rotation
    Animated.timing(chevronRotation, {
      toValue: newExpanded ? 1 : 0,
      duration: 300,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      useNativeDriver: true,
    }).start();

    // Animate height
    Animated.timing(animatedHeight, {
      toValue: newExpanded ? 1 : 0,
      duration: 300,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      useNativeDriver: false,
    }).start();

    setExpanded(newExpanded);
    onExpansionChange?.(newExpanded);
  };

  // Chevron rotation interpolation
  const chevronRotate = chevronRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  // Height interpolation
  const maxHeight = animatedHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, contentHeight.current || 2000], // Use large number if not measured yet
  });

  return (
    <Card testID={testID} style={styles.card} elevation={0}>
      <View style={styles.innerContainer}>
        <TouchableOpacity
          onPress={toggleExpansion}
          activeOpacity={0.7}
          style={[
            styles.headerContainer,
            { backgroundColor: theme.colors.primary },
          ]}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Icon source={icon} size={24} color={theme.colors.onPrimary} />
              <Text
                variant="titleMedium"
                style={[
                  styles.headerTitle,
                  { color: theme.colors.onPrimary },
                ]}
              >
                {title}
              </Text>
            </View>
            <Animated.View style={{ transform: [{ rotate: chevronRotate }] }}>
              <Icon
                source="chevron-down"
                size={24}
                color={theme.colors.onPrimary}
              />
            </Animated.View>
          </View>
        </TouchableOpacity>

        <Animated.View
          style={[
            styles.animatedContent,
            {
              maxHeight: maxHeight,
              opacity: animatedHeight,
              backgroundColor: theme.colors.surface,
            }
          ]}
        >
          <View
            style={styles.contentWrapper}
            onLayout={(event) => {
              const { height } = event.nativeEvent.layout;
              if (height > 0 && contentHeight.current !== height) {
                contentHeight.current = height;
              }
            }}
          >
            <Card.Content style={styles.content}>{children}</Card.Content>
          </View>
        </Animated.View>
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
  animatedContent: {
    overflow: 'hidden',
  },
  contentWrapper: {
    // Removed position absolute to allow natural height
  },
  content: {
    paddingTop: 16,
    paddingBottom: 16,
  },
});
