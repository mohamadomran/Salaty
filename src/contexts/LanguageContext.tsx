/**
 * Language Context
 * Manages app language and RTL layout
 */

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { i18n } from '../localization';

export type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  isRTL: boolean;
  setLanguage: (lang: Language) => Promise<void>;
  t: typeof i18n.t; // Translation function
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = '@salaty_language';

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ar')) {
        setLanguageState(savedLanguage);
        i18n.changeLanguage(savedLanguage);
        setIsRTL(savedLanguage === 'ar');
      } else {
        // Use device language if available
        const deviceLang = i18n.language;
        const initialLang: Language = deviceLang === 'ar' ? 'ar' : 'en';
        setLanguageState(initialLang);
        setIsRTL(initialLang === 'ar');
      }
    } catch (error) {
      console.error('Error loading language:', error);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      const needsRTLChange = (lang === 'ar') !== I18nManager.isRTL;

      // Save language preference
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);

      // Change i18n language
      await i18n.changeLanguage(lang);

      setLanguageState(lang);
      setIsRTL(lang === 'ar');

      // If RTL direction needs to change, force RTL
      // Note: App restart is required for RTL changes to take effect
      if (needsRTLChange) {
        I18nManager.forceRTL(lang === 'ar');
        console.warn('Please restart the app for RTL changes to take effect');
      }
    } catch (error) {
      console.error('Error setting language:', error);
    }
  };

  const value: LanguageContextType = {
    language,
    isRTL,
    setLanguage,
    t: i18n.t,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
