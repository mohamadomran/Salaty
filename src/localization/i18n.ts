/**
 * i18n Configuration
 * Internationalization setup for English and Arabic support
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import en from './en.json';
import ar from './ar.json';

// Get device language
const deviceLanguage = RNLocalize.getLocales()[0]?.languageCode || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
    },
    lng: deviceLanguage === 'ar' ? 'ar' : 'en', // Default to device language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    compatibilityJSON: 'v4', // Use v4 format
  });

export default i18n;
