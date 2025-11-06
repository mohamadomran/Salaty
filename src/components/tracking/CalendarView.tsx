/**
 * Calendar View Component
 * Shows monthly prayer completion status with color-coded days
 */

import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useTheme } from 'react-native-paper';
import { TrackingService } from '../../services/tracking';
import { DailyPrayerRecord, PrayerStatus } from '../../types';
import type { ExpressiveTheme } from '../../theme';

interface CalendarViewProps {
  onDayPress?: (date: DateData) => void;
  selectedDate?: string;
}

export function CalendarView({
  onDayPress,
  selectedDate,
}: CalendarViewProps) {
  const theme = useTheme<ExpressiveTheme>();
  const [markedDates, setMarkedDates] = useState<any>({});

  useEffect(() => {
    loadCalendarData();
  }, []);

  const loadCalendarData = async () => {
    try {
      // Get all tracking records
      const allRecords = await TrackingService.exportRecords();

      // Process records to create marked dates
      const marks: any = {};

      Object.entries(allRecords).forEach(([dateKey, record]) => {
        const completionStatus = calculateDayCompletion(record);
        marks[dateKey] = {
          selected: selectedDate === dateKey,
          selectedColor: selectedDate === dateKey ? theme.colors.primary : undefined,
          marked: true,
          dotColor: getDotColor(completionStatus),
          customStyles: {
            container: {
              backgroundColor: getBackgroundColor(completionStatus),
              borderRadius: 8,
            },
            text: {
              color: completionStatus.allCompleted
                ? theme.colors.onPrimary
                : theme.colors.onSurface,
              fontWeight: completionStatus.allCompleted ? '700' : '400',
            },
          },
        };
      });

      setMarkedDates(marks);
    } catch (error) {
      console.error('Error loading calendar data:', error);
    }
  };

  const calculateDayCompletion = (record: DailyPrayerRecord) => {
    const prayers = Object.values(record.prayers);
    const total = prayers.length;
    const completed = prayers.filter(
      p =>
        p.status === PrayerStatus.COMPLETED ||
        p.status === PrayerStatus.DELAYED ||
        p.status === PrayerStatus.QADA,
    ).length;
    const missed = prayers.filter(p => p.status === PrayerStatus.MISSED).length;

    return {
      total,
      completed,
      missed,
      allCompleted: completed === total,
      completionRate: (completed / total) * 100,
    };
  };

  const getDotColor = (status: ReturnType<typeof calculateDayCompletion>): string => {
    if (status.allCompleted) {
      return theme.expressiveColors.prayerCompleted;
    } else if (status.completed > 0) {
      return theme.expressiveColors.prayerUpcoming;
    } else if (status.missed > 0) {
      return theme.expressiveColors.prayerMissed;
    }
    return theme.colors.outlineVariant;
  };

  const getBackgroundColor = (
    status: ReturnType<typeof calculateDayCompletion>,
  ): string => {
    if (status.allCompleted) {
      return theme.expressiveColors.prayerCompleted + '20'; // 20% opacity
    } else if (status.completionRate >= 60) {
      return theme.expressiveColors.prayerUpcoming + '15';
    } else if (status.missed > 0) {
      return theme.expressiveColors.prayerMissed + '10';
    }
    return 'transparent';
  };

  return (
    <Calendar
      markedDates={markedDates}
      onDayPress={onDayPress}
      markingType="custom"
      theme={{
        backgroundColor: theme.colors.surface,
        calendarBackground: theme.colors.surface,
        textSectionTitleColor: theme.colors.onSurfaceVariant,
        selectedDayBackgroundColor: theme.colors.primary,
        selectedDayTextColor: theme.colors.onPrimary,
        todayTextColor: theme.colors.primary,
        dayTextColor: theme.colors.onSurface,
        textDisabledColor: theme.colors.onSurfaceVariant,
        dotColor: theme.colors.primary,
        selectedDotColor: theme.colors.onPrimary,
        arrowColor: theme.colors.primary,
        monthTextColor: theme.colors.onSurface,
        indicatorColor: theme.colors.primary,
        textDayFontFamily: 'System',
        textMonthFontFamily: 'System',
        textDayHeaderFontFamily: 'System',
        textDayFontWeight: '400',
        textMonthFontWeight: '700',
        textDayHeaderFontWeight: '600',
        textDayFontSize: 15,
        textMonthFontSize: 18,
        textDayHeaderFontSize: 13,
      }}
      style={styles.calendar}
      enableSwipeMonths={true}
    />
  );
}

const styles = StyleSheet.create({
  calendar: {
    borderRadius: 16,
  },
});
