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
  RadioButton,
} from 'react-native-paper';
import { AppSettings, DailyPrayerRecord, QadaDebt } from '../../types';
import { TrackingService } from '../../services/tracking';
import { StorageService } from '../../services/storage';

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
  const [exportType, setExportType] = useState<'settings' | 'tracking' | 'full'>('settings');

  const handleExport = async () => {
    try {
      setLoading(true);

      let exportData: any;
      let exportTitle: string;

      switch (exportType) {
        case 'settings':
          exportData = {
            type: 'settings',
            settings: currentSettings,
            exportedAt: new Date().toISOString(),
            version: currentSettings.version,
          };
          exportTitle = 'Salaty Settings Export';
          break;

        case 'tracking':
          const trackingData = await TrackingService.exportRecords();
          const qadaDebt = await TrackingService.getQadaDebt();
          exportData = {
            type: 'tracking',
            dailyRecords: trackingData,
            qadaDebt: qadaDebt,
            exportedAt: new Date().toISOString(),
          };
          exportTitle = 'Salaty Prayer Tracking Export';
          break;

        case 'full':
          const allRecords = await TrackingService.exportRecords();
          const allQadaDebt = await TrackingService.getQadaDebt();
          exportData = {
            type: 'full_backup',
            settings: currentSettings,
            dailyRecords: allRecords,
            qadaDebt: allQadaDebt,
            exportedAt: new Date().toISOString(),
            version: currentSettings.version,
          };
          exportTitle = 'Salaty Full Backup Export';
          break;

        default:
          throw new Error('Invalid export type');
      }

      // Convert to JSON
      const jsonString = JSON.stringify(exportData, null, 2);

      // Use Share API to allow user to save/share the data
      await Share.share({
        message: jsonString,
        title: exportTitle,
      });

      const dataType = exportType === 'settings' ? 'Settings' : 
                      exportType === 'tracking' ? 'Prayer tracking data' : 
                      'Full backup (settings + tracking)';
      
      Alert.alert('Export Ready', `${dataType} exported. You can save the shared content to a file.`);
      onDismiss();
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error', 'Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    try {
      setLoading(false);

      // Show instructions for importing
      Alert.alert(
        'Import Data',
        'To import data:\n\n1. Copy the JSON content from your export file\n2. Paste it in the next dialog\n\nSupported formats: Settings, Tracking Data, Full Backup',
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
      Alert.alert('Error', 'Failed to import data');
    }
  };

  const showImportInput = () => {
    // For now, show a message that import requires pasting JSON
    // In a full implementation, you would show a TextInput dialog or navigate to a separate screen
    Alert.alert(
      'Import Method',
      'Import functionality requires:\n\n1. A file picker (coming soon)\n2. Or paste JSON manually\n\nFor now, you can manually adjust settings or wait for the file picker feature.\n\nNote: When implemented, the import will automatically detect whether the file contains settings, tracking data, or a full backup.',
      [{ text: 'OK' }],
    );
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>Settings Import/Export</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium" style={styles.description}>
            Export your data to share across devices, or import data from a backup.
          </Text>

          <Divider style={styles.divider} />

          <Text variant="titleMedium" style={styles.sectionTitle}>
            Export Type
          </Text>
          
          <RadioButton.Group
            onValueChange={newValue => setExportType(newValue as 'settings' | 'tracking' | 'full')}
            value={exportType}
          >
            <View style={styles.radioOption}>
              <RadioButton value="settings" />
              <View style={styles.radioText}>
                <Text variant="bodyMedium">Settings Only</Text>
                <Text variant="bodySmall" style={[styles.radioDescription, { color: theme.colors.outline }]}>
                  App preferences, calculation method, location settings
                </Text>
              </View>
            </View>

            <View style={styles.radioOption}>
              <RadioButton value="tracking" />
              <View style={styles.radioText}>
                <Text variant="bodyMedium">Prayer Tracking Data</Text>
                <Text variant="bodySmall" style={[styles.radioDescription, { color: theme.colors.outline }]}>
                  Prayer records, statistics, qada prayers
                </Text>
              </View>
            </View>

            <View style={styles.radioOption}>
              <RadioButton value="full" />
              <View style={styles.radioText}>
                <Text variant="bodyMedium">Full Backup</Text>
                <Text variant="bodySmall" style={[styles.radioDescription, { color: theme.colors.outline }]}>
                  All settings and tracking data
                </Text>
              </View>
            </View>
          </RadioButton.Group>

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
              Export Data
            </Button>

            <Button
              mode="outlined"
              onPress={handleImport}
              icon="import"
              style={styles.button}
              loading={loading}
              disabled={loading}
            >
              Import Data (Coming Soon)
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
  sectionTitle: {
    marginBottom: 12,
    fontWeight: '600',
  },
  divider: {
    marginBottom: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  radioText: {
    flex: 1,
    marginLeft: 8,
  },
  radioDescription: {
    marginTop: 2,
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
