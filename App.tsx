/**
 * Salaty App - Main Entry Point
 * Islamic prayer times, Qibla direction, and prayer tracking
 */

import React, { useState, useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeProvider, useThemeContext } from './src/contexts';
import { TabNavigator } from './src/navigation';
import { ErrorBoundary } from './src/components';
import { LocationSetupScreen } from './src/screens';
import { LocationPreferenceService } from './src/services/location';

// Configure icon library for react-native-paper
const settings = {
  icon: (props: any) => <MaterialCommunityIcons {...props} />,
};

function AppContent(): React.JSX.Element {
  const { theme, isDark, isLoading } = useThemeContext();
  const [setupCompleted, setSetupCompleted] = useState<boolean | null>(null);

  // Check location setup status
  useEffect(() => {
    const checkSetup = async () => {
      const isCompleted = await LocationPreferenceService.isSetupCompleted();
      setSetupCompleted(isCompleted);
    };
    checkSetup();
  }, []);

  // Handle setup completion
  const handleSetupComplete = () => {
    setSetupCompleted(true);
  };

  // Show nothing while loading theme or checking setup
  if (isLoading || setupCompleted === null) {
    return (
      <PaperProvider theme={theme} settings={settings}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.background}
        />
      </PaperProvider>
    );
  }

  // Show location setup if not completed
  if (!setupCompleted) {
    return (
      <PaperProvider theme={theme} settings={settings}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.background}
        />
        <LocationSetupScreen onComplete={handleSetupComplete} />
      </PaperProvider>
    );
  }

  // Show main app
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
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;
