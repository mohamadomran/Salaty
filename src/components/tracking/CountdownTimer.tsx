/**
 * Countdown Timer Component
 * Displays real-time countdown to next prayer
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type { ExpressiveTheme } from '../../theme';

interface CountdownTimerProps {
  nextPrayer: {
    name: string;
    time: Date;
  } | null;
  theme: ExpressiveTheme;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = React.memo(({ 
  nextPrayer
}) => {
  const [countdown, setCountdown] = useState<string>('');

  const updateCountdown = useCallback(() => {
    if (!nextPrayer) return;

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
  }, [nextPrayer]);

  useEffect(() => {
    if (!nextPrayer) return;

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [nextPrayer, updateCountdown]);

  if (!nextPrayer) return null;

  return (
    <View style={styles.countdownContainer}>
      <MaterialCommunityIcons
        name="clock-outline"
        size={20}
        color="#FFFFFF"
      />
      <Text
        variant="titleMedium"
        style={[
          styles.countdown,
          { color: '#FFFFFF' }
        ]}
      >
        {countdown}
      </Text>
    </View>
  );
});

CountdownTimer.displayName = 'CountdownTimer';

const styles = StyleSheet.create({
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  countdown: {
    fontWeight: '600',
  },
});