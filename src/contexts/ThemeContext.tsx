/**
 * Theme Context
 * Manages app theme state and provides theme switching functionality
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme, ExpressiveTheme } from '@theme';
import { SettingsService } from '@services';
import { ThemeMode } from '@types';

interface ThemeContextType {
  theme: ExpressiveTheme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  isDark: boolean;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('auto');
  const [currentTheme, setCurrentTheme] = useState<ExpressiveTheme>(lightTheme);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme preference on mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const settings = await SettingsService.getSettings();
        setThemeModeState(settings.themeMode);
      } catch (error) {
        console.error('Failed to load theme preference:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadThemePreference();
  }, []);

  // Update theme when mode or system preference changes
  useEffect(() => {
    let shouldUseDark = false;

    if (themeMode === 'dark') {
      shouldUseDark = true;
    } else if (themeMode === 'light') {
      shouldUseDark = false;
    } else {
      // Auto mode - follow system preference
      shouldUseDark = systemColorScheme === 'dark';
    }

    setCurrentTheme(shouldUseDark ? darkTheme : lightTheme);
  }, [themeMode, systemColorScheme]);

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    await SettingsService.setThemeMode(mode);
  };

  const isDark = currentTheme === darkTheme;

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, themeMode, setThemeMode, isDark, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within ThemeProvider');
  }
  return context;
};
