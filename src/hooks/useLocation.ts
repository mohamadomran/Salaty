/**
 * useLocation Hook
 * React hook for accessing location data
 */

import { useState, useEffect, useCallback } from 'react';
import { LocationService } from '../services/location';
import type { LocationData, LocationPermissionStatus } from '../types';

interface UseLocationResult {
  location: LocationData | null;
  loading: boolean;
  error: string | null;
  permission: LocationPermissionStatus | null;
  refetch: () => Promise<void>;
  requestPermission: () => Promise<LocationPermissionStatus | null>;
}

export function useLocation(autoFetch = true): UseLocationResult {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permission, setPermission] = useState<LocationPermissionStatus | null>(
    null,
  );

  // Check permission
  const checkPermission = useCallback(async () => {
    try {
      const result = await LocationService.checkPermission();
      setPermission(result);
      return result;
    } catch (err) {
      console.error('Permission check error:', err);
      setError('Failed to check location permission');
      return null;
    }
  }, []);

  // Request permission
  const requestPermission = useCallback(async () => {
    try {
      setLoading(true);
      const result = await LocationService.requestPermission();
      setPermission(result);

      if (result && result.granted) {
        // Auto-fetch location after permission granted
        await fetchLocation();
      } else {
        setError('Location permission denied');
      }

      return result;
    } catch (err) {
      console.error('Permission request error:', err);
      setError('Failed to request location permission');
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchLocation]);

  // Fetch location
  const fetchLocation = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      const loc = await LocationService.getCurrentLocation(forceRefresh);
      setLocation(loc);
    } catch (err: any) {
      console.error('Location fetch error:', err);
      setError(err.message || 'Failed to get location');
    } finally {
      setLoading(false);
    }
  }, []);

  // Refetch location
  const refetch = useCallback(async () => {
    await fetchLocation(true);
  }, [fetchLocation]);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      const init = async () => {
        const perm = await checkPermission();
        if (perm?.granted) {
          await fetchLocation();
        }
      };
      init();
    }
  }, [autoFetch, checkPermission, fetchLocation]);

  return {
    location,
    loading,
    error,
    permission,
    refetch,
    requestPermission,
  };
}
