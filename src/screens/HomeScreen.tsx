/**
 * Home Screen - Prayer Times Display
 * Redesigned with modern card-based layout
 */

import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, StyleSheet, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  Button,
  Card,
  useTheme,
  Surface,
  Divider,
} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useCalculationMethods } from '../hooks/useCalculationMethods';
import { PrayerService } from '../services/prayer';
import { SettingsService } from '../services/settings';
import { AlAdhanService } from '../services/api';
import { LocationPreferenceService } from '../services/location';
import {
  HomeScreenSkeleton,
} from '../components';
import type { PrayerTimes, PrayerName, AppSettings, HijriDate, Coordinates } from '../types';
import type { ExpressiveTheme } from '../theme';

const PRAYER_NAMES_WITH_ICONS: Record<
  string,
  { english: string; arabic: string; icon: string; color: string }
> = {
  fajr: { english: 'Fajr', arabic: 'الفجر', icon: 'weather-sunset-up', color: '#9C27B0' },
  dhuhr: { english: 'Dhuhr', arabic: 'الظهر', icon: 'white-balance-sunny', color: '#FF9800' },
  asr: { english: 'Asr', arabic: 'العصر', icon: 'weather-partly-cloudy', color: '#FF5722' },
  maghrib: {
    english: 'Maghrib',
    arabic: 'المغرب',
    icon: 'weather-sunset-down',
    color: '#E91E63',
  },
  isha: { english: 'Isha', arabic: 'العشاء', icon: 'weather-night', color: '#3F51B5' },
};

export default function HomeScreen() {
  const theme = useTheme<ExpressiveTheme>();
  const { methods: calculationMethods } = useCalculationMethods();
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [currentPrayer, setCurrentPrayer] = useState<PrayerName | null>(null);
  const [nextPrayer, setNextPrayer] = useState<{
    name: PrayerName;
    time: Date;
  } | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [hijriDate, setHijriDate] = useState<HijriDate | null>(null);
  const [savedLocation, setSavedLocation] = useState<Coordinates | null>(null);
  const [locationName, setLocationName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Real-time countdown
  const [countdown, setCountdown] = useState<string>('');

  // Load user settings and location, then fetch prayer times
  useEffect(() => {
    const loadDataAndFetchPrayers = async () => {
      try {
        setLoading(true);

        // Load settings
        const userSettings = await SettingsService.getSettings();
        setSettings(userSettings);

        // Load saved location
        const preference = await LocationPreferenceService.getLocationPreference();

        if (!preference.coordinates) {
          console.warn('No saved location found');
          setLoading(false);
          return;
        }

        setSavedLocation(preference.coordinates);
        setLocationName(preference.cityName || preference.displayName || 'My Location');

        // Fetch prayer times and Hijri date
        const times = await PrayerService.getPrayerTimes(
          preference.coordinates,
          new Date(),
        );
        setPrayerTimes(times);

        const current = PrayerService.getCurrentPrayer(times);
        setCurrentPrayer(current);

        const next = await PrayerService.getNextPrayer(times, preference.coordinates);
        setNextPrayer(next);

        // Fetch Hijri date
        try {
          const dateInfo = await AlAdhanService.getHijriDate(preference.coordinates);
          if (dateInfo.hijriDate) {
            setHijriDate(dateInfo.hijriDate);
          }
        } catch (error) {
          console.error('Error fetching Hijri date:', error);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        Alert.alert('Error', 'Failed to load prayer times. Please check your location settings.');
      } finally {
        setLoading(false);
      }
    };

    loadDataAndFetchPrayers();
  }, []);

  // Update countdown every second
  useEffect(() => {
    if (!nextPrayer) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const target = nextPrayer.time.getTime();
      const diff = target - now;

      if (diff <= 0) {
        setCountdown('Now');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 0) {
        setCountdown(`${hours}h ${minutes}m`);
      } else if (minutes > 0) {
        setCountdown(`${minutes}m ${seconds}s`);
      } else {
        setCountdown(`${seconds}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [nextPrayer]);

  // Format time using user's time format preference
  const formatTime = useCallback(
    (date: Date): string => {
      if (!settings) return '';
      return PrayerService.formatPrayerTimeSync(
        date,
        settings.timeFormat === '24h',
      );
    },
    [settings],
  );

  // Show loading skeleton while data is loading
  if (loading || !settings || !prayerTimes) {
    return (
      <SafeAreaView
        edges={['top', 'left', 'right']}
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <HomeScreenSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Compact Date Header */}
        <View style={styles.headerSection}>
          <View>
            <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
              TODAY
            </Text>
            <Text variant="titleMedium" style={{ fontWeight: '600', marginTop: 2 }}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              })}
            </Text>
          </View>
          {hijriDate && (
            <View style={{ alignItems: 'flex-end' }}>
              <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
                HIJRI
              </Text>
              <Text
                variant="titleMedium"
                style={{
                  fontWeight: '600',
                  marginTop: 2,
                  color: theme.colors.primary
                }}
              >
                {hijriDate.day} {hijriDate.month.en}
              </Text>
            </View>
          )}
        </View>

        {/* Hero Section - Next Prayer with Big Clock */}
        {nextPrayer && (
          <Card style={[styles.heroCard, { backgroundColor: theme.colors.primaryContainer }]}>
            <Card.Content style={styles.heroContent}>
              <Text
                variant="labelLarge"
                style={[styles.nextPrayerLabel, { color: theme.colors.onPrimaryContainer }]}
              >
                NEXT PRAYER
              </Text>

              <View style={styles.heroMain}>
                {/* Big Clock Display */}
                <Text
                  style={[
                    styles.heroTime,
                    { color: theme.colors.onPrimaryContainer }
                  ]}
                >
                  {formatTime(nextPrayer.time)}
                </Text>

                {/* Prayer Name */}
                <Text
                  variant="headlineMedium"
                  style={[
                    styles.heroPrayerName,
                    { color: theme.colors.onPrimaryContainer }
                  ]}
                >
                  {PRAYER_NAMES_WITH_ICONS[nextPrayer.name as PrayerName].english}
                </Text>
              </View>

              {/* Countdown */}
              <View style={styles.countdownContainer}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={20}
                  color={theme.colors.onPrimaryContainer}
                />
                <Text
                  variant="titleMedium"
                  style={[
                    styles.countdown,
                    { color: theme.colors.onPrimaryContainer }
                  ]}
                >
                  {countdown}
                </Text>
              </View>

              {/* Location */}
              <View style={styles.locationContainer}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={16}
                  color={theme.colors.onPrimaryContainer}
                  style={{ opacity: 0.7 }}
                />
                <Text
                  variant="bodyMedium"
                  style={{
                    color: theme.colors.onPrimaryContainer,
                    opacity: 0.7,
                  }}
                >
                  {locationName}
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Prayer Times Grid */}
        <View style={styles.sectionHeader}>
          <Text variant="titleLarge" style={{ fontWeight: '600' }}>
            Today's Prayers
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.outline, marginTop: 4 }}>
            {calculationMethods?.find(m => m.id === settings.calculationMethod)?.name ||
              settings.calculationMethod}
          </Text>
        </View>

        <View style={styles.prayerGrid}>
          {Object.entries(PRAYER_NAMES_WITH_ICONS).map(([key, prayer]) => {
            const prayerKey = key as PrayerName;
            const time = prayerTimes[prayerKey];
            const isCurrent = currentPrayer === prayerKey;
            const isNext = nextPrayer?.name === prayerKey;

            return (
              <Surface
                key={key}
                style={[
                  styles.prayerCard,
                  {
                    backgroundColor: isCurrent
                      ? theme.colors.primaryContainer
                      : isNext
                      ? theme.colors.secondaryContainer
                      : theme.colors.surfaceVariant,
                  },
                ]}
                elevation={0}
              >
                <View style={styles.prayerCardContent}>
                  {/* Icon */}
                  <View
                    style={[
                      styles.prayerIconContainer,
                      {
                        backgroundColor: isCurrent || isNext
                          ? theme.colors.surface
                          : prayer.color + '20',
                      }
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={prayer.icon as any}
                      size={24}
                      color={isCurrent || isNext ? theme.colors.primary : prayer.color}
                    />
                  </View>

                  {/* Prayer Info */}
                  <View style={styles.prayerInfo}>
                    <Text
                      variant="titleMedium"
                      style={{
                        fontWeight: '600',
                        color: isCurrent || isNext
                          ? theme.colors.onPrimaryContainer
                          : theme.colors.onSurface,
                      }}
                    >
                      {prayer.english}
                    </Text>
                    <Text
                      variant="bodySmall"
                      style={{
                        color: isCurrent || isNext
                          ? theme.colors.onPrimaryContainer
                          : theme.colors.onSurfaceVariant,
                        opacity: 0.7,
                        marginTop: 2,
                      }}
                    >
                      {prayer.arabic}
                    </Text>
                  </View>

                  {/* Status Badge */}
                  {(isCurrent || isNext) && (
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: isCurrent
                            ? theme.colors.primary
                            : theme.colors.secondary,
                        }
                      ]}
                    >
                      <Text
                        variant="labelSmall"
                        style={{
                          color: isCurrent
                            ? theme.colors.onPrimary
                            : theme.colors.onSecondary,
                          fontWeight: '700',
                        }}
                      >
                        {isCurrent ? 'NOW' : 'NEXT'}
                      </Text>
                    </View>
                  )}

                  {/* Time */}
                  <Text
                    variant="titleLarge"
                    style={{
                      fontWeight: '700',
                      color: isCurrent || isNext
                        ? theme.colors.onPrimaryContainer
                        : theme.colors.onSurface,
                    }}
                  >
                    {formatTime(time)}
                  </Text>
                </View>
              </Surface>
            );
          })}
        </View>

        {/* Sunrise & Sunset */}
        {settings.showSunriseSunset && (prayerTimes.sunrise || prayerTimes.sunset) && (
          <Card style={styles.sunCard}>
            <Card.Content>
              <View style={styles.sunTimesContainer}>
                {prayerTimes.sunrise && (
                  <View style={styles.sunTimeItem}>
                    <View style={[styles.sunTimeIcon, { backgroundColor: theme.colors.primaryContainer }]}>
                      <MaterialCommunityIcons
                        name="weather-sunset-up"
                        size={24}
                        color={theme.colors.primary}
                      />
                    </View>
                    <View>
                      <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
                        Sunrise
                      </Text>
                      <Text variant="titleMedium" style={{ fontWeight: '600', marginTop: 2 }}>
                        {formatTime(prayerTimes.sunrise)}
                      </Text>
                    </View>
                  </View>
                )}

                {prayerTimes.sunrise && prayerTimes.sunset && (
                  <Divider style={{ width: 1, height: '100%' }} />
                )}

                {prayerTimes.sunset && (
                  <View style={styles.sunTimeItem}>
                    <View style={[styles.sunTimeIcon, { backgroundColor: theme.colors.secondaryContainer }]}>
                      <MaterialCommunityIcons
                        name="weather-sunset-down"
                        size={24}
                        color={theme.colors.secondary}
                      />
                    </View>
                    <View>
                      <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
                        Sunset
                      </Text>
                      <Text variant="titleMedium" style={{ fontWeight: '600', marginTop: 2 }}>
                        {formatTime(prayerTimes.sunset)}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Quick Actions */}
        {savedLocation && prayerTimes && (
          <Card style={styles.quickActionsCard}>
            <Card.Content>
              <Text variant="titleMedium" style={{ fontWeight: '600', marginBottom: 16 }}>
                Quick Actions
              </Text>
              <View style={styles.quickActionsGrid}>
                <Button
                  mode="elevated"
                  icon="compass"
                  onPress={() => {
                    Alert.alert('Qibla', 'Qibla compass feature coming soon!');
                  }}
                  style={styles.quickActionButton}
                  contentStyle={styles.quickActionButtonContent}
                >
                  Find Qibla
                </Button>
                <Button
                  mode="elevated"
                  icon="check-circle-outline"
                  onPress={() => {
                    Alert.alert('Tracking', 'Navigate to Tracking tab to track your prayers');
                  }}
                  style={styles.quickActionButton}
                  contentStyle={styles.quickActionButtonContent}
                >
                  Track Prayers
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  heroCard: {
    marginBottom: 24,
    borderRadius: 24,
    overflow: 'hidden',
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
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  countdown: {
    fontWeight: '600',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionHeader: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  prayerGrid: {
    gap: 12,
    marginBottom: 24,
  },
  prayerCard: {
    borderRadius: 20,
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  prayerCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  prayerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prayerInfo: {
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
    alignSelf: 'center',
  },
  sunCard: {
    marginBottom: 16,
    borderRadius: 20,
  },
  sunTimesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    gap: 16,
  },
  sunTimeItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sunTimeIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionsCard: {
    borderRadius: 20,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    borderRadius: 12,
  },
  quickActionButtonContent: {
    paddingVertical: 8,
  },
});
