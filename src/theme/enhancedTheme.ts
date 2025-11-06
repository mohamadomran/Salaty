/**
 * Enhanced Theme System
 * Provides advanced theme management with transitions, contrast modes, and custom themes
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Animated, Appearance } from 'react-native';
import { ThemeMode } from '../types';
import { ExpressiveTheme, lightTheme, darkTheme } from '../theme';

export type ContrastMode = 'normal' | 'high' | 'reduced';
export type ThemeTransition = 'none' | 'fade' | 'slide' | 'scale';

export interface EnhancedThemeConfig {
  mode: ThemeMode;
  contrast: ContrastMode;
  transition: ThemeTransition;
  customColors?: Partial<ExpressiveTheme['colors']>;
  reduceMotion: boolean;
}

interface ThemeTransitionState {
  isTransitioning: boolean;
  progress: Animated.Value;
  fromTheme: ExpressiveTheme;
  toTheme: ExpressiveTheme;
}

class EnhancedThemeManager {
  private static instance: EnhancedThemeManager;
  private listeners: Set<(config: EnhancedThemeConfig) => void> = new Set();
  private currentConfig: EnhancedThemeConfig;
  private transitionState: ThemeTransitionState | null = null;

  private constructor() {
    this.currentConfig = {
      mode: 'auto',
      contrast: 'normal',
      transition: 'fade',
      reduceMotion: false,
    };
  }

  public static getInstance(): EnhancedThemeManager {
    if (!EnhancedThemeManager.instance) {
      EnhancedThemeManager.instance = new EnhancedThemeManager();
    }
    return EnhancedThemeManager.instance;
  }

  /**
   * Get current theme configuration
   */
  public getConfig(): EnhancedThemeConfig {
    return { ...this.currentConfig };
  }

  /**
   * Update theme configuration
   */
  public async updateConfig(updates: Partial<EnhancedThemeConfig>): Promise<void> {
    const newConfig = { ...this.currentConfig, ...updates };
    this.currentConfig = newConfig;
    
    // Notify all listeners
    this.listeners.forEach(listener => listener(newConfig));
  }

  /**
   * Subscribe to theme changes
   */
  public subscribe(listener: (config: EnhancedThemeConfig) => void): () => void {
    this.listeners.add(listener);
    listener(this.currentConfig);
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Get resolved theme based on configuration
   */
  public getResolvedTheme(systemColorScheme?: 'light' | 'dark'): ExpressiveTheme {
    const { mode, contrast, customColors } = this.currentConfig;
    
    // Determine base theme
    let baseTheme: ExpressiveTheme;
    if (mode === 'dark') {
      baseTheme = darkTheme;
    } else if (mode === 'light') {
      baseTheme = lightTheme;
    } else {
      // Auto mode
      baseTheme = systemColorScheme === 'dark' ? darkTheme : lightTheme;
    }

    // Apply contrast adjustments
    const adjustedTheme = this.applyContrastAdjustments(baseTheme, contrast);

    // Apply custom colors if provided
    if (customColors) {
      return {
        ...adjustedTheme,
        colors: {
          ...adjustedTheme.colors,
          ...customColors,
        },
      };
    }

    return adjustedTheme;
  }

  /**
   * Apply contrast adjustments to theme
   */
  private applyContrastAdjustments(
    theme: ExpressiveTheme,
    contrast: ContrastMode,
  ): ExpressiveTheme {
    if (contrast === 'normal') {
      return theme;
    }

    const adjustments = this.getContrastAdjustments(contrast);
    
    return {
      ...theme,
      colors: {
        ...theme.colors,
        ...adjustments,
      },
    };
  }

  /**
   * Get color adjustments for contrast mode
   */
  private getContrastAdjustments(contrast: ContrastMode): Partial<ExpressiveTheme['colors']> {
    switch (contrast) {
      case 'high':
        return {
          // Higher contrast for better readability
          primary: '#005555',
          secondary: '#996600',
          background: '#FFFFFF',
          surface: '#FFFFFF',
          onBackground: '#000000',
          onSurface: '#000000',
          outline: '#000000',
        };
      
      case 'reduced':
        return {
          // Reduced contrast for sensitive users
          primary: '#408080',
          secondary: '#CCAA66',
          background: '#F8F8F8',
          surface: '#F0F0F0',
          onBackground: '#333333',
          onSurface: '#333333',
          outline: '#CCCCCC',
        };
      
      default:
        return {};
    }
  }

  /**
   * Start theme transition animation
   */
  public startTransition(
    fromTheme: ExpressiveTheme,
    toTheme: ExpressiveTheme,
    transition: ThemeTransition,
  ): ThemeTransitionState {
    this.transitionState = {
      isTransitioning: true,
      progress: new Animated.Value(0),
      fromTheme,
      toTheme,
    };

    // Animate the transition
    const duration = this.currentConfig.reduceMotion ? 0 : 300;
    
    Animated.timing(this.transitionState.progress, {
      toValue: 1,
      duration,
      useNativeDriver: false,
    }).start(() => {
      if (this.transitionState) {
        this.transitionState.isTransitioning = false;
      }
    });

    return this.transitionState;
  }

  /**
   * Get current transition state
   */
  public getTransitionState(): ThemeTransitionState | null {
    return this.transitionState;
  }

  /**
   * Check if reduced motion is preferred
   */
  public async checkReducedMotion(): Promise<boolean> {
    try {
      // In a real implementation, you would check accessibility settings
      // For now, we'll use a simple setting
      return this.currentConfig.reduceMotion;
    } catch (error) {
      console.warn('Failed to check reduced motion preference:', error);
      return false;
    }
  }
}

// Export singleton instance
export const enhancedThemeManager = EnhancedThemeManager.getInstance();

// Hook for using enhanced theme system
export const useEnhancedTheme = () => {
  const [config, setConfig] = useState<EnhancedThemeConfig>(enhancedThemeManager.getConfig());
  const [systemColorScheme, setSystemColorScheme] = useState<'light' | 'dark'>(() => {
    const scheme = Appearance.getColorScheme();
    return (scheme === 'light' || scheme === 'dark') ? scheme : 'light';
  });

  // Subscribe to theme manager changes
  useEffect(() => {
    const unsubscribe = enhancedThemeManager.subscribe(setConfig);
    return unsubscribe;
  }, []);

  // Subscribe to system appearance changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemColorScheme((colorScheme === 'light' || colorScheme === 'dark') ? colorScheme : 'light');
    });
    return subscription.remove;
  }, []);

  // Memoized resolved theme
  const theme = useMemo(() => {
    return enhancedThemeManager.getResolvedTheme(systemColorScheme);
  }, [config, systemColorScheme]);

  // Update configuration callback
  const updateConfig = useCallback(async (updates: Partial<EnhancedThemeConfig>) => {
    await enhancedThemeManager.updateConfig(updates);
  }, []);

  // Theme transition callback
  const startTransition = useCallback((
    fromTheme: ExpressiveTheme,
    toTheme: ExpressiveTheme,
    transition: ThemeTransition = 'fade',
  ) => {
    return enhancedThemeManager.startTransition(fromTheme, toTheme, transition);
  }, []);

  return {
    theme,
    config,
    updateConfig,
    startTransition,
    isDark: theme === darkTheme,
    isLight: theme === lightTheme,
    systemColorScheme,
  };
};

// Utility functions for theme calculations
export const themeUtils = {
  /**
   * Get readable text color for background
   */
  getReadableTextColor: (backgroundColor: string): string => {
    // Simple luminance calculation
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  },

  /**
   * Adjust color opacity
   */
  adjustOpacity: (color: string, opacity: number): string => {
    if (color.startsWith('#')) {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 2), 16);
      const b = parseInt(hex.substring(4, 2), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    return color;
  },

  /**
   * Lighten or darken color
   */
  adjustColor: (color: string, amount: number): string => {
    const hex = color.replace('#', '');
    const r = Math.max(0, Math.min(255, parseInt(hex.substring(0, 2), 16) + amount));
    const g = Math.max(0, Math.min(255, parseInt(hex.substring(2, 2), 16) + amount));
    const b = Math.max(0, Math.min(255, parseInt(hex.substring(4, 2), 16) + amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  },

  /**
   * Generate color palette from base color
   */
  generatePalette: (baseColor: string) => {
    return {
      50: themeUtils.adjustColor(baseColor, 180),
      100: themeUtils.adjustColor(baseColor, 140),
      200: themeUtils.adjustColor(baseColor, 100),
      300: themeUtils.adjustColor(baseColor, 60),
      400: themeUtils.adjustColor(baseColor, 30),
      500: baseColor,
      600: themeUtils.adjustColor(baseColor, -20),
      700: themeUtils.adjustColor(baseColor, -40),
      800: themeUtils.adjustColor(baseColor, -60),
      900: themeUtils.adjustColor(baseColor, -80),
    };
  },
};