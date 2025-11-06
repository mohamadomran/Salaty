/**
 * Location Setup Screen
 * Initial setup screen for location - GPS or Manual entry
 */

import React, { useState, useCallback, useRef } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  Button,
  Card,
  Searchbar,
  List,
  ActivityIndicator,
  Divider,
  useTheme,
} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { LocationService, GeocodingService, LocationPreferenceService } from '../services/location';
import type { GeocodingResult } from '../services/location';
import type { ExpressiveTheme } from '../theme';

interface LocationSetupScreenProps {
  onComplete: () => void;
}

export default function LocationSetupScreen({ onComplete }: LocationSetupScreenProps) {
  const theme = useTheme<ExpressiveTheme>();
  const [mode, setMode] = useState<'choice' | 'manual' | 'gps'>('choice');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  
  // Debounce timer ref
  const searchTimeoutRef = useRef<any>(null);

  // Handle GPS location
  const handleUseGPS = async () => {
    setMode('gps');
    setLoading(true);

    try {
      // Check permission
      const permission = await LocationService.checkPermission();

      if (!permission || !permission.granted) {
        // Request permission
        const requestResult = await LocationService.requestPermission();

        if (!requestResult || !requestResult.granted) {
          Alert.alert(
            'Permission Required',
            'Location permission is required to use GPS location.',
            [
              { text: 'Cancel', onPress: () => setMode('choice') },
              { text: 'Try Again', onPress: handleUseGPS },
            ],
          );
          setLoading(false);
          return;
        }
      }

      // Get location
      const locationData = await LocationService.getCurrentLocation(true);

      if (!locationData) {
        throw new Error('Unable to get location');
      }

      // Save preference
      await LocationPreferenceService.setGPSPreference({
        latitude: locationData.latitude,
        longitude: locationData.longitude,
      });

      Alert.alert('Success', 'Location set successfully!', [
        { text: 'Continue', onPress: onComplete },
      ]);
    } catch (error: any) {
      console.error('GPS location error:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to get GPS location. Please try manual entry.',
        [
          { text: 'Try Manual', onPress: () => setMode('manual') },
          { text: 'Try Again', onPress: handleUseGPS },
        ],
      );
    } finally {
      setLoading(false);
    }
  };

  // Debounced search function
  const performSearch = useCallback(async (query: string) => {
    if (query.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    setSearching(true);

    try {
      const results = await GeocodingService.searchLocation(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Failed to search locations. Please try again.');
    } finally {
      setSearching(false);
    }
  }, []);

  // Handle manual search with debouncing
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for 500ms delay
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(query);
    }, 500);
  }, [performSearch]);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Handle location selection
  const handleSelectLocation = async (result: GeocodingResult) => {
    setLoading(true);

    try {
      await LocationPreferenceService.setManualLocation(
        result.coordinates,
        result.name,
        result.displayName,
        result.country,
      );

      Alert.alert(
        'Location Set',
        `Location set to ${result.name}, ${result.country}`,
        [{ text: 'Continue', onPress: onComplete }],
      );
    } catch (error) {
      console.error('Save location error:', error);
      Alert.alert('Error', 'Failed to save location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Render choice screen
  if (mode === 'choice' || mode === 'gps') {
    return (
      <SafeAreaView
        edges={['top', 'left', 'right']}
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <MaterialCommunityIcons
              name="map-marker"
              size={64}
              color={theme.colors.primary}
            />
            <Text variant="headlineLarge" style={[styles.title, { marginTop: 16 }]}>
              Set Your Location
            </Text>
            <Text
              variant="bodyLarge"
              style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
            >
              We need your location to calculate accurate prayer times
            </Text>
          </View>

          {mode === 'gps' && loading ? (
            <Card style={styles.card}>
              <Card.Content style={styles.loadingCard}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text variant="titleMedium" style={{ marginTop: 16 }}>
                  Getting your location...
                </Text>
              </Card.Content>
            </Card>
          ) : (
            <>
              {/* GPS Option */}
              <Card style={styles.card}>
                <Card.Content>
                  <View style={styles.optionHeader}>
                    <MaterialCommunityIcons
                      name="crosshairs-gps"
                      size={32}
                      color={theme.colors.primary}
                    />
                    <View style={styles.optionText}>
                      <Text variant="titleLarge" style={{ fontWeight: '600' }}>
                        Use My Location
                      </Text>
                      <Text
                        variant="bodyMedium"
                        style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}
                      >
                        Automatically detect your location using GPS
                      </Text>
                    </View>
                  </View>
                  <Button
                    mode="contained"
                    onPress={handleUseGPS}
                    style={styles.button}
                    icon="crosshairs-gps"
                  >
                    Enable GPS
                  </Button>
                </Card.Content>
              </Card>

              <Divider style={styles.divider} />
              <Text variant="bodyMedium" style={styles.orText}>
                OR
              </Text>
              <Divider style={styles.divider} />

              {/* Manual Option */}
              <Card style={styles.card}>
                <Card.Content>
                  <View style={styles.optionHeader}>
                    <MaterialCommunityIcons
                      name="map-search"
                      size={32}
                      color={theme.colors.secondary}
                    />
                    <View style={styles.optionText}>
                      <Text variant="titleLarge" style={{ fontWeight: '600' }}>
                        Enter Manually
                      </Text>
                      <Text
                        variant="bodyMedium"
                        style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}
                      >
                        Search and select your city
                      </Text>
                    </View>
                  </View>
                  <Button
                    mode="outlined"
                    onPress={() => setMode('manual')}
                    style={styles.button}
                    icon="map-search"
                  >
                    Search City
                  </Button>
                </Card.Content>
              </Card>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Render manual search screen
  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.manualContainer}>
        {/* Header with back button */}
        <View style={styles.manualHeader}>
          <Button icon="arrow-left" onPress={() => setMode('choice')}>
            Back
          </Button>
          <Text variant="titleLarge" style={{ fontWeight: '600' }}>
            Search Location
          </Text>
        </View>

        {/* Search bar */}
        <Searchbar
          placeholder="Enter city name..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
          loading={searching}
        />

        {/* Results */}
        <ScrollView style={styles.results}>
          {searching && (
            <View style={styles.loadingResults}>
              <ActivityIndicator size="small" />
              <Text style={{ marginTop: 8 }}>Searching...</Text>
            </View>
          )}

          {!searching && searchResults.length === 0 && searchQuery.length >= 3 && (
            <View style={styles.emptyResults}>
              <MaterialCommunityIcons
                name="map-marker-off"
                size={48}
                color={theme.colors.outline}
              />
              <Text style={{ marginTop: 16, color: theme.colors.onSurfaceVariant }}>
                No locations found. Try a different search.
              </Text>
            </View>
          )}

          {!searching && searchResults.length === 0 && searchQuery.length < 3 && (
            <View style={styles.emptyResults}>
              <MaterialCommunityIcons
                name="map-search"
                size={48}
                color={theme.colors.outline}
              />
              <Text style={{ marginTop: 16, color: theme.colors.onSurfaceVariant }}>
                Type at least 3 characters to search
              </Text>
            </View>
          )}

          {searchResults.map((result, index) => (
            <List.Item
              key={index}
              title={result.name}
              description={result.displayName}
              left={props => <List.Icon {...props} icon="map-marker" />}
              onPress={() => handleSelectLocation(result)}
              disabled={loading}
              style={styles.resultItem}
            />
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
  },
  loadingCard: {
    alignItems: 'center',
    padding: 32,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 16,
  },
  optionText: {
    flex: 1,
  },
  button: {
    marginTop: 8,
    borderRadius: 12,
  },
  divider: {
    marginVertical: 16,
  },
  orText: {
    textAlign: 'center',
    marginVertical: 8,
    fontWeight: '600',
  },
  manualContainer: {
    flex: 1,
  },
  manualHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  searchBar: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  results: {
    flex: 1,
  },
  resultItem: {
    paddingVertical: 8,
  },
  loadingResults: {
    alignItems: 'center',
    padding: 32,
  },
  emptyResults: {
    alignItems: 'center',
    padding: 48,
  },
});
