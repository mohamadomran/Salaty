/**
 * Qibla Screen - Qibla Direction Compass
 * Show direction to Kaaba with compass
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { ScreenContainer, PageHeader } from '../components';

export default function QiblaScreen() {
  const { t } = useTranslation();

  return (
    <ScreenContainer testID="qibla-screen">
      <PageHeader
        title={t('qibla.title')}
        icon="compass"
      />
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="bodyLarge">
            {t('qibla.subtitle')}
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
