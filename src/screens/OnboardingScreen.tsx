/**
 * Onboarding Screen
 * First-time setup: Location + Calculation Method selection
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
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

interface OnboardingScreenProps {
  onComplete: () => void;
}

type OnboardingStep = 'welcome' | 'location' | 'method' | 'complete';

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const theme = useTheme<ExpressiveTheme>();
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [selectedMethod, setSelectedMethod] = useState<string>('UmmAlQura');
  const [saving, setSaving] = useState(false);

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

  // Welcome Screen
  if (step === 'welcome') {
    return (
      <SafeAreaView
        edges={['top', 'left', 'right']}
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.welcomeHeader}>
            <MaterialCommunityIcons
              name="mosque"
              size={80}
              color={theme.colors.primary}
            />
            <Text variant="headlineLarge" style={[styles.title, { marginTop: 24 }]}>
              Welcome to Salaty
            </Text>
            <Text
              variant="bodyLarge"
              style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
            >
              Your companion for accurate prayer times
            </Text>
          </View>

          <View style={styles.featuresContainer}>
            <View style={styles.feature}>
              <MaterialCommunityIcons
                name="map-marker-check"
                size={32}
                color={theme.colors.primary}
              />
              <Text variant="titleMedium" style={styles.featureTitle}>
                Accurate Times
              </Text>
              <Text
                variant="bodyMedium"
                style={[styles.featureText, { color: theme.colors.onSurfaceVariant }]}
              >
                Get precise prayer times based on your location
              </Text>
            </View>

            <View style={styles.feature}>
              <MaterialCommunityIcons
                name="cog"
                size={32}
                color={theme.colors.primary}
              />
              <Text variant="titleMedium" style={styles.featureTitle}>
                Customizable
              </Text>
              <Text
                variant="bodyMedium"
                style={[styles.featureText, { color: theme.colors.onSurfaceVariant }]}
              >
                Choose your preferred calculation method
              </Text>
            </View>

            <View style={styles.feature}>
              <MaterialCommunityIcons
                name="moon-waning-crescent"
                size={32}
                color={theme.colors.primary}
              />
              <Text variant="titleMedium" style={styles.featureTitle}>
                Islamic Calendar
              </Text>
              <Text
                variant="bodyMedium"
                style={[styles.featureText, { color: theme.colors.onSurfaceVariant }]}
              >
                Stay connected with Hijri dates
              </Text>
            </View>
          </View>

          <Button
            mode="contained"
            onPress={() => setStep('location')}
            style={styles.primaryButton}
            contentStyle={styles.buttonContent}
          >
            Get Started
          </Button>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Location Setup
  if (step === 'location') {
    return (
      <LocationSetupScreen
        onComplete={() => setStep('method')}
      />
    );
  }

  // Method Selection
  if (step === 'method') {
    return (
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
              Select the method used to calculate prayer times. You can change this later in settings.
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

            {calculationMethods?.map((method) => {
              const isSelected = selectedMethod === method.id;
              return (
                <Card key={method.id} style={styles.methodCard}>
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
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  welcomeHeader: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 48,
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 16,
  },
  featuresContainer: {
    marginBottom: 48,
  },
  feature: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 32,
  },
  featureTitle: {
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  featureText: {
    textAlign: 'center',
  },
  primaryButton: {
    borderRadius: 12,
    marginTop: 16,
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
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    flex: 1,
    borderRadius: 12,
  },
  continueButton: {
    flex: 2,
    borderRadius: 12,
  },
});
