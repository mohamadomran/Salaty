/**
 * SettingsSearchBar Component
 * Search/filter bar for settings options (e.g., calculation methods)
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { Searchbar } from 'react-native-paper';

interface SettingsSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export const SettingsSearchBar: React.FC<SettingsSearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search...',
}) => {
  return (
    <Searchbar
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      style={styles.searchBar}
      inputStyle={styles.searchInput}
      elevation={0}
    />
  );
};

const styles = StyleSheet.create({
  searchBar: {
    marginBottom: 12,
    borderRadius: 12,
  },
  searchInput: {
    minHeight: 0,
  },
});
