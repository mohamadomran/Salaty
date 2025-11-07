/**
 * Notification Test Screen
 * Debug/test screen for notification services
 * TODO: Remove before production release
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  Button,
  Card,
  Divider,
  List,
  useTheme,
  ActivityIndicator,
  Chip,
} from 'react-native-paper';
import {
  NotificationPermissions,
  NotificationChannels,
  NotificationService,
  NotificationPreferencesService,
  NotificationScheduler,
} from '../services/notifications';
import { PageHeader } from '../components';

export default function NotificationTestScreen() {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<string>('unknown');
  const [scheduledCount, setScheduledCount] = useState(0);
  const [displayedCount, setDisplayedCount] = useState(0);
  const [notificationStatus, setNotificationStatus] = useState<any>(null);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const status = await NotificationPermissions.checkPermissionStatus();
      setPermissionStatus(status);

      const counts = await NotificationService.getNotificationCount();
      setScheduledCount(counts.scheduled);
      setDisplayedCount(counts.displayed);

      const notifStatus = await NotificationScheduler.getNotificationStatus();
      setNotificationStatus(notifStatus);
    } catch (error) {
      console.error('Error loading status:', error);
    }
  };

  // 1. PERMISSION TESTS
  const handleRequestPermissions = async () => {
    try {
      setLoading(true);
      const status = await NotificationPermissions.requestPermissions();
      setPermissionStatus(status);
      Alert.alert('Permission Result', `Status: ${status}`);
      await loadStatus();
    } catch (error) {
      Alert.alert('Error', String(error));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSettings = async () => {
    try {
      await NotificationPermissions.openNotificationSettings();
    } catch (error) {
      Alert.alert('Error', String(error));
    }
  };

  // 2. CHANNEL TESTS (Android only)
  const handleCreateChannels = async () => {
    try {
      setLoading(true);
      await NotificationChannels.createAllChannels();
      Alert.alert('Success', 'All notification channels created!');
    } catch (error) {
      Alert.alert('Error', String(error));
    } finally {
      setLoading(false);
    }
  };

  const handleListChannels = async () => {
    try {
      const channels = await NotificationChannels.getAllChannels();
      Alert.alert(
        'Channels',
        `Found ${channels.length} channels:\n${channels.map(c => c.name).join('\n')}`
      );
    } catch (error) {
      Alert.alert('Error', String(error));
    }
  };

  // 3. NOTIFICATION TESTS
  const handleTestImmediateNotification = async () => {
    try {
      setLoading(true);
      await NotificationService.displayNotification(
        'Test Notification',
        'This is a test notification from Salaty app!',
        'general_notifications',
        { test: true }
      );
      Alert.alert('Success', 'Notification displayed! Check your notification tray.');
      await loadStatus();
    } catch (error) {
      Alert.alert('Error', String(error));
    } finally {
      setLoading(false);
    }
  };

  const handleTestScheduledNotification = async () => {
    try {
      setLoading(true);
      const futureTime = new Date(Date.now() + 10000); // 10 seconds from now

      await NotificationService.scheduleNotification(
        'test-scheduled',
        'Scheduled Test',
        'This notification was scheduled 10 seconds ago!',
        futureTime,
        'general_notifications',
        { test: true }
      );

      Alert.alert('Success', 'Notification scheduled for 10 seconds from now!');
      await loadStatus();
    } catch (error) {
      Alert.alert('Error', String(error));
    } finally {
      setLoading(false);
    }
  };

  const handleTestPrayerNotification = async () => {
    try {
      setLoading(true);
      const futureTime = new Date(Date.now() + 15000); // 15 seconds from now
      const prayerTime = new Date(Date.now() + 30 * 60000); // 30 min from now

      await NotificationService.schedulePrayerNotification(
        'fajr',
        'pre_prayer',
        futureTime,
        prayerTime,
        new Date().toISOString().split('T')[0],
        'simple_beep'
      );

      Alert.alert('Success', 'Prayer notification scheduled for 15 seconds from now!');
      await loadStatus();
    } catch (error) {
      Alert.alert('Error', String(error));
    } finally {
      setLoading(false);
    }
  };

  // 4. PREFERENCES TESTS
  const handleGetPreferences = async () => {
    try {
      const prefs = await NotificationPreferencesService.getPreferences();
      Alert.alert(
        'Notification Preferences',
        `Enabled: ${prefs.global.enabled}\nDND: ${prefs.global.dnd.enabled}\nVibration: ${prefs.global.vibrationEnabled}`
      );
    } catch (error) {
      Alert.alert('Error', String(error));
    }
  };

  const handleToggleNotifications = async () => {
    try {
      setLoading(true);
      const prefs = await NotificationPreferencesService.getPreferences();
      await NotificationPreferencesService.toggleNotifications(!prefs.global.enabled);
      Alert.alert('Success', `Notifications ${!prefs.global.enabled ? 'enabled' : 'disabled'}`);
      await loadStatus();
    } catch (error) {
      Alert.alert('Error', String(error));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPreferences = async () => {
    try {
      setLoading(true);
      await NotificationPreferencesService.resetToDefaults();
      Alert.alert('Success', 'Preferences reset to defaults');
    } catch (error) {
      Alert.alert('Error', String(error));
    } finally {
      setLoading(false);
    }
  };

  // 5. SCHEDULER TESTS
  const handleScheduleAll = async () => {
    try {
      setLoading(true);
      await NotificationScheduler.scheduleAllNotifications(2); // 2 days ahead
      Alert.alert('Success', 'Scheduled notifications for next 2 days!');
      await loadStatus();
    } catch (error) {
      Alert.alert('Error', String(error));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAll = async () => {
    try {
      setLoading(true);
      await NotificationScheduler.cancelAll();
      Alert.alert('Success', 'All notifications cancelled');
      await loadStatus();
    } catch (error) {
      Alert.alert('Error', String(error));
    } finally {
      setLoading(false);
    }
  };

  const handleGetScheduled = async () => {
    try {
      const scheduled = await NotificationService.getScheduledNotifications();
      Alert.alert(
        'Scheduled Notifications',
        `${scheduled.length} notifications scheduled\n\n${scheduled.slice(0, 5).map(n =>
          `${n.notification.title} at ${new Date(n.trigger.timestamp).toLocaleString()}`
        ).join('\n')}`
      );
    } catch (error) {
      Alert.alert('Error', String(error));
    }
  };

  // 6. CLEANUP TESTS
  const handleClearDisplayed = async () => {
    try {
      setLoading(true);
      await NotificationService.clearDisplayedNotifications();
      Alert.alert('Success', 'Cleared displayed notifications from tray');
      await loadStatus();
    } catch (error) {
      Alert.alert('Error', String(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <PageHeader
          title="Notification Testing"
          subtitle="Test all notification services"
        />

        {/* STATUS CARD */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Current Status
            </Text>
            <Divider style={styles.divider} />

            <View style={styles.statusRow}>
              <Text variant="bodyMedium">Permission:</Text>
              <Chip
                mode="flat"
                style={{ backgroundColor: permissionStatus === 'granted' ? '#4CAF50' : '#F44336' }}
                textStyle={{ color: '#FFF' }}
              >
                {permissionStatus}
              </Chip>
            </View>

            <View style={styles.statusRow}>
              <Text variant="bodyMedium">Scheduled:</Text>
              <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>{scheduledCount}</Text>
            </View>

            <View style={styles.statusRow}>
              <Text variant="bodyMedium">Displayed:</Text>
              <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>{displayedCount}</Text>
            </View>

            {notificationStatus && (
              <>
                <View style={styles.statusRow}>
                  <Text variant="bodyMedium">Enabled:</Text>
                  <Text variant="bodyMedium">{notificationStatus.enabled ? 'Yes' : 'No'}</Text>
                </View>

                {notificationStatus.nextNotification && (
                  <View style={styles.statusRow}>
                    <Text variant="bodyMedium">Next:</Text>
                    <Text variant="bodySmall">
                      {notificationStatus.nextNotification.title} at{' '}
                      {new Date(notificationStatus.nextNotification.scheduledTime).toLocaleTimeString()}
                    </Text>
                  </View>
                )}
              </>
            )}

            <Button mode="outlined" onPress={loadStatus} style={styles.refreshButton}>
              Refresh Status
            </Button>
          </Card.Content>
        </Card>

        {/* 1. PERMISSION TESTS */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              1. Permission Tests
            </Text>
            <Divider style={styles.divider} />

            <Button
              mode="contained"
              onPress={handleRequestPermissions}
              style={styles.button}
              loading={loading}
            >
              Request Permissions
            </Button>

            <Button mode="outlined" onPress={handleOpenSettings} style={styles.button}>
              Open Notification Settings
            </Button>
          </Card.Content>
        </Card>

        {/* 2. CHANNEL TESTS */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              2. Channel Tests (Android)
            </Text>
            <Divider style={styles.divider} />

            <Button
              mode="contained"
              onPress={handleCreateChannels}
              style={styles.button}
              loading={loading}
            >
              Create All Channels
            </Button>

            <Button mode="outlined" onPress={handleListChannels} style={styles.button}>
              List All Channels
            </Button>
          </Card.Content>
        </Card>

        {/* 3. NOTIFICATION TESTS */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              3. Notification Tests
            </Text>
            <Divider style={styles.divider} />

            <Button
              mode="contained"
              onPress={handleTestImmediateNotification}
              style={styles.button}
              loading={loading}
            >
              Test Immediate Notification
            </Button>

            <Button
              mode="contained"
              onPress={handleTestScheduledNotification}
              style={styles.button}
              loading={loading}
            >
              Test Scheduled (10s delay)
            </Button>

            <Button
              mode="contained"
              onPress={handleTestPrayerNotification}
              style={styles.button}
              loading={loading}
            >
              Test Prayer Notification (15s delay)
            </Button>
          </Card.Content>
        </Card>

        {/* 4. PREFERENCES TESTS */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              4. Preferences Tests
            </Text>
            <Divider style={styles.divider} />

            <Button mode="outlined" onPress={handleGetPreferences} style={styles.button}>
              Get Current Preferences
            </Button>

            <Button
              mode="contained"
              onPress={handleToggleNotifications}
              style={styles.button}
              loading={loading}
            >
              Toggle Notifications On/Off
            </Button>

            <Button mode="outlined" onPress={handleResetPreferences} style={styles.button}>
              Reset to Defaults
            </Button>
          </Card.Content>
        </Card>

        {/* 5. SCHEDULER TESTS */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              5. Scheduler Tests
            </Text>
            <Divider style={styles.divider} />

            <Button
              mode="contained"
              onPress={handleScheduleAll}
              style={styles.button}
              loading={loading}
            >
              Schedule All (2 days)
            </Button>

            <Button mode="outlined" onPress={handleGetScheduled} style={styles.button}>
              List Scheduled Notifications
            </Button>

            <Button
              mode="contained-tonal"
              onPress={handleCancelAll}
              style={styles.button}
              loading={loading}
              buttonColor={theme.colors.error}
            >
              Cancel All Notifications
            </Button>
          </Card.Content>
        </Card>

        {/* 6. CLEANUP */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              6. Cleanup Tests
            </Text>
            <Divider style={styles.divider} />

            <Button
              mode="outlined"
              onPress={handleClearDisplayed}
              style={styles.button}
              loading={loading}
            >
              Clear Displayed Notifications
            </Button>
          </Card.Content>
        </Card>
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
  card: {
    marginBottom: 16,
    borderRadius: 16,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: 8,
  },
  divider: {
    marginBottom: 16,
  },
  button: {
    marginBottom: 12,
  },
  refreshButton: {
    marginTop: 8,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
});
