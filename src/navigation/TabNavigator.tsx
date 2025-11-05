/**
 * Tab Navigator
 * Bottom tab navigation with Material Design 3 styling
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
        tabBarActiveTintColor: '#00BFA5',
        tabBarInactiveTintColor: '#78909C',
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          backgroundColor: theme.dark ? '#1E2A2A' : '#FFFFFF',
          borderRadius: 24,
          height: 70,
          paddingBottom: 12,
          paddingTop: 12,
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
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
