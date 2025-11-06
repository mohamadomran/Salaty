/**
 * Home Screen - Prayer Times Display
 * Redesigned with modern card-based layout
 */

import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, StyleSheet, View, Alert, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  Button,
  Card,
  useTheme,
  Divider,
  Portal,
  Modal,
} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useCalculationMethods } from '../hooks/useCalculationMethods';
import { PrayerService } from '../services/prayer';
import { AlAdhanService } from '../services/api';
import { TrackingService } from '../services/tracking';
import {
  HomeScreenSkeleton,
  PrayerTimesCard,
  PrayerGrid,
} from '../components';
import { useAppContext } from '../contexts';
import { usePrayerReactiveUpdates } from '../hooks/useReactiveUpdates';
import type { PrayerName, HijriDate } from '../types';
import { PrayerStatus } from '../types';
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
  const navigation = useNavigation();
  const { methods: calculationMethods } = useCalculationMethods();
  const { state, updatePrayerStatus, subscribe } = useAppContext();
  
  // Get screen dimensions for responsive text sizing
  const { width: screenWidth } = Dimensions.get('window');
  const isSmallScreen = screenWidth < 375; // iPhone SE size
  const isMediumScreen = screenWidth >= 375 && screenWidth < 414; // standard phones
  const [hijriDate, setHijriDate] = useState<HijriDate | null>(null);


  
  // Prayer tracking modal state
  const [trackingModalVisible, setTrackingModalVisible] = useState(false);
  const [selectedPrayer, setSelectedPrayer] = useState<{
    name: PrayerName;
    time: Date;
    status: PrayerStatus;
  } | null>(null);

  // Fetch Hijri date when location changes
  useEffect(() => {
    const fetchHijriDate = async () => {
      if (state.location) {
        try {
          const dateInfo = await AlAdhanService.getHijriDate(state.location);
          if (dateInfo.hijriDate) {
            setHijriDate(dateInfo.hijriDate);
          }
        } catch (error) {
          console.error('Error fetching Hijri date:', error);
        }
      }
    };

    fetchHijriDate();
  }, [state.location]);

  // Subscribe to reactive updates
  usePrayerReactiveUpdates((data: any) => {
    console.log('HomeScreen: Prayer status changed:', data);
    // Context state is already updated, this ensures UI reacts immediately
  });

  // Format time using user's time format preference
  const formatTime = useCallback(
    (date: Date): string => {
      if (!state.settings) return '';
      return PrayerService.formatPrayerTimeSync(
        date,
        state.settings.timeFormat === '24h',
      );
    },
    [state.settings],
  );

  // Handle prayer tracking
  const handlePrayerTrack = async (prayerName: PrayerName, time: Date) => {
    try {
      // Get today's record
      const record = await TrackingService.getDailyRecord(new Date());
      
      // Get current status
      const currentStatus = record.prayers[prayerName]?.status || 'pending';
      
      setSelectedPrayer({
        name: prayerName,
        time,
        status: currentStatus,
      });
      setTrackingModalVisible(true);
    } catch (error) {
      console.error('Error loading prayer status:', error);
      Alert.alert('Error', 'Could not load prayer status');
    }
  };

  // Update prayer status using context
  const handleUpdatePrayerStatus = async (status: PrayerStatus) => {
    if (!selectedPrayer) return;
    
    try {
      await updatePrayerStatus(
        selectedPrayer.name,
        status,
        new Date(),
      );

      // If prayer is marked as missed, add to qada debt
      if (status === PrayerStatus.MISSED) {
        await TrackingService.addToQadaDebt(
          selectedPrayer.name,
          selectedPrayer.time,
          'Marked as missed from HomeScreen'
        );
      }
      
      // Close modal
      setTrackingModalVisible(false);
      setSelectedPrayer(null);
      
      Alert.alert(
        'Prayer Tracked',
        `${PRAYER_NAMES_WITH_ICONS[selectedPrayer.name].english} marked as ${status}${status === PrayerStatus.MISSED ? ' and added to Qada debt' : ''}`,
      );
    } catch (error) {
      console.error('Error updating prayer status:', error);
      Alert.alert('Error', 'Could not update prayer status');
    }
  };

  // Show loading skeleton while data is loading
  if (state.isLoading || !state.settings || !state.prayerTimes) {
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
      testID="home-screen"
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
        <PrayerTimesCard
          nextPrayer={state.nextPrayer}
          locationName={state.locationName}
          formatTime={formatTime}
          prayerNames={PRAYER_NAMES_WITH_ICONS}
        />

        {/* Prayer Times Grid */}
        <View style={styles.sectionHeader}>
          <Text variant="titleLarge" style={{ fontWeight: '600' }}>
            Today's Prayers
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.outline, marginTop: 4 }}>
            {calculationMethods?.find(m => m.id === state.settings?.calculationMethod)?.name ||
              state.settings?.calculationMethod}
          </Text>
        </View>

        <PrayerGrid
          prayerTimes={state.prayerTimes}
          currentPrayer={state.currentPrayer}
          nextPrayer={state.nextPrayer}
          formatTime={formatTime}
          onPrayerPress={handlePrayerTrack}
          prayerNames={PRAYER_NAMES_WITH_ICONS}
        />

        {/* Sunrise & Sunset */}
        {state.settings.showSunriseSunset && (state.prayerTimes.sunrise || state.prayerTimes.sunset) && (
          <Card style={styles.sunCard}>
            <Card.Content>
              <View style={styles.sunTimesContainer}>
                {state.prayerTimes.sunrise && (
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
                        {formatTime(state.prayerTimes.sunrise)}
                      </Text>
                    </View>
                  </View>
                )}

                {state.prayerTimes.sunrise && state.prayerTimes.sunset && (
                  <Divider style={{ width: 1, height: '100%' }} />
                )}

                {state.prayerTimes.sunset && (
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
                        {formatTime(state.prayerTimes.sunset)}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Quick Actions */}
        {state.location && state.prayerTimes && (
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
                  icon="account-clock-outline"
                  onPress={() => {
                    navigation.navigate('Qada' as never);
                  }}
                  style={styles.quickActionButton}
                  contentStyle={styles.quickActionButtonContent}
                >
                  Qada Prayers
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}

      </ScrollView>

      {/* Prayer Tracking Modal */}
      <Portal>
        <Modal
          visible={trackingModalVisible}
          onDismiss={() => setTrackingModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          {selectedPrayer && (
            <View style={styles.modalContent}>
              {/* Header with Prayer Icon */}
              <View style={styles.modalHeader}>
                <View style={[
                  styles.modalPrayerIcon,
                  { backgroundColor: PRAYER_NAMES_WITH_ICONS[selectedPrayer.name].color + '20' }
                ]}>
                  <MaterialCommunityIcons
                    name={PRAYER_NAMES_WITH_ICONS[selectedPrayer.name].icon as any}
                    size={32}
                    color={PRAYER_NAMES_WITH_ICONS[selectedPrayer.name].color}
                  />
                </View>
                <View style={styles.modalHeaderContent}>
                   <Text 
                     variant="headlineMedium" 
                     style={[
                       styles.modalTitle,
                       { fontSize: isSmallScreen ? 18 : isMediumScreen ? 20 : 22 }
                     ]}
                   >
                     {PRAYER_NAMES_WITH_ICONS[selectedPrayer.name].english}
                   </Text>
                   <Text 
                     variant="bodyMedium" 
                     style={[
                       styles.modalSubtitle,
                       { fontSize: isSmallScreen ? 13 : isMediumScreen ? 14 : 15 }
                     ]}
                   >
                     {PRAYER_NAMES_WITH_ICONS[selectedPrayer.name].arabic}
                   </Text>
                </View>
              </View>

              {/* Prayer Time Card */}
              <Card style={styles.timeCard}>
                <Card.Content style={styles.timeCardContent}>
                  <View style={styles.timeInfo}>
                    <MaterialCommunityIcons 
                      name="clock-outline" 
                      size={20} 
                      color={theme.colors.primary} 
                    />
                     <Text 
                       variant="bodyLarge" 
                       style={[
                         styles.timeText,
                         { fontSize: isSmallScreen ? 16 : isMediumScreen ? 18 : 20 }
                       ]}
                     >
                       {formatTime(selectedPrayer.time)}
                     </Text>
                  </View>
                  <View style={[
                    styles.statusIndicator,
                    { 
                      backgroundColor: selectedPrayer.status === PrayerStatus.COMPLETED ? '#4CAF50' :
                                       selectedPrayer.status === PrayerStatus.DELAYED ? '#FF9800' :
                                       selectedPrayer.status === PrayerStatus.MISSED ? '#F44336' :
                                       theme.colors.outline 
                    }
                  ]}>
                     <Text 
                       variant="labelSmall" 
                       style={[
                         styles.statusText,
                         { fontSize: isSmallScreen ? 10 : isMediumScreen ? 11 : 12 }
                       ]}
                     >
                       {selectedPrayer.status === PrayerStatus.COMPLETED ? 'Completed' :
                        selectedPrayer.status === PrayerStatus.DELAYED ? 'Delayed' :
                        selectedPrayer.status === PrayerStatus.MISSED ? 'Missed' : 'Pending'}
                     </Text>
                  </View>
                </Card.Content>
              </Card>

               {/* Status Selection */}
               <Text 
                 variant="titleMedium" 
                 style={[
                   styles.selectionTitle,
                   { fontSize: isSmallScreen ? 16 : isMediumScreen ? 18 : 19 }
                 ]}
               >
                 Update Prayer Status
               </Text>
              
              <View style={styles.statusGrid}>
                <TouchableOpacity
                  style={[styles.statusCard, styles.completedCard]}
                  onPress={() => handleUpdatePrayerStatus(PrayerStatus.COMPLETED)}
                  activeOpacity={0.8}
                >
                  <View style={styles.statusCardIcon}>
                    <MaterialCommunityIcons name="check-circle" size={28} color="#4CAF50" />
                  </View>
                   <Text 
                     variant="titleMedium" 
                     style={[
                       styles.statusCardTitle,
                       { fontSize: isSmallScreen ? 14 : isMediumScreen ? 16 : 17 }
                     ]}
                   >
                     Completed
                   </Text>
                   <Text 
                     variant="bodySmall" 
                     style={[
                       styles.statusCardDescription,
                       { fontSize: isSmallScreen ? 11 : isMediumScreen ? 12 : 13 }
                     ]}
                   >
                     Prayer performed on time
                   </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.statusCard, styles.delayedCard]}
                  onPress={() => handleUpdatePrayerStatus(PrayerStatus.DELAYED)}
                  activeOpacity={0.8}
                >
                  <View style={styles.statusCardIcon}>
                    <MaterialCommunityIcons name="clock" size={28} color="#FF9800" />
                  </View>
                   <Text 
                     variant="titleMedium" 
                     style={[
                       styles.statusCardTitle,
                       { fontSize: isSmallScreen ? 14 : isMediumScreen ? 16 : 17 }
                     ]}
                   >
                     Delayed
                   </Text>
                   <Text 
                     variant="bodySmall" 
                     style={[
                       styles.statusCardDescription,
                       { fontSize: isSmallScreen ? 11 : isMediumScreen ? 12 : 13 }
                     ]}
                   >
                     Prayer performed late
                   </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.statusCard, styles.missedCard]}
                  onPress={() => handleUpdatePrayerStatus(PrayerStatus.MISSED)}
                  activeOpacity={0.8}
                >
                  <View style={styles.statusCardIcon}>
                    <MaterialCommunityIcons name="close-circle" size={28} color="#F44336" />
                  </View>
                   <Text 
                     variant="titleMedium" 
                     style={[
                       styles.statusCardTitle,
                       { fontSize: isSmallScreen ? 14 : isMediumScreen ? 16 : 17 }
                     ]}
                   >
                     Missed
                   </Text>
                   <Text 
                     variant="bodySmall" 
                     style={[
                       styles.statusCardDescription,
                       { fontSize: isSmallScreen ? 11 : isMediumScreen ? 12 : 13 }
                     ]}
                   >
                     Prayer not performed
                   </Text>
                </TouchableOpacity>
              </View>

              {/* Cancel Button */}
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setTrackingModalVisible(false)}
                activeOpacity={0.7}
              >
                 <Text 
                   variant="bodyMedium" 
                   style={[
                     styles.cancelButtonText,
                     { fontSize: isSmallScreen ? 14 : isMediumScreen ? 16 : 17 }
                   ]}
                 >
                   Cancel
                 </Text>
              </TouchableOpacity>
            </View>
          )}
        </Modal>
      </Portal>
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
  sectionHeader: {
    marginBottom: 16,
    paddingHorizontal: 4,
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
   modalContainer: {
     marginHorizontal: '4%',
     marginVertical: 20,
     maxWidth: 500,
     alignSelf: 'center',
     width: '92%',
     borderRadius: 24,
     padding: 0,
     overflow: 'hidden',
   },
  modalContent: {
   backgroundColor: 'white',
   borderRadius: 24,
   overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
    backgroundColor: '#F8F9FA',
  },
  modalPrayerIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  modalHeaderContent: {
    flex: 1,
  },
   modalTitle: {
     fontWeight: '700',
     color: '#1C1C1E',
     marginBottom: 2,
     fontSize: 20,
   },
   modalSubtitle: {
     color: '#6B7280',
     fontSize: 14,
   },
  timeCard: {
   marginHorizontal: 24,
   marginBottom: 20,
   borderRadius: 16,
   elevation: 2,
   shadowColor: '#000',
   shadowOffset: { width: 0, height: 2 },
   shadowOpacity: 0.1,
   shadowRadius: 4,
  },
  timeCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  selectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginHorizontal: 24,
    marginBottom: 16,
  },
   statusGrid: {
     flexDirection: 'row',
     paddingHorizontal: 24,
     gap: 10,
     marginBottom: 24,
   },
   statusCard: {
     flex: 1,
     backgroundColor: '#F8F9FA',
     borderRadius: 16,
     padding: 10,
     alignItems: 'center',
     minHeight: 100,
   },
  completedCard: {
   backgroundColor: '#F0FDF4',
   borderWidth: 2,
   borderColor: '#4CAF50',
  },
  delayedCard: {
   backgroundColor: '#FFFBEB',
   borderWidth: 2,
   borderColor: '#FF9800',
  },
  missedCard: {
   backgroundColor: '#FEF2F2',
   borderWidth: 2,
   borderColor: '#F44336',
  },
   statusCardIcon: {
     width: 44,
     height: 44,
     borderRadius: 12,
     backgroundColor: 'white',
     alignItems: 'center',
     justifyContent: 'center',
     marginBottom: 6,
     shadowColor: '#000',
     shadowOffset: { width: 0, height: 1 },
     shadowOpacity: 0.1,
     shadowRadius: 2,
     elevation: 2,
   },
  statusCardTitle: {
   fontSize: 16,
   fontWeight: '600',
   color: '#1C1C1E',
   marginBottom: 4,
  },
  statusCardDescription: {
   fontSize: 12,
   color: '#6B7280',
   textAlign: 'center',
   lineHeight: 16,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginHorizontal: 24,
    marginTop: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
});
