/**
 * Location-related type definitions
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationData extends Coordinates {
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  timestamp?: number;
}

export interface QiblaData {
  direction: number; // Direction to Qibla in degrees (0-360)
  compassDirection: number; // Current compass direction
  distance?: number; // Distance to Kaaba in km (optional)
}

export interface LocationPermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
  status: 'granted' | 'denied' | 'blocked' | 'limited';
}

// Kaaba coordinates (Makkah, Saudi Arabia)
export const KAABA_COORDINATES: Coordinates = {
  latitude: 21.4225,
  longitude: 39.8262,
};
