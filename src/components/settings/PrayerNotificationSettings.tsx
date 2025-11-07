/**
 * Per-Prayer Notification Settings
 * Component for customizing notification settings for individual prayers
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Modal, Portal, List, Switch, Button, Text, Divider, IconButton, Chip, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { PrayerName, PrayerNotificationSettings, NotificationSoundType, ReminderInterval } from '../../types';
import NotificationSoundPicker from './NotificationSoundPicker';
import ReminderIntervalSelector from './ReminderIntervalSelector';

interface PrayerNotificationSettingsProps {
  visible: boolean;
  onDismiss: () => void;
  prayerName: PrayerName;
  settings: PrayerNotificationSettings;
  onSave: (settings: PrayerNotificationSettings) => void;
}

export default function PrayerNotificationSettingsModal({
  visible,
  onDismiss,
  prayerName,
  settings,
  onSave,
}: PrayerNotificationSettingsProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [tempSettings, setTempSettings] = useState<PrayerNotificationSettings>(settings);
  const [showSoundPicker, setShowSoundPicker] = useState(false);
  const [showIntervalSelector, setShowIntervalSelector] = useState(false);

  const handleSave = () => {
    onSave(tempSettings);
    onDismiss();
  };

  const handleCancel = () => {
    setTempSettings(settings); // Reset to original settings
    onDismiss();
  };

  const handleToggleEnabled = () => {
    setTempSettings({ ...tempSettings, enabled: !tempSettings.enabled });
  };

  const handleTogglePreReminder = () => {
    setTempSettings({ ...tempSettings, preReminderEnabled: !tempSettings.preReminderEnabled });
  };

  const handleToggleAtTime = () => {
    setTempSettings({ ...tempSettings, atTimeEnabled: !tempSettings.atTimeEnabled });
  };

  const handleToggleMissedAlert = () => {
    setTempSettings({ ...tempSettings, missedAlertEnabled: !tempSettings.missedAlertEnabled });
  };

  const handleSelectSound = (sound: NotificationSoundType) => {
    setTempSettings({ ...tempSettings, atTimeSound: sound });
  };

  const handleSelectIntervals = (intervals: ReminderInterval[]) => {
    setTempSettings({ ...tempSettings, reminderMinutes: intervals });
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

  return (
    <>
      <Portal>
        <Modal
          visible={visible}
          onDismiss={handleCancel}
          contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}
        >
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <IconButton icon={getPrayerIcon(prayerName)} size={28} />
              <Text variant="titleLarge" style={styles.title}>
                {t(`prayers.${prayerName}`)} Notifications
              </Text>
            </View>
            <IconButton icon="close" onPress={handleCancel} />
          </View>

          <Divider />

          <ScrollView style={styles.scrollView}>
            <View style={styles.content}>
              {/* Master toggle */}
              <List.Item
                title={t('settings.enableNotifications')}
                description={tempSettings.enabled ? t('settings.disableAllNotificationsFor', { prayer: t(`prayers.${prayerName}`) }) : t('settings.enableAllNotificationsFor', { prayer: t(`prayers.${prayerName}`) })}
                left={(props) => <List.Icon {...props} icon="bell" />}
                right={() => (
                  <Switch value={tempSettings.enabled} onValueChange={handleToggleEnabled} />
                )}
              />

              <Divider style={styles.sectionDivider} />

              {/* Pre-prayer reminders */}
              <View style={[styles.section, !tempSettings.enabled && styles.disabledSection]}>
                <List.Item
                  title={t('settings.prePrayerReminders')}
                  description={t('settings.getNotifiedBefore')}
                  left={(props) => <List.Icon {...props} icon="clock-alert-outline" />}
                  right={() => (
                    <Switch
                      value={tempSettings.preReminderEnabled}
                      onValueChange={handleTogglePreReminder}
                      disabled={!tempSettings.enabled}
                    />
                  )}
                />

                {tempSettings.preReminderEnabled && tempSettings.enabled && (
                  <View style={styles.subsection}>
                    <List.Item
                      title={t('settings.reminderTimes')}
                      description={
                        tempSettings.reminderMinutes.length > 0
                          ? tempSettings.reminderMinutes.map((m) => `${m} min`).join(', ')
                          : t('settings.noRemindersSet')
                      }
                      left={(props) => <List.Icon {...props} icon="timer-outline" />}
                      right={(props) => <List.Icon {...props} icon="chevron-right" />}
                      onPress={() => setShowIntervalSelector(true)}
                    />

                    {/* Preview chips */}
                    <View style={styles.chipsContainer}>
                      {tempSettings.reminderMinutes.map((interval) => (
                        <Chip key={interval} mode="outlined" compact>
                          {interval} min before
                        </Chip>
                      ))}
                    </View>
                  </View>
                )}
              </View>

              <Divider style={styles.sectionDivider} />

              {/* At-time notification */}
              <View style={[styles.section, !tempSettings.enabled && styles.disabledSection]}>
                <List.Item
                  title={t('settings.atPrayerTime')}
                  description={t('settings.notificationAtExact')}
                  left={(props) => <List.Icon {...props} icon="bell-ring" />}
                  right={() => (
                    <Switch
                      value={tempSettings.atTimeEnabled}
                      onValueChange={handleToggleAtTime}
                      disabled={!tempSettings.enabled}
                    />
                  )}
                />

                {tempSettings.atTimeEnabled && tempSettings.enabled && (
                  <View style={styles.subsection}>
                    <List.Item
                      title={t('settings.notificationSound')}
                      description={t(`notificationSounds.${tempSettings.atTimeSound}`)}
                      left={(props) => <List.Icon {...props} icon="volume-high" />}
                      right={(props) => <List.Icon {...props} icon="chevron-right" />}
                      onPress={() => setShowSoundPicker(true)}
                    />
                  </View>
                )}
              </View>

              <Divider style={styles.sectionDivider} />

              {/* Missed prayer alert */}
              <View style={[styles.section, !tempSettings.enabled && styles.disabledSection]}>
                <List.Item
                  title={t('settings.missedPrayerAlertTitle')}
                  description={t('settings.remindIfNotComplete', { prayer: t(`prayers.${prayerName}`) })}
                  left={(props) => <List.Icon {...props} icon="alert-circle-outline" />}
                  right={() => (
                    <Switch
                      value={tempSettings.missedAlertEnabled}
                      onValueChange={handleToggleMissedAlert}
                      disabled={!tempSettings.enabled}
                    />
                  )}
                />

                {tempSettings.missedAlertEnabled && tempSettings.enabled && (
                  <View style={styles.subsection}>
                    <Text variant="bodySmall" style={styles.missedAlertInfo}>
                      You'll be notified {tempSettings.missedAlertDelay} minutes after prayer time
                      if you haven't marked it as completed.
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>

          <Divider />

          <View style={styles.footer}>
            <Button mode="outlined" onPress={handleCancel} style={styles.button}>
              {t('common.cancel')}
            </Button>
            <Button mode="contained" onPress={handleSave} style={styles.button}>
              {t('common.save')}
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* Sound picker modal */}
      <NotificationSoundPicker
        visible={showSoundPicker}
        onDismiss={() => setShowSoundPicker(false)}
        selectedSound={tempSettings.atTimeSound}
        onSelectSound={handleSelectSound}
        title={`${t(`prayers.${prayerName}`)} Prayer Sound`}
      />

      {/* Interval selector modal */}
      <ReminderIntervalSelector
        visible={showIntervalSelector}
        onDismiss={() => setShowIntervalSelector(false)}
        selectedIntervals={tempSettings.reminderMinutes}
        onSelectIntervals={handleSelectIntervals}
        title={`${t(`prayers.${prayerName}`)} Reminders`}
      />
    </>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    marginHorizontal: 20,
    borderRadius: 16,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 8,
    paddingRight: 8,
    paddingVertical: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontWeight: '600',
  },
  scrollView: {
    maxHeight: '75%',
  },
  content: {
    paddingVertical: 8,
  },
  section: {
    opacity: 1,
  },
  disabledSection: {
    opacity: 0.5,
  },
  subsection: {
    paddingLeft: 16,
    paddingRight: 16,
    paddingBottom: 12,
  },
  sectionDivider: {
    marginVertical: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  missedAlertInfo: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    opacity: 0.7,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    padding: 16,
  },
  button: {
    minWidth: 100,
  },
});
