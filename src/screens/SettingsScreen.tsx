/**
 * Settings Screen - App Settings (Redesigned)
 * Configure calculation method, notifications, display, etc.
 * Features: Collapsible sections, search, import/export, language selection
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  List,
  Switch,
  SegmentedButtons,
  Divider,
  Button,
  Snackbar,
  ActivityIndicator,
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
import { useCalculationMethods } from '../hooks/useCalculationMethods';
import {
  CollapsibleSettingsSection,
  SettingsSearchBar,
  LanguagePicker,
  Language,
  ImportExportDialog,
} from '../components/settings';
import { SkeletonCard } from '../components/LoadingSkeleton';
import { PageHeader } from '../components/PageHeader';
import { LocationSetupScreen } from './';
import { LocationPreferenceService } from '../services/location';
import type { LocationPreference } from '../services/location';

export default function SettingsScreen() {
  const { setThemeMode, theme } = useThemeContext();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showImportExport, setShowImportExport] = useState(false);
  const [showLocationSetup, setShowLocationSetup] = useState(false);
  const [locationInfo, setLocationInfo] = useState<LocationPreference | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Fetch calculation methods with TanStack Query (cache-first, 7-day cache)
  const {
    methods: calculationMethods,
    isLoading: methodsLoading,
    error: methodsError,
    refetch: refetchMethods,
    isFetching: methodsRefetching,
  } = useCalculationMethods();

  useEffect(() => {
    loadSettings();
    loadLocation();
  }, []);

  const loadSettings = async () => {
    try {
      const currentSettings = await SettingsService.getSettings();
      setSettings(currentSettings);
    } catch (error) {
      console.error('Failed to load settings:', error);
      Alert.alert('Error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const loadLocation = async () => {
    try {
      const preference = await LocationPreferenceService.getLocationPreference();
      setLocationInfo(preference);
    } catch (error) {
      console.error('Failed to load location:', error);
    }
  };

  const handleLocationChange = () => {
    setShowLocationSetup(true);
  };

  const handleLocationSetupComplete = async () => {
    setShowLocationSetup(false);
    await loadLocation();
    showToast('Location updated successfully');
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

  // Helper function to format method params as description
  const formatMethodParams = (params: Record<string, any>): string => {
    const parts: string[] = [];
    if (params.Fajr) parts.push(`Fajr: ${params.Fajr}°`);
    if (params.Isha) {
      if (typeof params.Isha === 'string') {
        parts.push(`Isha: ${params.Isha}`);
      } else {
        parts.push(`Isha: ${params.Isha}°`);
      }
    }
    return parts.join(', ') || 'Custom parameters';
  };

  // Filter calculation methods based on search
  const filteredMethods = (calculationMethods || []).filter(method =>
    searchQuery
      ? method.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        method.id.toLowerCase().includes(searchQuery.toLowerCase())
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
      testID="settings-screen"
      edges={['top', 'left', 'right']}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <PageHeader title="Settings" />

          {/* Prayer Settings Section */}
          <CollapsibleSettingsSection
            testID="prayer-settings-section"
            title="Prayer Settings"
            icon="mosque"
            defaultExpanded={false}
          >
            <Text
              testID="calculation-method-setting"
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

            {/* Methods Loading State */}
            {methodsLoading && !calculationMethods && (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <ActivityIndicator size="large" />
                <Text style={{ marginTop: 10, color: theme.colors.onSurfaceVariant }}>
                  Loading calculation methods...
                </Text>
              </View>
            )}

            {/* Methods Error State */}
            {methodsError && !calculationMethods && (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ color: theme.colors.error, marginBottom: 10 }}>
                  Failed to load calculation methods
                </Text>
                <Button mode="contained" onPress={() => refetchMethods()}>
                  Retry
                </Button>
              </View>
            )}

            {/* Background Refresh Indicator */}
            {methodsRefetching && calculationMethods && (
              <Text style={{ padding: 10, color: theme.colors.primary, textAlign: 'center' }}>
                Syncing methods...
              </Text>
            )}

            {/* Methods List */}
            {calculationMethods && filteredMethods.map(method => {
              const isSelected = settings.calculationMethod === method.id;
              return (
                <List.Item
                  key={method.id}
                  title={method.name}
                  description={formatMethodParams(method.params)}
                  left={props => (
                    <List.Icon
                      {...props}
                      icon={isSelected ? 'radiobox-marked' : 'radiobox-blank'}
                      color={isSelected ? theme.colors.primary : undefined}
                    />
                  )}
                  onPress={() => handleCalculationMethodChange(method.id)}
                  style={[
                    styles.listItem,
                    isSelected && {
                      backgroundColor: theme.colors.primaryContainer,
                      borderRadius: 8,
                    },
                  ]}
                  titleStyle={isSelected ? { color: theme.colors.primary, fontWeight: '600' } : undefined}
                />
              );
            })}

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
            testID="notifications-setting"
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

          {/* Location Section */}
          <CollapsibleSettingsSection
            testID="location-setting"
            title="Location"
            icon="map-marker"
            defaultExpanded={false}
          >
            {locationInfo && (
              <>
                <Text
                  variant="labelLarge"
                  style={[styles.label, { color: theme.colors.onSurfaceVariant }]}
                >
                  Current Location
                </Text>
                <List.Item
                  title={locationInfo.source === 'gps' ? 'GPS Location' : 'Manual Location'}
                  description={
                    locationInfo.cityName || locationInfo.displayName
                      ? `${locationInfo.cityName || locationInfo.displayName}${locationInfo.country ? `, ${locationInfo.country}` : ''}`
                      : locationInfo.coordinates
                        ? `${locationInfo.coordinates.latitude.toFixed(4)}, ${locationInfo.coordinates.longitude.toFixed(4)}`
                        : 'No location set'
                  }
                  left={props => (
                    <List.Icon
                      {...props}
                      icon={locationInfo.source === 'gps' ? 'crosshairs-gps' : 'map-search'}
                    />
                  )}
                  style={styles.listItem}
                />

                <Divider style={styles.divider} />
              </>
            )}

            <Button
              mode="outlined"
              onPress={handleLocationChange}
              icon="map-marker-radius"
              style={styles.changeLocationButton}
            >
              Change Location
            </Button>

            <Text
              variant="bodySmall"
              style={[styles.description, { color: theme.colors.outline, marginTop: 12 }]}
            >
              Changing your location will update prayer times to match your new location.
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

      {/* Location Setup Modal */}
      <Modal
        visible={showLocationSetup}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowLocationSetup(false)}
      >
        <LocationSetupScreen onComplete={handleLocationSetupComplete} />
      </Modal>

      {/* Toast Notifications */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2500}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
        style={styles.snackbar}
        icon="check-circle"
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
  changeLocationButton: {
    borderRadius: 12,
  },
  snackbar: {
    marginBottom: 80,
  },
});
