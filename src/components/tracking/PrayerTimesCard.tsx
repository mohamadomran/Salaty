/**
 * Prayer Times Card Component
 * Displays the next prayer with large clock and countdown
 */

import React from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { CountdownTimer } from './CountdownTimer';
import type { ExpressiveTheme } from '../../theme';

interface PrayerTimesCardProps {
  nextPrayer: {
    name: string;
    time: Date;
  } | null;
  locationName: string;
  formatTime: (date: Date) => string;
  prayerNames: Record<string, { english: string; arabic: string; icon: string; color: string }>;
}

export const PrayerTimesCard: React.FC<PrayerTimesCardProps> = React.memo(({ 
  nextPrayer, 
  locationName, 
  formatTime,
  prayerNames
}) => {
  const theme = useTheme<ExpressiveTheme>();

  if (!nextPrayer) return null;

  return (
    <Card style={styles.heroCard}>
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&q=80' }}
        style={styles.heroBackground}
        imageStyle={styles.heroBackgroundImage}
      >
        {/* Colored Overlay */}
        <View style={[
          styles.heroOverlay,
          {
            backgroundColor: theme.dark
              ? 'rgba(0, 0, 0, 0.75)'
              : theme.colors.primary,
            opacity: theme.dark ? 1 : 0.85
          }
        ]} />

        <Card.Content style={styles.heroContent}>
          <Text
            variant="labelLarge"
            style={[styles.nextPrayerLabel, { color: '#FFFFFF' }]}
          >
            NEXT PRAYER
          </Text>

          <View style={styles.heroMain}>
            {/* Big Clock Display */}
            <Text
              style={[
                styles.heroTime,
                { color: '#FFFFFF' }
              ]}
            >
              {formatTime(nextPrayer.time)}
            </Text>

            {/* Prayer Name */}
            <Text
              variant="headlineMedium"
              style={[
                styles.heroPrayerName,
                { color: '#FFFFFF' }
              ]}
            >
              {prayerNames[nextPrayer.name as keyof typeof prayerNames]?.english || nextPrayer.name}
            </Text>
          </View>

          {/* Countdown */}
          <CountdownTimer nextPrayer={nextPrayer} theme={theme} />

          {/* Location */}
          <View style={styles.locationContainer}>
            <MaterialCommunityIcons
              name="map-marker"
              size={16}
              color="#FFFFFF"
              style={{ opacity: 0.9 }}
            />
            <Text
              variant="bodyMedium"
              style={{
                color: '#FFFFFF',
                opacity: 0.9,
              }}
            >
              {locationName}
            </Text>
          </View>
        </Card.Content>
      </ImageBackground>
    </Card>
  );
});

PrayerTimesCard.displayName = 'PrayerTimesCard';

const styles = StyleSheet.create({
  heroCard: {
    marginBottom: 24,
    borderRadius: 24,
    overflow: 'hidden',
  },
  heroBackground: {
    width: '100%',
  },
  heroBackgroundImage: {
    borderRadius: 24,
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
  },
  heroContent: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  nextPrayerLabel: {
    letterSpacing: 1.2,
    marginBottom: 16,
    opacity: 0.8,
  },
  heroMain: {
    alignItems: 'center',
    marginBottom: 24,
  },
  heroTime: {
    fontSize: 72,
    fontWeight: '300',
    letterSpacing: -2,
    lineHeight: 80,
  },
  heroPrayerName: {
    fontWeight: '600',
    marginTop: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});