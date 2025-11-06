/**
 * Qibla Screen - Qibla Direction Compass
 * Show direction to Kaaba with compass
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { ScreenContainer, PageHeader } from '../components';

export default function QiblaScreen() {
  return (
    <ScreenContainer testID="qibla-screen">
      <PageHeader 
        title="Qibla Direction"
        icon="compass"
      />
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="bodyLarge">
            Coming Soon: Live compass pointing to Kaaba with distance display and calibration.
          </Text>
        </Card.Content>
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
  },
});
