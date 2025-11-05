/**
 * Settings Screen - App Settings (Redesigned)
 * Configure calculation method, notifications, display, etc.
 * Features: Collapsible sections, search, import/export, language selection
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  List,
  Switch,
  SegmentedButtons,
  Divider,
  Button,
  Snackbar,
} from 'react-native-paper';
import { SettingsService } from '../services';
import {
  AppSettings,
  CalculationMethodInfo,
  Madhab,
  TimeFormat,
  ThemeMode,
} from '../types';
import { useThemeContext } from '../contexts';
import {
  CollapsibleSettingsSection,
  SettingsSearchBar,
  LanguagePicker,
  Language,
  ImportExportDialog,
} from '../components/settings';
import { SkeletonCard } from '../components/LoadingSkeleton';
import { PageHeader } from '../components/PageHeader';

export default function SettingsScreen() {
  const { setThemeMode, theme } = useThemeContext();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [calculationMethods, setCalculationMethods] = useState<
    CalculationMethodInfo[]
  >([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showImportExport, setShowImportExport] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const currentSettings = await SettingsService.getSettings();
      const methods = SettingsService.getCalculationMethods();
      setSettings(currentSettings);
      setCalculationMethods(methods);
    } catch (error) {
      console.error('Failed to load settings:', error);
      Alert.alert('Error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const handleCalculationMethodChange = async (methodId: string) => {
    if (!settings) return;

    try {
      await SettingsService.setCalculationMethod(
        methodId as AppSettings['calculationMethod'],
      );
      setSettings({
        ...settings,
        calculationMethod: methodId as AppSettings['calculationMethod'],
      });
      showToast('Calculation method updated');
    } catch (error) {
      console.error('Failed to update calculation method:', error);
      Alert.alert('Error', 'Failed to update calculation method');
    }
  };

  const handleMadhabChange = async (madhab: Madhab) => {
    if (!settings) return;

    try {
      await SettingsService.setMadhab(madhab);
      setSettings({ ...settings, madhab });
      showToast('Madhab updated');
    } catch (error) {
      console.error('Failed to update madhab:', error);
      Alert.alert('Error', 'Failed to update madhab');
    }
  };

  const handleTimeFormatChange = async (format: TimeFormat) => {
    if (!settings) return;

    try {
      await SettingsService.setTimeFormat(format);
      setSettings({ ...settings, timeFormat: format });
      showToast('Time format updated');
    } catch (error) {
      console.error('Failed to update time format:', error);
      Alert.alert('Error', 'Failed to update time format');
    }
  };

  const handleSunriseSunsetToggle = async () => {
    if (!settings) return;

    try {
      const newValue = !settings.showSunriseSunset;
      await SettingsService.toggleSunriseSunset(newValue);
      setSettings({ ...settings, showSunriseSunset: newValue });
      showToast(
        newValue ? 'Sunrise/Sunset enabled' : 'Sunrise/Sunset disabled',
      );
    } catch (error) {
      console.error('Failed to toggle sunrise/sunset:', error);
      Alert.alert('Error', 'Failed to update display settings');
    }
  };

  const handleThemeModeChange = async (mode: ThemeMode) => {
    if (!settings) return;

    try {
      await setThemeMode(mode);
      setSettings({ ...settings, themeMode: mode });
      showToast(`Theme changed to ${mode} mode`);
    } catch (error) {
      console.error('Failed to update theme mode:', error);
      Alert.alert('Error', 'Failed to update theme');
    }
  };

  const handleLanguageChange = async (language: Language) => {
    if (!settings) return;

    try {
      await SettingsService.setLanguage(language);
      setSettings({ ...settings, language });
      showToast('Language updated');
    } catch (error) {
      console.error('Failed to update language:', error);
      Alert.alert('Error', 'Failed to update language');
    }
  };

  const handleNotificationsToggle = async () => {
    if (!settings) return;

    try {
      const newValue = !settings.notificationsEnabled;
      await SettingsService.updateNotificationSettings({ enabled: newValue });
      setSettings({ ...settings, notificationsEnabled: newValue });
      showToast(
        newValue ? 'Notifications enabled' : 'Notifications disabled',
      );
    } catch (error) {
      console.error('Failed to toggle notifications:', error);
      Alert.alert('Error', 'Failed to update notifications');
    }
  };

  const handleImport = async (importedSettings: AppSettings) => {
    try {
      const updated = await SettingsService.importSettings(importedSettings);
      await setThemeMode(updated.themeMode);
      setSettings(updated);
      showToast('Settings imported successfully');
    } catch (error) {
      console.error('Failed to import settings:', error);
      throw error;
    }
  };

  const handleResetToDefaults = async () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              const defaults = await SettingsService.resetToDefaults();
              await setThemeMode(defaults.themeMode);
              setSettings(defaults);
              showToast('Settings reset to defaults');
            } catch (error) {
              console.error('Failed to reset settings:', error);
              Alert.alert('Error', 'Failed to reset settings');
            }
          },
        },
      ],
    );
  };

  // Filter calculation methods based on search
  const filteredMethods = calculationMethods.filter(method =>
    searchQuery
      ? method.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        method.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
        method.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true,
  );

  if (loading || !settings) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        edges={['top', 'left', 'right']}
      >
        <View style={styles.content}>
          <PageHeader title="Settings" />
          <SkeletonCard variant="settings" />
          <SkeletonCard variant="settings" />
          <SkeletonCard variant="settings" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <PageHeader title="Settings" />

          {/* Prayer Settings Section */}
          <CollapsibleSettingsSection
            title="Prayer Settings"
            icon="mosque"
            defaultExpanded={false}
          >
            <Text
              variant="labelLarge"
              style={[styles.label, { color: theme.colors.onSurfaceVariant }]}
            >
              Calculation Method
            </Text>
            <Text
              variant="bodySmall"
              style={[styles.description, { color: theme.colors.outline }]}
            >
              Select the method used to calculate prayer times
            </Text>

            <SettingsSearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search calculation methods..."
            />

            {filteredMethods.map(method => (
              <List.Item
                key={method.id}
                title={method.name}
                description={`${method.description} • ${method.region}`}
                left={props => (
                  <List.Icon
                    {...props}
                    icon={
                      settings.calculationMethod === method.id
                        ? 'radiobox-marked'
                        : 'radiobox-blank'
                    }
                  />
                )}
                onPress={() => handleCalculationMethodChange(method.id)}
                style={styles.listItem}
              />
            ))}

            <Divider style={styles.divider} />

            <Text
              variant="labelLarge"
              style={[styles.label, { color: theme.colors.onSurfaceVariant }]}
            >
              Madhab (Asr Calculation)
            </Text>
            <Text
              variant="bodySmall"
              style={[styles.description, { color: theme.colors.outline }]}
            >
              Choose the juristic method for Asr prayer time
            </Text>

            <SegmentedButtons
              value={settings.madhab}
              onValueChange={value => handleMadhabChange(value as Madhab)}
              buttons={[
                {
                  value: 'shafi',
                  label: 'Shafi/Maliki/Hanbali',
                },
                {
                  value: 'hanafi',
                  label: 'Hanafi',
                },
              ]}
              style={styles.segmentedButtons}
            />
          </CollapsibleSettingsSection>

          {/* Display & Appearance Section */}
          <CollapsibleSettingsSection
            title="Display & Appearance"
            icon="palette"
            defaultExpanded={false}
          >
            <Text
              variant="labelLarge"
              style={[styles.label, { color: theme.colors.onSurfaceVariant }]}
            >
              Theme
            </Text>

            <SegmentedButtons
              value={settings.themeMode}
              onValueChange={value => handleThemeModeChange(value as ThemeMode)}
              buttons={[
                {
                  value: 'light',
                  label: 'Light',
                  icon: 'white-balance-sunny',
                },
                {
                  value: 'dark',
                  label: 'Dark',
                  icon: 'moon-waning-crescent',
                },
                {
                  value: 'auto',
                  label: 'Auto',
                  icon: 'theme-light-dark',
                },
              ]}
              style={styles.segmentedButtons}
            />

            <Text
              variant="bodySmall"
              style={[styles.description, { color: theme.colors.outline }]}
            >
              Auto mode follows your device's system theme preference
            </Text>

            <Divider style={styles.divider} />

            <LanguagePicker
              selectedLanguage={settings.language as Language}
              onLanguageChange={handleLanguageChange}
            />

            <Divider style={styles.divider} />

            <Text
              variant="labelLarge"
              style={[styles.label, { color: theme.colors.onSurfaceVariant }]}
            >
              Time Format
            </Text>

            <SegmentedButtons
              value={settings.timeFormat}
              onValueChange={value => handleTimeFormatChange(value as TimeFormat)}
              buttons={[
                {
                  value: '12h',
                  label: '12 Hour',
                },
                {
                  value: '24h',
                  label: '24 Hour',
                },
              ]}
              style={styles.segmentedButtons}
            />

            <Divider style={styles.divider} />

            <List.Item
              title="Show Sunrise & Sunset"
              description="Display sunrise and sunset times with prayer times"
              left={props => <List.Icon {...props} icon="weather-sunset" />}
              right={() => (
                <Switch
                  value={settings.showSunriseSunset}
                  onValueChange={handleSunriseSunsetToggle}
                />
              )}
            />
          </CollapsibleSettingsSection>

          {/* Notifications Section */}
          <CollapsibleSettingsSection
            title="Notifications"
            icon="bell"
            defaultExpanded={false}
          >
            <List.Item
              title="Enable Notifications"
              description="Receive prayer time notifications"
              left={props => <List.Icon {...props} icon="bell-ring" />}
              right={() => (
                <Switch
                  value={settings.notificationsEnabled}
                  onValueChange={handleNotificationsToggle}
                  disabled
                />
              )}
            />

            <Text
              variant="bodySmall"
              style={[styles.comingSoon, { color: theme.colors.outline }]}
            >
              Full notification features coming in a future update. This will
              include customizable reminder times, notification sounds, and per-prayer
              notification settings.
            </Text>
          </CollapsibleSettingsSection>

          {/* Advanced Settings Section */}
          <CollapsibleSettingsSection
            title="Advanced"
            icon="cog"
            defaultExpanded={false}
          >
            <Button
              mode="contained"
              onPress={() => setShowImportExport(true)}
              icon="swap-horizontal"
              style={styles.importExportButton}
            >
              Import / Export Settings
            </Button>

            <Divider style={styles.divider} />

            <List.Item
              title="App Version"
              description={settings.version}
              left={props => <List.Icon {...props} icon="information" />}
            />

            <Divider style={styles.divider} />

            <Button
              mode="outlined"
              onPress={handleResetToDefaults}
              style={[
                styles.resetButton,
                { borderColor: theme.colors.error },
              ]}
              textColor={theme.colors.error}
            >
              Reset to Defaults
            </Button>
          </CollapsibleSettingsSection>
        </View>
      </ScrollView>

      {/* Import/Export Dialog */}
      <ImportExportDialog
        visible={showImportExport}
        onDismiss={() => setShowImportExport(false)}
        currentSettings={settings}
        onImport={handleImport}
      />

      {/* Toast Notifications */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
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
  divider: {
    marginVertical: 16,
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  comingSoon: {
    marginTop: 8,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  importExportButton: {
    marginBottom: 8,
  },
  resetButton: {
    marginTop: 8,
  },
  snackbar: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
  },
});
