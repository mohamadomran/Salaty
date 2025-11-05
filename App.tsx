/**
 * Salaty App - Main Entry Point
 * Islamic prayer times, Qibla direction, and prayer tracking
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeProvider, useThemeContext } from './src/contexts';
import { TabNavigator } from './src/navigation';

// Configure icon library for react-native-paper
const settings = {
  icon: (props: any) => <MaterialCommunityIcons {...props} />,
};

function AppContent(): React.JSX.Element {
  const { theme, isDark, isLoading } = useThemeContext();

  // Show nothing while loading theme to prevent flash
  if (isLoading) {
    return (
      <PaperProvider theme={theme} settings={settings}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.background}
        />
      </PaperProvider>
    );
  }

  return (
    <PaperProvider theme={theme} settings={settings}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      <NavigationContainer>
        <TabNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
}

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;
