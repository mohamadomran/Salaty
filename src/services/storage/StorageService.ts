/**
 * Storage Service
 * Wrapper around AsyncStorage for type-safe operations
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
export const STORAGE_KEYS = {
  CALCULATION_METHOD: '@salaty:calculation_method',
  PRAYER_TRACKING: '@salaty:prayer_tracking',
  CUSTOM_PRAYERS: '@salaty:custom_prayers',
  USER_LOCATION: '@salaty:user_location',
  SETTINGS: '@salaty:settings',
  STATISTICS: '@salaty:statistics',
  LAST_SYNC: '@salaty:last_sync',
} as const;

class StorageService {
  /**
   * Set item in storage
   */
  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Error setting item ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get item from storage
   */
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove item from storage
   */
  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item ${key}:`, error);
      throw error;
    }
  }

  /**
   * Clear all storage (use with caution)
   */
  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }

  /**
   * Get multiple items
   */
  async multiGet(keys: string[]): Promise<Record<string, any>> {
    try {
      const pairs = await AsyncStorage.multiGet(keys);
      const result: Record<string, any> = {};

      pairs.forEach(([key, value]) => {
        if (value !== null) {
          try {
            result[key] = JSON.parse(value);
          } catch {
            result[key] = value;
          }
        }
      });

      return result;
    } catch (error) {
      console.error('Error getting multiple items:', error);
      return {};
    }
  }

  /**
   * Set multiple items
   */
  async multiSet(keyValuePairs: Array<[string, any]>): Promise<void> {
    try {
      const pairs: Array<[string, string]> = keyValuePairs.map(([key, value]) => [
        key,
        JSON.stringify(value),
      ]);
      await AsyncStorage.multiSet(pairs);
    } catch (error) {
      console.error('Error setting multiple items:', error);
      throw error;
    }
  }

  /**
   * Get all keys
   */
  async getAllKeys(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return [...keys]; // Convert readonly array to mutable
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  }

  /**
   * Merge item (for objects)
   */
  async mergeItem(key: string, value: object): Promise<void> {
    try {
      await AsyncStorage.mergeItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error merging item ${key}:`, error);
      throw error;
    }
  }

  /**
   * Batch update settings for better performance
   */
  async batchUpdateSettings(updates: Record<string, any>): Promise<void> {
    try {
      const keyValuePairs: Array<[string, any]> = Object.entries(updates).map(([key, value]) => [
        key,
        value,
      ]);
      await this.multiSet(keyValuePairs);
    } catch (error) {
      console.error('Error batch updating settings:', error);
      throw error;
    }
  }

  /**
   * Batch remove multiple keys
   */
  async batchRemove(keys: string[]): Promise<void> {
    try {
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('Error batch removing keys:', error);
      throw error;
    }
  }
}

export default new StorageService();
