/**
 * Prayer Time Utilities
 * Logic for determining prayer time status and available actions
 */

import { PrayerName, PrayerTimes } from '../types';
import { PrayerStatus } from '../types/tracking';

/**
 * Prayer time status relative to current time
 */
export enum PrayerTimeStatus {
  PAST = 'past',         // Prayer time has passed
  CURRENT = 'current',   // Prayer is currently in its time window
  FUTURE = 'future',     // Prayer time has not arrived yet
}

/**
 * Prayer action availability based on time
 */
export interface PrayerActions {
  canMarkCompleted: boolean;
  canMarkMissed: boolean;
  canMarkDelayed: boolean;
  availableStatuses: PrayerStatus[];
  timeStatus: PrayerTimeStatus;
  nextActionText?: string;
}

/**
 * Get current time status of a prayer
 */
export function getPrayerTimeStatus(
  prayerName: PrayerName,
  prayerTimes: PrayerTimes,
  currentTime: Date = new Date()
): PrayerTimeStatus {
  const prayerTime = prayerTimes[prayerName];
  if (!prayerTime) {
    return PrayerTimeStatus.FUTURE;
  }

  // Calculate next prayer time to determine current prayer window
  const prayerTimesArray: { name: PrayerName; time: Date }[] = [
    { name: 'fajr', time: prayerTimes.fajr },
    { name: 'dhuhr', time: prayerTimes.dhuhr },
    { name: 'asr', time: prayerTimes.asr },
    { name: 'maghrib', time: prayerTimes.maghrib },
    { name: 'isha', time: prayerTimes.isha },
  ];

  // Sort by time
  prayerTimesArray.sort((a, b) => a.time.getTime() - b.time.getTime());

  // Find current prayer index
  const currentIndex = prayerTimesArray.findIndex(p => p.name === prayerName);
  
  if (currentIndex === -1) {
    return PrayerTimeStatus.FUTURE;
  }

  // Check if this prayer is current one
  const nextPrayerIndex = prayerTimesArray.findIndex(p => 
    p.time.getTime() > currentTime.getTime()
  );

  if (nextPrayerIndex === -1) {
    // After Isha, all prayers are past
    return PrayerTimeStatus.PAST;
  }

  const currentPrayerIndex = nextPrayerIndex === 0 ? 
    prayerTimesArray.length - 1 : nextPrayerIndex - 1;

  if (currentIndex === currentPrayerIndex) {
    return PrayerTimeStatus.CURRENT;
  } else if (currentIndex < currentPrayerIndex) {
    return PrayerTimeStatus.PAST;
  } else {
    return PrayerTimeStatus.FUTURE;
  }
}

/**
 * Get available actions for a prayer based on its time status
 */
export function getPrayerActions(
  prayerName: PrayerName,
  prayerTimes: PrayerTimes,
  _currentStatus: PrayerStatus,
  currentTime: Date = new Date()
): PrayerActions {
  const timeStatus = getPrayerTimeStatus(prayerName, prayerTimes, currentTime);

  switch (timeStatus) {
    case PrayerTimeStatus.PAST:
      return {
        canMarkCompleted: true,
        canMarkMissed: true,
        canMarkDelayed: true,
        availableStatuses: [PrayerStatus.COMPLETED, PrayerStatus.MISSED, PrayerStatus.DELAYED],
        timeStatus,
        nextActionText: 'Mark prayer status',
      };

    case PrayerTimeStatus.CURRENT:
      return {
        canMarkCompleted: true,
        canMarkMissed: false, // Can't mark current as missed yet
        canMarkDelayed: false, // Can't mark as delayed until time passes
        availableStatuses: [PrayerStatus.COMPLETED],
        timeStatus,
        nextActionText: 'Mark as prayed',
      };

    case PrayerTimeStatus.FUTURE:
      return {
        canMarkCompleted: false,
        canMarkMissed: false,
        canMarkDelayed: false,
        availableStatuses: [PrayerStatus.PENDING],
        timeStatus,
        nextActionText: `Wait for ${prayerName} time`,
      };

    default:
      return {
        canMarkCompleted: false,
        canMarkMissed: false,
        canMarkDelayed: false,
        availableStatuses: [PrayerStatus.PENDING],
        timeStatus: PrayerTimeStatus.FUTURE,
      };
  }
}

/**
 * Check if a prayer can be marked with a specific status
 */
export function canMarkPrayerWithStatus(
  prayerName: PrayerName,
  prayerTimes: PrayerTimes,
  status: PrayerStatus,
  currentTime: Date = new Date()
): boolean {
  const actions = getPrayerActions(prayerName, prayerTimes, PrayerStatus.PENDING, currentTime);
  return actions.availableStatuses.includes(status);
}

/**
 * Get next prayer that can be marked
 */
export function getNextMarkablePrayer(
  prayerTimes: PrayerTimes,
  currentTime: Date = new Date()
): PrayerName | null {
  const prayers: PrayerName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  
  // Find first prayer that is current or past
  for (const prayer of prayers) {
    const actions = getPrayerActions(prayer, prayerTimes, PrayerStatus.PENDING, currentTime);
    if (actions.canMarkCompleted) {
      return prayer;
    }
  }
  
  return null;
}

/**
 * Get time remaining until prayer can be marked
 */
export function getTimeUntilMarkable(
  prayerName: PrayerName,
  prayerTimes: PrayerTimes,
  currentTime: Date = new Date()
): number | null {
  const prayerTime = prayerTimes[prayerName];
  if (!prayerTime) return null;

  const timeUntilPrayer = prayerTime.getTime() - currentTime.getTime();
  
  if (timeUntilPrayer <= 0) {
    return 0; // Can be marked now
  }
  
  return timeUntilPrayer; // Milliseconds until prayer time
}

/**
 * Format time remaining for display
 */
export function formatTimeUntilMarkable(
  prayerName: PrayerName,
  prayerTimes: PrayerTimes,
  currentTime: Date = new Date()
): string {
  const timeMs = getTimeUntilMarkable(prayerName, prayerTimes, currentTime);
  
  if (timeMs === null) {
    return 'Unknown';
  }
  
  if (timeMs === 0) {
    return 'Now';
  }
  
  const minutes = Math.ceil(timeMs / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`;
  } else {
    return `${minutes}m`;
  }
}