/**
 * TanStack Query Client Configuration
 * Sets up QueryClient with AsyncStorage persistence for offline support
 */

import { QueryClient } from '@tanstack/react-query';
import type { Persister, PersistedClient } from '@tanstack/react-query-persist-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@salaty:react-query-cache';

/**
 * Create a custom persister for AsyncStorage
 * Implements the Persister interface for TanStack Query persistence
 */
export const asyncStoragePersister: Persister = {
  persistClient: async (client: PersistedClient) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(client));
  },
  restoreClient: async () => {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : undefined;
  },
  removeClient: async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
  },
};

// Configure QueryClient with optimal settings for mobile
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache-first strategy: show cached data immediately
      staleTime: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      gcTime: 30 * 24 * 60 * 60 * 1000, // Keep cache for 30 days (gcTime replaces cacheTime)

      // Retry configuration for network failures
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Refetch strategy - conservative to save data/battery
      refetchOnMount: true, // Check if data is stale on mount
      refetchOnWindowFocus: false, // Don't refetch on app focus (mobile)
      refetchOnReconnect: true, // Refetch when network reconnects
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
    },
  },
});
