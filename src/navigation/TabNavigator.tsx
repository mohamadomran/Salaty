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
  QiblaScreen,
  SettingsScreen,
  QadaScreen,
} from '@/screens';
import type { ExpressiveTheme } from '../theme';

const Tab = createBottomTabNavigator<RootTabParamList>();

// Custom tab bar with asymmetric design
function CustomTabBar({ state, descriptors, navigation }: any) {
  const theme = useTheme<ExpressiveTheme>();

  const iconMap: Record<string, string> = {
    Home: 'home',
    Tracking: 'view-grid',
    Qada: 'history',
    Qibla: 'compass',
    Settings: 'account',
  };

  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.tabBarWrapper}>
        {/* Dark pill containing first 4 tabs */}
        <View
          style={[
            styles.darkPill,
            { backgroundColor: theme.dark ? '#1C1C1E' : '#1C1C1E' },
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
                testID={options.tabBarTestID}
                onPress={onPress}
                style={styles.tabButton}
              >
                <Icon
                  source={iconMap[route.name] || 'circle'}
                  size={24}
                  color={isFocused ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)'}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* White circular button for last tab (Settings/Profile) */}
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityState={state.index === 4 ? { selected: true } : {}}
          onPress={() => navigation.navigate('Settings')}
          style={[
            styles.profileButton,
            { backgroundColor: theme.dark ? '#FFFFFF' : '#FFFFFF' },
            state.index === 4 && styles.profileButtonActive,
          ]}
        >
          <Icon
            source={iconMap['Settings']}
            size={26}
            color={state.index === 4 ? '#1C1C1E' : '#1C1C1E'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Simple screen components without animations
const AnimatedHomeScreen = () => <HomeScreen />;
const AnimatedTrackingScreen = () => <TrackingScreen />;
const AnimatedQadaScreen = () => <QadaScreen />;
const AnimatedQiblaScreen = () => <QiblaScreen />;
const AnimatedSettingsScreen = () => <SettingsScreen />;

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
      <Tab.Screen name="Qibla" component={AnimatedQiblaScreen} />
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
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    // Elevation for Android
    elevation: 8,
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
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    // Elevation for Android
    elevation: 8,
  },
  profileButtonActive: {
    // Optional: Add active state styling
  },
});
