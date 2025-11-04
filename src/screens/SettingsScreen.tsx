/**
 * Settings Screen - App Settings
 * Configure calculation method, notifications, display, etc.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Card } from 'react-native-paper';

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          Settings
        </Text>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="bodyLarge">
              Coming Soon: Configure calculation method, madhab, notifications, display preferences, and more.
            </Text>
          </Card.Content>
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFDFD',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontWeight: '700',
    color: '#006A6A',
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    borderRadius: 16,
  },
});
