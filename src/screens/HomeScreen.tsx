/**
 * Home Screen - Prayer Times Display
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { ScrollView, StyleSheet, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  Button,
  Card,
  ActivityIndicator,
  Divider,
  Icon,
  useTheme,
} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useLocation } from '../hooks/useLocation';
import { PrayerService } from '../services/prayer';
import { SettingsService } from '../services/settings';
import { AlAdhanService } from '../services/api';
import { LocationPreferenceService } from '../services/location';
import {
  PremiumCard,
  PrayerTimeCard,
  IslamicPattern,
  PageHeader,
  HomeScreenSkeleton,
} from '../components';
import type { PrayerTimes, PrayerName, AppSettings, HijriDate, Coordinates } from '../types';
import type { ExpressiveTheme } from '../theme';
import type { LocationSource } from '../services/location';

const PRAYER_NAMES_WITH_ICONS: Record<
  string,
  { english: string; arabic: string; icon: string }
> = {
  fajr: { english: 'Fajr', arabic: 'الفجر', icon: 'weather-sunset-up' },
  dhuhr: { english: 'Dhuhr', arabic: 'الظهر', icon: 'white-balance-sunny' },
  asr: { english: 'Asr', arabic: 'العصر', icon: 'weather-partly-cloudy' },
  maghrib: {
    english: 'Maghrib',
    arabic: 'المغرب',
    icon: 'weather-sunset-down',
  },
  isha: { english: 'Isha', arabic: 'العشاء', icon: 'weather-night' },
};

export default function HomeScreen() {
  const theme = useTheme<ExpressiveTheme>();
  const {
    location,
    loading: locationLoading,
    error: locationError,
    requestPermission,
  } = useLocation(false);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [currentPrayer, setCurrentPrayer] = useState<PrayerName | null>(null);
  const [nextPrayer, setNextPrayer] = useState<{
    name: PrayerName;
    time: Date;
  } | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [hijriDate, setHijriDate] = useState<HijriDate | null>(null);
  const [storedLocation, setStoredLocation] = useState<Coordinates | null>(null);
  const [locationSource, setLocationSource] = useState<LocationSource | null>(null);

  // Load user settings and stored location
  useEffect(() => {
    const loadData = async () => {
      const userSettings = await SettingsService.getSettings();
      setSettings(userSettings);

      // Load stored location
      const preference = await LocationPreferenceService.getLocationPreference();
      if (preference.coordinates) {
        setStoredLocation(preference.coordinates);
        setLocationSource(preference.source);
      }
    };
    loadData();
  }, []);

  // Fetch location and calculate prayer times
  const fetchPrayerTimes = async () => {
    try {
      const perm = await requestPermission();

      if (!perm || !perm.granted) {
        Alert.alert(
          'Location Permission Required',
          'Please enable location permissions to calculate accurate prayer times.',
          [{ text: 'OK' }],
        );
        return;
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  // Calculate prayer times and fetch Hijri date when location is available
  useEffect(() => {
    const calculatePrayerTimes = async () => {
      // Use stored location first, fallback to GPS location
      const activeLocation = storedLocation || location;

      if (activeLocation) {
        try {
          // Use settings from SettingsService (will use defaults if not set)
          const times = await PrayerService.getPrayerTimes(
            activeLocation,
            new Date(),
          );
          setPrayerTimes(times);

          const current = PrayerService.getCurrentPrayer(times);
          setCurrentPrayer(current);

          const next = await PrayerService.getNextPrayer(times, activeLocation);
          setNextPrayer(next);

          // Fetch Hijri date
          try {
            const dateInfo = await AlAdhanService.getHijriDate(activeLocation);
            if (dateInfo.hijriDate) {
              setHijriDate(dateInfo.hijriDate);
            }
          } catch (error) {
            console.error('Error fetching Hijri date:', error);
          }
        } catch (error) {
          console.error('Error calculating prayer times:', error);
        }
      }
    };
    calculatePrayerTimes();
  }, [location, storedLocation]);

  // Format time using user's time format preference (memoized)
  // MUST be before early return to maintain hook order
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

  // Format countdown (memoized)
  const formatCountdown = useCallback((ms: number): string => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }, []);

  // Memoize prayer list rendering with enhanced components
  const prayerListItems = useMemo(() => {
    if (!prayerTimes || !settings) return null;

    return Object.entries(PRAYER_NAMES_WITH_ICONS).map(([key, prayer]) => {
      const prayerKey = key as PrayerName;
      const prayerInfo = PRAYER_NAMES_WITH_ICONS[prayerKey] as {
        english: string;
        arabic: string;
        icon: string;
      };
      const time = prayerTimes[prayerKey];
      const isCurrent = currentPrayer === prayerKey;
      const isNext = nextPrayer?.name === prayerKey;

      const status: 'current' | 'next' | 'completed' | 'upcoming' = isCurrent
        ? 'current'
        : isNext
        ? 'next'
        : 'completed';

      return (
        <PrayerTimeCard
          key={key}
          prayerName={prayerInfo.english}
          arabicName={prayerInfo.arabic}
          time={formatTime(time)}
          status={status}
          icon={prayerInfo.icon}
        />
      );
    });
  }, [prayerTimes, settings, currentPrayer, nextPrayer, formatTime]);

  // Show loading skeleton while settings are loading
  // MUST be after ALL hooks (useState, useEffect, useCallback, useMemo)
  if (!settings) {
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <PageHeader title="Salaty" subtitle="Prayer Times & Qibla" />

        {/* Islamic Date */}
        {hijriDate && (
          <Card style={[styles.card, styles.dateCard]}>
            <Card.Content>
              <View style={styles.dateContainer}>
                <View style={styles.dateSection}>
                  <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
                    TODAY
                  </Text>
                  <Text variant="headlineSmall" style={{ fontWeight: '600', marginTop: 4 }}>
                    {new Date().toLocaleDateString('en-US', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
                <Divider style={styles.dateDivider} />
                <View style={styles.dateSection}>
                  <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
                    HIJRI DATE
                  </Text>
                  <Text
                    variant="headlineSmall"
                    style={{
                      fontWeight: '600',
                      marginTop: 4,
                      color: theme.colors.primary,
                    }}
                  >
                    {hijriDate.day} {hijriDate.month.en} {hijriDate.year} AH
                  </Text>
                  <Text
                    variant="bodyMedium"
                    style={{
                      marginTop: 2,
                      color: theme.colors.onSurfaceVariant,
                      textAlign: 'right',
                      fontFamily: 'System',
                    }}
                  >
                    {hijriDate.day} {hijriDate.month.ar} {hijriDate.year} هـ
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Location Status */}
        {(storedLocation || location) && (
          <Card style={styles.card}>
            <Card.Content>
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
              >
                <MaterialCommunityIcons
                  name={locationSource === 'gps' ? 'crosshairs-gps' : 'map-search'}
                  size={24}
                  color={theme.colors.primary}
                />
                <Text variant="titleMedium">
                  {locationSource === 'gps' ? 'GPS Location' : 'Manual Location'}
                </Text>
              </View>
              <Divider style={styles.divider} />

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <MaterialCommunityIcons
                  name="check-circle"
                  size={20}
                  color={theme.colors.primary}
                />
                <Text
                  variant="bodyLarge"
                  style={{ color: theme.colors.primary, fontWeight: '500' }}
                >
                  {locationSource === 'gps'
                    ? 'Using GPS location'
                    : 'Using manual location'}
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Next Prayer */}
        {nextPrayer && prayerTimes && (
          <Card style={[styles.card, styles.nextPrayerCard]}>
            <Card.Content>
              <Text variant="labelLarge" style={styles.nextPrayerLabel}>
                NEXT PRAYER
              </Text>
              <Text variant="headlineLarge" style={styles.nextPrayerName}>
                {PRAYER_NAMES_WITH_ICONS[nextPrayer.name as PrayerName].english}
              </Text>
              <Text variant="displaySmall" style={styles.nextPrayerTime}>
                {formatTime(nextPrayer.time)}
              </Text>
              <Text variant="bodyLarge" style={styles.countdown}>
                In{' '}
                {formatCountdown(
                  nextPrayer.time.getTime() - new Date().getTime(),
                )}
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Prayer Times */}
        {prayerTimes && settings && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge">Today's Prayer Times</Text>
              <Text variant="bodySmall" style={styles.methodText}>
                Method:{' '}
                {SettingsService.getCalculationMethods().find(
                  m => m.id === settings.calculationMethod,
                )?.name || settings.calculationMethod}
              </Text>
              <Text variant="bodySmall" style={styles.methodText}>
                Madhab:{' '}
                {settings.madhab === 'shafi'
                  ? 'Shafi/Maliki/Hanbali'
                  : 'Hanafi'}
              </Text>
              <Divider style={styles.divider} />

              {prayerListItems}

              {/* Sunrise & Sunset */}
              {settings.showSunriseSunset && prayerTimes.sunrise && (
                <View
                  style={[
                    styles.sunTimeRow,
                    { borderTopColor: theme.colors.outlineVariant },
                  ]}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <MaterialCommunityIcons
                      name="weather-sunset-up"
                      size={20}
                      color={theme.colors.secondary}
                    />
                    <Text variant="bodyMedium">Sunrise</Text>
                  </View>
                  <Text variant="bodyMedium">
                    {formatTime(prayerTimes.sunrise)}
                  </Text>
                </View>
              )}
              {settings.showSunriseSunset && prayerTimes.sunset && (
                <View
                  style={[
                    styles.sunTimeRow,
                    { borderTopColor: theme.colors.outlineVariant },
                  ]}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <MaterialCommunityIcons
                      name="weather-sunset-down"
                      size={20}
                      color={theme.colors.secondary}
                    />
                    <Text variant="bodyMedium">Sunset</Text>
                  </View>
                  <Text variant="bodyMedium">
                    {formatTime(prayerTimes.sunset)}
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Quick Actions */}
        {(storedLocation || location) && prayerTimes && (
          <Card style={styles.card}>
            <Card.Content>
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}
              >
                <MaterialCommunityIcons
                  name="star-four-points"
                  size={24}
                  color={theme.colors.primary}
                />
                <Text variant="titleMedium">Quick Actions</Text>
              </View>
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
  card: {
    marginBottom: 16,
    borderRadius: 16,
  },
  dateCard: {
    borderRadius: 20,
  },
  dateContainer: {
    gap: 16,
  },
  dateSection: {
    gap: 4,
  },
  dateDivider: {
    marginVertical: 8,
  },
  nextPrayerCard: {
    borderRadius: 24,
  },
  nextPrayerLabel: {
    marginBottom: 4,
  },
  nextPrayerName: {
    fontWeight: '700',
    marginBottom: 8,
  },
  nextPrayerTime: {
    fontWeight: '700',
  },
  countdown: {
    marginTop: 8,
  },
  divider: {
    marginVertical: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
  },
  errorText: {
    // color handled inline with theme
  },
  successText: {
    marginTop: 8,
  },
  button: {
    marginTop: 12,
    borderRadius: 100,
  },
  methodText: {
    marginTop: 4,
  },
  prayerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginVertical: 4,
  },
  currentPrayerRow: {
    // backgroundColor handled inline with theme
  },
  nextPrayerRow: {
    // backgroundColor handled inline with theme
  },
  prayerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prayerNames: {
    marginLeft: 12,
  },
  prayerEnglish: {
    fontWeight: '600',
  },
  prayerArabic: {
    // color handled inline with theme
    marginTop: 2,
  },
  prayerTimeContainer: {
    alignItems: 'flex-end',
  },
  prayerTime: {
    fontWeight: '600',
  },
  currentPrayerTime: {
    // color handled inline with theme
  },
  currentLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
    // color handled inline with theme
  },
  nextLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
    // color handled inline with theme
  },
  sunTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginTop: 8,
    borderTopWidth: 1,
    // borderTopColor handled inline with theme
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
