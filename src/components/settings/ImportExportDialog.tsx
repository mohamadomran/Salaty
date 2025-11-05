/**
 * ImportExportDialog Component
 * Dialog for importing and exporting settings
 */

import React, { useState } from 'react';
import { View, StyleSheet, Alert, Share, Platform } from 'react-native';
import {
  Portal,
  Dialog,
  Button,
  Text,
  useTheme,
  Divider,
} from 'react-native-paper';
import { AppSettings } from '../../types';

interface ImportExportDialogProps {
  visible: boolean;
  onDismiss: () => void;
  currentSettings: AppSettings;
  onImport: (settings: AppSettings) => Promise<void>;
}

export const ImportExportDialog: React.FC<ImportExportDialogProps> = ({
  visible,
  onDismiss,
  currentSettings,
  onImport,
}) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);

      // Create export data with timestamp
      const exportData = {
        settings: currentSettings,
        exportedAt: new Date().toISOString(),
        version: currentSettings.version,
      };

      // Convert to JSON
      const jsonString = JSON.stringify(exportData, null, 2);

      // Use Share API to allow user to save/share the settings
      await Share.share({
        message: jsonString,
        title: 'Salaty Settings Export',
      });

      Alert.alert('Export Ready', 'Settings exported. You can save the shared content to a file.');
      onDismiss();
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error', 'Failed to export settings');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    try {
      setLoading(false);

      // Show instructions for importing
      Alert.alert(
        'Import Settings',
        'To import settings:\n\n1. Copy the JSON content from your settings export file\n2. Paste it in the next dialog',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Continue',
            onPress: () => showImportInput(),
          },
        ],
      );
    } catch (error) {
      console.error('Import error:', error);
      Alert.alert('Error', 'Failed to import settings');
    }
  };

  const showImportInput = () => {
    // For now, show a message that import requires pasting JSON
    // In a full implementation, you would show a TextInput dialog or navigate to a separate screen
    Alert.alert(
      'Import Method',
      'Import functionality requires:\n\n1. A file picker (coming soon)\n2. Or paste JSON manually in app settings\n\nFor now, you can manually adjust settings or wait for the file picker feature.',
      [{ text: 'OK' }],
    );
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>Settings Import/Export</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium" style={styles.description}>
            Export your settings to share them across devices, or import
            settings from a backup.
          </Text>

          <Divider style={styles.divider} />

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleExport}
              icon="export"
              style={styles.button}
              loading={loading}
              disabled={loading}
            >
              Export Settings
            </Button>

            <Button
              mode="outlined"
              onPress={handleImport}
              icon="import"
              style={styles.button}
              loading={loading}
              disabled={loading}
            >
              Import Settings (Coming Soon)
            </Button>

            <Text variant="bodySmall" style={[styles.note, { color: theme.colors.outline }]}>
              Note: Export creates a shareable JSON file. Import functionality will be added in a future update with native file picker support.
            </Text>
          </View>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Close</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  description: {
    marginBottom: 16,
  },
  divider: {
    marginBottom: 16,
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    marginBottom: 8,
  },
  note: {
    marginTop: 8,
    fontStyle: 'italic',
    lineHeight: 18,
  },
});
