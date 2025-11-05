/**
 * Home Screen - Prayer Times Display
 */

import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Alert,
} from 'react-native';
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
import { useLocation } from '@hooks/useLocation';
import { PrayerService } from '@services/prayer';
import { SettingsService } from '@services/settings';
import type { PrayerTimes, PrayerName, AppSettings } from '@types';
import type { ExpressiveTheme } from '@theme';

const PRAYER_NAMES = {
  fajr: { english: 'Fajr', arabic: 'الفجر', icon: 'weather-sunset-up' },
  dhuhr: { english: 'Dhuhr', arabic: 'الظهر', icon: 'white-balance-sunny' },
  asr: { english: 'Asr', arabic: 'العصر', icon: 'weather-partly-cloudy' },
  maghrib: { english: 'Maghrib', arabic: 'المغرب', icon: 'weather-sunset-down' },
  isha: { english: 'Isha', arabic: 'العشاء', icon: 'weather-night' },
};

export default function HomeScreen() {
  const theme = useTheme<ExpressiveTheme>();
  const { location, loading: locationLoading, error: locationError, requestPermission } = useLocation(false);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [currentPrayer, setCurrentPrayer] = useState<PrayerName | null>(null);
  const [nextPrayer, setNextPrayer] = useState<{ name: PrayerName; time: Date } | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  // Load user settings
  useEffect(() => {
    const loadSettings = async () => {
      const userSettings = await SettingsService.getSettings();
      setSettings(userSettings);
    };
    loadSettings();
  }, []);

  // Fetch location and calculate prayer times
  const fetchPrayerTimes = async () => {
    try {
      const perm = await requestPermission();

      if (!perm || !perm.granted) {
        Alert.alert(
          'Location Permission Required',
          'Please enable location permissions to calculate accurate prayer times.',
          [{ text: 'OK' }]
        );
        return;
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  // Calculate prayer times when location is available
  useEffect(() => {
    const calculatePrayerTimes = async () => {
      if (location) {
        try {
          // Use settings from SettingsService (will use defaults if not set)
          const times = await PrayerService.getPrayerTimes(
            location,
            new Date()
          );
          setPrayerTimes(times);

          const current = PrayerService.getCurrentPrayer(times);
          setCurrentPrayer(current);

          const next = await PrayerService.getNextPrayer(times, location);
          setNextPrayer(next);
        } catch (error) {
          console.error('Error calculating prayer times:', error);
        }
      }
    };
    calculatePrayerTimes();
  }, [location]);

  // Format time using user's time format preference
  const formatTime = (date: Date): string => {
    if (!settings) return '';
    return PrayerService.formatPrayerTimeSync(date, settings.timeFormat === '24h');
  };

  // Format countdown
  const formatCountdown = (ms: number): string => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            Salaty
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Prayer Times & Qibla
          </Text>
        </View>

        {/* Location Status */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <MaterialCommunityIcons name="map-marker" size={24} color={theme.colors.primary} />
              <Text variant="titleMedium">Location Status</Text>
            </View>
            <Divider style={styles.divider} />

            {locationLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Getting location...</Text>
              </View>
            )}

            {locationError && (
              <Text style={styles.errorText}>Error: {locationError}</Text>
            )}

            {location && (
              <View>
                <Text>Latitude: {location.latitude.toFixed(4)}</Text>
                <Text>Longitude: {location.longitude.toFixed(4)}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 }}>
                  <MaterialCommunityIcons name="check-circle" size={16} color="#00C853" />
                  <Text style={styles.successText}>Location acquired</Text>
                </View>
              </View>
            )}

            {!location && !locationLoading && (
              <Button
                mode="contained"
                onPress={fetchPrayerTimes}
                style={styles.button}
              >
                Get Location & Prayer Times
              </Button>
            )}
          </Card.Content>
        </Card>

        {/* Next Prayer */}
        {nextPrayer && prayerTimes && (
          <Card style={[styles.card, styles.nextPrayerCard]}>
            <Card.Content>
              <Text variant="labelLarge" style={styles.nextPrayerLabel}>
                NEXT PRAYER
              </Text>
              <Text variant="headlineLarge" style={styles.nextPrayerName}>
                {PRAYER_NAMES[nextPrayer.name].english}
              </Text>
              <Text variant="displaySmall" style={styles.nextPrayerTime}>
                {formatTime(nextPrayer.time)}
              </Text>
              <Text variant="bodyLarge" style={styles.countdown}>
                In {formatCountdown(PrayerService.getTimeUntilNextPrayer(prayerTimes))}
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
                Method: {SettingsService.getCalculationMethods().find(m => m.id === settings.calculationMethod)?.name || settings.calculationMethod}
              </Text>
              <Text variant="bodySmall" style={styles.methodText}>
                Madhab: {settings.madhab === 'shafi' ? 'Shafi/Maliki/Hanbali' : 'Hanafi'}
              </Text>
              <Divider style={styles.divider} />

              {Object.entries(PRAYER_NAMES).map(([key, prayer]) => {
                const prayerKey = key as PrayerName;
                const time = prayerTimes[prayerKey];
                const isCurrent = currentPrayer === prayerKey;
                const isNext = nextPrayer?.name === prayerKey;

                return (
                  <View
                    key={key}
                    style={[
                      styles.prayerRow,
                      isCurrent && styles.currentPrayerRow,
                      isNext && styles.nextPrayerRow,
                    ]}
                  >
                    <View style={styles.prayerInfo}>
                      <Icon source={prayer.icon} size={24} color={theme.colors.primary} />
                      <View style={styles.prayerNames}>
                        <Text variant="titleMedium" style={styles.prayerEnglish}>
                          {prayer.english}
                        </Text>
                        <Text variant="bodySmall" style={styles.prayerArabic}>
                          {prayer.arabic}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.prayerTimeContainer}>
                      <Text
                        variant="titleLarge"
                        style={[
                          styles.prayerTime,
                          isCurrent && styles.currentPrayerTime,
                        ]}
                      >
                        {formatTime(time)}
                      </Text>
                      {isCurrent && (
                        <Text style={styles.currentLabel}>NOW</Text>
                      )}
                      {isNext && !isCurrent && (
                        <Text style={styles.nextLabel}>NEXT</Text>
                      )}
                    </View>
                  </View>
                );
              })}

              {/* Sunrise & Sunset */}
              {settings.showSunriseSunset && prayerTimes.sunrise && (
                <View style={styles.sunTimeRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <MaterialCommunityIcons name="weather-sunset-up" size={20} color="#FFA726" />
                    <Text variant="bodyMedium">Sunrise</Text>
                  </View>
                  <Text variant="bodyMedium">{formatTime(prayerTimes.sunrise)}</Text>
                </View>
              )}
              {settings.showSunriseSunset && prayerTimes.sunset && (
                <View style={styles.sunTimeRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <MaterialCommunityIcons name="weather-sunset-down" size={20} color="#FFA726" />
                    <Text variant="bodyMedium">Sunset</Text>
                  </View>
                  <Text variant="bodyMedium">{formatTime(prayerTimes.sunset)}</Text>
                </View>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Settings Info */}
        {settings && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <MaterialCommunityIcons name="cog" size={24} color={theme.colors.primary} />
                <Text variant="titleMedium">Current Settings</Text>
              </View>
              <Divider style={styles.divider} />
              <Text variant="bodySmall">
                • {SettingsService.getCalculationMethods().find(m => m.id === settings.calculationMethod)?.name || settings.calculationMethod}
              </Text>
              <Text variant="bodySmall">
                • {settings.timeFormat === '12h' ? '12-hour' : '24-hour'} time format
              </Text>
              <Text variant="bodySmall">
                • {settings.madhab === 'shafi' ? 'Shafi/Maliki/Hanbali' : 'Hanafi'} madhab for Asr
              </Text>
              <Text variant="bodySmall">
                • Sunrise/Sunset: {settings.showSunriseSunset ? 'Visible' : 'Hidden'}
              </Text>
              <Text variant="bodySmall" style={{ marginTop: 8, fontStyle: 'italic' }}>
                Go to Settings tab to change these preferences
              </Text>
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
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontWeight: '700',
    color: '#006A6A',
  },
  subtitle: {
    color: '#4A6363',
    marginTop: 4,
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
  },
  nextPrayerCard: {
    backgroundColor: '#E5F1F1',
    borderRadius: 24,
  },
  nextPrayerLabel: {
    color: '#4A6363',
    marginBottom: 4,
  },
  nextPrayerName: {
    fontWeight: '700',
    color: '#006A6A',
    marginBottom: 8,
  },
  nextPrayerTime: {
    fontWeight: '700',
    color: '#006A6A',
  },
  countdown: {
    color: '#FFA726',
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
    color: '#4A6363',
  },
  errorText: {
    color: '#BA1A1A',
  },
  successText: {
    color: '#00C853',
    marginTop: 8,
  },
  button: {
    marginTop: 12,
    borderRadius: 100,
  },
  methodText: {
    color: '#4A6363',
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
    backgroundColor: '#B9F6CA',
  },
  nextPrayerRow: {
    backgroundColor: '#FFE0B2',
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
    color: '#4A6363',
    marginTop: 2,
  },
  prayerTimeContainer: {
    alignItems: 'flex-end',
  },
  prayerTime: {
    fontWeight: '600',
  },
  currentPrayerTime: {
    color: '#00C853',
  },
  currentLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00C853',
    marginTop: 2,
  },
  nextLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F57C00',
    marginTop: 2,
  },
  sunTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#DAE5E4',
  },
});
