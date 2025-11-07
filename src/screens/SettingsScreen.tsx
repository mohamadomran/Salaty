/**
 * Settings Screen - App Settings
 * Configure calculation method, notifications, display, etc.
 * Features: Segmented sections, search, import/export, language selection
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import {
  Text,
  List,
  Switch,
  SegmentedButtons,
  Divider,
  Button,
  Snackbar,
  ActivityIndicator,
  Icon,
} from 'react-native-paper';
import { SettingsService } from '../services';
import { NotificationPreferencesService } from '../services/notifications';
import {
  AppSettings,
  CalculationMethodInfo,
  Madhab,
  TimeFormat,
  ThemeMode,
  PrayerName,
  PrayerNotificationSettings as PrayerNotificationSettingsType,
  NotificationPreferences,
} from '../types';
import { useThemeContext, useAppContext, useLanguage } from '../contexts';
import { useSettingsReactiveUpdates } from '../hooks/useReactiveUpdates';
import { useCalculationMethods } from '../hooks/useCalculationMethods';
import {
  useNotificationPreferences,
  usePrayerTimeNotifications,
} from '../hooks/useNotifications';
import {
  SettingsSearchBar,
  LanguagePicker,
  Language,
  ImportExportDialog,
  PrayerNotificationSettings,
} from '../components/settings';
import { Skeleton } from '../components';
import { PageHeader } from '../components/PageHeader';
import { LocationSetupScreen } from './';
import { LocationPreferenceService } from '../services/location';
import type { LocationPreference } from '../services/location';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { setThemeMode, theme } = useThemeContext();
  const { state, updateSettings, subscribe } = useAppContext();
  const { language, setLanguage: setAppLanguage } = useLanguage();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showImportExport, setShowImportExport] = useState(false);
  const [showLocationSetup, setShowLocationSetup] = useState(false);
  const [locationInfo, setLocationInfo] = useState<LocationPreference | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences | null>(null);
  const [showPrayerNotificationModal, setShowPrayerNotificationModal] = useState(false);
  const [selectedPrayer, setSelectedPrayer] = useState<PrayerName>('fajr');

  // Fetch calculation methods with TanStack Query (cache-first, 7-day cache)
  const {
    methods: calculationMethods,
    isLoading: methodsLoading,
    error: methodsError,
    refetch: refetchMethods,
    isFetching: methodsRefetching,
  } = useCalculationMethods();

  // Notification reschedule hooks
  const { rescheduleOnPreferenceChange } = useNotificationPreferences();
  const { rescheduleOnPrayerTimeChange } = usePrayerTimeNotifications();

  useEffect(() => {
    loadSettings();
    loadLocation();
    loadNotificationPreferences();
  }, []);

  // Subscribe to reactive updates
  useSettingsReactiveUpdates((data: any) => {
    // Update local settings state to reflect changes
    if (data.settings) {
      setSettings(data.settings);
    }
  });

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

  const loadNotificationPreferences = async () => {
    try {
      const prefs = await NotificationPreferencesService.getPreferences();
      setNotificationPrefs(prefs);
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
    }
  };

  const handleLocationChange = () => {
    setShowLocationSetup(true);
  };

  const handleLocationSetupComplete = async () => {
    setShowLocationSetup(false);
    await loadLocation();
    showToast('Location updated successfully');

    // Location changed, prayer times changed, reschedule notifications
    await rescheduleOnPrayerTimeChange();
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

      // Prayer times changed, reschedule notifications
      await rescheduleOnPrayerTimeChange();
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

      // Madhab affects Asr time, reschedule notifications
      await rescheduleOnPrayerTimeChange();
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

  const handleLanguageChange = async (newLanguage: Language) => {
    if (!settings) return;

    try {
      // Update language in context (handles i18n and RTL)
      await setAppLanguage(newLanguage);

      // Save to settings
      await SettingsService.setLanguage(newLanguage);
      setSettings({ ...settings, language: newLanguage });

      // Show success message
      showToast(newLanguage === 'ar' ? 'تم تحديث اللغة' : 'Language updated');

      // If RTL changed, show restart message
      if ((newLanguage === 'ar') !== (language === 'ar')) {
        Alert.alert(
          newLanguage === 'ar' ? 'إعادة التشغيل مطلوبة' : 'Restart Required',
          newLanguage === 'ar'
            ? 'يرجى إعادة تشغيل التطبيق لتطبيق تغييرات RTL'
            : 'Please restart the app to apply RTL changes',
          [{ text: newLanguage === 'ar' ? 'موافق' : 'OK' }]
        );
      }
    } catch (error) {
      console.error('Failed to update language:', error);
      Alert.alert('Error', 'Failed to update language');
    }
  };

  const handleNotificationsToggle = async () => {
    if (!settings || !notificationPrefs) return;

    try {
      const newValue = !notificationPrefs.global.enabled;
      await NotificationPreferencesService.toggleNotifications(newValue);
      await SettingsService.updateNotificationSettings({ enabled: newValue });

      setSettings({ ...settings, notificationsEnabled: newValue });
      setNotificationPrefs({ ...notificationPrefs, global: { ...notificationPrefs.global, enabled: newValue } });

      showToast(
        newValue ? 'Notifications enabled' : 'Notifications disabled',
      );

      // Notification preferences changed, reschedule or cancel notifications
      await rescheduleOnPreferenceChange();
    } catch (error) {
      console.error('Failed to toggle notifications:', error);
      Alert.alert('Error', 'Failed to update notifications');
    }
  };

  const handleOpenPrayerSettings = (prayerName: PrayerName) => {
    setSelectedPrayer(prayerName);
    setShowPrayerNotificationModal(true);
  };

  const handleSavePrayerSettings = async (prayerSettings: PrayerNotificationSettingsType) => {
    if (!notificationPrefs) return;

    try {
      const updatedPrefs = await NotificationPreferencesService.updatePrayerSettings(
        selectedPrayer,
        prayerSettings
      );
      setNotificationPrefs(updatedPrefs);
      showToast(`${t(`prayers.${selectedPrayer}`)} notification settings saved`);

      // Reschedule notifications with new preferences
      await rescheduleOnPreferenceChange();
    } catch (error) {
      console.error('Failed to save prayer settings:', error);
      Alert.alert('Error', 'Failed to save notification settings');
    }
  };

  const getPrayerIcon = (prayer: PrayerName): string => {
    const icons: Record<PrayerName, string> = {
      fajr: 'weather-sunset-up',
      dhuhr: 'weather-sunny',
      asr: 'weather-sunset-down',
      maghrib: 'weather-sunset',
      isha: 'weather-night',
    };
    return icons[prayer];
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
          <PageHeader title={t('settings.title')} />
          <View style={styles.skeletonCard}>
            <Skeleton width={150} height={24} style={styles.skeletonMargin} />
            <Skeleton width="100%" height={16} style={styles.skeletonMargin} />
            <Skeleton width="80%" height={16} style={styles.skeletonMargin} />
            <Skeleton width="100%" height={48} />
          </View>
          <View style={styles.skeletonCard}>
            <Skeleton width={150} height={24} style={styles.skeletonMargin} />
            <Skeleton width="100%" height={16} style={styles.skeletonMargin} />
            <Skeleton width="80%" height={16} style={styles.skeletonMargin} />
            <Skeleton width="100%" height={48} />
          </View>
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
          <PageHeader title={t('settings.title')} />

          {/* Prayer Settings Section */}
          <View style={styles.sectionHeader}>
            <Icon source="mosque" size={24} color={theme.colors.primary} />
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              {t('settings.prayerSettings')}
            </Text>
          </View>
          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <Text
              testID="calculation-method-setting"
              variant="labelLarge"
              style={[styles.label, { color: theme.colors.onSurfaceVariant }]}
            >
              {t('settings.calculationMethod')}
            </Text>
            <Text
              variant="bodySmall"
              style={[styles.description, { color: theme.colors.outline }]}
            >
              {t('settings.calculationMethodDesc')}
            </Text>

            <SettingsSearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={t('settings.searchMethods')}
            />

            {/* Methods Loading State */}
            {methodsLoading && !calculationMethods && (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <ActivityIndicator size="large" />
                <Text style={{ marginTop: 10, color: theme.colors.onSurfaceVariant }}>
                  {t('common.loading')}
                </Text>
              </View>
            )}

            {/* Methods Error State */}
            {methodsError && !calculationMethods && (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ color: theme.colors.error, marginBottom: 10 }}>
                  {t('errors.generic')}
                </Text>
                <Button mode="contained" onPress={() => refetchMethods()}>
                  {t('common.retry')}
                </Button>
              </View>
            )}

            {/* Background Refresh Indicator */}
            {methodsRefetching && calculationMethods && (
              <Text style={{ padding: 10, color: theme.colors.primary, textAlign: 'center' }}>
                {t('common.loading')}
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
              {t('settings.madhab')}
            </Text>
            <Text
              variant="bodySmall"
              style={[styles.description, { color: theme.colors.outline }]}
            >
              {t('settings.madhabDesc')}
            </Text>

            <SegmentedButtons
              value={settings.madhab}
              onValueChange={value => handleMadhabChange(value as Madhab)}
              buttons={[
                {
                  value: 'shafi',
                  label: t('settings.shafiMalikiHanbali'),
                },
                {
                  value: 'hanafi',
                  label: t('settings.hanafi'),
                },
              ]}
              style={styles.segmentedButtons}
            />
          </View>

          {/* Display & Appearance Section */}
          <View style={styles.sectionHeader}>
            <Icon source="palette" size={24} color={theme.colors.primary} />
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              {t('settings.displayAppearance')}
            </Text>
          </View>
          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <Text
              variant="labelLarge"
              style={[styles.label, { color: theme.colors.onSurfaceVariant }]}
            >
              {t('settings.theme')}
            </Text>

            <SegmentedButtons
              value={settings.themeMode}
              onValueChange={value => handleThemeModeChange(value as ThemeMode)}
              buttons={[
                {
                  value: 'light',
                  label: t('settings.light'),
                  icon: 'white-balance-sunny',
                },
                {
                  value: 'dark',
                  label: t('settings.dark'),
                  icon: 'moon-waning-crescent',
                },
                {
                  value: 'auto',
                  label: t('settings.auto'),
                  icon: 'theme-light-dark',
                },
              ]}
              style={styles.segmentedButtons}
            />

            <Text
              variant="bodySmall"
              style={[styles.description, { color: theme.colors.outline }]}
            >
              {t('settings.autoModeDesc')}
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
              {t('settings.timeFormat')}
            </Text>

            <SegmentedButtons
              value={settings.timeFormat}
              onValueChange={value => handleTimeFormatChange(value as TimeFormat)}
              buttons={[
                {
                  value: '12h',
                  label: t('settings.12hour'),
                },
                {
                  value: '24h',
                  label: t('settings.24hour'),
                },
              ]}
              style={styles.segmentedButtons}
            />

            <Divider style={styles.divider} />

            <List.Item
              title={t('settings.showSunriseSunset')}
              description={t('settings.showSunriseSunsetDesc')}
              left={props => <List.Icon {...props} icon="weather-sunset" />}
              right={() => (
                <Switch
                  value={settings.showSunriseSunset}
                  onValueChange={handleSunriseSunsetToggle}
                />
              )}
            />
          </View>

          {/* Notifications Section */}
          <View style={styles.sectionHeader}>
            <Icon source="bell" size={24} color={theme.colors.primary} />
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              {t('settings.notifications')}
            </Text>
          </View>
          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            {/* Master toggle */}
            <List.Item
              title={t('settings.enableNotifications')}
              description={t('settings.notificationsDesc')}
              left={props => <List.Icon {...props} icon="bell-ring" />}
              right={() => (
                <Switch
                  value={notificationPrefs?.global.enabled || false}
                  onValueChange={handleNotificationsToggle}
                />
              )}
            />

            {notificationPrefs?.global.enabled && (
              <>
                <Divider style={styles.divider} />

                {/* Per-prayer settings */}
                <Text
                  variant="labelLarge"
                  style={[styles.label, { color: theme.colors.onSurfaceVariant, marginTop: 8 }]}
                >
                  {t('settings.prayerNotificationSettings')}
                </Text>
                <Text
                  variant="bodySmall"
                  style={[styles.description, { color: theme.colors.outline }]}
                >
                  {t('settings.customizeNotifications')}
                </Text>

                {(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as PrayerName[]).map((prayer) => {
                  const prayerSettings = notificationPrefs.perPrayer[prayer];
                  const reminderCount = prayerSettings.preReminderEnabled ? prayerSettings.reminderMinutes.length : 0;

                  return (
                    <List.Item
                      key={prayer}
                      title={t(`prayers.${prayer}`)}
                      description={
                        prayerSettings.enabled
                          ? `${reminderCount} ${t('settings.reminderMinutes').toLowerCase()} • ${prayerSettings.atTimeEnabled ? t('settings.atTimeNotification') : t('settings.atTimeNotification') + ' off'} • ${prayerSettings.missedAlertEnabled ? t('settings.missedPrayerAlert') : t('settings.missedPrayerAlert') + ' off'}`
                          : t('common.disabled')
                      }
                      left={props => (
                        <List.Icon
                          {...props}
                          icon={getPrayerIcon(prayer)}
                          color={prayerSettings.enabled ? theme.colors.primary : theme.colors.outline}
                        />
                      )}
                      right={props => <List.Icon {...props} icon="chevron-right" />}
                      onPress={() => handleOpenPrayerSettings(prayer)}
                      style={styles.listItem}
                    />
                  );
                })}

                <Divider style={styles.divider} />

                {/* Global notification settings preview */}
                <Text
                  variant="labelLarge"
                  style={[styles.label, { color: theme.colors.onSurfaceVariant, marginTop: 8 }]}
                >
                  {t('settings.globalSettings')}
                </Text>

                <List.Item
                  title={t('settings.vibration')}
                  description={notificationPrefs.global.vibrationEnabled ? t('common.enabled') : t('common.disabled')}
                  left={props => <List.Icon {...props} icon="vibrate" />}
                  right={() => (
                    <Switch
                      value={notificationPrefs.global.vibrationEnabled}
                      onValueChange={async (value) => {
                        const updated = await NotificationPreferencesService.updateGlobalSettings({ vibrationEnabled: value });
                        setNotificationPrefs(updated);
                        showToast(`${t('settings.vibration')} ${value ? t('common.enabled').toLowerCase() : t('common.disabled').toLowerCase()}`);
                      }}
                    />
                  )}
                />
              </>
            )}
          </View>

          {/* Location Section */}
          <View style={styles.sectionHeader}>
            <Icon source="map-marker" size={24} color={theme.colors.primary} />
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              {t('settings.location')}
            </Text>
          </View>
          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            {locationInfo && (
              <>
                <Text
                  variant="labelLarge"
                  style={[styles.label, { color: theme.colors.onSurfaceVariant }]}
                >
                  {t('settings.currentLocation')}
                </Text>
                <List.Item
                  title={locationInfo.source === 'gps' ? t('settings.gpsLocation') : t('settings.manualLocation')}
                  description={
                    locationInfo.cityName || locationInfo.displayName
                      ? `${locationInfo.cityName || locationInfo.displayName}${locationInfo.country ? `, ${locationInfo.country}` : ''}`
                      : locationInfo.coordinates
                        ? `${locationInfo.coordinates.latitude.toFixed(4)}, ${locationInfo.coordinates.longitude.toFixed(4)}`
                        : t('location.noLocationSet')
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
              {t('settings.changeLocation')}
            </Button>

            <Text
              variant="bodySmall"
              style={[styles.description, { color: theme.colors.outline, marginTop: 12 }]}
            >
              {t('settings.locationChangeDesc')}
            </Text>
          </View>

          {/* Advanced Settings Section */}
          <View style={styles.sectionHeader}>
            <Icon source="cog" size={24} color={theme.colors.primary} />
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              {t('settings.advanced')}
            </Text>
          </View>
          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <Button
              mode="contained"
              onPress={() => setShowImportExport(true)}
              icon="swap-horizontal"
              style={styles.importExportButton}
            >
              {t('settings.importExport')}
            </Button>

            <Divider style={styles.divider} />

            <List.Item
              title={t('settings.appVersion')}
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
              {t('settings.resetToDefaults')}
            </Button>
          </View>
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

      {/* Prayer Notification Settings Modal */}
      {notificationPrefs && (
        <PrayerNotificationSettings
          visible={showPrayerNotificationModal}
          onDismiss={() => setShowPrayerNotificationModal(false)}
          prayerName={selectedPrayer}
          settings={notificationPrefs.perPrayer[selectedPrayer]}
          onSave={handleSavePrayerSettings}
        />
      )}

      {/* Toast Notifications */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2500}
        action={{
          label: t('common.ok'),
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontWeight: '700',
  },
  section: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
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
  skeletonCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  skeletonMargin: {
    marginBottom: 12,
  },
});
