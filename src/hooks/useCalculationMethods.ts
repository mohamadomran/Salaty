/**
 * useCalculationMethods Hook
 * Fetches prayer calculation methods from AlAdhan API with caching
 */

import { useQuery } from '@tanstack/react-query';
import { AlAdhanService } from '../services/api';
import type { CalculationMethodInfo } from '../types';

export interface UseCalculationMethodsResult {
  methods: CalculationMethodInfo[] | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  isFetching: boolean;
}

/**
 * Fetch and cache prayer calculation methods
 *
 * Features:
 * - 7-day cache (staleTime configured in queryClient)
 * - Offline support via AsyncStorage persistence
 * - Background refresh on mount
 * - Manual refresh capability
 * - Cache-first strategy: shows cached data immediately
 *
 * @returns Calculation methods with loading and error states
 *
 * @example
 * ```tsx
 * const { methods, isLoading, error, refetch, isFetching } = useCalculationMethods();
 *
 * if (isLoading) return <LoadingSkeleton />;
 * if (error) return <ErrorView onRetry={refetch} />;
 *
 * return methods?.map(method => (
 *   <MethodCard key={method.id} method={method} />
 * ));
 * ```
 */
export function useCalculationMethods(): UseCalculationMethodsResult {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['calculationMethods'],
    queryFn: () => AlAdhanService.getCalculationMethods(),
    // staleTime is configured globally in queryClient (7 days)
    // This means the data is considered fresh for 7 days
    retry: 2, // Retry twice on failure
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    methods: data,
    isLoading,
    error: error as Error | null,
    refetch,
    isFetching, // True when refetching in background
  };
}
