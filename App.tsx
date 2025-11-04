/**
 * Salaty App - Main Entry Point
 * Islamic prayer times, Qibla direction, and prayer tracking
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { lightTheme } from './src/theme';
import { TabNavigator } from './src/navigation';

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={lightTheme}>
        <StatusBar barStyle="dark-content" backgroundColor={lightTheme.colors.background} />
        <NavigationContainer>
          <TabNavigator />
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

export default App;
