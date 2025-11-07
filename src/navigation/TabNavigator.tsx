/**
 * Tab Navigator
 * Asymmetric bottom navigation with dark pill + white circular profile button
 * Inspired by modern fitness app design
 * Enhanced with smooth page transitions
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon, useTheme } from 'react-native-paper';
import type { RootTabParamList } from './types';
import {
  HomeScreen,
  TrackingScreen,
  SettingsScreen,
  QadaScreen,
  StatisticsScreen,
} from '@/screens';
import type { ExpressiveTheme } from '../theme';

const Tab = createBottomTabNavigator<RootTabParamList>();

// Move iconMap outside component to prevent recreation
const iconMap: Record<string, string> = {
  Home: 'home',
  Tracking: 'view-grid',
  Qada: 'history',
  Statistics: 'chart-line',
  Settings: 'account',
};

// Custom tab bar with asymmetric design
const CustomTabBar = React.memo(({ state, descriptors, navigation }: any) => {
  const theme = useTheme<ExpressiveTheme>();

  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.tabBarWrapper}>
        {/* Dark pill containing first 4 tabs */}
        <View
          style={[
            styles.darkPill,
            { backgroundColor: theme.colors.elevation.level2 },
          ]}
        >
          {state.routes.slice(0, 4).map((route: any, index: number) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={`${route.name.toLowerCase()}-tab`}
                onPress={onPress}
                style={styles.tabButton}
              >
                <Icon
                  source={iconMap[route.name] || 'circle'}
                  size={24}
                  color={isFocused ? theme.expressiveColors.goldAccent : theme.colors.onSurfaceVariant}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* White circular button for last tab (Settings/Profile) */}
        <TouchableOpacity
          testID="settings-tab"
          accessibilityRole="button"
          accessibilityState={state.index === 3 ? { selected: true } : {}}
          onPress={() => navigation.navigate('Settings')}
          style={[
            styles.profileButton,
            { backgroundColor: theme.expressiveColors.goldAccent },
            state.index === 3 && styles.profileButtonActive,
          ]}
        >
          <Icon
            source={iconMap['Settings']}
            size={26}
            color={state.index === 3 ? theme.colors.onPrimary : theme.colors.onPrimary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
});

CustomTabBar.displayName = 'CustomTabBar';

// Simple screen components without animations - optimized with React.memo
const AnimatedHomeScreen = React.memo(() => <HomeScreen />);
const AnimatedTrackingScreen = React.memo(() => <TrackingScreen />);
const AnimatedQadaScreen = React.memo(() => <QadaScreen />);
const AnimatedStatisticsScreen = React.memo(() => <StatisticsScreen />);
const AnimatedSettingsScreen = React.memo(() => <SettingsScreen />);

export default function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        // Lazy load screens for better performance
        lazy: true,
      }}
    >
      <Tab.Screen name="Home" component={AnimatedHomeScreen} />
      <Tab.Screen name="Tracking" component={AnimatedTrackingScreen} />
      <Tab.Screen name="Qada" component={AnimatedQadaScreen} />
      <Tab.Screen name="Statistics" component={AnimatedStatisticsScreen} />
      <Tab.Screen name="Settings" component={AnimatedSettingsScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 20 : 16,
    paddingHorizontal: 20,
  },
  tabBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 72,
  },
  darkPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 40,
    flex: 1,
    marginRight: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  profileButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  profileButtonActive: {
    // Optional: Add active state styling
  },
});
