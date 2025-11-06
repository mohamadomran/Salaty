/**
 * Qibla Screen - Qibla Direction Compass
 * Show direction to Kaaba with compass
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Card } from 'react-native-paper';

export default function QiblaScreen() {
  return (
    <SafeAreaView testID="qibla-screen" edges={['top', 'left', 'right']} style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          Qibla Direction
        </Text>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="bodyLarge">
              Coming Soon: Live compass pointing to Kaaba with distance display and calibration.
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
