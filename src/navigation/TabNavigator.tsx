/**
 * Tab Navigator
 * Bottom tab navigation with sophisticated purple & gold theme
 * Equal 16px spacing from all edges (bottom, left, right)
 */

import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon, useTheme } from 'react-native-paper';
import type { RootTabParamList } from './types';
import {
  HomeScreen,
  TrackingScreen,
  QiblaScreen,
  SettingsScreen,
} from '@/screens';
import type { ExpressiveTheme } from '@theme';

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function TabNavigator() {
  const theme = useTheme<ExpressiveTheme>();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        // Use gold for active tab, muted purple for inactive
        tabBarActiveTintColor: theme.expressiveColors.navigationActive,
        tabBarInactiveTintColor: theme.expressiveColors.navigationInactive,
        tabBarStyle: {
          position: 'absolute',
          // Equal 16px spacing from all edges
          bottom: 16,
          left: 16,
          right: 16,

          // Theme-aware background
          backgroundColor: theme.dark
            ? theme.expressiveColors.navigationBackgroundDark
            : theme.expressiveColors.navigationBackgroundLight,

          // Refined pill shape
          borderRadius: 20,

          // Subtle border with purple tint
          borderWidth: 1,
          borderColor: theme.colors.outline,
          borderTopWidth: 0,

          // Dimensions
          height: 68,
          paddingBottom: 10,
          paddingTop: 10,

          // Android elevation
          elevation: 12,

          // iOS shadow with purple glow
          shadowColor: theme.colors.primary,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.08,
          shadowRadius: 16,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.5,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Icon source="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Tracking"
        component={TrackingScreen}
        options={{
          tabBarLabel: 'Track',
          tabBarIcon: ({ color, size }) => (
            <Icon source="check-circle" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Qibla"
        component={QiblaScreen}
        options={{
          tabBarLabel: 'Qibla',
          tabBarIcon: ({ color, size }) => (
            <Icon source="compass" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Icon source="cog" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
