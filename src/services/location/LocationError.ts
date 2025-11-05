/**
 * Location Error Types
 * Custom error class for location-related errors
 */

export class LocationError extends Error {
  public readonly code: string;
  public readonly canRetry: boolean;
  public readonly originalError?: Error;

  constructor(
    message: string,
    code: string,
    canRetry: boolean = true,
    originalError?: Error,
  ) {
    super(message);
    this.name = 'LocationError';
    this.code = code;
    this.canRetry = canRetry;
    this.originalError = originalError;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, LocationError);
    }
  }

  /**
   * Check if error is permission related
   */
  public isPermissionError(): boolean {
    return this.code === 'PERMISSION_DENIED';
  }

  /**
   * Check if error is timeout related
   */
  public isTimeoutError(): boolean {
    return this.code === 'TIMEOUT';
  }

  /**
   * Check if error is network related
   */
  public isNetworkError(): boolean {
    return this.code === 'NETWORK_ERROR';
  }

  /**
   * Check if error can be retried
   */
  public isRetryable(): boolean {
    return this.canRetry && !this.isPermissionError();
  }

  /**
   * Get user-friendly error message
   */
  public getUserMessage(): string {
    switch (this.code) {
      case 'PERMISSION_DENIED':
        return 'Location permission is required to calculate prayer times. Please enable location access in your device settings.';
      case 'TIMEOUT':
        return 'Unable to get your location. Please check your GPS signal and try again.';
      case 'POSITION_UNAVAILABLE':
        return 'Location services are temporarily unavailable. Please try again later.';
      case 'NETWORK_ERROR':
        return 'Network error occurred while getting location. Please check your internet connection.';
      case 'INVALID_LOCATION':
        return 'Invalid location data received. Please try again.';
      default:
        return this.message;
    }
  }

  /**
   * Convert to plain object for logging/serialization
   */
  public toJSON(): any {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      canRetry: this.canRetry,
      stack: this.stack,
      originalError: this.originalError
        ? {
            name: this.originalError.name,
            message: this.originalError.message,
            stack: this.originalError.stack,
          }
        : undefined,
    };
  }
}

/**
 * Location error codes
 */
export const LOCATION_ERROR_CODES = {
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  TIMEOUT: 'TIMEOUT',
  POSITION_UNAVAILABLE: 'POSITION_UNAVAILABLE',
  NETWORK_ERROR: 'NETWORK_ERROR',
  INVALID_LOCATION: 'INVALID_LOCATION',
  UNKNOWN: 'UNKNOWN',
} as const;

/**
 * Check if error is a LocationError
 */
export function isLocationError(error: any): error is LocationError {
  return error instanceof LocationError;
}
