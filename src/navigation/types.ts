/**
 * Navigation Types
 * Type definitions for navigation structure
 */

export type RootTabParamList = {
  Home: undefined;
  Tracking: undefined;
  Qibla: undefined;
  Settings: undefined;
};

export type TabScreenName = keyof RootTabParamList;
