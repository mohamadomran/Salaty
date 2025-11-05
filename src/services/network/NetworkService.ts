/**
 * Network Connectivity Service
 * Monitors network connectivity status and provides offline/online detection
 */

import {
  NetInfoState,
  NetInfoStateType,
} from '@react-native-community/netinfo';
import { eventEmitter } from 'react-native';

// Define network status types
export type NetworkStatus = 'online' | 'offline' | 'unknown';
export type ConnectionType =
  | 'wifi'
  | 'cellular'
  | 'ethernet'
  | 'bluetooth'
  | 'wimax'
  | 'vpn'
  | 'other'
  | 'unknown';

export interface NetworkInfo {
  status: NetworkStatus;
  isConnected: boolean | null;
  connectionType: ConnectionType;
  isInternetReachable: boolean | null;
  details: {
    isWifiEnabled?: boolean;
    cellularGeneration?: '2g' | '3g' | '4g' | '5g' | null;
    strength?: number | null;
  };
}

// Event types for network status changes
export type NetworkEventListener = (networkInfo: NetworkInfo) => void;

class NetworkService {
  private static instance: NetworkService;
  private currentNetworkInfo: NetworkInfo;
  private listeners: Set<NetworkEventListener> = new Set();
  private retryQueue: Array<() => Promise<any>> = [];
  private isRetrying = false;

  private constructor() {
    this.currentNetworkInfo = this.getDefaultNetworkInfo();
  }

  public static getInstance(): NetworkService {
    if (!NetworkService.instance) {
      NetworkService.instance = new NetworkService();
    }
    return NetworkService.instance;
  }

  private getDefaultNetworkInfo(): NetworkInfo {
    return {
      status: 'unknown',
      isConnected: null,
      connectionType: 'unknown',
      isInternetReachable: null,
      details: {},
    };
  }

  /**
   * Initialize network monitoring
   */
  public async initialize(): Promise<void> {
    try {
      // Import NetInfo dynamically to avoid issues when not installed
      const NetInfo = require('@react-native-community/netinfo').default;

      // Get initial network state
      const initialState: NetInfoState = await NetInfo.fetch();
      this.updateNetworkInfo(initialState);

      // Subscribe to network state changes
      NetInfo.addEventListener(this.handleNetworkChange);
    } catch (error) {
      console.warn(
        'NetInfo not available, network monitoring disabled:',
        error,
      );
      // Set default offline state
      this.updateNetworkInfo({
        type: NetInfoStateType.none,
        isConnected: false,
        isInternetReachable: false,
      });
    }
  }

  /**
   * Handle network state changes
   */
  private handleNetworkChange = (state: NetInfoState): void => {
    this.updateNetworkInfo(state);

    // Process retry queue when coming back online
    if (
      state.isConnected &&
      state.isInternetReachable &&
      this.retryQueue.length > 0
    ) {
      this.processRetryQueue();
    }
  };

  /**
   * Update network information
   */
  private updateNetworkInfo(state: NetInfoState): void {
    const previousStatus = this.currentNetworkInfo.status;

    this.currentNetworkInfo = {
      status: this.getNetworkStatus(state),
      isConnected: state.isConnected,
      connectionType: this.getConnectionType(state.type),
      isInternetReachable: state.isInternetReachable,
      details: {
        isWifiEnabled: state.type === NetInfoStateType.wifi,
        cellularGeneration: this.getCellularGeneration(state.details),
        strength: state.details.strength || null,
      },
    };

    // Notify listeners if status changed
    if (previousStatus !== this.currentNetworkInfo.status) {
      this.notifyListeners();
    }
  }

  /**
   * Get network status from NetInfo state
   */
  private getNetworkStatus(state: NetInfoState): NetworkStatus {
    if (state.isConnected === null) return 'unknown';
    if (state.isConnected && state.isInternetReachable) return 'online';
    if (!state.isConnected) return 'offline';
    return 'unknown';
  }

  /**
   * Get connection type from NetInfo type
   */
  private getConnectionType(type: NetInfoStateType): ConnectionType {
    switch (type) {
      case NetInfoStateType.wifi:
        return 'wifi';
      case NetInfoStateType.cellular:
        return 'cellular';
      case NetInfoStateType.ethernet:
        return 'ethernet';
      case NetInfoStateType.bluetooth:
        return 'bluetooth';
      case NetInfoStateType.wimax:
        return 'wimax';
      case NetInfoStateType.vpn:
        return 'vpn';
      case NetInfoStateType.other:
        return 'other';
      case NetInfoStateType.none:
      default:
        return 'unknown';
    }
  }

  /**
   * Get cellular generation from details
   */
  private getCellularGeneration(
    details: any,
  ): '2g' | '3g' | '4g' | '5g' | null {
    if (!details.cellularGeneration) return null;

    const gen = details.cellularGeneration.toLowerCase();
    switch (gen) {
      case '2g':
        return '2g';
      case '3g':
        return '3g';
      case '4g':
        return '4g';
      case '5g':
        return '5g';
      default:
        return null;
    }
  }

  /**
   * Get current network information
   */
  public getCurrentNetworkInfo(): NetworkInfo {
    return { ...this.currentNetworkInfo };
  }

  /**
   * Check if device is online
   */
  public isOnline(): boolean {
    return this.currentNetworkInfo.status === 'online';
  }

  /**
   * Check if device is offline
   */
  public isOffline(): boolean {
    return this.currentNetworkInfo.status === 'offline';
  }

  /**
   * Add network status change listener
   */
  public addListener(listener: NetworkEventListener): () => void {
    this.listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Remove network status change listener
   */
  public removeListener(listener: NetworkEventListener): void {
    this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of network status change
   */
  private notifyListeners(): void {
    const networkInfo = { ...this.currentNetworkInfo };
    this.listeners.forEach(listener => {
      try {
        listener(networkInfo);
      } catch (error) {
        console.error('Error in network listener:', error);
      }
    });
  }

  /**
   * Add function to retry queue when offline
   */
  public addToRetryQueue<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const wrappedFn = async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };

      if (this.isOnline()) {
        // Execute immediately if online
        wrappedFn();
      } else {
        // Add to queue if offline
        this.retryQueue.push(wrappedFn);
      }
    });
  }

  /**
   * Process retry queue when coming back online
   */
  private async processRetryQueue(): Promise<void> {
    if (this.isRetrying || this.retryQueue.length === 0) return;

    this.isRetrying = true;
    const queue = [...this.retryQueue];
    this.retryQueue = [];

    try {
      // Execute all queued functions with delay between them
      for (const fn of queue) {
        try {
          await fn();
          // Small delay between requests
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error('Error executing queued function:', error);
        }
      }
    } finally {
      this.isRetrying = false;
    }
  }

  /**
   * Clear retry queue
   */
  public clearRetryQueue(): void {
    this.retryQueue = [];
  }

  /**
   * Get retry queue size
   */
  public getRetryQueueSize(): number {
    return this.retryQueue.length;
  }

  /**
   * Execute function with retry logic
   */
  public async executeWithRetry<T>(
    fn: () => Promise<T>,
    options: {
      maxRetries?: number;
      retryDelay?: number;
      retryOnOffline?: boolean;
    } = {},
  ): Promise<T> {
    const {
      maxRetries = 3,
      retryDelay = 1000,
      retryOnOffline = true,
    } = options;

    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Check if offline and should retry
        if (retryOnOffline && this.isOffline() && attempt < maxRetries) {
          console.log(
            `Network offline, queuing retry attempt ${attempt + 1}/${
              maxRetries + 1
            }`,
          );
          return this.addToRetryQueue(fn);
        }

        // Execute function
        return await fn();
      } catch (error) {
        lastError = error as Error;

        if (attempt < maxRetries) {
          console.warn(
            `Attempt ${attempt + 1} failed, retrying in ${retryDelay}ms:`,
            error,
          );
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }

    throw lastError!;
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    this.listeners.clear();
    this.clearRetryQueue();
  }
}

// Export singleton instance
export default NetworkService.getInstance();
