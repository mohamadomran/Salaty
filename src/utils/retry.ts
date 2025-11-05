/**
 * Retry Utility
 * Provides robust retry mechanisms for API calls and async operations
 */

import { NetworkService } from '../services/network';

export interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  exponentialBackoff?: boolean;
  maxDelay?: number;
  retryCondition?: (error: any) => boolean;
  onRetry?: (attempt: number, error: any) => void;
  shouldRetryOnNetworkError?: boolean;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  retryDelay: 1000,
  exponentialBackoff: true,
  maxDelay: 30000,
  retryCondition: () => true,
  onRetry: () => {},
  shouldRetryOnNetworkError: true,
};

/**
 * Sleep utility for delays
 */
const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Calculate delay with exponential backoff
 */
const calculateDelay = (
  attempt: number,
  baseDelay: number,
  exponentialBackoff: boolean,
  maxDelay: number,
): number => {
  if (!exponentialBackoff) {
    return baseDelay;
  }

  // Exponential backoff with jitter
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  const jitter = Math.random() * 0.1 * exponentialDelay; // 10% jitter
  const delay = exponentialDelay + jitter;

  return Math.min(delay, maxDelay);
};

/**
 * Check if error is a network error
 */
const isNetworkError = (error: any): boolean => {
  if (!error) return false;

  // Common network error patterns
  const networkErrorPatterns = [
    'network request failed',
    'network error',
    'timeout',
    'connection refused',
    'unable to resolve host',
    'no internet connection',
    'offline',
  ];

  const errorMessage = error.message?.toLowerCase() || '';
  const errorString = error.toString().toLowerCase();

  return networkErrorPatterns.some(
    pattern => errorMessage.includes(pattern) || errorString.includes(pattern),
  );
};

/**
 * Check if error should be retried
 */
const shouldRetry = (
  error: any,
  attempt: number,
  maxRetries: number,
  retryCondition: (error: any) => boolean,
  shouldRetryOnNetworkError: boolean,
): boolean => {
  if (attempt >= maxRetries) return false;

  // Check custom retry condition
  if (!retryCondition(error)) return false;

  // Check for network errors
  if (shouldRetryOnNetworkError && isNetworkError(error)) {
    return true;
  }

  // Check for HTTP status codes that should be retried
  if (error.status || error.response?.status) {
    const status = error.status || error.response?.status;
    const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
    return retryableStatusCodes.includes(status);
  }

  return true;
};

/**
 * Retry function with comprehensive error handling
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      const result = await fn();
      return result;
    } catch (error) {
      lastError = error as Error;

      // Check if we should retry
      if (
        !shouldRetry(
          error,
          attempt,
          opts.maxRetries,
          opts.retryCondition,
          opts.shouldRetryOnNetworkError,
        )
      ) {
        throw lastError;
      }

      // If this is the last attempt, throw the error
      if (attempt === opts.maxRetries) {
        throw lastError;
      }

      // Calculate delay
      const delay = calculateDelay(
        attempt,
        opts.retryDelay,
        opts.exponentialBackoff,
        opts.maxDelay,
      );

      // Call onRetry callback
      try {
        opts.onRetry(attempt + 1, error);
      } catch (callbackError) {
        console.warn('Error in retry callback:', callbackError);
      }

      // Wait before retrying
      await sleep(delay);
    }
  }

  throw lastError!;
}

/**
 * Retry with result object containing metadata
 */
export async function retryWithResult<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<RetryResult<T>> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      const result = await fn();
      return {
        success: true,
        data: result,
        attempts: attempt + 1,
      };
    } catch (error) {
      lastError = error as Error;

      // Check if we should retry
      if (
        !shouldRetry(
          error,
          attempt,
          opts.maxRetries,
          opts.retryCondition,
          opts.shouldRetryOnNetworkError,
        )
      ) {
        return {
          success: false,
          error: lastError,
          attempts: attempt + 1,
        };
      }

      // If this is the last attempt, return failure
      if (attempt === opts.maxRetries) {
        return {
          success: false,
          error: lastError,
          attempts: attempt + 1,
        };
      }

      // Calculate delay
      const delay = calculateDelay(
        attempt,
        opts.retryDelay,
        opts.exponentialBackoff,
        opts.maxDelay,
      );

      // Call onRetry callback
      try {
        opts.onRetry(attempt + 1, error);
      } catch (callbackError) {
        console.warn('Error in retry callback:', callbackError);
      }

      // Wait before retrying
      await sleep(delay);
    }
  }

  return {
    success: false,
    error: lastError!,
    attempts: opts.maxRetries + 1,
  };
}

/**
 * Retry with network awareness
 */
export async function networkAwareRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  // If online, use normal retry
  if (NetworkService.isOnline()) {
    return retry(fn, options);
  }

  // If offline, queue the operation
  return NetworkService.addToRetryQueue(fn);
}

/**
 * Create a retryable function wrapper
 */
export function createRetryable<T>(
  fn: () => Promise<T>,
  defaultOptions: RetryOptions = {},
): (options?: RetryOptions) => Promise<T> {
  return (options?: RetryOptions) => {
    const mergedOptions = { ...defaultOptions, ...options };
    return retry(fn, mergedOptions);
  };
}

/**
 * Batch retry for multiple functions
 */
export async function batchRetry<T>(
  functions: Array<() => Promise<T>>,
  options: RetryOptions = {},
): Promise<Array<RetryResult<T>>> {
  const results: Array<RetryResult<T>> = [];

  for (const fn of functions) {
    try {
      const result = await retryWithResult(fn, options);
      results.push(result);
    } catch (error) {
      results.push({
        success: false,
        error: error as Error,
        attempts: 1,
      });
    }
  }

  return results;
}

/**
 * Retry with timeout
 */
export async function retryWithTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  options: RetryOptions = {},
): Promise<T> {
  return Promise.race([
    retry(fn, options),
    new Promise<never>((_, reject) => {
      setTimeout(
        () => reject(new Error(`Operation timed out after ${timeoutMs}ms`)),
        timeoutMs,
      );
    }),
  ]);
}

/**
 * Common retry configurations
 */
export const RETRY_CONFIGS = {
  // For critical operations (prayer time calculations)
  CRITICAL: {
    maxRetries: 5,
    retryDelay: 2000,
    exponentialBackoff: true,
    maxDelay: 10000,
    shouldRetryOnNetworkError: true,
  },

  // For user interactions (tracking updates)
  USER_INTERACTION: {
    maxRetries: 2,
    retryDelay: 500,
    exponentialBackoff: false,
    shouldRetryOnNetworkError: true,
  },

  // For background operations (sync, backup)
  BACKGROUND: {
    maxRetries: 3,
    retryDelay: 5000,
    exponentialBackoff: true,
    maxDelay: 60000,
    shouldRetryOnNetworkError: true,
  },

  // For quick operations (settings, cache)
  QUICK: {
    maxRetries: 1,
    retryDelay: 200,
    exponentialBackoff: false,
    shouldRetryOnNetworkError: false,
  },
};
