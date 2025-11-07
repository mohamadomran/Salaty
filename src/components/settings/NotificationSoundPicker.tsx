/**
 * Notification Sound Picker
 * Component for selecting notification sound with preview
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Modal, Portal, List, Button, RadioButton, Text, Divider, IconButton, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { NotificationSoundType } from '../../types';

interface NotificationSoundPickerProps {
  visible: boolean;
  onDismiss: () => void;
  selectedSound: NotificationSoundType;
  onSelectSound: (sound: NotificationSoundType) => void;
  title?: string;
}

const SOUND_OPTIONS: Array<{
  value: NotificationSoundType;
  icon: string;
  description: string;
}> = [
  {
    value: 'system',
    icon: 'volume-high',
    description: 'Default system notification sound',
  },
  {
    value: 'adhan_mecca',
    icon: 'mosque',
    description: 'Traditional Adhan from Mecca',
  },
  {
    value: 'adhan_medina',
    icon: 'mosque',
    description: 'Traditional Adhan from Medina',
  },
  {
    value: 'adhan_egypt',
    icon: 'mosque',
    description: 'Traditional Adhan from Egypt',
  },
  {
    value: 'simple_beep',
    icon: 'bell-outline',
    description: 'Simple notification beep',
  },
  {
    value: 'silent',
    icon: 'bell-off-outline',
    description: 'No sound, vibration only',
  },
];

export default function NotificationSoundPicker({
  visible,
  onDismiss,
  selectedSound,
  onSelectSound,
  title = 'Select Notification Sound',
}: NotificationSoundPickerProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [tempSelection, setTempSelection] = useState<NotificationSoundType>(selectedSound);

  const handleConfirm = () => {
    onSelectSound(tempSelection);
    onDismiss();
  };

  const handleCancel = () => {
    setTempSelection(selectedSound); // Reset to original selection
    onDismiss();
  };

  const handleSoundSelect = (sound: NotificationSoundType) => {
    setTempSelection(sound);
    // TODO: Play preview of sound
    // playNotificationSoundPreview(sound);
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleCancel}
        contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}
      >
        <View style={styles.header}>
          <Text variant="titleLarge" style={styles.title}>
            {title}
          </Text>
          <IconButton icon="close" onPress={handleCancel} />
        </View>

        <Divider />

        <ScrollView style={styles.scrollView}>
          <RadioButton.Group
            onValueChange={(value) => handleSoundSelect(value as NotificationSoundType)}
            value={tempSelection}
          >
            {SOUND_OPTIONS.map((option) => (
              <View key={option.value}>
                <List.Item
                  title={t(`notificationSounds.${option.value}`)}
                  description={option.description}
                  left={(props) => (
                    <List.Icon {...props} icon={option.icon} />
                  )}
                  right={() => (
                    <View style={styles.rightContent}>
                      {/* Preview button - TODO: Implement sound preview */}
                      {option.value !== 'silent' && (
                        <IconButton
                          icon="play-circle-outline"
                          size={20}
                          onPress={() => {
                            // TODO: Play sound preview
                          }}
                        />
                      )}
                      <RadioButton value={option.value} />
                    </View>
                  )}
                  onPress={() => handleSoundSelect(option.value)}
                  style={styles.listItem}
                />
                <Divider />
              </View>
            ))}
          </RadioButton.Group>
        </ScrollView>

        <Divider />

        <View style={styles.footer}>
          <Button mode="outlined" onPress={handleCancel} style={styles.button}>
            {t('common.cancel')}
          </Button>
          <Button mode="contained" onPress={handleConfirm} style={styles.button}>
            {t('common.confirm')}
          </Button>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    marginHorizontal: 20,
    borderRadius: 16,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 24,
    paddingRight: 8,
    paddingVertical: 8,
  },
  title: {
    fontWeight: '600',
  },
  scrollView: {
    maxHeight: 400,
  },
  listItem: {
    paddingVertical: 8,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
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
