/**
 * LanguagePicker Component
 * Language selection component for app settings
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { List, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

export type Language = 'en' | 'ar';

interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English (الإنجليزية)' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
];

interface LanguagePickerProps {
  selectedLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

export const LanguagePicker: React.FC<LanguagePickerProps> = ({
  selectedLanguage,
  onLanguageChange,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Text
        variant="labelLarge"
        style={[styles.label, { color: theme.colors.onSurfaceVariant }]}
      >
        {t('settings.language')}
      </Text>
      <Text
        variant="bodySmall"
        style={[styles.description, { color: theme.colors.outline }]}
      >
        {selectedLanguage === 'ar'
          ? 'اختر لغة واجهة التطبيق'
          : 'Select the language for the app interface'}
      </Text>

      {LANGUAGES.map(language => (
        <List.Item
          key={language.code}
          title={language.name}
          description={language.nativeName}
          left={(props) => {
            return (
              <List.Icon
                {...props}
                icon={
                  selectedLanguage === language.code
                    ? 'radiobox-marked'
                    : 'radiobox-blank'
                }
              />
            );
          }}
          onPress={() => onLanguageChange(language.code)}
          style={styles.listItem}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginTop: 8,
    marginBottom: 4,
  },
  description: {
    marginBottom: 12,
  },
  listItem: {
    paddingVertical: 4,
  },
});
