/**
 * Salaty App - Main Entry Point
 * Islamic prayer times, Qibla direction, and prayer tracking
 */

import React, { useState, useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeProvider, useThemeContext } from './src/contexts';
import { TabNavigator } from './src/navigation';
import { ErrorBoundary } from './src/components';
import { OnboardingScreen } from './src/screens';
import { SettingsService } from './src/services';
import { queryClient, asyncStoragePersister } from './src/lib/queryClient';

// Configure icon library for react-native-paper
const settings = {
  icon: (props: any) => <MaterialCommunityIcons {...props} />,
};

function AppContent(): React.JSX.Element {
  const { theme, isDark, isLoading } = useThemeContext();
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);

  // Check onboarding status
  useEffect(() => {
    const checkOnboarding = async () => {
      const isCompleted = await SettingsService.isOnboardingCompleted();
      setOnboardingCompleted(isCompleted);
    };
    checkOnboarding();
  }, []);

  // Handle onboarding completion
  const handleOnboardingComplete = () => {
    setOnboardingCompleted(true);
  };

  // Show nothing while loading theme or checking onboarding
  if (isLoading || onboardingCompleted === null) {
    return (
      <PaperProvider theme={theme} settings={settings}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.background}
        />
      </PaperProvider>
    );
  }

  // Show onboarding if not completed
  if (!onboardingCompleted) {
    return (
      <PaperProvider theme={theme} settings={settings}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.background}
        />
        <OnboardingScreen onComplete={handleOnboardingComplete} />
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
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister: asyncStoragePersister }}
      >
        <ThemeProvider>
          <ErrorBoundary>
            <AppContent />
          </ErrorBoundary>
        </ThemeProvider>
      </PersistQueryClientProvider>
    </SafeAreaProvider>
  );
}

export default App;
