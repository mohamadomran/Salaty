/**
 * Sunnah Checkbox Component
 * Simpler checkbox for tracking sunnah/voluntary prayers
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Checkbox, useTheme } from 'react-native-paper';

interface SunnahCheckboxProps {
  label: string; // e.g., "2 Sunnah before", "2 Sunnah after"
  completed: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function SunnahCheckbox({
  label,
  completed,
  onToggle,
  disabled = false,
}: SunnahCheckboxProps) {
  const theme = useTheme();

  return (
    <TouchableOpacity
      testID={`sunnah-checkbox-${label.toLowerCase().replace(/\s+/g, '-')}`}
      style={[styles.container, disabled && styles.disabled]}
      onPress={onToggle}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Checkbox.Android
        status={completed ? 'checked' : 'unchecked'}
        onPress={onToggle}
        disabled={disabled}
        color={theme.colors.primary}
      />
      <Text
        variant="bodyMedium"
        style={[
          styles.label,
          { color: completed ? theme.colors.onSurfaceVariant : theme.colors.onSurface },
          completed && styles.completedText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginLeft: 40, // Indent to show it's subordinate to main prayer
  },
  disabled: {
    opacity: 0.6,
  },
  label: {
    marginLeft: 8,
    flex: 1,
  },
  completedText: {
    textDecorationLine: 'line-through',
  },
});
