/**
 * Settings Screen - App Settings
 * Configure calculation method, notifications, display, etc.
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Card, List, Switch, SegmentedButtons, Divider, Button } from 'react-native-paper';
import { SettingsService } from '@services';
import { AppSettings, CalculationMethodInfo, Madhab, TimeFormat, ThemeMode } from '@types';
import { useThemeContext } from '@/contexts';

export default function SettingsScreen() {
  const { setThemeMode } = useThemeContext();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [calculationMethods, setCalculationMethods] = useState<CalculationMethodInfo[]>([]);

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

  const handleCalculationMethodChange = async (methodId: string) => {
    if (!settings) return;

    try {
      await SettingsService.setCalculationMethod(methodId as AppSettings['calculationMethod']);
      setSettings({ ...settings, calculationMethod: methodId as AppSettings['calculationMethod'] });
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
    } catch (error) {
      console.error('Failed to toggle sunrise/sunset:', error);
      Alert.alert('Error', 'Failed to update display settings');
    }
  };

  const handleThemeModeChange = async (mode: ThemeMode) => {
    if (!settings) return;

    try {
      // Update theme context (this will also persist to storage)
      await setThemeMode(mode);
      setSettings({ ...settings, themeMode: mode });
    } catch (error) {
      console.error('Failed to update theme mode:', error);
      Alert.alert('Error', 'Failed to update theme');
    }
  };

  const handleNotificationsToggle = async () => {
    if (!settings) return;

    try {
      const newValue = !settings.notificationsEnabled;
      await SettingsService.updateNotificationSettings({ enabled: newValue });
      setSettings({ ...settings, notificationsEnabled: newValue });
    } catch (error) {
      console.error('Failed to toggle notifications:', error);
      Alert.alert('Error', 'Failed to update notifications');
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
              // Reset theme mode in context
              await setThemeMode(defaults.themeMode);
              setSettings(defaults);
              Alert.alert('Success', 'Settings have been reset to defaults');
            } catch (error) {
              console.error('Failed to reset settings:', error);
              Alert.alert('Error', 'Failed to reset settings');
            }
          },
        },
      ]
    );
  };

  const theme = useThemeContext().theme;

  if (loading || !settings) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.content}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text variant="headlineMedium" style={styles.title}>
            Settings
          </Text>

          {/* Prayer Calculation Section */}
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Prayer Calculation
              </Text>

              {/* Calculation Method */}
              <Text variant="labelLarge" style={styles.label}>
                Calculation Method
              </Text>
              <Text variant="bodySmall" style={styles.description}>
                Select the method used to calculate prayer times
              </Text>

              {calculationMethods.map((method) => (
                <List.Item
                  key={method.id}
                  title={method.name}
                  description={`${method.description} • ${method.region}`}
                  left={(props) => (
                    <List.Icon
                      {...props}
                      icon={settings.calculationMethod === method.id ? 'radiobox-marked' : 'radiobox-blank'}
                    />
                  )}
                  onPress={() => handleCalculationMethodChange(method.id)}
                  style={styles.listItem}
                />
              ))}

              <Divider style={styles.divider} />

              {/* Madhab Selection */}
              <Text variant="labelLarge" style={styles.label}>
                Madhab (Asr Calculation)
              </Text>
              <Text variant="bodySmall" style={styles.description}>
                Choose the juristic method for Asr prayer time
              </Text>

              <SegmentedButtons
                value={settings.madhab}
                onValueChange={(value) => handleMadhabChange(value as Madhab)}
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
            </Card.Content>
          </Card>

          {/* Display Settings Section */}
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Display Settings
              </Text>

              {/* Time Format */}
              <Text variant="labelLarge" style={styles.label}>
                Time Format
              </Text>

              <SegmentedButtons
                value={settings.timeFormat}
                onValueChange={(value) => handleTimeFormatChange(value as TimeFormat)}
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

              {/* Show Sunrise/Sunset */}
              <List.Item
                title="Show Sunrise & Sunset"
                description="Display sunrise and sunset times with prayer times"
                left={(props) => <List.Icon {...props} icon="weather-sunset" />}
                right={() => (
                  <Switch
                    value={settings.showSunriseSunset}
                    onValueChange={handleSunriseSunsetToggle}
                  />
                )}
              />
            </Card.Content>
          </Card>

          {/* Notification Settings Section */}
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Notifications
              </Text>

              <List.Item
                title="Enable Notifications"
                description="Receive prayer time notifications (Coming Soon)"
                left={(props) => <List.Icon {...props} icon="bell" />}
                right={() => (
                  <Switch
                    value={settings.notificationsEnabled}
                    onValueChange={handleNotificationsToggle}
                    disabled
                  />
                )}
              />

              <Text variant="bodySmall" style={styles.comingSoon}>
                Full notification features coming in a future update
              </Text>
            </Card.Content>
          </Card>

          {/* App Settings Section */}
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                App Settings
              </Text>

              {/* Theme Mode */}
              <Text variant="labelLarge" style={styles.label}>
                Theme
              </Text>

              <SegmentedButtons
                value={settings.themeMode}
                onValueChange={(value) => handleThemeModeChange(value as ThemeMode)}
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

              <Text variant="bodySmall" style={styles.comingSoon}>
                Theme functionality coming in a future update
              </Text>
            </Card.Content>
          </Card>

          {/* About Section */}
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                About
              </Text>

              <List.Item
                title="App Version"
                description={settings.version}
                left={(props) => <List.Icon {...props} icon="information" />}
              />

              <Divider style={styles.divider} />

              <Button
                mode="outlined"
                onPress={handleResetToDefaults}
                style={styles.resetButton}
                textColor="#B00020"
              >
                Reset to Defaults
              </Button>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
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
  title: {
    fontWeight: '700',
    color: '#006A6A',
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#006A6A',
    marginBottom: 16,
  },
  label: {
    marginTop: 8,
    marginBottom: 4,
    color: '#004D4D',
  },
  description: {
    marginBottom: 12,
    color: '#5F6368',
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
    color: '#5F6368',
    fontStyle: 'italic',
  },
  resetButton: {
    marginTop: 8,
    borderColor: '#B00020',
  },
});
