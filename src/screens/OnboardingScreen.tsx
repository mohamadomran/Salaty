/**
 * Onboarding Screen without Animations
 * First-time setup: Location + Calculation Method selection
 */

import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, FlatList, Dimensions, ViewToken } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  Button,
  Card,
  List,
  ActivityIndicator,
  useTheme,
} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SettingsService } from '../services';
import { useCalculationMethods } from '../hooks/useCalculationMethods';
import LocationSetupScreen from './LocationSetupScreen';
import type { CalculationMethod } from '../types';
import type { ExpressiveTheme } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingScreenProps {
  onComplete: () => void;
}

type OnboardingStep = 'welcome' | 'location' | 'method' | 'complete';

interface WelcomeSlide {
  id: string;
  icon: string;
  title: string;
  description: string;
}

const WELCOME_SLIDES: WelcomeSlide[] = [
  {
    id: '1',
    icon: 'mosque',
    title: 'Prayer Times',
    description: 'Get accurate prayer times for your location based on trusted calculation methods',
  },
  {
    id: '2',
    icon: 'map-marker',
    title: 'Location Based',
    description: 'Automatically detects your location or search for any city worldwide',
  },
  {
    id: '3',
    icon: 'cog',
    title: 'Customizable',
    description: 'Choose your preferred calculation method and adjust settings',
  },
  {
    id: '4',
    icon: 'moon-waning-crescent',
    title: 'Islamic Calendar',
    description: 'Stay connected with Hijri dates and Islamic events',
  },
];

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const theme = useTheme<ExpressiveTheme>();
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [selectedMethod, setSelectedMethod] = useState<string>('UmmAlQura');
  const [saving, setSaving] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const flatListRef = useRef<FlatList>(null);

  const { methods: calculationMethods, isLoading: methodsLoading } = useCalculationMethods();

  // Format method params for display
  const formatMethodParams = (params: Record<string, any>): string => {
    const parts: string[] = [];
    if (params.Fajr) parts.push(`Fajr: ${params.Fajr}°`);
    if (params.Isha) {
      if (typeof params.Isha === 'string') {
        parts.push(`Isha: ${params.Isha}`);
      } else {
        parts.push(`Isha: ${params.Isha}°`);
      }
    }
    return parts.join(', ') || 'Custom parameters';
  };

  // Handle method selection and completion
  const handleComplete = async () => {
    setSaving(true);
    try {
      // Save selected calculation method
      await SettingsService.setCalculationMethod(selectedMethod as CalculationMethod);

      // Mark onboarding as complete
      await SettingsService.completeOnboarding();

      onComplete();
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleNext = () => {
    if (currentSlideIndex < WELCOME_SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentSlideIndex + 1,
        animated: true,
      });
    } else {
      setStep('location');
    }
  };

  const handleSkip = () => {
    setStep('location');
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentSlideIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  // Welcome Slide Component
  const renderWelcomeSlide = ({ item, index }: { item: WelcomeSlide; index: number }) => {
    return (
      <View style={[styles.slideContainer, { width: SCREEN_WIDTH }]}>
        <View style={styles.slideContent}>
          <View>
            <MaterialCommunityIcons
              name={item.icon as any}
              size={100}
              color={theme.colors.primary}
            />
          </View>
          <Text
            variant="headlineMedium"
            style={[styles.slideTitle, { color: theme.colors.onSurface }]}
          >
            {item.title}
          </Text>
          <Text
            variant="bodyLarge"
            style={[styles.slideDescription, { color: theme.colors.onSurfaceVariant }]}
          >
            {item.description}
          </Text>
        </View>
      </View>
    );
  };

  // Pagination Dots
  const PaginationDots = () => {
    return (
      <View style={styles.paginationContainer}>
        {WELCOME_SLIDES.map((_, index) => {
          const isActive = index === currentSlideIndex;
          return (
            <View
              key={index}
              style={[
                styles.dot,
                { 
                  backgroundColor: theme.colors.primary,
                  width: isActive ? 24 : 8,
                  opacity: isActive ? 1 : 0.3,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  // Welcome Screen with Swipeable Slides
  if (step === 'welcome') {
    return (
      <SafeAreaView
        edges={['top', 'left', 'right']}
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.welcomeContainer}>
          <FlatList
            ref={flatListRef}
            data={WELCOME_SLIDES}
            renderItem={renderWelcomeSlide}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            bounces={false}
            keyExtractor={(item) => item.id}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            scrollEventThrottle={16}
          />

          <PaginationDots />

          <View style={styles.buttonContainer}>
            {currentSlideIndex < WELCOME_SLIDES.length - 1 ? (
              <View style={styles.navigationButtons}>
                <Button
                  mode="text"
                  onPress={handleSkip}
                  textColor={theme.colors.primary}
                >
                  Skip
                </Button>
                <Button
                  mode="contained"
                  onPress={handleNext}
                  style={styles.nextButton}
                  contentStyle={styles.buttonContent}
                >
                  Next
                </Button>
              </View>
            ) : (
              <Button
                mode="contained"
                onPress={handleNext}
                style={styles.primaryButton}
                contentStyle={styles.buttonContent}
              >
                Get Started
              </Button>
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Location Setup
  if (step === 'location') {
    return (
      <View style={{ flex: 1 }}>
        <LocationSetupScreen
          onComplete={() => setStep('method')}
        />
      </View>
    );
  }

  // Method Selection
  if (step === 'method') {
    return (
      <View style={{ flex: 1 }}>
        <SafeAreaView
          edges={['top', 'left', 'right']}
          style={[styles.container, { backgroundColor: theme.colors.background }]}
        >
          <View style={styles.methodContainer}>
            {/* Header */}
            <View style={styles.methodHeader}>
              <Text variant="headlineMedium" style={styles.methodTitle}>
                Choose Calculation Method
              </Text>
              <Text
                variant="bodyMedium"
                style={[styles.methodSubtitle, { color: theme.colors.onSurfaceVariant }]}
              >
                Select method used to calculate prayer times. You can change this later in settings.
              </Text>
            </View>

            {/* Methods List */}
            <ScrollView style={styles.methodsList}>
              {methodsLoading && !calculationMethods && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" />
                  <Text style={{ marginTop: 16 }}>Loading methods...</Text>
                </View>
              )}

              {calculationMethods?.map((method, index) => {
                const isSelected = selectedMethod === method.id;
                return (
                  <View key={method.id}>
                    <Card style={styles.methodCard}>
                      <List.Item
                        title={method.name}
                        description={formatMethodParams(method.params)}
                        left={props => (
                          <List.Icon
                            {...props}
                            icon={isSelected ? 'radiobox-marked' : 'radiobox-blank'}
                            color={isSelected ? theme.colors.primary : undefined}
                          />
                        )}
                        onPress={() => setSelectedMethod(method.id)}
                        style={[
                          isSelected && {
                            backgroundColor: theme.colors.primaryContainer,
                          },
                        ]}
                        titleStyle={
                          isSelected
                            ? { color: theme.colors.primary, fontWeight: '600' }
                            : undefined
                        }
                      />
                    </Card>
                  </View>
                );
              })}
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.methodActions}>
              <Button
                mode="outlined"
                onPress={() => setStep('location')}
                style={styles.backButton}
                disabled={saving}
              >
                Back
              </Button>
              <Button
                mode="contained"
                onPress={handleComplete}
                style={styles.continueButton}
                loading={saving}
                disabled={saving || !selectedMethod}
              >
                Complete Setup
              </Button>
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  welcomeContainer: {
    flex: 1,
  },
  slideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  slideContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideTitle: {
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 16,
  },
  slideDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextButton: {
    borderRadius: 12,
    minWidth: 120,
  },
  primaryButton: {
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  methodContainer: {
    flex: 1,
  },
  methodHeader: {
    padding: 24,
    paddingBottom: 16,
  },
  methodTitle: {
    fontWeight: '700',
    marginBottom: 8,
  },
  methodSubtitle: {
    lineHeight: 22,
  },
  methodsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  methodCard: {
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 48,
  },
  methodActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  backButton: {
    borderRadius: 12,
    flex: 1,
  },
  continueButton: {
    borderRadius: 12,
    flex: 1,
  },
});